import { Request, Response } from 'express';
import { NotificationService } from '../services/notificationService';
import { AuthRequest } from '../middleware/auth';

export class NotificationController {
  static async getUserNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = (page - 1) * limit;

      const result = await NotificationService.getUserNotifications(req.user.id, limit, offset);

      res.json({
        success: true,
        data: {
          notifications: result.notifications,
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
            unreadCount: result.unreadCount
          }
        }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async getUnreadCount(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const unreadCount = await NotificationService.getUnreadCount(req.user.id);

      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      console.error('Erreur lors de la récupération du nombre de notifications non lues:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async markAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const { notificationId } = req.params;
      const success = await NotificationService.markNotificationAsRead(notificationId, req.user.id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Notification non trouvée'
        });
      }

      res.json({
        success: true,
        message: 'Notification marquée comme lue'
      });
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async markAllAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const markedCount = await NotificationService.markAllNotificationsAsRead(req.user.id);

      res.json({
        success: true,
        data: { markedCount },
        message: `${markedCount} notifications marquées comme lues`
      });
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async deleteNotification(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const { notificationId } = req.params;
      const success = await NotificationService.deleteNotification(notificationId, req.user.id);

      if (!success) {
        return res.status(404).json({
          success: false,
          error: 'Notification non trouvée'
        });
      }

      res.json({
        success: true,
        message: 'Notification supprimée'
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async deleteAllNotifications(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const deletedCount = await NotificationService.deleteAllNotifications(req.user.id);

      res.json({
        success: true,
        data: { deletedCount },
        message: `${deletedCount} notifications supprimées`
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de toutes les notifications:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async getUserPreferences(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const preferences = await NotificationService.getUserPreferences(req.user.id);

      res.json({
        success: true,
        data: preferences
      });
    } catch (error) {
      console.error('Erreur lors de la récupération des préférences:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  static async updateUserPreferences(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const preferences = await NotificationService.updateUserPreferences(req.user.id, req.body);

      res.json({
        success: true,
        data: preferences,
        message: 'Préférences mises à jour'
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour des préférences:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }

  // Test endpoint to create a sample notification
  static async createTestNotification(req: AuthRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'Non autorisé'
        });
      }

      const notification = await NotificationService.createMessageNotification(
        req.user.id,
        'test@example.com',
        'test-app-123',
        'test-message-456'
      );

      res.json({
        success: true,
        data: notification,
        message: 'Notification de test créée'
      });
    } catch (error) {
      console.error('Erreur lors de la création de la notification de test:', error);
      res.status(500).json({
        success: false,
        error: 'Erreur serveur'
      });
    }
  }
}