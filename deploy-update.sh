#!/bin/bash

# GROWF Update Deployment Script
# For updating existing deployment on lab.cipme.ci

set -e

echo "🔄 GROWF Update Deployment - lab.cipme.ci"
echo "========================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Configuration
PROJECT_DIR="/opt/growf"
APP_USER="growf"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

print_status "Starting GROWF update deployment..."

# 1. Pull latest changes
print_status "1️⃣ Pulling latest changes from GitHub..."
cd $PROJECT_DIR
git pull origin master

print_success "Latest changes pulled"

# 2. Update backend dependencies
print_status "2️⃣ Updating backend dependencies..."
cd $PROJECT_DIR/backend
sudo -u $APP_USER npm install
sudo -u $APP_USER npx prisma generate

print_success "Backend dependencies updated"

# 3. Update and build frontend
print_status "3️⃣ Building frontend..."
cd $PROJECT_DIR/frontend

# Ensure production .env
cat > .env << EOF
VITE_API_URL=https://lab.cipme.ci/api
EOF

chown $APP_USER:$APP_USER .env

sudo -u $APP_USER npm install
sudo -u $APP_USER npx vite build

print_success "Frontend built successfully"

# 4. Restart backend service
print_status "4️⃣ Restarting backend service..."
cd $PROJECT_DIR/backend

# Stop existing PM2 process
sudo -u $APP_USER pm2 stop growf-backend 2>/dev/null || true

# Start with updated configuration
sudo -u $APP_USER pm2 start ecosystem.config.js

print_success "Backend service restarted"

# 5. Reload Nginx
print_status "5️⃣ Reloading Nginx..."
systemctl reload nginx

print_success "Nginx reloaded"

# 6. Final checks
print_status "6️⃣ Performing health checks..."
sleep 5

# Check PM2 status
if sudo -u $APP_USER pm2 list | grep -q "growf-backend.*online"; then
    print_success "✅ Backend is running"
else
    print_warning "⚠️ Backend status unclear"
    sudo -u $APP_USER pm2 status
fi

# Check backend health
if curl -f http://localhost:3005/health > /dev/null 2>&1; then
    print_success "✅ Backend health check passed"
else
    print_warning "⚠️ Backend health check failed"
fi

# Check frontend
if curl -f https://lab.cipme.ci > /dev/null 2>&1; then
    print_success "✅ Frontend is accessible"
else
    print_warning "⚠️ Frontend accessibility issue"
fi

echo ""
echo "========================================"
print_success "🎉 GROWF UPDATE COMPLETED!"
echo "========================================"
echo ""
print_success "🌐 Application: https://lab.cipme.ci"
print_success "🔧 Check logs: sudo -u $APP_USER pm2 logs growf-backend"
print_success "📊 PM2 status: sudo -u $APP_USER pm2 status"
echo ""