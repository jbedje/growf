#!/bin/bash

# GROWF Native Deployment (Sans Docker)
# Déploiement direct sur Ubuntu pour lab.cipme.ci

set -e

echo "🚀 GROWF Native Deployment - lab.cipme.ci"
echo "==============================================="

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

# Vérifier si on est root
if [[ $EUID -ne 0 ]]; then
   print_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

print_status "Déploiement natif GROWF sans Docker"
print_status "Serveur: Ubuntu - Contabo VM"
print_status "Domaine: $DOMAIN"

# 1. Mise à jour système
print_status "1️⃣ Mise à jour du système..."
apt update && apt upgrade -y

# 2. Installation des dépendances
print_status "2️⃣ Installation des dépendances..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
apt install -y nodejs nginx postgresql postgresql-contrib redis-server certbot python3-certbot-nginx build-essential git

# 3. Créer utilisateur pour l'application
print_status "3️⃣ Création de l'utilisateur application..."
if ! id "$APP_USER" &>/dev/null; then
    useradd -m -s /bin/bash $APP_USER
    print_success "Utilisateur $APP_USER créé"
fi

# 4. Configuration PostgreSQL
print_status "4️⃣ Configuration PostgreSQL..."
systemctl start postgresql
systemctl enable postgresql

# Créer base de données et utilisateur
sudo -u postgres psql << EOF
DROP DATABASE IF EXISTS growf_prod;
DROP USER IF EXISTS growf_user;
CREATE USER growf_user WITH PASSWORD 'GrowfDB2024!';
CREATE DATABASE growf_prod OWNER growf_user;
GRANT ALL PRIVILEGES ON DATABASE growf_prod TO growf_user;
ALTER USER growf_user CREATEDB;
\q
EOF

print_success "Base de données PostgreSQL configurée"

# 5. Configuration Redis
print_status "5️⃣ Configuration Redis..."
systemctl start redis-server
systemctl enable redis-server

# Configurer Redis avec mot de passe
echo "requirepass GrowfRedis2024!" >> /etc/redis/redis.conf
systemctl restart redis-server

print_success "Redis configuré"

# 6. Préparation du projet
print_status "6️⃣ Préparation du projet..."
cd $PROJECT_DIR

# Changer propriétaire
chown -R $APP_USER:$APP_USER $PROJECT_DIR

# 7. Installation dépendances backend
print_status "7️⃣ Installation backend..."
cd $PROJECT_DIR/backend
sudo -u $APP_USER npm install
sudo -u $APP_USER npm run build

# Créer fichier .env pour backend
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
EOF

chown $APP_USER:$APP_USER .env

# Générer client Prisma et migrations
sudo -u $APP_USER npx prisma generate
sudo -u $APP_USER npx prisma db push

print_success "Backend configuré"

# 8. Installation dépendances frontend
print_status "8️⃣ Installation frontend..."
cd $PROJECT_DIR/frontend

# Créer .env pour frontend
cat > .env << EOF
VITE_API_URL=https://$DOMAIN/api
EOF

chown $APP_USER:$APP_USER .env

sudo -u $APP_USER npm install
sudo -u $APP_USER npm run build

print_success "Frontend buildé"

# 9. Configuration Nginx
print_status "9️⃣ Configuration Nginx..."

# Arrêter nginx et libérer le port 80
systemctl stop nginx
fuser -k 80/tcp 2>/dev/null || true

# Obtenir certificat SSL
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

# Configuration Nginx
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

# Activer la configuration
rm -f /etc/nginx/sites-enabled/default
ln -sf /etc/nginx/sites-available/growf /etc/nginx/sites-enabled/

# Tester la configuration
nginx -t

print_success "Nginx configuré"

# 10. Créer services systemd
print_status "🔟 Création des services systemd..."

# Service backend
cat > /etc/systemd/system/growf-backend.service << EOF
[Unit]
Description=GROWF Backend API
After=network.target postgresql.service redis.service
Wants=postgresql.service redis.service

[Service]
Type=simple
User=$APP_USER
WorkingDirectory=$PROJECT_DIR/backend
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/server.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Recharger systemd et démarrer les services
systemctl daemon-reload
systemctl enable growf-backend
systemctl start growf-backend

# Démarrer Nginx
systemctl enable nginx
systemctl start nginx

print_success "Services démarrés"

# 11. Setup SSL auto-renewal
print_status "1️⃣1️⃣ Configuration renouvellement SSL..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'systemctl reload nginx'") | crontab -

# 12. Créer script de sauvegarde
print_status "1️⃣2️⃣ Configuration des sauvegardes..."
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

echo "Sauvegarde terminée: $BACKUP_DIR/$DATE"
EOF

chmod +x /opt/backup-growf.sh
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-growf.sh") | crontab -

# 13. Vérifications finales
print_status "1️⃣3️⃣ Vérifications finales..."
sleep 5

# Vérifier les services
if systemctl is-active --quiet growf-backend; then
    print_success "✅ Backend service actif"
else
    print_warning "⚠️ Backend service non actif"
fi

if systemctl is-active --quiet nginx; then
    print_success "✅ Nginx actif"
else
    print_warning "⚠️ Nginx non actif"
fi

if systemctl is-active --quiet postgresql; then
    print_success "✅ PostgreSQL actif"
else
    print_warning "⚠️ PostgreSQL non actif"
fi

# Test de connectivité
if curl -f http://localhost:3005/health > /dev/null 2>&1; then
    print_success "✅ Backend répond sur port 3005"
else
    print_warning "⚠️ Backend ne répond pas"
fi

echo ""
echo "==============================================="
print_success "🎉 DÉPLOIEMENT NATIF TERMINÉ!"
echo "==============================================="
echo ""
print_success "🌐 Application: https://$DOMAIN"
print_success "🔒 SSL: Let's Encrypt configuré"
print_success "🗄️ Base de données: PostgreSQL native"
print_success "💾 Sauvegarde: Automatique (2h du matin)"
echo ""
print_warning "Étapes finales:"
print_warning "1. Créer le superadmin:"
print_warning "   cd $PROJECT_DIR/backend && sudo -u $APP_USER npm run create:superadmin"
print_warning "2. Vérifier les logs:"
print_warning "   journalctl -u growf-backend -f"
print_warning "3. Tester l'application: https://$DOMAIN"
echo ""