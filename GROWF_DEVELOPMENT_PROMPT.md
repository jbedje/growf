# GROWF - Prompt de Développement Complet

## Vue d'ensemble du projet
Développer une plateforme web complète appelée **GROWF** (Growth Opportunities forワークフォース Financing) qui connecte les PME et porteurs de projets avec des programmes de financement adaptés à leurs besoins.

## Architecture et Stack Technique

### Frontend
- **Framework**: React 18 avec TypeScript
- **Styling**: Tailwind CSS + Shadcn/ui pour les composants
- **State Management**: Zustand ou Redux Toolkit
- **Routing**: React Router v6
- **Formulaires**: React Hook Form + Zod pour la validation
- **HTTP Client**: Axios avec intercepteurs
- **Build Tool**: Vite

### Backend
- **Runtime**: Node.js avec Express.js et TypeScript
- **Base de données**: PostgreSQL avec Prisma ORM
- **Authentification**: JWT + refresh tokens
- **Upload de fichiers**: Multer + AWS S3 ou local storage
- **Email**: Nodemailer ou SendGrid
- **Validation**: Joi ou Zod
- **Documentation API**: Swagger/OpenAPI

### Infrastructure
- **Containerisation**: Docker + Docker Compose
- **Variables d'environnement**: dotenv
- **Logging**: Winston
- **Testing**: Jest + Supertest (backend), Vitest + Testing Library (frontend)
- **Linting**: ESLint + Prettier

## Fonctionnalités Détaillées

### 1. Système d'Authentification et Autorisation
- Inscription/Connexion pour 3 types d'utilisateurs :
  - **PME/Porteurs de projets** : Peuvent consulter et postuler aux programmes
  - **Organismes de financement** : Peuvent créer et gérer leurs programmes
  - **Administrateurs** : Gestion globale de la plateforme
- Authentification OAuth (Google, LinkedIn)
- Vérification email
- Reset de mot de passe
- Système de rôles et permissions (RBAC)

### 2. Dashboard PME/Porteurs de Projets
- **Profil d'entreprise** :
  - Informations générales (nom, secteur, taille, CA, etc.)
  - Documents légaux (KBIS, bilans, etc.)
  - Historique de financement
  - Projet(s) en cours
- **Recherche et filtrage des programmes** :
  - Par secteur d'activité
  - Par montant de financement
  - Par type de financement (subvention, prêt, capital-risque, etc.)
  - Par région/localisation
  - Par stade de développement de l'entreprise
- **Candidatures** :
  - Liste des candidatures en cours
  - Historique des candidatures
  - Statut de chaque candidature
  - Messages/communications avec les organismes

### 3. Dashboard Organismes de Financement
- **Gestion des programmes** :
  - Création de nouveaux programmes
  - Modification des programmes existants
  - Définition des critères d'éligibilité
  - Calendrier d'ouverture/fermeture
- **Gestion des candidatures** :
  - Vue d'ensemble de toutes les candidatures
  - Système de scoring/évaluation
  - Workflow d'approbation (brouillon → publié → clos)
  - Communication avec les candidats
- **Analytics et rapports** :
  - Nombre de candidatures par programme
  - Taux d'acceptation
  - Statistiques par secteur/région

### 4. Système de Candidature
- **Formulaire dynamique** :
  - Questions personnalisables par programme
  - Upload de documents multiples
  - Sauvegarde automatique (brouillon)
  - Validation en temps réel
- **Workflow de candidature** :
  - Brouillon → Soumise → En révision → Approuvée/Rejetée
  - Notifications à chaque étape
  - Possibilité de demander des documents complémentaires

### 5. Système de Messagerie
- Chat en temps réel entre candidats et organismes
- Notifications push et email
- Pièces jointes dans les messages
- Historique des conversations

### 6. Système de Notifications
- Notifications in-app
- Emails automatiques
- SMS (optionnel)
- Préférences de notification personnalisables

