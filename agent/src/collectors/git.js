const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const collector = {
    name: 'git_status',
    async collect() {
        let repoPath = process.env.GIT_REPO_PATH;
        
        // Letar i ordning: Miljövariabel -> ../ (från agent) -> ./ (om agent körs från rot)
        if (!repoPath) {
            const possiblePaths = ['../', './'];
            for (const p of possiblePaths) {
                const absoluteP = path.resolve(process.cwd(), p);
                if (fs.existsSync(path.join(absoluteP, '.git'))) {
                    repoPath = absoluteP;
                    break;
                }
            }
        }

        // Tvinga till projektets rot om inget annat hittats (vi vet att det är där)
        if (!repoPath) {
            repoPath = path.resolve(process.cwd(), '../');
        }

        console.log(`[Git] Probing path: ${repoPath}`);
        return this.collectLocal(repoPath);
    },

    async collectLocal(repoPath) {
        return new Promise((resolve) => {
            // 1. Get current branch name
            const branchCmd = `git -C "${repoPath}" rev-parse --abbrev-ref HEAD`;
            
            // 2. Get git author name
            const authorCmd = `git -C "${repoPath}" config user.name`;

            // 3. Get total commits in the last 24 hours (för siffran i dashboard)
            const countCmd = `git -C "${repoPath}" rev-list --count --since="24.hours.ago" HEAD`;
            
            // 4. Get the 5 most recent commit messages (för listan)
            const recentCmd = `git -C "${repoPath}" log -n 5 --pretty=format:"%s"`;

            // 5. Get repo name (folder name of the git root)
            const repoNameCmd = `git -C "${repoPath}" rev-parse --show-toplevel`;

            exec(branchCmd, (err0, stdout0) => {
                const branch = stdout0 && !err0 ? stdout0.trim() : 'unknown';
                
                exec(authorCmd, (err1, stdout1) => {
                    const author = stdout1 && !err1 ? stdout1.trim() : '';

                    exec(countCmd, (err2, stdout2) => {
                        const count = parseInt(stdout2 ? stdout2.trim() : '0') || 0;
                        
                        exec(recentCmd, (err3, stdout3) => {
                            const messages = stdout3 && !err3 ? stdout3.trim().split('\n') : [];
                            
                            exec(repoNameCmd, (err4, stdout4) => {
                                const repoName = stdout4 && !err4 ? path.basename(stdout4.trim()) : 'unknown';
                                
                                console.log(`[Git] Repo: ${repoName} | Branch: ${branch} | Author: ${author || 'N/A'}`);
                                
                                resolve({
                                    repo_name: repoName,
                                    branch_name: branch,
                                    git_author: author,
                                    git_commits: count,
                                    git_commits_24h: count,
                                    recent_commits: messages
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
