#!/bin/bash

# Script de correction rapide pour les problèmes de déploiement
# À exécuter sur le serveur Contabo

echo "🔧 Correction des problèmes de déploiement GROWF..."

cd /opt/growf

# 1. Arrêter tous les services qui occupent le port 80
echo "1️⃣ Libération du port 80..."
systemctl stop nginx 2>/dev/null || true
systemctl stop apache2 2>/dev/null || true
fuser -k 80/tcp 2>/dev/null || true
fuser -k 443/tcp 2>/dev/null || true

# Attendre que les ports se libèrent
sleep 5

# 2. Corriger le fichier docker-compose.prod.yml
echo "2️⃣ Correction du fichier Docker Compose..."
sed -i 's/SMTP_SECURE: false/SMTP_SECURE: "false"/g' docker-compose.prod.yml

# Vérifier la correction
echo "Vérification de la correction:"
grep -n "SMTP_SECURE" docker-compose.prod.yml

# 3. Obtenir le certificat SSL avec la méthode standalone
echo "3️⃣ Génération du certificat SSL..."
certbot certonly --standalone -d lab.cipme.ci --non-interactive --agree-tos --email admin@cipme.ci --force-renewal

# 4. Créer les répertoires SSL pour Docker
echo "4️⃣ Configuration SSL pour Docker..."
mkdir -p nginx/ssl/live/lab.cipme.ci

if [ -f "/etc/letsencrypt/live/lab.cipme.ci/fullchain.pem" ]; then
    cp /etc/letsencrypt/live/lab.cipme.ci/fullchain.pem nginx/ssl/live/lab.cipme.ci/
    cp /etc/letsencrypt/live/lab.cipme.ci/privkey.pem nginx/ssl/live/lab.cipme.ci/
    chown -R 1000:1000 nginx/ssl
    chmod -R 644 nginx/ssl
    echo "✅ Certificats SSL copiés avec succès"
else
    echo "❌ Certificats SSL non trouvés. Création de certificats temporaires..."
    # Créer des certificats auto-signés temporaires
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/live/lab.cipme.ci/privkey.pem \
        -out nginx/ssl/live/lab.cipme.ci/fullchain.pem \
        -subj "/C=CI/ST=Abidjan/L=Abidjan/O=CIPME/CN=lab.cipme.ci"
    echo "⚠️ Certificats temporaires créés - à remplacer plus tard"
fi

# 5. Créer un environnement avec mots de passe générés
echo "5️⃣ Configuration de l'environnement..."
if [ ! -f ".env" ]; then
    cp .env.prod .env

    # Générer des mots de passe sécurisés
    DB_PASS=$(openssl rand -base64 24 | tr -d '=+/')
    REDIS_PASS=$(openssl rand -base64 24 | tr -d '=+/')
    JWT_SECRET=$(openssl rand -base64 32 | tr -d '=+/')
    JWT_REFRESH=$(openssl rand -base64 32 | tr -d '=+/')

    # Remplacer dans le fichier .env
    sed -i "s/your_secure_db_password_here/$DB_PASS/g" .env
    sed -i "s/your_secure_redis_password_here/$REDIS_PASS/g" .env
    sed -i "s/your_very_secure_jwt_secret_here_at_least_32_characters_long/$JWT_SECRET/g" .env
    sed -i "s/your_very_secure_refresh_secret_here_at_least_32_characters_long/$JWT_REFRESH/g" .env

    echo "✅ Mots de passe sécurisés générés automatiquement"
fi

# 6. Tester la configuration Docker Compose
echo "6️⃣ Test de la configuration Docker Compose..."
docker-compose -f docker-compose.prod.yml config > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Configuration Docker Compose valide"
else
    echo "❌ Erreur dans la configuration Docker Compose"
    docker-compose -f docker-compose.prod.yml config
    exit 1
fi

# 7. Déployer l'application
echo "7️⃣ Déploiement de l'application..."
docker-compose -f docker-compose.prod.yml up -d --build

# 8. Attendre que les services démarrent
echo "8️⃣ Attente du démarrage des services..."
sleep 60

# 9. Vérifier l'état des services
echo "9️⃣ Vérification des services..."
docker-compose -f docker-compose.prod.yml ps

# 10. Initialiser la base de données
echo "🔟 Initialisation de la base de données..."
docker-compose -f docker-compose.prod.yml exec -T backend npm run db:push 2>/dev/null || echo "⚠️ Échec db:push - normal au premier démarrage"

# 11. Test de connectivité
echo "1️⃣1️⃣ Test de connectivité..."
sleep 10
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Application accessible localement"
else
    echo "⚠️ Application pas encore accessible - vérifiez les logs"
fi

echo ""
echo "🎉 Correction terminée!"
echo ""
echo "📋 Prochaines étapes:"
echo "1. Vérifiez les logs: docker-compose -f docker-compose.prod.yml logs"
echo "2. Testez l'application: curl http://lab.cipme.ci"
echo "3. Créez le superadmin: docker-compose -f docker-compose.prod.yml exec backend npm run create:superadmin"
echo ""
echo "🌐 URLs d'accès:"
echo "- Frontend: http://lab.cipme.ci (HTTPS viendra après)"
echo "- Backoffice: http://lab.cipme.ci/backoffice"
echo ""