import { Router } from 'express';
import { OrganizationController } from '../controllers/organizationController';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorization';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les superadmins - gestion de toutes les organisations
router.get(
  '/',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.ADMIN]),
  OrganizationController.getAllOrganizations
);

router.post(
  '/',
  authorizeRoles([UserRole.SUPERADMIN]),
  OrganizationController.createOrganization
);

router.get(
  '/:id',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ORGANIZATION]),
  OrganizationController.getOrganizationById
);

router.put(
  '/:id',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.ORGANIZATION]),
  OrganizationController.updateOrganization
);

router.delete(
  '/:id',
  authorizeRoles([UserRole.SUPERADMIN]),
  OrganizationController.deleteOrganization
);

// Route pour obtenir le profil de l'organisation connectée
router.get(
  '/profile/me',
  authorizeRoles([UserRole.ORGANIZATION]),
  OrganizationController.getMyOrganization
);

// Route pour mettre à jour le profil de l'organisation connectée
router.put(
  '/profile/me',
  authorizeRoles([UserRole.ORGANIZATION]),
  OrganizationController.updateMyOrganization
);

// Routes pour les statistiques
router.get(
  '/:id/statistics',
  authorizeRoles([UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.ORGANIZATION]),
  OrganizationController.getOrganizationStatistics
);

export default router;