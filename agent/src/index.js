const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
    nodeName: process.env.COMPUTER_NAME || require('os').hostname(),
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    interval: parseInt(process.env.HEARTBEAT_INTERVAL) || 300000 // 5 min standard
};

if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('[Fatal] Missing Supabase configuration. Check .env');
    process.exit(1);
}

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

const collectors = [];
const collectorsPath = path.join(__dirname, 'collectors');

fs.readdirSync(collectorsPath).forEach(file => {
    if (file.endsWith('.js')) {
        const collector = require(path.join(collectorsPath, file));
        collectors.push(collector);
        console.log(`[Plugin] Loaded: ${collector.name}`);
    }
});

async function sendHeartbeat() {
    try {
        let stats = {
            node_name: config.nodeName,
            last_seen: new Date().toISOString()
        };

        const results = await Promise.all(
            collectors.map(c => c.collect(config))
        );

        results.forEach(res => {
            stats = { ...stats, ...res };
        });

        // Forced UPSERT to ensure heartbeat
        const { error } = await supabase
            .from('node_status')
            .upsert(stats, { onConflict: 'node_name' });

        if (error) throw error;
        console.log(`[Pulse] ${config.nodeName} synced at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
        console.error(`[Error] Heartbeat failed: ${err.message}`);
    }
}

console.log(`[TT-Pulse Agent] Monitoring: ${config.nodeName} every ${config.interval / 1000}s`);
setInterval(sendHeartbeat, config.interval);
sendHeartbeat();
