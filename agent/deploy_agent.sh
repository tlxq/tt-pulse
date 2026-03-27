#!/bin/bash

# TT-Pulse Agent Deployment Script for Arch Linux
# Usage: ./deploy_agent.sh "COMPUTER_NAME" "/path/to/git/projects"

COMPUTER_NAME=$1
PROJECTS_PATH=$2

if [ -z "$COMPUTER_NAME" ]; then
    echo "Usage: ./deploy_agent.sh <COMPUTER_NAME> <PROJECTS_PATH>"
    exit 1
fi

echo "--- Setting up TT-Pulse Agent for: $COMPUTER_NAME ---"

# 1. Install Node.js if missing
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    sudo pacman -S --noconfirm nodejs npm
fi

# 2. Create directory and copy files
mkdir -p ~/tt-pulse-agent
cp agent.js ~/tt-pulse-agent/
cp package.json ~/tt-pulse-agent/

# 3. Create .env file
cat <<EOT > ~/tt-pulse-agent/.env
COMPUTER_NAME=$COMPUTER_NAME
PROJECTS_PATH=$PROJECTS_PATH
SUPABASE_URL=$(grep SUPABASE_URL .env | cut -d '=' -f2)
SUPABASE_KEY=$(grep SUPABASE_KEY .env | cut -d '=' -f2)
EOT

# 4. Install dependencies
cd ~/tt-pulse-agent
npm install --silent

# 5. Create Systemd Service
sudo bash -c "cat <<EOT > /etc/systemd/system/tt-pulse.service
[Unit]
Description=TT-Pulse Heartbeat Agent
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$HOME/tt-pulse-agent
ExecStart=/usr/bin/node agent.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOT"

# 6. Start Service
sudo systemctl daemon-reload
sudo systemctl enable --now tt-pulse.service

echo "--- Success! Agent is now running in the background. ---"
echo "Check status with: systemctl status tt-pulse.service"
