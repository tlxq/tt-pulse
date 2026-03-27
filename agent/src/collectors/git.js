const https = require('https');

module.exports = {
    name: 'git_global',
    async collect() {
        return new Promise((resolve) => {
            const username = process.env.GITHUB_USERNAME;
            const token = process.env.GITHUB_TOKEN;

            if (!username) {
                console.warn('[Git] GITHUB_USERNAME missing in .env');
                return resolve({ git_commits_24h: 0 });
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
                        if (!Array.isArray(events)) {
                            console.error('[Git] API did not return an array');
                            return resolve({ git_commits_24h: 0 });
                        }
                        
                        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                        let totalCommits = 0;
                        
                        const pushEvents = events.filter(e => e.type === 'PushEvent' && new Date(e.created_at) > twentyFourHoursAgo);
                        
                        pushEvents.forEach(e => {
                            // GitHub API can sometimes omit 'size' or 'commits' in the events list
                            const count = e.payload.size || (e.payload.commits ? e.payload.commits.length : 1);
                            totalCommits += count;
                        });

                        console.log(`[Git] Found ${pushEvents.length} PushEvents with total ${totalCommits} commits for ${username}`);
                        resolve({ git_commits_24h: totalCommits });
                    } catch (e) {
                        console.error('[Git] Error parsing GitHub API response:', e.message);
                        resolve({ git_commits_24h: 0 });
                    }
                });
            }).on('error', (err) => {
                console.error('[Git] Network error:', err.message);
                resolve({ git_commits_24h: 0 });
            });
        });
    }
};
