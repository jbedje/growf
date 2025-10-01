#!/bin/bash

# GROWF Final Production Deployment - lab.cipme.ci
# Optimized deployment script for Contabo VM
# This script assumes you have uploaded the GROWF files to /opt/growf

set -e

echo "🚀 GROWF Final Production Deployment - lab.cipme.ci"
echo "=================================================="

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
DOMAIN="lab.cipme.ci"
EMAIL="admin@cipme.ci"
PROJECT_DIR="/opt/growf"
APP_USER="growf"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

print_status "Starting GROWF deployment for $DOMAIN..."

# 1. System Update
print_status "1️⃣ Updating system packages..."
apt update && apt upgrade -y

# 2. Install Dependencies
print_status "2️⃣ Installing system dependencies..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs nginx postgresql postgresql-contrib redis-server certbot python3-certbot-nginx build-essential git

# 3. Create Application User
print_status "3️⃣ Creating application user..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    print_success "User $APP_USER created"
fi

# 4. Configure PostgreSQL
print_status "4️⃣ Setting up PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Create database and user
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS growf_prod;
DROP USER IF EXISTS growf_user;
CREATE USER growf_user WITH PASSWORD 'GrowfDB2024!';
CREATE DATABASE growf_prod OWNER growf_user;
GRANT ALL PRIVILEGES ON DATABASE growf_prod TO growf_user;
ALTER USER growf_user CREATEDB;
\q
EOF

print_success "PostgreSQL configured successfully"

# 5. Configure Redis
print_status "5️⃣ Setting up Redis..."
systemctl start redis-server
systemctl enable redis-server

# Configure Redis with password
echo "requirepass GrowfRedis2024!" >> /etc/redis/redis.conf
systemctl restart redis-server

print_success "Redis configured successfully"

# 6. Setup Project Directory
print_status "6️⃣ Setting up project..."
cd $PROJECT_DIR

# Change ownership
chown -R $APP_USER:$APP_USER $PROJECT_DIR

# 7. Install Backend Dependencies
print_status "7️⃣ Installing backend dependencies..."
cd $PROJECT_DIR/backend
sudo -u $APP_USER npm install

# 8. Configure Backend Environment
print_status "8️⃣ Configuring backend environment..."
cat > .env << EOF
NODE_ENV=production
PORT=3005
DATABASE_URL=postgresql://growf_user:GrowfDB2024!@localhost:5432/growf_prod
REDIS_URL=redis://:GrowfRedis2024!@localhost:6379
JWT_SECRET=$(openssl rand -base64 32 | tr -d '=+/')
JWT_REFRESH_SECRET=$(openssl rand -base64 32 | tr -d '=+/')
CORS_ORIGINS=https://$DOMAIN
SMTP_HOST=mail.smtp2go.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=growf@cipme.ci
SMTP_PASS=Cipme@2024
EMAIL_FROM=growf@cipme.ci
FRONTEND_URL=https://$DOMAIN
BACKEND_URL=https://$DOMAIN/api
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads
EOF

chown $APP_USER:$APP_USER .env

# Generate Prisma client and setup database
print_status "9️⃣ Setting up database schema..."
sudo -u $APP_USER npx prisma generate
sudo -u $APP_USER npx prisma db push

print_success "Backend configured successfully"

# 10. Configure Frontend
print_status "🔟 Configuring frontend..."
cd $PROJECT_DIR/frontend

# Create frontend environment
cat > .env << EOF
VITE_API_URL=https://$DOMAIN/api
EOF

chown $APP_USER:$APP_USER .env

# Install dependencies and build
sudo -u $APP_USER npm install
sudo -u $APP_USER npx vite build

print_success "Frontend built successfully"

# 11. Setup SSL Certificate
print_status "1️⃣1️⃣ Setting up SSL certificate..."
# Stop nginx temporarily for certbot standalone
systemctl stop nginx 2>/dev/null || true
fuser -k 80/tcp 2>/dev/null || true

# Get SSL certificate
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

print_success "SSL certificate obtained"

# 12. Configure Nginx
print_status "1️⃣2️⃣ Configuring Nginx..."
cat > /etc/nginx/sites-available/growf << EOF
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name $DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    server_name $DOMAIN;

    # SSL configuration
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Frontend (React build)
    location / {
        root $PROJECT_DIR/frontend/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)\$ {
            expires 1y;
            add_header Cache-Control "public, no-transform";
        }
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3005/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3005/health;
    }
}
EOF

