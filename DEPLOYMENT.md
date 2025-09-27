# GROWF Production Deployment Guide

## 🎯 Overview

This guide provides step-by-step instructions to deploy GROWF on your Contabo VM with the following specifications:

- **Server**: Ubuntu on Contabo VM (184.174.37.7)
- **Domain**: growf2.cipme.ci
- **SSL**: Let's Encrypt (free)
- **Database**: PostgreSQL on the same VM
- **Email**: SMTP via smtp2go
- **Architecture**: Docker + Docker Compose + Nginx reverse proxy

## 🔧 Prerequisites

- Ubuntu server with root access
- Domain name (growf2.cipme.ci) pointing to your server IP
- SMTP credentials from smtp2go
- SSH access to your server

## 🚀 Quick Deployment (Automated)

### Option 1: One-Command Deployment

```bash
# Connect to your server
ssh root@184.174.37.7

# Download and run the deployment script
curl -fsSL https://raw.githubusercontent.com/YourUsername/growf/main/deploy.sh | bash
```

### Option 2: Manual Step-by-Step Deployment

## 📋 Manual Deployment Steps

### 1. Server Preparation

```bash
# Update system
apt update && apt upgrade -y

# Install required packages
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
rm get-docker.sh

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

### 2. Security Configuration

```bash
# Configure firewall
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 'Nginx Full'
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Configure fail2ban
cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3
EOF

systemctl enable fail2ban
systemctl restart fail2ban
```

### 3. Clone Repository

```bash
# Create project directory
mkdir -p /opt/growf
cd /opt/growf

# Clone the repository
git clone https://github.com/YourUsername/growf.git .
```

### 4. Environment Configuration

```bash
# Copy production environment template
cp .env.prod .env

# Edit environment variables
nano .env
```

**Important**: Update these values in your `.env` file:

```env
# Database Configuration
DB_PASSWORD=your_very_secure_db_password

# Redis Configuration
REDIS_PASSWORD=your_very_secure_redis_password

# JWT Secrets (generate new ones!)
JWT_SECRET=your_very_secure_jwt_secret_at_least_32_characters_long
JWT_REFRESH_SECRET=your_very_secure_refresh_secret_at_least_32_characters_long

# SMTP Password (already configured)
SMTP_PASSWORD=Cipme@2024
```

### 5. SSL Certificate Setup

```bash
# Get SSL certificate from Let's Encrypt
certbot --nginx -d growf2.cipme.ci --non-interactive --agree-tos --email admin@cipme.ci

# Copy certificates for Docker
mkdir -p nginx/ssl/live/growf2.cipme.ci
cp /etc/letsencrypt/live/growf2.cipme.ci/fullchain.pem nginx/ssl/live/growf2.cipme.ci/
cp /etc/letsencrypt/live/growf2.cipme.ci/privkey.pem nginx/ssl/live/growf2.cipme.ci/

# Set permissions
chown -R www-data:www-data nginx/ssl
chmod -R 644 nginx/ssl
```

### 6. Database Initialization

```bash
# Start database services first
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for databases to be ready
sleep 30

# Initialize database schema
docker-compose -f docker-compose.prod.yml exec postgres psql -U growf_user -d growf_prod -c "SELECT version();"
```

### 7. Application Deployment

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services to start
sleep 60

# Initialize database schema
docker-compose -f docker-compose.prod.yml exec backend npm run db:push

# Seed initial data
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed

# Create superadmin account
docker-compose -f docker-compose.prod.yml exec backend npm run create:superadmin
```

### 8. System Service Setup

```bash
# Create systemd service for auto-start
cat > /etc/systemd/system/growf.service << 'EOF'
[Unit]
Description=GROWF Application
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/opt/growf
ExecStart=/usr/local/bin/docker-compose -f docker-compose.prod.yml up -d
ExecStop=/usr/local/bin/docker-compose -f docker-compose.prod.yml down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable growf
```

### 9. Backup Configuration

```bash
# Create backup script
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

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/$DATE"
EOF

chmod +x /opt/backup-growf.sh

# Setup daily backups at 2 AM
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-growf.sh") | crontab -
```

