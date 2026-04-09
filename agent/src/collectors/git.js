const { exec } = require('child_process');
const { promisify } = require('util');
const path = require('path');
const fs = require('fs');

const execAsync = promisify(exec);

const collector = {
    name: 'git_status',
    async collect(config) {
        let repoPaths = [];

        // 1. GIT_REPO_PATH (can be a comma-separated list of absolute or relative paths)
        if (process.env.GIT_REPO_PATH) {
            repoPaths = process.env.GIT_REPO_PATH.split(',').map(p => path.resolve(process.cwd(), p.trim()));
        }

        // 2. GIT_PARENT_PATH (a directory containing multiple repos, e.g., ~/.1repos/dev)
        if (process.env.GIT_PARENT_PATH) {
            let parentPath = process.env.GIT_PARENT_PATH;
            if (parentPath.startsWith('~')) {
                parentPath = path.join(require('os').homedir(), parentPath.slice(1));
            } else {
                parentPath = path.resolve(process.cwd(), parentPath);
            }

            if (fs.existsSync(parentPath) && fs.lstatSync(parentPath).isDirectory()) {
                const subdirs = fs.readdirSync(parentPath);
                for (const subdir of subdirs) {
                    const fullPath = path.join(parentPath, subdir);
                    if (fs.existsSync(path.join(fullPath, '.git'))) {
                        repoPaths.push(fullPath);
                    }
                }
            }
        }

        // 3. Fallback to current project if nothing else found
        if (repoPaths.length === 0) {
            const possiblePaths = ['../', './'];
            for (const p of possiblePaths) {
                const absoluteP = path.resolve(process.cwd(), p);
                if (fs.existsSync(path.join(absoluteP, '.git'))) {
                    repoPaths.push(absoluteP);
                    break;
                }
            }
        }

        // De-duplicate paths
        repoPaths = [...new Set(repoPaths)];

        if (repoPaths.length === 0) {
            console.log(`[Git] No repositories found to probe.`);
            return {
                repo_name: 'none',
                branch_name: 'n/a',
                git_commits_24h: 0,
                recent_commits: []
            };
        }

        console.log(`[Git] Probing ${repoPaths.length} repositories: ${repoPaths.map(p => path.basename(p)).join(', ')}`);

        const results = await Promise.all(repoPaths.map(p => this.collectLocal(p, config)));

        // Aggregate results
        const aggregated = {
            repo_name: results.length === 1 ? results[0].repo_name : `Studio (${results.length} repos)`,
            branch_name: results.length === 1
                ? `${results[0].repo_name}:${results[0].branch_name}${results[0].remote_url ? '|' + results[0].remote_url : ''}`
                : (results.filter(r => r.git_commits_24h > 0).map(r => `${r.repo_name}:${r.branch_name}${r.remote_url ? '|' + r.remote_url : ''}`).join(', ')
                   || `${results[0].repo_name}:${results[0].branch_name}${results[0].remote_url ? '|' + results[0].remote_url : ''}`),
            git_author: results[0].git_author,
            github_username: process.env.GITHUB_USERNAME || results[0].git_author,
            git_commits_24h: results.reduce((sum, r) => sum + r.git_commits_24h, 0),
            recent_commits: results.flatMap(r => r.recent_commits_raw.map(msg => ({
                repo: r.repo_name,
                timestamp: parseInt(msg.split('|')[0]) || 0,
                cleanMsg: msg.split('|').slice(1).join('|')
            })))
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 10)
            .map(c => `[${c.repo}] ${c.cleanMsg}`)
        };

        return aggregated;
    },

    async collectLocal(repoPath, config) {
        if (!fs.existsSync(path.join(repoPath, '.git'))) {
            return {
                repo_name: path.basename(repoPath),
                branch_name: 'no-git',
                remote_url: '',
                git_author: '',
                git_commits_24h: 0,
                recent_commits_raw: []
            };
        }

        try {
            // 1. Get current branch
            const { stdout: branchOut } = await execAsync(`git -C "${repoPath}" rev-parse --abbrev-ref HEAD`);
            const branch = branchOut.trim();

            // 2. Get git author name
            let author = '';
            try {
                const { stdout: authorOut } = await execAsync(`git -C "${repoPath}" config user.name`);
                author = authorOut.trim();
            } catch {
                try {
                    const { stdout: globalAuthorOut } = await execAsync(`git config --global user.name`);
                    author = globalAuthorOut.trim();
                } catch { /* no author found */ }
            }

            // 3. Count commits created on this machine in the last 24h via reflog
            let count = 0;
            try {
                const { stdout: countOut } = await execAsync(
                    `git -C "${repoPath}" reflog --since="24.hours.ago" --pretty=format:"%gs" | grep -E "^commit.*: " | wc -l`
                );
                count = parseInt(countOut.trim()) || 0;
            } catch { /* reflog unavailable */ }

            // 4. Get recent commit messages via reflog
            let messages = [];
            try {
                const { stdout: recentOut } = await execAsync(
                    `git -C "${repoPath}" reflog -n 20 --since="24.hours.ago" --pretty=format:"%ct|%gs" | grep -E "[|]commit.*: " | head -n 5`
                );
                if (recentOut.trim()) {
                    messages = recentOut.trim().split('\n')
                        .filter(m => m)
                        .map(m => m.replace(/\|commit.*: /, '|'));
                }
            } catch { /* reflog unavailable */ }

            // 5. Get repo name from top-level path
            let repoName = path.basename(repoPath);
            try {
                const { stdout: repoOut } = await execAsync(`git -C "${repoPath}" rev-parse --show-toplevel`);
                repoName = path.basename(repoOut.trim());
            } catch { /* fall back to directory name */ }

            // 6. Get and normalise remote origin URL
            let remoteUrl = '';
            try {
                const { stdout: remoteOut } = await execAsync(`git -C "${repoPath}" remote get-url origin`);
                remoteUrl = remoteOut.trim();
                if (remoteUrl.startsWith('git@')) {
                    remoteUrl = remoteUrl.replace(':', '/').replace('git@', 'https://').replace('.git', '');
                } else if (remoteUrl.startsWith('https://') && remoteUrl.endsWith('.git')) {
                    remoteUrl = remoteUrl.slice(0, -4);
                } else if (remoteUrl.includes('github.com') && !remoteUrl.startsWith('http')) {
                    remoteUrl = 'https://' + remoteUrl.replace('.git', '');
                }
            } catch { /* no remote */ }

            return {
                repo_name: repoName,
                branch_name: branch,
                remote_url: remoteUrl,
                git_author: author,
                git_commits_24h: count,
                recent_commits_raw: messages
            };
        } catch (err) {
            console.error(`[Git] Failed to collect ${path.basename(repoPath)}: ${err.message}`);
            return {
                repo_name: path.basename(repoPath),
                branch_name: 'error',
                remote_url: '',
                git_author: '',
                git_commits_24h: 0,
                recent_commits_raw: []
            };
        }
    }
};

module.exports = collector;
