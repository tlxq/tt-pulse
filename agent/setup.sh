#!/bin/bash

# TT-Pulse Agent Setup Script for Arch Linux
set -e

echo "--- TT-Pulse Agent Setup ---"

# 1. Dependency Check
if ! command -v node &> /dev/null; then
    echo "[Error] Node.js is not installed. Please install it (sudo pacman -S nodejs npm)"
    exit 1
fi

# 2. Install Dependencies
echo "[1/4] Installing dependencies..."
npm install --production

# 3. Environment Setup
if [ ! -f .env ]; then
    echo "[2/4] Warning: .env file not found. Creating from example..."
    cp .env.example .env
    echo "PLEASE EDIT .env AND RESTART THE SERVICE LATER."
else
    echo "[2/4] .env file found."
fi

# 4. Systemd Service Creation
SERVICE_PATH="/etc/systemd/system/ttpulse-agent.service"
WORKING_DIR=$(pwd)
USER_NAME=$(whoami)

echo "[3/4] Creating systemd service..."
sudo bash -c "cat > $SERVICE_PATH <<EOF
[Unit]
Description=TT-Pulse Monitoring Agent
After=network.target

[Service]
Type=simple
User=$USER_NAME
WorkingDirectory=$WORKING_DIR
ExecStart=$(command -v node) src/index.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF"

# 5. Enable and Start
echo "[4/4] Activating service..."
sudo systemctl daemon-reload
sudo systemctl enable ttpulse-agent
sudo systemctl restart ttpulse-agent

echo "--- Setup Complete! ---"
echo "Check status: sudo systemctl status ttpulse-agent"
echo "Check logs: journalctl -u ttpulse-agent -f"
