import { apiService } from './api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3003';

export interface Document {
  id: string;
  applicationId: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  description?: string;
  uploadedAt: string;
}

export class DocumentService {
  static async uploadDocument(applicationId: string, file: File, description?: string) {
    const formData = new FormData();
    formData.append('document', file);
    if (description) {
      formData.append('description', description);
    }

    return fetch(`${API_BASE_URL}/api/documents/upload/${applicationId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: formData
    }).then(response => {
      if (!response.ok) {
        throw new Error('Erreur lors de l\'upload');
      }
      return response.json();
    });
  }

  static async getApplicationDocuments(applicationId: string) {
    return apiService.get(`/documents/application/${applicationId}`);
  }

  static async downloadDocument(documentId: string) {
    return fetch(`${API_BASE_URL}/api/documents/download/${documentId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
  }

  static async deleteDocument(documentId: string) {
    return apiService.delete(`/documents/${documentId}`);
  }

  static async updateDocument(documentId: string, description: string) {
    return apiService.patch(`/documents/${documentId}`, { description });
  }
}

export default DocumentService;