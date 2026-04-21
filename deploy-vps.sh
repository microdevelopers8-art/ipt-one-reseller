#!/bin/bash

# ==============================================================================
# IPT One Reseller Portal - Automated VPS Deployment Script
# Port: 3000 | Domain: reseller.iptone.co.za
# ==============================================================================

# 1. System Updates & Essential Tools
echo "🚀 Updating system packages..."
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git nginx ufw unzip

# 2. Node.js Installation (via NVM)
echo "📦 Installing Node.js 22 LTS..."
if [ ! -d "$HOME/.nvm" ]; then
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
fi
source ~/.bashrc
nvm install 22
nvm use 22

# 3. Global Packages
echo "⚡ Installing PM2..."
npm install -g pm2

# 4. Firewall Configuration
echo "🛡️ Configuring UFW Firewall..."
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
echo "y" | sudo ufw enable

# 5. Application Setup
# Assumes script is run from WITHIN the project folder or project folder is known
APP_DIR=$(pwd)

# Check if we are in a zip extraction scenario
if [ -f "project.zip" ]; then
    echo "📦 Extracting project.zip..."
    unzip -o project.zip -d .
    rm project.zip
fi

echo "📂 Setting up application in $APP_DIR..."

cd "$APP_DIR"

# Ensure production environment variables exist
if [ ! -f ".env.production" ]; then
    echo "⚠️ .env.production not found! Please ensure it is uploaded before running the final build."
    # We will look for production.env if uploaded and rename it
    if [ -f "production.env" ]; then
        mv production.env .env.production
        echo "✅ Renamed production.env to .env.production"
    else
        exit 1
    fi
fi

# Link production env to .env.local for Next.js
cp .env.production .env.local

echo "🏗️ Installing dependencies..."
npm install

echo "🔨 Building the IPT One Portal..."
npm run build

# 6. PM2 Launch
echo "🚀 Starting application with PM2..."
pm2 delete ipt-portal 2>/dev/null || true
pm2 start npm --name "ipt-portal" -- start

# Save PM2 process list and setup startup script
pm2 save
pm2 startup | tail -n 1 | bash

# 7. Nginx Configuration
echo "🌐 Configuring Nginx reverse proxy..."
NGINX_CONF="/etc/nginx/sites-available/reseller.iptone.co.za"

if [ -f "nginx-config" ]; then
    sudo cp nginx-config "$NGINX_CONF"
    sudo ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/"
    sudo rm -f /etc/nginx/sites-enabled/default
    sudo nginx -t && sudo systemctl restart nginx
    echo "✅ Nginx is now routing to port 3000."
else
    echo "❌ nginx-config file missing! Please upload it first."
fi

# 8. SSL Setup (Encouraged)
echo "🔒 SSL Setup..."
sudo apt install -y python3-certbot-nginx
echo "=============================================================================="
echo "✅ DEPLOYMENT COMPLETE!"
echo "Next step: Run the following to get your free SSL certificate:"
echo "sudo certbot --nginx -d reseller.iptone.co.za"
echo "=============================================================================="
