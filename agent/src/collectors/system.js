const si = require('systeminformation');

module.exports = {
    name: 'system',
    async collect() {
        const [mem, load] = await Promise.all([si.mem(), si.currentLoad()]);
        return {
            cpu_usage: Math.round(load.currentLoad),
            ram_usage: Math.round((mem.active / mem.total) * 100)
        };
    }
};
