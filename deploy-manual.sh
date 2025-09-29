#!/bin/bash

# GROWF Manual Deployment Script (without GitHub dependency)
# For Contabo VM (Ubuntu) - growf2.cipme.ci

set -e

echo "🚀 Starting GROWF Manual Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "This script must be run as root (sudo)"
   exit 1
fi

# Configuration
DOMAIN="growf2.cipme.ci"
EMAIL="admin@cipme.ci"
PROJECT_DIR="/opt/growf"
BACKUP_DIR="/opt/growf-backups"

print_status "This script will deploy GROWF without requiring GitHub access"
print_warning "Make sure you have uploaded all the project files to $PROJECT_DIR first!"

read -p "Have you uploaded the project files to $PROJECT_DIR? (y/N): " confirm
if [[ ! $confirm =~ ^[Yy]$ ]]; then
    print_error "Please upload the project files first, then run this script again"
    exit 1
fi

if [ ! -f "$PROJECT_DIR/docker-compose.prod.yml" ]; then
    print_error "docker-compose.prod.yml not found in $PROJECT_DIR"
    print_error "Please ensure all project files are uploaded to $PROJECT_DIR"
    exit 1
fi

cd $PROJECT_DIR

print_status "Updating system packages..."
apt update && apt upgrade -y

print_status "Installing required packages..."
apt install -y curl wget nginx certbot python3-certbot-nginx ufw fail2ban

# Install Docker if not present
if ! command -v docker &> /dev/null; then
    print_status "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
fi

# Install Docker Compose if not present
if ! command -v docker-compose &> /dev/null; then
    print_status "Installing Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

print_status "Configuring firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

print_status "Configuring fail2ban..."
cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Create necessary directories
print_status "Setting up directories..."
mkdir -p $BACKUP_DIR
mkdir -p /var/log/growf
mkdir -p uploads
mkdir -p logs

# Copy production environment file if not exists
if [ ! -f ".env" ]; then
    if [ -f ".env.prod" ]; then
        print_status "Setting up environment configuration..."
        cp .env.prod .env
        print_warning "Please edit .env file with your production values:"
        print_warning "- Database passwords"
        print_warning "- JWT secrets"
        print_warning "- Other sensitive data"
        read -p "Press enter when you've configured the .env file..."
    else
        print_error ".env.prod file not found! Please ensure it's uploaded."
        exit 1
    fi
fi

# Generate SSL certificate with Certbot
print_status "Setting up SSL certificate with Let's Encrypt..."
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

# Create SSL certificate directory for Docker
mkdir -p nginx/ssl/live/$DOMAIN
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/live/$DOMAIN/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/live/$DOMAIN/

# Set proper permissions
chown -R www-data:www-data nginx/ssl
chmod -R 644 nginx/ssl

# Create backup script
print_status "Setting up backup system..."
cat > /opt/backup-growf.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/growf-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR/$DATE

# Backup database
docker-compose -f /opt/growf/docker-compose.prod.yml exec -T postgres pg_dump -U growf_user growf_prod > $BACKUP_DIR/$DATE/database.sql

# Backup uploads
cp -r /opt/growf/uploads $BACKUP_DIR/$DATE/

# Backup configuration
cp /opt/growf/.env $BACKUP_DIR/$DATE/

# Keep only last 7 days of backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/$DATE"
EOF

chmod +x /opt/backup-growf.sh

# Setup cron for automatic backups
print_status "Setting up automatic backups..."
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-growf.sh") | crontab -

# Create systemd service for auto-start
print_status "Setting up systemd service..."
cat > /etc/systemd/system/growf.service << EOF
[Unit]
Description=GROWF Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=$PROJECT_DIR
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable growf

# Start the application
print_status "Starting GROWF application..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Initialize database
print_status "Initializing database..."
docker-compose -f docker-compose.prod.yml exec backend npm run db:push
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed

# Setup SSL renewal
print_status "Setting up SSL certificate auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'cp /etc/letsencrypt/live/$DOMAIN/*.pem $PROJECT_DIR/nginx/ssl/live/$DOMAIN/ && docker-compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx'") | crontab -

# Final status check
print_status "Checking service status..."
if curl -f https://$DOMAIN/health > /dev/null 2>&1; then
    print_success "✅ GROWF is successfully deployed and running!"
    print_success "🌐 Application URL: https://$DOMAIN"
    print_success "🔒 SSL Certificate: Active"
    print_success "🛡️  Firewall: Configured"
    print_success "💾 Backups: Automated (daily at 2 AM)"
else
    print_warning "⚠️  Deployment completed but health check failed"
    print_warning "Please check the logs: docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs"
fi

print_status "Deployment completed!"
print_warning "Important reminders:"
print_warning "1. Create your superadmin account:"
print_warning "   docker-compose -f $PROJECT_DIR/docker-compose.prod.yml exec backend npm run create:superadmin"
print_warning "2. Monitor logs regularly:"
print_warning "   docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs -f"

echo ""
print_success "🎉 GROWF Manual Deployment Complete!"
echo ""