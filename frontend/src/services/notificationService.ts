import { apiService } from './api';

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  readAt?: string;
  applicationId?: string;
  relatedEntity?: {
    type: 'message' | 'document' | 'application' | 'program';
    id: string;
  };
}

export const NotificationType = {
  NEW_MESSAGE: 'NEW_MESSAGE',
  NEW_DOCUMENT: 'NEW_DOCUMENT',
  APPLICATION_STATUS_CHANGE: 'APPLICATION_STATUS_CHANGE',
  APPLICATION_REVIEWED: 'APPLICATION_REVIEWED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  PROGRAM_DEADLINE_APPROACHING: 'PROGRAM_DEADLINE_APPROACHING',
  NEW_PROGRAM_AVAILABLE: 'NEW_PROGRAM_AVAILABLE',
  COMPANY_VERIFICATION: 'COMPANY_VERIFICATION'
} as const;

export type NotificationType = typeof NotificationType[keyof typeof NotificationType];

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  browserNotifications: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}

export class NotificationService {
  static async getUserNotifications(page: number = 1, limit: number = 20) {
    return apiService.get('/notifications', { page, limit });
  }

  static async getUnreadCount() {
    return apiService.get('/notifications/unread-count');
  }

  static async markAsRead(notificationId: string) {
    return apiService.patch(`/notifications/${notificationId}/read`);
  }

  static async markAllAsRead() {
    return apiService.patch('/notifications/read-all');
  }

  static async deleteNotification(notificationId: string) {
    return apiService.delete(`/notifications/${notificationId}`);
  }

  static async deleteAllNotifications() {
    return apiService.delete('/notifications');
  }

  static async getUserPreferences() {
    return apiService.get('/notifications/preferences');
  }

  static async updateUserPreferences(preferences: Partial<NotificationPreferences>) {
    return apiService.patch('/notifications/preferences', preferences);
  }

  // Test function to create a sample notification
  static async createTestNotification() {
    return apiService.post('/notifications/test');
  }

  // Helper functions for notification types
  static getNotificationIcon(type: NotificationType): string {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return '💬';
      case NotificationType.NEW_DOCUMENT:
      case NotificationType.DOCUMENT_UPLOADED:
        return '📄';
      case NotificationType.APPLICATION_STATUS_CHANGE:
      case NotificationType.APPLICATION_REVIEWED:
        return '📋';
      case NotificationType.PROGRAM_DEADLINE_APPROACHING:
        return '⏰';
      case NotificationType.NEW_PROGRAM_AVAILABLE:
        return '🆕';
      case NotificationType.COMPANY_VERIFICATION:
        return '✅';
      default:
        return '🔔';
    }
  }

  static getNotificationColor(type: NotificationType): string {
    switch (type) {
      case NotificationType.NEW_MESSAGE:
        return 'text-blue-600 bg-blue-100';
      case NotificationType.NEW_DOCUMENT:
      case NotificationType.DOCUMENT_UPLOADED:
        return 'text-green-600 bg-green-100';
      case NotificationType.APPLICATION_STATUS_CHANGE:
      case NotificationType.APPLICATION_REVIEWED:
        return 'text-yellow-600 bg-yellow-100';
      case NotificationType.PROGRAM_DEADLINE_APPROACHING:
        return 'text-red-600 bg-red-100';
      case NotificationType.NEW_PROGRAM_AVAILABLE:
        return 'text-purple-600 bg-purple-100';
      case NotificationType.COMPANY_VERIFICATION:
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  static formatNotificationTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) {
      return 'À l\'instant';
    } else if (minutes < 60) {
      return `Il y a ${minutes}min`;
    } else if (hours < 24) {
      return `Il y a ${hours}h`;
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return `Il y a ${days}j`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
      });
    }
  }
}

export default NotificationService;