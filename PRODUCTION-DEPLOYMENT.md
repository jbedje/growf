# GROWF Production Deployment Guide

## 🚀 Production Deployment Checklist

### Prerequisites
- [ ] Docker and Docker Compose installed
- [ ] Domain name configured (DNS pointing to your server)
- [ ] SSL certificates (Let's Encrypt recommended)
- [ ] Email service credentials (SMTP)
- [ ] Server with at least 4GB RAM and 2 CPU cores

### 1. Environment Configuration

#### Backend Environment Variables
Copy and configure the production environment:

```bash
cp backend/.env.production backend/.env
```

**Required Environment Variables:**
```bash
# Database
DATABASE_URL="postgresql://growf_user:SECURE_PASSWORD@localhost:5432/growf_prod"

# JWT Security (CRITICAL: Generate new secrets)
JWT_SECRET="your-64-character-minimum-secret-key-here"
JWT_REFRESH_SECRET="your-different-64-character-refresh-secret-here"

# CORS (Replace with your domain)
CORS_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"

# Email Service
SMTP_HOST="smtp.your-provider.com"
SMTP_PORT=587
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"
FROM_EMAIL="noreply@yourdomain.com"

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # 100 requests per window
```

#### Frontend Environment Variables
```bash
# frontend/.env.production
VITE_API_URL=https://api.yourdomain.com
```

### 2. Security Configuration

#### Generate Secure Secrets
```bash
# Generate JWT secrets (64+ characters recommended)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### Update Production Passwords
- [ ] Change default database passwords
- [ ] Generate strong JWT secrets
- [ ] Configure Redis password
- [ ] Update CORS origins to your domain

### 3. Database Setup

#### Option A: Using Docker Compose (Recommended)
```bash
# Start only database services
docker-compose -f docker-compose.prod.yml up -d postgres redis

# Wait for services to be ready, then setup database
cd backend
npm run db:generate
npm run db:push
npm run db:seed
```

#### Option B: External Database
If using managed database services (AWS RDS, etc.):
1. Update `DATABASE_URL` to point to your managed database
2. Run migrations: `npm run db:migrate`
3. Seed database: `npm run db:seed`

### 4. Build and Deploy

#### Build Application
```bash
# Build backend
cd backend
npm run build:production

# Build frontend
cd ../frontend
npm run build
```

#### Deploy with Docker
```bash
# Full production deployment
docker-compose -f docker-compose.prod.yml up -d

# Or deploy specific services
docker-compose -f docker-compose.prod.yml up -d backend frontend
```

### 5. SSL/TLS Configuration

#### Using Let's Encrypt with Nginx
1. Install Certbot
2. Generate certificates:
   ```bash
   certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```
3. Configure auto-renewal

#### Manual SSL Setup
Place certificates in `nginx/ssl/` directory:
- `cert.pem` - Certificate file
- `privkey.pem` - Private key file

### 6. Health Checks and Monitoring

#### Verify Deployment
```bash
# Check all services
docker-compose -f docker-compose.prod.yml ps

# Check backend health
curl https://api.yourdomain.com/health

# Check frontend
curl https://yourdomain.com
```

#### Monitor Logs
```bash
# View backend logs
docker-compose -f docker-compose.prod.yml logs -f backend

# View all service logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 7. Performance Optimization

#### Database Optimization
- [ ] Configure PostgreSQL connection pooling
- [ ] Set up database backups
- [ ] Monitor query performance

#### Redis Configuration
- [ ] Configure Redis persistence
- [ ] Set up Redis clustering (for high availability)

#### Application Optimization
- [ ] Enable gzip compression (handled by Nginx)
- [ ] Configure CDN for static assets
- [ ] Set up application monitoring (APM)

### 8. Security Hardening

#### Server Security
- [ ] Configure firewall (allow only necessary ports)
- [ ] Set up fail2ban for intrusion prevention
- [ ] Regular security updates
- [ ] Monitor security logs

#### Application Security
- [ ] Implement API rate limiting (✅ Already configured)
- [ ] Set up request logging
- [ ] Configure CORS properly (✅ Already configured)
- [ ] Enable security headers (✅ Already configured)

## 🚧 Maintenance Commands

### Database Backups
```bash
# Create backup
docker exec growf_postgres_prod pg_dump -U growf_user growf_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker exec -i growf_postgres_prod psql -U growf_user growf_prod < backup.sql
```

### Application Updates
```bash
# Update application code
git pull origin main

# Rebuild and redeploy
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling
```bash
# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

## 🔍 Troubleshooting

### Common Issues

#### Backend Won't Start
1. Check environment variables
2. Verify database connectivity
3. Check logs: `docker-compose -f docker-compose.prod.yml logs backend`

#### Frontend Build Fails
1. Check Node.js version (18+ required)
2. Clear cache: `rm -rf node_modules/.vite && npm install`
3. Verify environment variables

#### Database Connection Issues
1. Check PostgreSQL container status
2. Verify credentials in environment variables
3. Check network connectivity between containers

### Performance Issues
1. Monitor resource usage: `docker stats`
2. Check database query performance
3. Analyze application logs
4. Consider horizontal scaling

## 📊 Monitoring and Alerts

### Recommended Monitoring
- [ ] Application Performance Monitoring (APM)
- [ ] Database performance monitoring
- [ ] Server resource monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation

### Key Metrics to Monitor
- Response times
- Error rates
- Database connection pool usage
- Memory and CPU usage
- Disk space usage

## 🔐 Security Best Practices

### Ongoing Security Tasks
- [ ] Regular security audits
- [ ] Dependency vulnerability scanning
- [ ] Log monitoring for suspicious activity
- [ ] Regular backup testing
- [ ] Access control review

### Incident Response
1. Have a disaster recovery plan
2. Document emergency procedures
3. Set up automated alerts
4. Regular security drills

---

## 📞 Support

For production support and issues:
1. Check application logs first
2. Review this deployment guide
3. Consult the main documentation in README.md
4. Check Docker container status and logs

**Remember**: Never commit production environment variables or secrets to version control!