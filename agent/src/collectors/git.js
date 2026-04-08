const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

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
            branch_name: results.length === 1 ? results[0].branch_name : (results.filter(r => r.git_commits_24h > 0).map(r => `${r.repo_name}:${r.branch_name}`).join(', ') || results[0].branch_name),
            git_author: results[0].git_author,
            github_username: process.env.GITHUB_USERNAME || results[0].git_author,
            git_commits: results.reduce((sum, r) => sum + r.git_commits, 0),
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
        return new Promise((resolve) => {
            if (!fs.existsSync(path.join(repoPath, '.git'))) {
                return resolve({
                    repo_name: path.basename(repoPath),
                    branch_name: 'no-git',
                    git_author: '',
                    git_commits: 0,
                    git_commits_24h: 0,
                    recent_commits_raw: []
                });
            }

            // 1. Get current branch name
            const branchCmd = `git -C "${repoPath}" rev-parse --abbrev-ref HEAD`;
            
            // 2. Get git author name
            const authorCmd = `git -C "${repoPath}" config user.name`;

            // 3. Get total commits in the last 24 hours
            const countCmd = `git -C "${repoPath}" rev-list --count --since="24.hours.ago" HEAD`;
            
            // 4. Get the 5 most recent commit messages with timestamp
            const recentCmd = `git -C "${repoPath}" log -n 5 --pretty=format:"%ct|%s"`;

            // 5. Get repo name
            const repoNameCmd = `git -C "${repoPath}" rev-parse --show-toplevel`;

            exec(branchCmd, (err0, stdout0) => {
                const branch = stdout0 && !err0 ? stdout0.trim() : 'unknown';
                
                exec(authorCmd, (err1, stdout1) => {
                    const author = stdout1 && !err1 ? stdout1.trim() : '';

                    exec(countCmd, (err2, stdout2) => {
                        const count = parseInt(stdout2 ? stdout2.trim() : '0') || 0;
                        
                        exec(recentCmd, (err3, stdout3) => {
                            const messages = stdout3 && !err3 ? stdout3.trim().split('\n').filter(m => m) : [];
                            
                            exec(repoNameCmd, (err4, stdout4) => {
                                const repoFull = stdout4 && !err4 ? stdout4.trim() : repoPath;
                                const repoName = path.basename(repoFull);
                                
                                resolve({
                                    repo_name: repoName,
                                    branch_name: branch,
                                    git_author: author,
                                    git_commits: count,
                                    git_commits_24h: count,
                                    recent_commits_raw: messages
                                });
                            });
                        });
                    });
                });
            });
        });
    }
};

module.exports = collector;
