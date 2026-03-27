const si = require('systeminformation');

module.exports = {
    name: 'network',
    async collect() {
        try {
            // Mäter latens mot Google DNS (8.8.8.8)
            const ms = await si.inetLatency('8.8.8.8');
            return { latency_ms: Math.round(ms) };
        } catch (e) {
            return { latency_ms: 0 };
        }
    }
};
