# GROWF - Plateforme de Financement pour PME

GROWF est une plateforme web complète qui connecte les PME et porteurs de projets avec des programmes de financement adaptés à leurs besoins.

## 🚀 Fonctionnalités

### Pour les Entreprises/PME
- **Recherche avancée** de programmes de financement
- **Candidatures simplifiées** avec formulaires dynamiques
- **Suivi en temps réel** de l'état des candidatures
- **Communication directe** avec les organismes de financement
- **Gestion de documents** sécurisée

### Pour les Organismes de Financement
- **Création et gestion** de programmes de financement
- **Évaluation des candidatures** avec système de scoring
- **Communication** avec les candidats
- **Analytics et rapports** détaillés

### Pour les Administrateurs
- **Gestion globale** de la plateforme
- **Supervision** des utilisateurs et programmes
- **Statistiques** et métriques

## 🛠 Stack Technique

### Backend
- **Node.js** avec Express et TypeScript
- **PostgreSQL** avec Prisma ORM
- **Redis** pour le cache et les sessions
- **JWT** pour l'authentification
- **Nodemailer** pour les emails
- **Winston** pour les logs

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Zustand** pour le state management
- **React Hook Form** + Zod pour les formulaires
- **Axios** pour les requêtes HTTP
- **React Query** pour la gestion des données

### Infrastructure
- **Docker** et Docker Compose
- **Vite** pour le build frontend
- **ESLint** et Prettier pour le code quality

## 📋 Prérequis

- Node.js 20+
- Docker et Docker Compose
- Git

## 🚀 Installation et Démarrage

### 1. Cloner le projet
```bash
git clone <repository-url>
cd GROWF
```

### 2. Variables d'environnement
```bash
cp .env.example .env
# Modifier les variables dans .env selon votre configuration
```

### 3. Installation des dépendances
```bash
npm install
```

### 4. Démarrage avec Docker
```bash
# Démarrer tous les services (base de données, cache, backend, frontend)
docker-compose up -d

# Ou démarrer en mode développement
npm run dev
```

### 5. Configuration de la base de données
```bash
cd backend
npx prisma generate
npx prisma db push
# Optionnel: ajouter des données de test
npm run db:seed
```

## 📁 Structure du Projet

```
GROWF/
├── frontend/                 # Application React
│   ├── src/
│   │   ├── components/      # Composants réutilisables
│   │   ├── pages/          # Pages de l'application
│   │   ├── hooks/          # Hooks personnalisés
│   │   ├── services/       # Services API
│   │   ├── store/          # State management (Zustand)
│   │   ├── types/          # Types TypeScript
│   │   └── utils/          # Utilitaires
│   └── ...
├── backend/                  # API Node.js
│   ├── src/
│   │   ├── controllers/    # Contrôleurs Express
│   │   ├── services/       # Logique métier
│   │   ├── models/         # Modèles Prisma
│   │   ├── routes/         # Routes API
│   │   ├── middleware/     # Middlewares Express
│   │   ├── config/         # Configuration
│   │   ├── utils/          # Utilitaires
│   │   └── types/          # Types TypeScript
│   ├── prisma/             # Schéma et migrations
│   └── ...
├── docker-compose.yml        # Configuration Docker
├── package.json             # Scripts et dépendances racine
└── README.md               # Documentation
```

## 🧪 Scripts Disponibles

### Racine du projet
```bash
npm run dev          # Démarre frontend + backend en développement
npm run build        # Build de production
npm test             # Lance tous les tests
npm run lint         # Vérification du code
```

### Backend
```bash
cd backend
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm test             # Tests backend
npm run db:generate  # Génère le client Prisma
npm run db:push      # Pousse le schéma vers la DB
npm run db:migrate   # Lance les migrations
npm run db:studio    # Interface graphique Prisma
npm run db:seed      # Données de test
```

### Frontend
```bash
cd frontend
npm run dev          # Démarrage en mode développement
npm run build        # Build de production
npm test             # Tests frontend
npm run lint         # Vérification du code
```

## 🔧 Configuration

### Base de données
La base de données PostgreSQL est configurée via Docker Compose. Le schéma est défini dans `backend/prisma/schema.prisma`.

### Authentification
- JWT avec refresh tokens
- Vérification par email
- Réinitialisation de mot de passe
- Rôles utilisateur (COMPANY, ORGANIZATION, ADMIN)

### Upload de fichiers
- Stockage local par défaut
- Limitation de taille et type de fichier
- Organisation par utilisateur

## 🌐 URLs par défaut

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Base de données**: localhost:5432
- **Redis**: localhost:6379
- **Health check**: http://localhost:3001/health

## 🧪 Tests

```bash
# Tests backend
cd backend && npm test

# Tests frontend
cd frontend && npm test

# Tests complets
npm test
```

## 📊 Monitoring et Logs

- Logs structurés avec Winston
- Fichiers de logs dans `backend/logs/`
- Health check endpoint disponible
- Métriques de performance

## 🔐 Sécurité

- Helmet.js pour la sécurité HTTP
- Rate limiting
- Validation des données avec Joi/Zod
- Sanitisation des entrées
- CORS configuré
- Chiffrement des mots de passe avec bcrypt

## 🚀 Déploiement

Le projet est containerisé avec Docker pour un déploiement simple :

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité
3. Commiter vos changements
4. Pousser vers la branche
5. Ouvrir une Pull Request

## 📝 License

Ce projet est sous licence MIT.

## 📞 Support

Pour toute question ou problème, ouvrez une issue sur GitHub.