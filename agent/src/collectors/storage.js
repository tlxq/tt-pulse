const si = require('systeminformation');

module.exports = {
    name: 'storage',
    async collect() {
        try {
            const fs = await si.fsSize();
            // Hittar rotpartitionen (eller den första tillgängliga disken)
            const rootFs = fs.find(f => f.mount === '/') || fs[0];
            return { disk_usage_percent: Math.round(rootFs.use) };
        } catch (e) {
            return { disk_usage_percent: 0 };
        }
    }
};
