# CLAUDE.md

This file contains project-specific information for Claude Code.

## Project Information
- Working Directory: C:\Users\JeremieBEDJE\Downloads\GROWF
- Platform: Windows (win32)
- Git Repository: No
- Project Type: Full-stack web application (React + Node.js)

## Architecture
- **Frontend**: React 18 + TypeScript + Tailwind CSS + Vite
- **Backend**: Node.js + Express + TypeScript + Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Authentication**: JWT with refresh tokens
- **File Upload**: Multer with local storage

## Commands

### Development
```bash
npm run dev          # Start both frontend and backend in development mode
npm run dev:frontend # Start only frontend
npm run dev:backend  # Start only backend
```

### Build
```bash
npm run build        # Build both frontend and backend for production
npm run build:frontend
npm run build:backend
```

### Testing
```bash
npm test            # Run all tests
npm run test:frontend
npm run test:backend
```

### Linting
```bash
npm run lint        # Lint both frontend and backend
npm run lint:frontend
npm run lint:backend
```

### Database (from backend directory)
```bash
npm run db:generate # Generate Prisma client
npm run db:push     # Push schema to database
npm run db:migrate  # Run migrations
npm run db:studio   # Open Prisma Studio
npm run db:seed     # Seed database with test data
```

### Docker
```bash
docker-compose up -d          # Start all services
docker-compose up -d postgres redis  # Start only database services
docker-compose down           # Stop all services
```

## Project Structure
```
GROWF/
├── frontend/           # React application
├── backend/            # Node.js API
├── docker-compose.yml  # Docker configuration
├── package.json        # Root workspace configuration
└── README.md          # Project documentation
```

## Key Features Implemented
- ✅ User authentication (login/register/verify email)
- ✅ Role-based access control with 5 roles system
- ✅ Frontoffice/Backoffice separation
- ✅ Responsive UI with Tailwind CSS
- ✅ Database schema with Prisma
- ✅ API rate limiting and security
- ✅ File upload system
- ✅ Email service integration
- ✅ Error handling and logging

## Role System
The application uses a hierarchical role system with 5 distinct roles:

### Public Roles (Created via public registration)
- **COMPANY**: PME/Entreprises et porteurs de projet
  - Access: Frontoffice only (http://localhost:5174)
  - Can: Apply for programs, manage company profile, view applications
  - Created: Via public registration form

### Backoffice Roles (Created by SUPERADMIN only)
- **ANALYST**: Analystes
  - Access: Backoffice (http://localhost:5174/backoffice)
  - Can: Review applications, manage programs, view companies

- **ADMIN**: Administrateurs
  - Access: Backoffice + additional admin features
  - Can: Everything ANALYST can do + user statistics, advanced analytics

- **SUPERADMIN**: Super administrateur
  - Access: Full system access
  - Can: Everything + create/manage ANALYST and ADMIN accounts

### Organization Role (Special)
- **ORGANIZATION**: Organismes de financement
  - Access: Currently same as COMPANY (to be implemented)
  - Can: Create and manage funding programs

## Account Creation Rules
1. **Public Registration** (http://localhost:5174/register):
   - Creates COMPANY accounts only
   - No role selection - automatically assigned COMPANY role
   - Open to any business/project owner

2. **Backoffice Account Creation**:
   - Only SUPERADMIN can create ANALYST and ADMIN accounts
   - Done via backoffice interface (/backoffice/users)
   - Requires SUPERADMIN authentication

## Access Control
- **Frontoffice**: http://localhost:5174 - Public + COMPANY users
- **Backoffice**: http://localhost:5174/backoffice - ANALYST, ADMIN, SUPERADMIN only
- **User Management**: /backoffice/users - SUPERADMIN only

## Environment Setup
1. Copy `.env.example` to `.env` and configure
2. Install dependencies: `npm install`
3. Start databases: `docker-compose up -d postgres redis`
4. Setup database: `cd backend && npm run db:generate && npm run db:push`
5. Create SUPERADMIN account: `cd backend && npm run create:superadmin`
6. Start development: `npm run dev`

## Default SUPERADMIN Account
**Email**: `superadmin@growf.fr`
**Password**: `SuperAdmin2024!`

⚠️ **IMPORTANT**: Change this password after first login for security!

## Notes
- The application uses JWT tokens with automatic refresh
- All passwords are hashed with bcrypt
- Rate limiting is implemented for security
- File uploads are stored locally with user-specific folders
- Email verification is required for account activation
- The frontend uses Zustand for state management
- API responses follow a consistent structure with success/error fields