# Enable site
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/growf /etc/nginx/sites-enabled/

# Test nginx configuration
nginx -t

print_success "Nginx configured successfully"

# 13. Install PM2 and Setup Backend Service
print_status "1️⃣3️⃣ Setting up PM2 process manager..."
npm install -g pm2

# Create PM2 ecosystem file
cd $PROJECT_DIR/backend
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'growf-backend',
    script: 'src/dev-server.ts',
    interpreter: 'node',
    interpreter_args: '--loader tsx',
    cwd: '$PROJECT_DIR/backend',
    env: {
      NODE_ENV: 'production',
      PORT: 3005
    },
    log_file: '/var/log/growf/combined.log',
    out_file: '/var/log/growf/out.log',
    error_file: '/var/log/growf/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
};
EOF

# Create log directory
mkdir -p /var/log/growf
chown -R $APP_USER:$APP_USER /var/log/growf

# Start the application with PM2
sudo -u $APP_USER pm2 start ecosystem.config.js
sudo -u $APP_USER pm2 save
sudo -u $APP_USER pm2 startup

print_success "Backend service started with PM2"

# 14. Start Nginx
print_status "1️⃣4️⃣ Starting Nginx..."
systemctl enable nginx
systemctl start nginx

# 15. Setup Automatic Backups
print_status "1️⃣5️⃣ Setting up automatic backups..."
cat > /opt/backup-growf.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/growf-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR/$DATE

# Backup database
pg_dump -h localhost -U growf_user growf_prod > $BACKUP_DIR/$DATE/database.sql

# Backup uploads
cp -r /opt/growf/uploads $BACKUP_DIR/$DATE/ 2>/dev/null || true

# Backup configuration
cp /opt/growf/backend/.env $BACKUP_DIR/$DATE/backend.env
cp /opt/growf/frontend/.env $BACKUP_DIR/$DATE/frontend.env

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

echo "Backup completed: $BACKUP_DIR/$DATE"
EOF

chmod +x /opt/backup-growf.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-growf.sh") | crontab -

# 16. Setup SSL Auto-Renewal
print_status "1️⃣6️⃣ Setting up SSL auto-renewal..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | crontab -

# 17. Final Status Check
print_status "1️⃣7️⃣ Performing final checks..."
sleep 10

# Check services
if systemctl is-active --quiet nginx; then
    print_success "✅ Nginx is running"
else
    print_warning "⚠️ Nginx is not running"
fi

if systemctl is-active --quiet postgresql; then
    print_success "✅ PostgreSQL is running"
else
    print_warning "⚠️ PostgreSQL is not running"
fi

if systemctl is-active --quiet redis-server; then
    print_success "✅ Redis is running"
else
    print_warning "⚠️ Redis is not running"
fi

if sudo -u $APP_USER pm2 list | grep -q "growf-backend.*online"; then
    print_success "✅ Backend is running"
else
    print_warning "⚠️ Backend is not running"
fi

# Test connectivity
if curl -f https://$DOMAIN > /dev/null 2>&1; then
    print_success "✅ Application is accessible at https://$DOMAIN"
else
    print_warning "⚠️ Application may not be accessible yet"
fi

echo ""
echo "=================================================="
print_success "🎉 GROWF DEPLOYMENT COMPLETED!"
echo "=================================================="
echo ""
print_success "🌐 Application: https://$DOMAIN"
print_success "🔒 SSL: Let's Encrypt configured"
print_success "🗄️ Database: PostgreSQL native"
print_success "💾 Backups: Automated (daily at 2 AM)"
print_success "📊 Process Manager: PM2"
echo ""
print_warning "Final Steps:"
print_warning "1. Create superadmin account:"
print_warning "   cd $PROJECT_DIR/backend && sudo -u $APP_USER npm run create:superadmin"
print_warning "2. Monitor logs:"
print_warning "   sudo -u $APP_USER pm2 logs growf-backend"
print_warning "3. PM2 commands:"
print_warning "   sudo -u $APP_USER pm2 status"
print_warning "   sudo -u $APP_USER pm2 restart growf-backend"
print_warning "4. Test the application: https://$DOMAIN"
echo ""