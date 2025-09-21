import { apiService } from './api';
import type {
  Application,
  CreateApplicationData,
  ApplicationFilters
} from '../types/application';

export class ApplicationService {
  // Routes pour les entreprises
  static async getMyApplications(filters: ApplicationFilters = {}) {
    return apiService.get('/applications/my-applications', filters);
  }

  static async createApplication(data: CreateApplicationData) {
    return apiService.post('/applications', data);
  }

  static async getApplicationById(id: string) {
    return apiService.get(`/applications/${id}`);
  }

  static async updateApplication(id: string, data: Partial<CreateApplicationData>) {
    return apiService.put(`/applications/${id}`, data);
  }

  static async deleteApplication(id: string) {
    return apiService.delete(`/applications/${id}`);
  }

  static async submitApplication(id: string) {
    return apiService.post(`/applications/${id}/submit`);
  }

  // Routes pour les organisations et admins
  static async getAllApplications(filters: ApplicationFilters = {}) {
    return apiService.get('/applications', filters);
  }

  static async getApplicationsByProgram(programId: string, filters: Omit<ApplicationFilters, 'programId'> = {}) {
    return apiService.get(`/applications/program/${programId}`, filters);
  }

  static async updateApplicationStatus(id: string, status: Application['status']) {
    return apiService.patch(`/applications/${id}/status`, { status });
  }

  static async reviewApplication(id: string, score?: number, comments?: string) {
    return apiService.post(`/applications/${id}/review`, { score, comments });
  }

  static async getApplicationStatistics() {
    return apiService.get('/applications/statistics/overview');
  }
}

export default ApplicationService;