import { apiService } from './api';
import type { Program, CreateProgramData, ProgramFilters } from '../types/program';

export class ProgramService {
  // Routes publiques - pour les entreprises
  static async getPublicPrograms(filters: ProgramFilters = {}) {
    return apiService.get('/programs/public', filters);
  }

  static async getPublicProgramById(id: string) {
    return apiService.get(`/programs/public/${id}`);
  }

  // Routes pour les organisations et admins
  static async getPrograms(filters: ProgramFilters = {}) {
    return apiService.get('/programs', filters);
  }

  static async createProgram(data: CreateProgramData) {
    return apiService.post('/programs', data);
  }

  static async getProgramById(id: string) {
    return apiService.get(`/programs/${id}`);
  }

  static async updateProgram(id: string, data: Partial<CreateProgramData>) {
    return apiService.put(`/programs/${id}`, data);
  }

  static async deleteProgram(id: string) {
    return apiService.delete(`/programs/${id}`);
  }

  static async updateProgramStatus(id: string, status: Program['status']) {
    return apiService.patch(`/programs/${id}/status`, { status });
  }

  static async duplicateProgram(id: string) {
    return apiService.post(`/programs/${id}/duplicate`);
  }

  static async getProgramStatistics(id: string) {
    return apiService.get(`/programs/${id}/statistics`);
  }
}

export default ProgramService;