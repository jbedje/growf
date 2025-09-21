import { Router } from 'express';
import { MockMessageController } from '../controllers/mockMessageController';
// import { authenticateToken } from '../middleware/auth';

const router = Router();

// Apply authentication middleware to all message routes - temporarily disabled
// router.use(authenticateToken);

// Get application messages
router.get('/application/:applicationId', MockMessageController.getApplicationMessages);

// Send message
router.post('/application/:applicationId', MockMessageController.sendMessage);

// Mark message as read
router.patch('/:messageId/read', MockMessageController.markMessageAsRead);

// Mark all messages as read
router.patch('/application/:applicationId/read-all', MockMessageController.markAllMessagesAsRead);

// Delete message
router.delete('/:messageId', MockMessageController.deleteMessage);

// Get unread count
router.get('/unread-count', MockMessageController.getUnreadCount);

// Get user conversations
router.get('/conversations', MockMessageController.getUserConversations);

export default router;