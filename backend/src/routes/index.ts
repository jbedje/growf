import { Router } from 'express';
import authRoutes from './authRoutes';
import programRoutes from './programRoutes';
import organizationRoutes from './organizationRoutes';
import applicationRoutes from './applicationRoutes';
import companyRoutes from './companyRoutes';
import documentRoutes from './documentRoutes';
import messageRoutes from './messageRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/programs', programRoutes);
router.use('/organizations', organizationRoutes);
router.use('/applications', applicationRoutes);
router.use('/companies', companyRoutes);
router.use('/documents', documentRoutes);
router.use('/messages', messageRoutes);

export default router;