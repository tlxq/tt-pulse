const { exec } = require('child_process');

module.exports = {
    name: 'ops_telemetry',
    async collect() {
        return new Promise((resolve) => {
            // SRE Standard: Use native Linux tools for high-precision process monitoring
            // ps aux --sort=-%cpu | head -n 4 gets the header + top 3 processes
            exec('ps aux --sort=-%cpu | head -n 4', (error, stdout) => {
                if (error) {
                    console.warn(`[Ops] Failed to read top processes: ${error.message}`);
                    return resolve({ top_processes: [] });
                }

                const lines = stdout.trim().split('\n');
                const topProcesses = lines.slice(1).map(line => {
                    const parts = line.split(/\s+/);
                    return {
                        user: parts[0],
                        pid: parts[1],
                        cpu: parseFloat(parts[2]),
                        mem: parseFloat(parts[3]),
                        command: parts[10] ? parts.slice(10).join(' ').split('/').pop() : 'unknown'
                    };
                });

                resolve({ top_processes: topProcesses });
            });
        });
    }
};
