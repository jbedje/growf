import { apiService } from './api';

export interface Company {
  id: string;
  userId: string;
  name: string;
  siret?: string;
  sector: string;
  size: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE';
  revenue?: number;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  foundedYear?: number;
  employeeCount?: number;
  legalForm?: string;
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
    applications: number;
    documents: number;
  };
}

export interface CompanyFilters {
  search?: string;
  sector?: string;
  size?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface CompanyStatistics {
  totalApplications: number;
  totalDocuments: number;
  applicationsByStatus: Record<string, number>;
}

export interface CompaniesStatistics {
  totalCompanies: number;
  recentCompanies: number;
  companiesBySize: Record<string, number>;
  companiesBySector: Record<string, number>;
}

export class CompanyService {
  // Routes pour les superadmins, admins et analystes
  static async getAllCompanies(filters: CompanyFilters = {}) {
    return apiService.get('/companies', filters);
  }

  static async getCompanyById(id: string) {
    return apiService.get(`/companies/${id}`);
  }

  static async updateCompany(id: string, data: Partial<Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | '_count'>>) {
    return apiService.put(`/companies/${id}`, data);
  }

  static async deleteCompany(id: string) {
    return apiService.delete(`/companies/${id}`);
  }

  // Routes pour les entreprises
  static async getMyCompany() {
    return apiService.get('/companies/profile/me');
  }

  static async updateMyCompany(data: Partial<Omit<Company, 'id' | 'userId' | 'createdAt' | 'updatedAt' | 'user' | '_count'>>) {
    return apiService.put('/companies/profile/me', data);
  }

  static async getCompanyStatistics(id: string) {
    return apiService.get(`/companies/${id}/statistics`);
  }

  static async getCompaniesStatistics() {
    return apiService.get('/companies/statistics/overview');
  }
}

export default CompanyService;