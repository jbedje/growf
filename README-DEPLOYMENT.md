# GROWF Deployment Guide

## 🚀 Production Deployment on lab.cipme.ci

### Server Configuration
- **Server**: Contabo VM (Ubuntu)
- **IP**: 184.174.37.7
- **Domain**: lab.cipme.ci
- **SSL**: Let's Encrypt (auto-renewal)

### Deployment Options

#### 1. Initial Deployment (Fresh Server)
```bash
# On fresh Ubuntu server
git clone https://github.com/jbedje/growf.git /opt/growf
cd /opt/growf
chmod +x deploy-final.sh
./deploy-final.sh
```

#### 2. Update Deployment (Existing Server)
```bash
# On server with existing deployment
cd /opt/growf
chmod +x deploy-update.sh
./deploy-update.sh
```

#### 3. CI/CD Deployment (Automated)
Push to master branch triggers automatic deployment via GitHub Actions.

### CI/CD Setup

#### Required GitHub Secrets
Add these secrets in your GitHub repository settings:

```
HOST=184.174.37.7
USERNAME=root
SSH_KEY=<your-private-ssh-key>
```

#### SSH Key Setup
1. Generate SSH key pair:
   ```bash
   ssh-keygen -t rsa -b 4096 -C "github-actions"
   ```

2. Add public key to server:
   ```bash
   ssh-copy-id root@184.174.37.7
   ```

3. Add private key to GitHub secrets as `SSH_KEY`

### Manual Deployment Commands

#### Check Application Status
```bash
# PM2 status
sudo -u growf pm2 status

# View logs
sudo -u growf pm2 logs growf-backend

# System services
systemctl status nginx postgresql redis-server
```

#### Restart Services
```bash
# Restart backend
sudo -u growf pm2 restart growf-backend

# Restart Nginx
systemctl restart nginx

# Restart all
sudo -u growf pm2 restart all && systemctl restart nginx
```

#### Database Management
```bash
# Connect to database
sudo -u postgres psql growf_prod

# Run migrations
cd /opt/growf/backend
sudo -u growf npx prisma db push

# Create superadmin
sudo -u growf npm run create:superadmin
```

### Application URLs
- **Frontend**: https://lab.cipme.ci
- **Backoffice**: https://lab.cipme.ci/backoffice
- **API**: https://lab.cipme.ci/api
- **Health Check**: https://lab.cipme.ci/health

### Default Credentials
- **Superadmin**: superadmin@growf.fr / SuperAdmin2024!

### Troubleshooting

#### Backend Issues
```bash
# Check logs
sudo -u growf pm2 logs growf-backend --lines 50

# Test database connection
cd /opt/growf/backend
PGPASSWORD=GrowfDB2024! psql -h localhost -U growf_user -d growf_prod -c "SELECT 1;"

# Restart with debug
sudo -u growf pm2 stop growf-backend
cd /opt/growf/backend
sudo -u growf npm run dev
```

#### Nginx Issues
```bash
# Test configuration
nginx -t

# Check SSL certificates
certbot certificates

# Renew SSL
certbot renew
```

#### Common Fixes
```bash
# Fix permissions
chown -R growf:growf /opt/growf

# Reinstall dependencies
cd /opt/growf/backend && sudo -u growf npm install
cd /opt/growf/frontend && sudo -u growf npm install

# Rebuild frontend
cd /opt/growf/frontend
echo "VITE_API_URL=https://lab.cipme.ci/api" > .env
sudo -u growf npx vite build
```

### Monitoring
- **PM2 Dashboard**: `sudo -u growf pm2 monit`
- **Logs Location**: `/var/log/growf/`
- **Nginx Logs**: `/var/log/nginx/`

### Backup & Recovery
- **Automatic Backups**: Daily at 2 AM via cron
- **Backup Location**: `/opt/growf-backups/`
- **Manual Backup**: `/opt/backup-growf.sh`