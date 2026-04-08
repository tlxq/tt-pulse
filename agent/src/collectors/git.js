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
            // 1. Get total commits in the last 24 hours (för siffran i dashboard)
            const countCmd = `git -C "${repoPath}" rev-list --count --since="24.hours.ago" HEAD`;
            
            // 2. Get the 5 most recent commit messages (för listan)
            const recentCmd = `git -C "${repoPath}" log -n 5 --pretty=format:"%s"`;

            exec(countCmd, (err1, stdout1) => {
                const count = parseInt(stdout1.trim()) || 0;
                
                exec(recentCmd, (err2, stdout2) => {
                    const messages = stdout2 ? stdout2.trim().split('\n') : [];
                    console.log(`[Git] Found ${count} daily commits and ${messages.length} log entries.`);
                    
                    resolve({
                        git_commits: count,
                        git_commits_24h: count,
                        recent_commits: messages
                    });
                });
            });
        });
    }
};

module.exports = collector;
