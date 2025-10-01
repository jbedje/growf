# GROWF Production Deployment Guide

## 🚀 Ready for Production Deployment on lab.cipme.ci

### Current Status
✅ **Backend Configuration**: Complete with production .env
✅ **Frontend Build**: Successfully built for production
✅ **Database Configuration**: PostgreSQL connection configured
✅ **Environment Variables**: Set for lab.cipme.ci domain

### Deployment Scripts Available

1. **deploy-final.sh** - Comprehensive native deployment (Recommended)
2. **deploy-native.sh** - Original native deployment script
3. **deploy-lab.sh** - Lab-specific deployment
4. **fix-deployment.sh** - Quick fixes for common issues

### Quick Deployment Steps

1. **Upload files to server**:
   ```bash
   scp -r GROWF root@184.174.37.7:/opt/
   ```

2. **Run deployment script**:
   ```bash
   ssh root@184.174.37.7
   cd /opt/growf
   chmod +x deploy-final.sh
   ./deploy-final.sh
   ```

3. **Create superadmin account**:
   ```bash
   cd /opt/growf/backend
   sudo -u growf npm run create:superadmin
   ```

### Application URLs
- **Frontend**: https://lab.cipme.ci
- **Backoffice**: https://lab.cipme.ci/backoffice
- **API**: https://lab.cipme.ci/api
- **Health Check**: https://lab.cipme.ci/health

### Default Credentials
- **Superadmin**: superadmin@growf.fr / SuperAdmin2024!

### Production Configuration
- **Domain**: lab.cipme.ci
- **Frontend Port**: 80/443 (via Nginx)
- **Backend Port**: 3005 (internal)
- **Database**: PostgreSQL on same VM
- **Cache**: Redis on same VM
- **SSL**: Let's Encrypt (auto-renewal)
- **Process Manager**: PM2
- **Web Server**: Nginx

### Key Files Configured
- `backend/.env` - Production backend configuration
- `frontend/.env` - Production frontend configuration
- `frontend/dist/` - Built frontend assets
- `deploy-final.sh` - Complete deployment script

### Monitoring Commands
```bash
# Check PM2 processes
sudo -u growf pm2 status

# Check logs
sudo -u growf pm2 logs growf-backend

# Check services
systemctl status nginx postgresql redis-server

# Test API
curl https://lab.cipme.ci/health
```

### Troubleshooting
If deployment fails:
1. Check the logs: `sudo -u growf pm2 logs`
2. Verify SSL certificate: `certbot certificates`
3. Test Nginx config: `nginx -t`
4. Restart services: `sudo -u growf pm2 restart growf-backend`

The application is now ready for production deployment! 🎉