const { execSync } = require('child_process');

module.exports = {
    name: 'git',
    async collect(config) {
        try {
            // Optimized find for deep repo structures (up to 5 levels)
            const cmd = `find ${config.projectsPath} -maxdepth 5 -name .git -type d -prune -exec sh -c 'git -C "$1/.." rev-list --all --since="24 hours ago" --count' _ {} \\; | awk '{s+=$1} END {print s || 0}'`;
            const count = parseInt(execSync(cmd).toString().trim()) || 0;
            return { git_commits: count };
        } catch (e) {
            return { git_commits: 0 };
        }
    }
};
