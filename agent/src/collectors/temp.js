const si = require('systeminformation');

module.exports = {
    name: 'temperature',
    async collect() {
        try {
            // Hämta CPU temperatur via systeminformation (lm_sensors etc)
            const temp = await si.cpuTemperature();
            
            // si.cpuTemperature() kan returnera main, cores (array), max
            // Om ingen sensor hittas brukar main vara -1 eller 0.
            if (temp && temp.main !== undefined && temp.main > 0) {
                return { cpu_temp: Math.round(temp.main) };
            }
            
            return { cpu_temp: 0 };
        } catch (e) {
            console.error(`[Telemetry] Failed to read CPU temperature: ${e.message}`);
            return { cpu_temp: 0 };
        }
    }
};