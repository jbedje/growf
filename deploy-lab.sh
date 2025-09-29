#!/bin/bash

# GROWF Production Deployment for lab.cipme.ci
# Contabo VM Ubuntu - Optimized for your specifications

set -e

echo "🚀 GROWF Deployment for lab.cipme.ci - Starting..."

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
DOMAIN="lab.cipme.ci"
EMAIL="admin@cipme.ci"
PROJECT_DIR="/opt/growf"
BACKUP_DIR="/opt/growf-backups"

print_status() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   print_error "Ce script doit être exécuté en tant que root"
   exit 1
fi

print_status "Configuration du serveur pour lab.cipme.ci..."
print_status "Serveur: Ubuntu sur Contabo VM"
print_status "IP: 184.174.37.7"
print_status "Domaine: $DOMAIN"

# System update
print_status "Mise à jour du système..."
apt update && apt upgrade -y

# Install essential packages
print_status "Installation des packages essentiels..."
apt install -y curl wget git nginx certbot python3-certbot-nginx ufw fail2ban htop

# Install Docker
if ! command -v docker &> /dev/null; then
    print_status "Installation de Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    usermod -aG docker root
fi

# Install Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_status "Installation de Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# Configure directories
print_status "Configuration des répertoires..."
mkdir -p $PROJECT_DIR
mkdir -p $BACKUP_DIR
mkdir -p /var/log/growf

# Setup project (assuming files are already uploaded)
cd $PROJECT_DIR

if [ ! -f "docker-compose.prod.yml" ]; then
    print_error "Les fichiers du projet GROWF ne sont pas trouvés dans $PROJECT_DIR"
    print_warning "Veuillez uploader vos fichiers GROWF avant de continuer"
    print_warning "Fichiers requis: docker-compose.prod.yml, .env.prod, frontend/, backend/"
    exit 1
fi

# Setup environment
if [ ! -f ".env" ]; then
    if [ -f ".env.prod" ]; then
        print_status "Configuration de l'environnement..."
        cp .env.prod .env

        # Generate secure passwords
        DB_PASS=$(openssl rand -base64 24)
        REDIS_PASS=$(openssl rand -base64 24)
        JWT_SECRET=$(openssl rand -base64 32)
        JWT_REFRESH=$(openssl rand -base64 32)

        # Update .env with generated passwords
        sed -i "s/your_secure_db_password_here/$DB_PASS/g" .env
        sed -i "s/your_secure_redis_password_here/$REDIS_PASS/g" .env
        sed -i "s/your_very_secure_jwt_secret_here_at_least_32_characters_long/$JWT_SECRET/g" .env
        sed -i "s/your_very_secure_refresh_secret_here_at_least_32_characters_long/$JWT_REFRESH/g" .env

        print_success "Mots de passe sécurisés générés automatiquement"
    else
        print_error "Fichier .env.prod non trouvé!"
        exit 1
    fi
fi

# Note: No firewall setup as requested
print_status "Configuration du firewall ignorée comme demandé"

# Setup fail2ban for basic security
print_status "Configuration de fail2ban..."
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
EOF

systemctl enable fail2ban
systemctl restart fail2ban

# Get SSL certificate
print_status "Configuration du certificat SSL avec Let's Encrypt..."
# Stop any service using port 80
systemctl stop nginx 2>/dev/null || true
fuser -k 80/tcp 2>/dev/null || true

# Get certificate
certbot certonly --standalone -d $DOMAIN --non-interactive --agree-tos --email $EMAIL

# Create SSL directories for Docker
print_status "Préparation des certificats SSL pour Docker..."
mkdir -p nginx/ssl/live/$DOMAIN
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem nginx/ssl/live/$DOMAIN/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem nginx/ssl/live/$DOMAIN/
chown -R 1000:1000 nginx/ssl
chmod -R 644 nginx/ssl

# Create backup script
print_status "Configuration des sauvegardes automatiques..."
cat > /opt/backup-growf.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/growf-backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR/$DATE

# Backup database
docker-compose -f /opt/growf/docker-compose.prod.yml exec -T postgres pg_dump -U growf_user growf_prod > $BACKUP_DIR/$DATE/database.sql

# Backup uploads
cp -r /opt/growf/uploads $BACKUP_DIR/$DATE/ 2>/dev/null || true

# Backup configuration
cp /opt/growf/.env $BACKUP_DIR/$DATE/

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true

echo "Sauvegarde terminée: $BACKUP_DIR/$DATE"
EOF

chmod +x /opt/backup-growf.sh

# Setup daily backups
(crontab -l 2>/dev/null; echo "0 2 * * * /opt/backup-growf.sh") | crontab -

# Setup systemd service
print_status "Configuration du service systemd..."
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

# Deploy application
print_status "Déploiement de l'application GROWF..."
docker-compose -f docker-compose.prod.yml up -d --build

# Wait for services
print_status "Attente du démarrage des services..."
sleep 60

# Initialize database
print_status "Initialisation de la base de données..."
docker-compose -f docker-compose.prod.yml exec backend npm run db:push
docker-compose -f docker-compose.prod.yml exec backend npm run db:seed

# Setup SSL auto-renewal
print_status "Configuration du renouvellement automatique SSL..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet --deploy-hook 'cp /etc/letsencrypt/live/$DOMAIN/*.pem $PROJECT_DIR/nginx/ssl/live/$DOMAIN/ && docker-compose -f $PROJECT_DIR/docker-compose.prod.yml restart nginx'") | crontab -

# Final checks
print_status "Vérification finale..."
sleep 10

if docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    print_success "✅ GROWF déployé avec succès!"
    print_success "🌐 Application: https://$DOMAIN"
    print_success "🔒 SSL: Actif (Let's Encrypt)"
    print_success "🗄️  Base de données: PostgreSQL configurée"
    print_success "📧 Email: Configuré avec smtp2go"
    print_success "💾 Sauvegardes: Automatiques (quotidiennes à 2h)"

    print_warning "Instructions finales:"
    print_warning "1. Créer le compte superadmin:"
    print_warning "   docker-compose -f $PROJECT_DIR/docker-compose.prod.yml exec backend npm run create:superadmin"
    print_warning "2. Accéder à l'application: https://$DOMAIN"
    print_warning "3. Backoffice: https://$DOMAIN/backoffice"
else
    print_warning "⚠️ Déploiement terminé mais vérification requise"
    print_warning "Vérifiez les logs: docker-compose -f $PROJECT_DIR/docker-compose.prod.yml logs"
fi

echo ""
print_success "🎉 Déploiement GROWF terminé pour lab.cipme.ci!"
echo ""