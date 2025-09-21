import { Router } from 'express';
import { ProgramController } from '../controllers/programController';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorization';
import { UserRole } from '@prisma/client';

const router = Router();

// Routes publiques - pour les entreprises
router.get('/public', ProgramController.getPublicPrograms);
router.get('/public/:id', ProgramController.getPublicProgramById);

// Routes protégées - nécessitent une authentification
router.use(authenticateToken);

// Routes pour les organisations et admins
router.get(
  '/',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ProgramController.getPrograms
);

router.post(
  '/',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ProgramController.createProgram
);

router.get(
  '/:id',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ProgramController.getProgramById
);

router.put(
  '/:id',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ProgramController.updateProgram
);

router.delete(
  '/:id',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ProgramController.deleteProgram
);

router.patch(
  '/:id/status',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ProgramController.updateProgramStatus
);

// Route pour dupliquer un programme
router.post(
  '/:id/duplicate',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ProgramController.duplicateProgram
);

// Routes pour les statistiques
router.get(
  '/:id/statistics',
  authorizeRoles([UserRole.ORGANIZATION, UserRole.ADMIN, UserRole.SUPERADMIN]),
  ProgramController.getProgramStatistics
);

export default router;