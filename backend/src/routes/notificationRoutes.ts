import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all notification routes
router.use(authenticateToken);

// Get user notifications with pagination
router.get('/', NotificationController.getUserNotifications);

// Get unread count
router.get('/unread-count', NotificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', NotificationController.markAsRead);

// Mark all notifications as read
router.patch('/read-all', NotificationController.markAllAsRead);

// Delete notification
router.delete('/:notificationId', NotificationController.deleteNotification);

// Delete all notifications
router.delete('/', NotificationController.deleteAllNotifications);

// Get user notification preferences
router.get('/preferences', NotificationController.getUserPreferences);

// Update user notification preferences
router.patch('/preferences', NotificationController.updateUserPreferences);

// Test endpoint (only for development)
router.post('/test', NotificationController.createTestNotification);

export default router;