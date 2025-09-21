import { Router } from 'express';
import { CompanyController } from '../controllers/companyController';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorization';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les superadmins et analystes - gestion de toutes les entreprises
router.get(
  '/',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ANALYST]),
  CompanyController.getAllCompanies
);

router.get(
  '/:id',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ANALYST, UserRole.COMPANY]),
  CompanyController.getCompanyById
);

router.put(
  '/:id',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.COMPANY]),
  CompanyController.updateCompany
);

router.delete(
  '/:id',
  authorizeRoles([UserRole.SUPERADMIN]),
  CompanyController.deleteCompany
);

// Route pour obtenir le profil de l'entreprise connectée
router.get(
  '/profile/me',
  authorizeRoles([UserRole.COMPANY]),
  CompanyController.getMyCompany
);

// Route pour mettre à jour le profil de l'entreprise connectée
router.put(
  '/profile/me',
  authorizeRoles([UserRole.COMPANY]),
  CompanyController.updateMyCompany
);

// Routes pour les statistiques
router.get(
  '/:id/statistics',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ANALYST, UserRole.COMPANY]),
  CompanyController.getCompanyStatistics
);

router.get(
  '/statistics/overview',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ANALYST]),
  CompanyController.getCompaniesStatistics
);

export default router;