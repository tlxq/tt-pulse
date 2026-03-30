const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const config = {
    nodeName: process.env.COMPUTER_NAME || require('os').hostname(),
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    agentEmail: process.env.AGENT_EMAIL,
    agentPassword: process.env.AGENT_PASSWORD,
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
        // Ensure we are still authenticated
        if (config.agentEmail && config.agentPassword) {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                console.log('[Auth] Session expired or missing. Re-authenticating...');
                const { error } = await supabase.auth.signInWithPassword({
                    email: config.agentEmail,
                    password: config.agentPassword
                });
                if (error) throw new Error(`Re-auth failed: ${error.message}`);
                console.log('[Auth] Re-authenticated successfully.');
            }
        }

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

        console.log(`[Pulse] Sending to Supabase: ${JSON.stringify(stats)}`);

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

async function start() {
    // Authenticate if credentials are provided
    if (config.agentEmail && config.agentPassword) {
        console.log(`[Auth] Attempting login for ${config.agentEmail}...`);
        const { error } = await supabase.auth.signInWithPassword({
            email: config.agentEmail,
            password: config.agentPassword
        });

        if (error) {
            console.error(`[Fatal] Authentication failed: ${error.message}`);
            process.exit(1);
        }
        console.log(`[Auth] Successfully authenticated.`);
    } else {
        console.warn(`[Warn] No AGENT_EMAIL/PASSWORD found. Proceeding as anonymous (Ensure RLS is disabled or public).`);
    }

    console.log(`[TT-Pulse Agent] Monitoring: ${config.nodeName} every ${config.interval / 1000}s`);
    
    // Initial heartbeat
    await sendHeartbeat();
    
    // Setup interval
    setInterval(sendHeartbeat, config.interval);
}

start().catch(err => {
    console.error('[Fatal] Agent failed to start:', err);
    process.exit(1);
});
