const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = {
    nodeName: process.env.COMPUTER_NAME || require('os').hostname(),
    projectsPath: process.env.PROJECTS_PATH || './',
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    interval: parseInt(process.env.HEARTBEAT_INTERVAL) || 120000
};

if (!config.supabaseUrl || !config.supabaseKey) {
    console.error('[Fatal] Missing Supabase configuration. Check .env');
    process.exit(1);
}

const supabase = createClient(config.supabaseUrl, config.supabaseKey);

// Dynamic Plugin System
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

        // Run all collectors in parallel
        const results = await Promise.all(
            collectors.map(c => c.collect(config))
        );

        // Merge results
        results.forEach(res => {
            stats = { ...stats, ...res };
        });

        const { error } = await supabase
            .from('node_status')
            .upsert(stats, { onConflict: 'node_name' });

        if (error) throw error;
        console.log(`[Pulse] ${config.nodeName} updated: ${JSON.stringify(stats)}`);
    } catch (err) {
        console.error(`[Error] Heartbeat failed: ${err.message}`);
    }
}

console.log(`[TT-Pulse Agent] Monitoring: ${config.nodeName}`);
setInterval(sendHeartbeat, config.interval);
sendHeartbeat();
