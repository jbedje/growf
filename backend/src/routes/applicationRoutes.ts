import { Router } from 'express';
import { ApplicationController } from '../controllers/applicationController';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorization';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les entreprises
router.get(
  '/my-applications',
  authorizeRoles([UserRole.COMPANY]),
  ApplicationController.getMyApplications
);

router.post(
  '/',
  authorizeRoles([UserRole.COMPANY]),
  ApplicationController.createApplication
);

router.get(
  '/:id',
  authorizeRoles([UserRole.COMPANY, UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ApplicationController.getApplicationById
);

router.put(
  '/:id',
  authorizeRoles([UserRole.COMPANY]),
  ApplicationController.updateApplication
);

router.delete(
  '/:id',
  authorizeRoles([UserRole.COMPANY]),
  ApplicationController.deleteApplication
);

router.post(
  '/:id/submit',
  authorizeRoles([UserRole.COMPANY]),
  ApplicationController.submitApplication
);

// Routes pour les organisations et admins - gestion des candidatures reçues
router.get(
  '/',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ApplicationController.getAllApplications
);

router.get(
  '/program/:programId',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ApplicationController.getApplicationsByProgram
);

router.patch(
  '/:id/status',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ApplicationController.updateApplicationStatus
);

router.post(
  '/:id/review',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ApplicationController.reviewApplication
);

// Routes pour les statistiques
router.get(
  '/statistics/overview',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ApplicationController.getApplicationStatistics
);

export default router;