### 10. SSL Auto-Renewal

```bash
# Setup SSL certificate auto-renewal
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'cp /etc/letsencrypt/live/growf2.cipme.ci/*.pem /opt/growf/nginx/ssl/live/growf2.cipme.ci/ && docker-compose -f /opt/growf/docker-compose.prod.yml restart nginx'") | crontab -
```

## 🔍 Verification

### Health Check

```bash
# Check if all services are running
docker-compose -f /opt/growf/docker-compose.prod.yml ps

# Test application
curl -f https://growf2.cipme.ci/health

# Check logs
docker-compose -f /opt/growf/docker-compose.prod.yml logs -f
```

### Access Points

- **Frontend**: https://growf2.cipme.ci
- **Backoffice**: https://growf2.cipme.ci/backoffice
- **API**: https://growf2.cipme.ci/api

### Default Superadmin Account

- **Email**: `superadmin@growf.fr`
- **Password**: `SuperAdmin2024!`

⚠️ **IMPORTANT**: Change this password immediately after first login!

## 🛠️ Management Commands

### Start/Stop Services

```bash
cd /opt/growf

# Start all services
docker-compose -f docker-compose.prod.yml up -d

# Stop all services
docker-compose -f docker-compose.prod.yml down

# Restart specific service
docker-compose -f docker-compose.prod.yml restart backend

# View logs
docker-compose -f docker-compose.prod.yml logs -f [service_name]
```

### Database Management

```bash
# Access database
docker-compose -f docker-compose.prod.yml exec postgres psql -U growf_user -d growf_prod

# Run migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate

# Backup database
docker-compose -f docker-compose.prod.yml exec postgres pg_dump -U growf_user growf_prod > backup.sql

# Restore database
docker-compose -f docker-compose.prod.yml exec -T postgres psql -U growf_user -d growf_prod < backup.sql
```

### Application Updates

```bash
cd /opt/growf

# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build

# Run any new migrations
docker-compose -f docker-compose.prod.yml exec backend npm run db:migrate
```

## 📊 Monitoring

### System Monitoring

```bash
# Check system resources
htop
df -h
free -h

# Check Docker stats
docker stats

# Check service status
systemctl status growf
systemctl status nginx
systemctl status fail2ban
```

### Application Monitoring

```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Database logs
docker-compose -f docker-compose.prod.yml logs -f postgres
```

## 🚨 Troubleshooting

### Common Issues

1. **SSL Certificate Issues**
   ```bash
   # Renew certificate manually
   certbot renew --force-renewal -d growf2.cipme.ci

   # Copy to Docker volume
   cp /etc/letsencrypt/live/growf2.cipme.ci/*.pem /opt/growf/nginx/ssl/live/growf2.cipme.ci/

   # Restart nginx
   docker-compose -f docker-compose.prod.yml restart nginx
   ```

2. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose -f docker-compose.prod.yml exec postgres pg_isready -U growf_user

   # Reset database connection
   docker-compose -f docker-compose.prod.yml restart postgres backend
   ```

3. **Permission Issues**
   ```bash
   # Fix file permissions
   chown -R 1001:1001 /opt/growf/uploads
   chown -R www-data:www-data /opt/growf/nginx/ssl
   ```

### Emergency Recovery

```bash
# Complete service restart
cd /opt/growf
docker-compose -f docker-compose.prod.yml down
docker system prune -f
docker-compose -f docker-compose.prod.yml up -d --build

# Restore from backup
/opt/backup-growf.sh
# Then restore specific backup as needed
```

## 📞 Support

For deployment issues:
1. Check service logs first
2. Verify environment configuration
3. Ensure domain DNS is properly configured
4. Check firewall and SSL certificate status

## 🎉 Success!

Once deployed successfully, your GROWF application will be:

- ✅ Running on https://growf2.cipme.ci
- ✅ Protected by SSL/TLS encryption
- ✅ Secured with firewall and fail2ban
- ✅ Automatically backing up daily
- ✅ Auto-starting on server reboot
- ✅ SSL certificates auto-renewing

Welcome to GROWF production! 🚀