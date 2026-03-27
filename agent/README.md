# TT-Pulse Agent

Modular lightweight monitoring agent for TT-Pulse.

## Installation & Deployment (Arch Linux)

Install the agent on any node with a single command:

```bash
cd agent && npm run setup
```

This will:
1. Install dependencies.
2. Setup a `.env` file (if missing).
3. Create and start a **systemd** service (`ttpulse-agent`).

### Configuration
Edit `agent/.env` to set your Supabase credentials and node name:
```env
COMPUTER_NAME="My-Node"
SUPABASE_URL="https://xxx.supabase.co"
SUPABASE_KEY="eyJ..."
PROJECTS_PATH="/home/user/projects"
```

### Management Commands
- **Update:** `npm run update` (Pulls changes and restarts service)
- **Status:** `npm run status`
- **Logs:** `npm run logs`

## Modular Architecture (Collectors)
Add new monitoring features by creating a file in `src/collectors/`.

Example `temp.js`:
```javascript
module.exports = {
    name: 'temperature',
    async collect() {
        return { cpu_temp: 45 };
    }
};
```
The agent automatically loads all files in the `collectors/` directory.
