#!/bin/bash

echo "🚀 Configuration initiale de GROWF..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Créer les fichiers .env si ils n'existent pas
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Fichier .env créé"
fi

if [ ! -f backend/.env ]; then
    echo "✅ Fichier backend/.env créé"
fi

if [ ! -f frontend/.env ]; then
    echo "✅ Fichier frontend/.env créé"
fi

# Installer les dépendances
echo "📦 Installation des dépendances..."
npm install

# Démarrer les services Docker
echo "🐳 Démarrage des services Docker..."
docker-compose up -d postgres redis

# Attendre que PostgreSQL soit prêt
echo "⏳ Attente de la base de données..."
sleep 10

# Configuration de la base de données
echo "🗄️ Configuration de la base de données..."
cd backend
npm run db:generate
npm run db:push

echo "✅ Configuration terminée !"
echo ""
echo "📋 Commandes disponibles :"
echo "  npm run dev      - Démarre le projet en mode développement"
echo "  npm run build    - Build de production"
echo "  npm test         - Lance les tests"
echo ""
echo "🌐 URLs :"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo "  Health:   http://localhost:3001/health"