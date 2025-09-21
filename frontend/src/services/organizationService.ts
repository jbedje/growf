import { apiService } from './api';

export interface Organization {
  id: string;
  userId: string;
  name: string;
  type: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  contactInfo?: any;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    isActive: boolean;
    isVerified?: boolean;
    createdAt: string;
  };
  _count?: {
    programs: number;
  };
}

export interface CreateOrganizationData {
  email: string;
  password: string;
  name: string;
  type: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  contactInfo?: any;
}

export interface OrganizationFilters {
  search?: string;
  type?: string;
  page?: number;
  limit?: number;
}

export interface OrganizationStatistics {
  totalPrograms: number;
  programsByStatus: Record<string, number>;
  totalApplicationsReceived: number;
}

export class OrganizationService {
  // Routes pour les superadmins et admins
  static async getAllOrganizations(filters: OrganizationFilters = {}) {
    return apiService.get('/organizations', filters);
  }

  static async createOrganization(data: CreateOrganizationData) {
    return apiService.post('/organizations', data);
  }

  static async getOrganizationById(id: string) {
    return apiService.get(`/organizations/${id}`);
  }

  static async updateOrganization(id: string, data: Partial<Omit<CreateOrganizationData, 'email' | 'password'>>) {
    return apiService.put(`/organizations/${id}`, data);
  }

  static async deleteOrganization(id: string) {
    return apiService.delete(`/organizations/${id}`);
  }

  // Routes pour les organisations
  static async getMyOrganization() {
    return apiService.get('/organizations/profile/me');
  }

  static async updateMyOrganization(data: Partial<Omit<CreateOrganizationData, 'email' | 'password'>>) {
    return apiService.put('/organizations/profile/me', data);
  }

  static async getOrganizationStatistics(id: string) {
    return apiService.get(`/organizations/${id}/statistics`);
  }
}

export default OrganizationService;