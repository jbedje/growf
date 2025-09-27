import { Notification, NotificationType, CreateNotificationRequest, NotificationPreferences } from '../types/notification';

export class NotificationService {
  private static notifications: Notification[] = [];
  private static preferences: NotificationPreferences[] = [];

  static async createNotification(request: CreateNotificationRequest): Promise<Notification> {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: request.userId,
      type: request.type,
      title: request.title,
      message: request.message,
      data: request.data,
      read: false,
      createdAt: new Date().toISOString(),
      ...(request.applicationId && { applicationId: request.applicationId }),
      ...(request.relatedEntity && { relatedEntity: request.relatedEntity })
    };

    this.notifications.push(notification);

    // In a real app, this would also trigger real-time updates via WebSocket/SSE
    console.log(`📢 Notification created for user ${request.userId}: ${request.title}`);

    return notification;
  }

  static async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<{
    notifications: Notification[];
    unreadCount: number;
    total: number;
  }> {
    const userNotifications = this.notifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const unreadCount = userNotifications.filter(n => !n.read).length;
    const paginatedNotifications = userNotifications.slice(offset, offset + limit);

    return {
      notifications: paginatedNotifications,
      unreadCount,
      total: userNotifications.length
    };
  }

  static async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    const notification = this.notifications.find(n => n.id === notificationId && n.userId === userId);
    if (notification && !notification.read) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  static async markAllNotificationsAsRead(userId: string): Promise<number> {
    let markedCount = 0;
    const now = new Date().toISOString();

    this.notifications.forEach(notification => {
      if (notification.userId === userId && !notification.read) {
        notification.read = true;
        notification.readAt = now;
        markedCount++;
      }
    });

    return markedCount;
  }

  static async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === notificationId && n.userId === userId);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      return true;
    }
    return false;
  }

  static async deleteAllNotifications(userId: string): Promise<number> {
    const initialLength = this.notifications.length;
    this.notifications = this.notifications.filter(n => n.userId !== userId);
    return initialLength - this.notifications.length;
  }

  static async getUnreadCount(userId: string): Promise<number> {
    return this.notifications.filter(n => n.userId === userId && !n.read).length;
  }

  // Notification creation helpers for specific events
  static async createMessageNotification(
    recipientId: string,
    senderEmail: string,
    applicationId: string,
    messageId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: recipientId,
      type: NotificationType.NEW_MESSAGE,
      title: 'Nouveau message',
      message: `Vous avez reçu un nouveau message de ${senderEmail}`,
      applicationId,
      relatedEntity: {
        type: 'message',
        id: messageId
      }
    });
  }

  static async createDocumentNotification(
    recipientId: string,
    uploaderEmail: string,
    documentName: string,
    applicationId: string,
    documentId: string
  ): Promise<Notification> {
    return this.createNotification({
      userId: recipientId,
      type: NotificationType.DOCUMENT_UPLOADED,
      title: 'Nouveau document',
      message: `${uploaderEmail} a uploadé un document: ${documentName}`,
      applicationId,
      relatedEntity: {
        type: 'document',
        id: documentId
      }
    });
  }

  static async createApplicationStatusNotification(
    userId: string,
    status: string,
    programTitle: string,
    applicationId: string
  ): Promise<Notification> {
    const statusMessages = {
      'UNDER_REVIEW': 'Votre candidature est maintenant en cours d\'examen',
      'APPROVED': 'Félicitations ! Votre candidature a été approuvée',
      'REJECTED': 'Votre candidature a été rejetée'
    };

    return this.createNotification({
      userId,
      type: NotificationType.APPLICATION_STATUS_CHANGE,
      title: 'Statut de candidature mis à jour',
      message: `${programTitle}: ${statusMessages[status as keyof typeof statusMessages] || 'Statut mis à jour'}`,
      applicationId,
      relatedEntity: {
        type: 'application',
        id: applicationId
      }
    });
  }

  // Notification preferences
  static async getUserPreferences(userId: string): Promise<NotificationPreferences | null> {
    return this.preferences.find(p => p.userId === userId) || null;
  }

  static async updateUserPreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const existingIndex = this.preferences.findIndex(p => p.userId === userId);

    if (existingIndex !== -1) {
      this.preferences[existingIndex] = { ...this.preferences[existingIndex], ...preferences } as NotificationPreferences;
      return this.preferences[existingIndex];
    } else {
      const defaultPreferences: NotificationPreferences = {
        id: Math.random().toString(36).substr(2, 9),
        userId,
        emailNotifications: true,
        browserNotifications: true,
        types: {
          [NotificationType.NEW_MESSAGE]: true,
          [NotificationType.NEW_DOCUMENT]: true,
          [NotificationType.APPLICATION_STATUS_CHANGE]: true,
          [NotificationType.APPLICATION_REVIEWED]: true,
          [NotificationType.DOCUMENT_UPLOADED]: true,
          [NotificationType.PROGRAM_DEADLINE_APPROACHING]: true,
          [NotificationType.NEW_PROGRAM_AVAILABLE]: true,
          [NotificationType.COMPANY_VERIFICATION]: true
        },
        ...preferences
      };

      this.preferences.push(defaultPreferences);
      return defaultPreferences;
    }
  }
}