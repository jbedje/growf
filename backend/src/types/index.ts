import { Request } from 'express';
import { UserRole, CompanySize, ApplicationStatus, ProgramStatus, NotificationType } from '@prisma/client';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
    companyId?: string | undefined;
    organizationId?: string | undefined;
  };
}

export interface CreateUserData {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CompanyProfileData {
  name: string;
  siret?: string;
  sector: string;
  size: CompanySize;
  revenue?: number;
  location: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  foundedYear?: number;
  employeeCount?: number;
  legalForm?: string;
}

export interface OrganizationProfileData {
  name: string;
  type: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  contactInfo?: any;
}

export interface CreateProgramData {
  title: string;
  description: string;
  criteria: any;
  amountMin?: number;
  amountMax?: number;
  deadline?: Date;
  sector: string[];
  companySize: CompanySize[];
  location: string[];
  tags: string[];
  requirements?: any;
  applicationForm?: any;
}

export interface UpdateProgramData extends Partial<CreateProgramData> {
  status?: ProgramStatus;
}

export interface CreateApplicationData {
  programId: string;
  data: any;
}

export interface UpdateApplicationData {
  data?: any;
  status?: ApplicationStatus;
  score?: number;
}

export interface ProgramFilters {
  sector?: string;
  companySize?: CompanySize;
  location?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
  tags?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string | undefined;
  organizationId?: string | undefined;
}

export interface EmailData {
  to: string;
  subject: string;
  template: string;
  data: any;
}

export interface FileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export { UserRole, CompanySize, ApplicationStatus, ProgramStatus, NotificationType };