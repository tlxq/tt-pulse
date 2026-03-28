const { exec } = require('child_process');
const https = require('https');
const path = require('path');

module.exports = {
    name: 'git_status',
    async collect() {
        const repoPath = process.env.GIT_REPO_PATH;
        
        if (repoPath) {
            return this.collectLocal(repoPath);
        } else {
            return this.collectRemote();
        }
    },

    async collectLocal(repoPath) {
        return new Promise((resolve) => {
            const absolutePath = path.isAbsolute(repoPath) 
                ? repoPath 
                : path.join(process.cwd(), repoPath);

            // Get commits in the last 24 hours
            const since = '24.hours.ago';
            const cmd = `git -C "${absolutePath}" log --since="${since}" --pretty=format:"%s"`;

            exec(cmd, (error, stdout) => {
                if (error) {
                    console.error(`[Git] Error collecting local logs from ${absolutePath}: ${error.message}`);
                    return resolve({ git_commits_24h: 0, recent_commits: [] });
                }

                const messages = stdout.trim() ? stdout.trim().split('\n') : [];
                console.log(`[Git] Local: Found ${messages.length} commits in ${absolutePath}`);
                
                resolve({
                    git_commits_24h: messages.length,
                    recent_commits: messages.slice(0, 5)
                });
            });
        });
    },

    async collectRemote() {
        return new Promise((resolve) => {
            const username = process.env.GITHUB_USERNAME;
            const token = process.env.GITHUB_TOKEN;
            const targetRepo = process.env.GITHUB_REPO; // Optional: filter by repo

            if (!username) {
                return resolve({ git_commits_24h: 0, recent_commits: [] });
            }

            const options = {
                hostname: 'api.github.com',
                path: `/users/${username}/events`,
                headers: {
                    'User-Agent': 'TT-Pulse-Agent',
                    ...(token && { 'Authorization': `token ${token}` })
                }
            };

            https.get(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        const events = JSON.parse(data);
                        if (!Array.isArray(events)) return resolve({ git_commits_24h: 0, recent_commits: [] });
                        
                        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        let totalCommits = 0;
                        const messages = [];
                        
                        const pushEvents = events.filter(e => {
                            const isPush = e.type === 'PushEvent';
                            const isRecent = new Date(e.created_at) > twentyFourHoursAgo;
                            const matchesRepo = targetRepo ? e.repo.name === targetRepo : true;
                            return isPush && isRecent && matchesRepo;
                        });
                        
                        pushEvents.forEach(e => {
                            const count = e.payload.size || (e.payload.commits ? e.payload.commits.length : 1);
                            totalCommits += count;

                            if (e.payload.commits) {
                                e.payload.commits.forEach(c => {
                                    if (messages.length < 5) messages.push(c.message);
                                });
                            }
                        });

                        resolve({ 
                            git_commits_24h: totalCommits,
                            recent_commits: messages 
                        });
                    } catch (e) {
                        resolve({ git_commits_24h: 0, recent_commits: [] });
                    }
                });
            }).on('error', () => {
                resolve({ git_commits_24h: 0, recent_commits: [] });
            });
        });
    }
};
