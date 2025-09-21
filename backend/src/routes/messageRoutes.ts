import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { authorizeRoles } from '../middleware/authorization';
import { MessageController } from '../controllers/messageController';
import { UserRole } from '@prisma/client';

const router = Router();

// Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Récupérer les messages d'une candidature
router.get('/application/:applicationId', MessageController.getApplicationMessages);

// Envoyer un nouveau message dans une candidature
router.post('/application/:applicationId', MessageController.sendMessage);

// Marquer un message comme lu
router.patch('/:messageId/read', MessageController.markMessageAsRead);

// Marquer tous les messages d'une candidature comme lus
router.patch('/application/:applicationId/read-all', MessageController.markAllMessagesAsRead);

// Supprimer un message (seulement par l'expéditeur)
router.delete('/:messageId', MessageController.deleteMessage);

// Obtenir le nombre de messages non lus pour l'utilisateur
router.get('/unread-count', MessageController.getUnreadCount);

// Obtenir les conversations de l'utilisateur (liste des candidatures avec messages)
router.get('/conversations', MessageController.getUserConversations);

export default router;