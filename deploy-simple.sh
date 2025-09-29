#!/bin/bash

# GROWF Simple Deployment Script
# For immediate deployment on Contabo VM

set -e

echo "🚀 Déploiement simple de GROWF..."

# Vérifier si on est root
if [[ $EUID -ne 0 ]]; then
   echo "❌ Ce script doit être exécuté en tant que root"
   exit 1
fi

# Configuration
DOMAIN="growf2.cipme.ci"
PROJECT_DIR="/opt/growf"

echo "📦 Installation des dépendances..."
apt update
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx ufw curl wget git

echo "🔧 Configuration du projet..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Créer un docker-compose.yml minimal pour test
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
EOF

# Créer une configuration Nginx basique
cat > nginx.conf << 'EOF'
server {
    listen 80;
    server_name growf2.cipme.ci;

    location / {
        return 200 '<!DOCTYPE html>
<html>
<head>
    <title>GROWF - En cours de déploiement</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; margin-top: 100px; }
        .container { max-width: 600px; margin: 0 auto; }
        .logo { color: #ff6b35; font-size: 48px; font-weight: bold; }
        .message { color: #333; font-size: 18px; margin: 20px 0; }
        .progress { background: #f0f0f0; height: 20px; border-radius: 10px; overflow: hidden; }
        .progress-bar { background: linear-gradient(90deg, #ff6b35, #38bfa0); height: 100%; width: 75%; animation: progress 2s ease-in-out infinite; }
        @keyframes progress { 0%, 100% { width: 75%; } 50% { width: 85%; } }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">GROWF</div>
        <div class="message">🚀 Déploiement en cours...</div>
        <div class="progress"><div class="progress-bar"></div></div>
        <p>La plateforme GROWF sera bientôt disponible.</p>
        <p><strong>Côte d'\''Ivoire PME</strong></p>
    </div>
</body>
</html>';
        add_header Content-Type text/html;
    }

    location /health {
        return 200 "GROWF deployment in progress\n";
        add_header Content-Type text/plain;
    }
}
EOF

echo "🔥 Configuration du firewall..."
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "🚀 Démarrage du serveur web temporaire..."
docker-compose up -d

echo "🔒 Configuration SSL..."
# Attendre que Nginx démarre
sleep 10

# Obtenir le certificat SSL
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@cipme.ci

echo "✅ Déploiement temporaire terminé !"
echo "🌐 Votre site est maintenant accessible à : https://$DOMAIN"
echo ""
echo "📋 Prochaines étapes :"
echo "1. Uploader le code source de GROWF"
echo "2. Configurer la base de données"
echo "3. Déployer l'application complète"
echo ""
echo "🔧 Pour continuer le déploiement complet :"
echo "   cd $PROJECT_DIR"
echo "   # Uploader vos fichiers GROWF ici"
echo "   # Puis exécuter le script de déploiement complet"