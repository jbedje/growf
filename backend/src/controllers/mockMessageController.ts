import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { NotificationService } from '../services/notificationService';

interface MockMessage {
  id: string;
  applicationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  readAt?: string;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    role: string;
  };
}

export class MockMessageController {
  private static messages: MockMessage[] = [];

  static async getApplicationMessages(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;
      const user = req.user!;

      const messages = this.messages
        .filter(m => m.applicationId === applicationId)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des messages:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async sendMessage(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;
      const { content, attachments = [] } = req.body;
      const user = req.user!;

      if (!content || content.trim().length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Le contenu du message est requis'
        });
      }

      const message: MockMessage = {
        id: Math.random().toString(36).substr(2, 9),
        applicationId,
        senderId: user.id,
        content: content.trim(),
        attachments,
        createdAt: new Date().toISOString(),
        sender: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      };

      this.messages.push(message);

      // Create notification for the recipient
      // Determine recipient - if sender is company, notify organization and vice versa
      let recipientId: string | null = null;

      if (user.role === 'COMPANY') {
        // Find organization user for this application
        recipientId = 'organization-1'; // Mock organization user
      } else if (user.role === 'ORGANIZATION') {
        // Find company user for this application
        recipientId = 'company-1'; // Mock company user
      }

      if (recipientId && recipientId !== user.id) {
        try {
          await NotificationService.createMessageNotification(
            recipientId,
            user.email,
            applicationId,
            message.id
          );
        } catch (notifError) {
          console.error('Erreur lors de la création de la notification:', notifError);
        }
      }

      res.status(201).json({
        success: true,
        data: message
      });
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async markMessageAsRead(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const user = req.user!;

      const messageIndex = this.messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Message non trouvé'
        });
      }

      const message = this.messages[messageIndex];

      // Ne marquer comme lu que si ce n'est pas l'expéditeur
      if (message.senderId !== user.id && !message.readAt) {
        this.messages[messageIndex] = {
          ...message,
          readAt: new Date().toISOString()
        };
      }

      res.json({
        success: true,
        message: 'Message marqué comme lu'
      });
    } catch (error) {
      console.error('Erreur lors du marquage du message:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async markAllMessagesAsRead(req: AuthRequest, res: Response) {
    try {
      const { applicationId } = req.params;
      const user = req.user!;

      const now = new Date().toISOString();
      this.messages = this.messages.map(message => {
        if (message.applicationId === applicationId &&
            message.senderId !== user.id &&
            !message.readAt) {
          return { ...message, readAt: now };
        }
        return message;
      });

      res.json({
        success: true,
        message: 'Tous les messages ont été marqués comme lus'
      });
    } catch (error) {
      console.error('Erreur lors du marquage des messages:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async deleteMessage(req: AuthRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const user = req.user!;

      const messageIndex = this.messages.findIndex(m => m.id === messageId);
      if (messageIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Message non trouvé'
        });
      }

      const message = this.messages[messageIndex];

      // Seul l'expéditeur ou un admin peut supprimer un message
      if (message.senderId !== user.id && !['ADMIN', 'SUPERADMIN'].includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'Accès refusé'
        });
      }

      this.messages.splice(messageIndex, 1);

      res.json({
        success: true,
        message: 'Message supprimé avec succès'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression du message:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;

      const unreadCount = this.messages.filter(message =>
        message.senderId !== user.id && !message.readAt
      ).length;

      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      console.error('Erreur lors du comptage des messages non lus:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async getUserConversations(req: AuthRequest, res: Response) {
    try {
      const user = req.user!;
      const { page = 1, limit = 10 } = req.query;

      // Group messages by application
      const conversationMap = new Map();

      this.messages.forEach(message => {
        if (!conversationMap.has(message.applicationId)) {
          conversationMap.set(message.applicationId, {
            id: message.applicationId,
            program: {
              id: 'prog-1',
              title: 'Programme Mock',
              organization: {
                id: 'org-1',
                name: 'Organisation Mock'
              }
            },
            company: {
              id: 'comp-1',
              name: 'Entreprise Mock'
            },
            messages: [],
            _count: {
              messages: 0
            }
          });
        }

        const conversation = conversationMap.get(message.applicationId);
        conversation.messages.push(message);

        if (message.senderId !== user.id && !message.readAt) {
          conversation._count.messages++;
        }
      });

      const conversations = Array.from(conversationMap.values())
        .sort((a, b) => b.messages.length - a.messages.length)
        .slice((Number(page) - 1) * Number(limit), Number(page) * Number(limit));

      res.json({
        success: true,
        data: {
          conversations,
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: conversationMap.size,
            totalPages: Math.ceil(conversationMap.size / Number(limit))
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des conversations:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }
}