const si = require('systeminformation');

module.exports = {
    name: 'system',
    async collect() {
        const [mem, load, os] = await Promise.all([
            si.mem(), 
            si.currentLoad(),
            si.osInfo()
        ]);
        
        return {
            cpu_usage: Math.round(load.currentLoad),
            ram_usage: Math.round((mem.active / mem.total) * 100),
            os_platform: os.platform,
            os_distro: os.distro,
            os_kernel: os.kernel
        };
    }
};
