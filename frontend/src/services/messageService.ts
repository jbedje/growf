import { apiService } from './api';

export interface Message {
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

export interface Conversation {
  id: string;
  program: {
    id: string;
    title: string;
    organization: {
      id: string;
      name: string;
    };
  };
  company?: {
    id: string;
    name: string;
  };
  messages: Message[];
  _count: {
    messages: number;
  };
}

export class MessageService {
  static async getApplicationMessages(applicationId: string) {
    return apiService.get(`/messages/application/${applicationId}`);
  }

  static async sendMessage(applicationId: string, content: string, attachments: string[] = []) {
    return apiService.post(`/messages/application/${applicationId}`, {
      content,
      attachments
    });
  }

  static async markMessageAsRead(messageId: string) {
    return apiService.patch(`/messages/${messageId}/read`);
  }

  static async markAllMessagesAsRead(applicationId: string) {
    return apiService.patch(`/messages/application/${applicationId}/read-all`);
  }

  static async deleteMessage(messageId: string) {
    return apiService.delete(`/messages/${messageId}`);
  }

  static async getUnreadCount() {
    return apiService.get('/messages/unread-count');
  }

  static async getUserConversations(page: number = 1, limit: number = 10) {
    return apiService.get('/messages/conversations', { page, limit });
  }
}

export default MessageService;