### 7. Recherche et Filtrage Avancés
- Moteur de recherche avec ElasticSearch ou indexation PostgreSQL
- Filtres multicritères
- Suggestions de programmes basées sur le profil
- Sauvegarde de recherches favorites

### 8. Système de Documents
- Upload sécurisé de fichiers
- Gestion des versions de documents
- Prévisualisation PDF
- Signature électronique (optionnel)

### 9. Analytics et Reporting
- Dashboard administrateur avec métriques clés
- Export de données (CSV, PDF)
- Graphiques et visualisations (Chart.js ou Recharts)
- Audit trail des actions importantes

### 10. SEO et Performance
- Pages statiques pour le référencement
- Meta tags dynamiques
- Sitemap XML
- Optimisation des images
- Lazy loading
- Code splitting

## Structure de la Base de Données

### Tables Principales
```sql
-- Utilisateurs
users (id, email, password_hash, role, created_at, updated_at, is_verified)

-- Profils PME
company_profiles (id, user_id, company_name, sector, size, revenue, location, description)

-- Organismes de financement
funding_organizations (id, user_id, org_name, org_type, description, contact_info)

-- Programmes de financement
funding_programs (id, org_id, title, description, criteria, amount_min, amount_max, deadline, status)

-- Candidatures
applications (id, program_id, company_id, status, submitted_at, data_json, score)

-- Messages
messages (id, application_id, sender_id, content, created_at, attachments)

-- Documents
documents (id, user_id, application_id, filename, file_path, file_type, uploaded_at)

-- Notifications
notifications (id, user_id, title, message, type, read_at, created_at)
```

## Structure des Dossiers

```
growf/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/ (shadcn components)
│   │   │   ├── common/ (composants réutilisables)
│   │   │   └── features/ (composants spécifiques par fonctionnalité)
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   └── package.json
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/ (Prisma)
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── utils/
│   │   ├── types/
│   │   └── config/
│   ├── prisma/
│   └── package.json
├── docker-compose.yml
├── README.md
└── docs/
```

## Étapes de Développement Prioritaires

### Phase 1 - Foundation (Semaines 1-2)
1. Setup du projet (frontend + backend + base de données)
2. Système d'authentification complet
3. Structure de base des données avec Prisma
4. Interface de base avec routing

### Phase 2 - Core Features (Semaines 3-6)
1. Profils utilisateurs (PME et organismes)
2. CRUD programmes de financement
3. Système de candidature de base
4. Dashboard principal pour chaque type d'utilisateur

### Phase 3 - Advanced Features (Semaines 7-10)
1. Système de messagerie
2. Notifications
3. Upload et gestion de documents
4. Recherche et filtrage avancés

### Phase 4 - Polish & Launch (Semaines 11-12)
1. Tests complets
2. Optimisations performance
3. SEO
4. Documentation
5. Déploiement

## Considérations de Sécurité
- Validation stricte côté serveur
- Protection CSRF
- Rate limiting
- Chiffrement des données sensibles
- Logs d'audit
- Permissions granulaires
- Sanitisation des inputs

## Instructions Spécifiques pour Claude Code

1. **Commencer par** créer la structure de dossiers et initialiser les projets frontend/backend
2. **Configurer** l'environnement de développement avec Docker
3. **Implémenter** les fonctionnalités dans l'ordre de priorité défini
4. **Créer** des composants réutilisables et suivre les bonnes pratiques
5. **Ajouter** des tests unitaires et d'intégration
6. **Documenter** le code et créer une documentation utilisateur
7. **Optimiser** les performances à chaque étape

## Livrables Attendus
- Code source complet (frontend + backend)
- Base de données configurée avec données de test
- Documentation technique et utilisateur
- Tests unitaires et d'intégration
- Configuration Docker pour déploiement
- Guide d'installation et de déploiement

## Points d'Attention Particuliers
- Interface utilisateur intuitive et responsive
- Performance (chargement rapide, pagination)
- Sécurité des données financières
- Conformité RGPD
- Accessibilité (WCAG 2.1)
- Multi-langue (français/anglais)
- Backup et récupération des données