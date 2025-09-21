import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import { authLimiter, emailLimiter } from '../middleware/rateLimiter';

const router = Router();

// Routes publiques avec limitation
router.post('/register', authLimiter, AuthController.register);
router.post('/login', authLimiter, AuthController.login);
router.post('/refresh-token', AuthController.refreshToken);
router.post('/forgot-password', emailLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);

// Routes protégées
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/change-password', authenticateToken, AuthController.changePassword);
router.get('/profile', authenticateToken, AuthController.getProfile);

export default router;