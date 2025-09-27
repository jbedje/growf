import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosProgressEvent } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3005';

class ApiService {
  private api: AxiosInstance;

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
      (error: unknown) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error: unknown) => {
        return Promise.reject(error);
      }
    );
  }

  async get(url: string, params?: Record<string, unknown>) {
    const response = await this.api.get(url, { params });
    return response.data;
  }

  async post(url: string, data?: unknown) {
    const response = await this.api.post(url, data);
    return response.data;
  }

  async put(url: string, data?: unknown) {
    const response = await this.api.put(url, data);
    return response.data;
  }

  async patch(url: string, data?: unknown) {
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
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
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
      onUploadProgress: (progressEvent: AxiosProgressEvent) => {
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

  // Dashboard API methods
  async getDashboardStats(timeRange: string = '30d') {
    return this.get(`/dashboard/stats?timeRange=${timeRange}`);
  }

  async getApplications(status?: string, limit?: number) {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', limit.toString());
    const queryString = params.toString();
    return this.get(`/applications${queryString ? '?' + queryString : ''}`);
  }

  async getPrograms(filters?: { type?: string; status?: string; limit?: number }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    const queryString = params.toString();
    return this.get(`/programs${queryString ? '?' + queryString : ''}`);
  }

  async getApplication(id: string) {
    return this.get(`/applications/${id}`);
  }

  async updateApplication(id: string, data: Record<string, unknown>) {
    return this.put(`/applications/${id}`, data);
  }

  async createApplication(data: Record<string, unknown>) {
    return this.post('/applications', data);
  }

  async deleteApplication(id: string) {
    return this.delete(`/applications/${id}`);
  }

  async getCompanyProfile() {
    return this.get('/company/profile');
  }

  async updateCompanyProfile(data: Record<string, unknown>) {
    return this.put('/company/profile', data);
  }

  async exportDashboardData(format: 'csv' | 'excel' | 'pdf', timeRange: string = '30d') {
    const response = await this.api.get(`/dashboard/export`, {
      params: { format, timeRange },
      responseType: 'blob'
    });
    return response.data;
  }

  async refreshDashboard() {
    return this.post('/dashboard/refresh');
  }

  // Settings API methods
  async getCompanySettings() {
    return this.get('/company/settings');
  }

  async updateCompanySettings(settings: Record<string, unknown>) {
    return this.put('/company/settings', settings);
  }

  async updateNotificationSettings(notificationSettings: Record<string, unknown>) {
    return this.put('/company/settings/notifications', notificationSettings);
  }

  async updateDashboardSettings(dashboardSettings: Record<string, unknown>) {
    return this.put('/company/settings/dashboard', dashboardSettings);
  }

  async updatePrivacySettings(privacySettings: Record<string, unknown>) {
    return this.put('/company/settings/privacy', privacySettings);
  }

  async updateSecuritySettings(securitySettings: Record<string, unknown>) {
    return this.put('/company/settings/security', securitySettings);
  }

  async resetSettings() {
    return this.post('/company/settings/reset');
  }

  async exportSettings() {
    const response = await this.api.get('/company/settings/export', {
      responseType: 'blob'
    });
    return response.data;
  }

  async importSettings(file: File) {
    const formData = new FormData();
    formData.append('settingsFile', file);
    const response = await this.api.post('/company/settings/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;