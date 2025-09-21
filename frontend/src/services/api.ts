import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004';

class ApiService {
  private api: any;

  constructor() {
    this.api = axios.create({
      baseURL: `${API_BASE_URL}/api`,
      timeout: 10000,
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.api.interceptors.request.use(
      (config: any) => {
        return config;
      },
      (error: any) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: any) => {
        return response;
      },
      async (error: any) => {
        return Promise.reject(error);
      }
    );
  }

  async get(url: string, params?: any) {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post(url: string, data?: any) {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put(url: string, data?: any) {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async patch(url: string, data?: any) {
    const response = await this.api.patch(url, data);
    return response.data;
  }

  async delete(url: string) {
    const response = await this.api.delete(url);
    return response.data;
  }

  async uploadFile(url: string, file: File, onProgress?: (progress: number) => void) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  async uploadFiles(url: string, files: File[], onProgress?: (progress: number) => void) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await this.api.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent: any) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  async uploadDocuments(files: File[], applicationId?: string, _onProgress?: (progress: number) => void) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('documents', file);
    });

    if (applicationId) {
      formData.append('applicationId', applicationId);
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3003'}/api/documents/upload`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  async getDocuments(applicationId?: string) {
    const params = applicationId ? `?applicationId=${applicationId}` : '';
    return this.get(`/documents${params}`);
  }

  async deleteDocument(documentId: string) {
    return this.delete(`/documents/${documentId}`);
  }

  async getNotifications(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    return this.get(`/notifications${params}`);
  }

  async getUnreadNotificationCount(userId: string) {
    return this.get(`/notifications/unread-count?userId=${userId}`);
  }

  async markNotificationAsRead(notificationId: string) {
    return this.put(`/notifications/${notificationId}/read`);
  }

  async markAllNotificationsAsRead(userId: string) {
    return this.put('/notifications/mark-all-read', { userId });
  }

  async deleteNotification(notificationId: string) {
    return this.delete(`/notifications/${notificationId}`);
  }

  async getMessages(applicationId?: string, userId?: string) {
    const params = new URLSearchParams();
    if (applicationId) params.append('applicationId', applicationId);
    if (userId) params.append('userId', userId);
    const queryString = params.toString();
    return this.get(`/messages${queryString ? '?' + queryString : ''}`);
  }

  async sendMessage(applicationId: string, receiverId: string, content: string, attachments?: string[]) {
    return this.post('/messages', {
      applicationId,
      receiverId,
      content,
      attachments
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.put(`/messages/${messageId}/read`);
  }

  async getConversations(userId: string) {
    return this.get(`/conversations?userId=${userId}`);
  }
}

export const apiService = new ApiService();
export default apiService;