export const UserRole = {
  COMPANY: 'COMPANY',
  ORGANIZATION: 'ORGANIZATION',
  ANALYST: 'ANALYST',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export const CompanySize = {
  MICRO: 'MICRO',
  SMALL: 'SMALL',
  MEDIUM: 'MEDIUM',
  LARGE: 'LARGE'
} as const;

export type CompanySize = typeof CompanySize[keyof typeof CompanySize];

export const ApplicationStatus = {
  DRAFT: 'DRAFT',
  SUBMITTED: 'SUBMITTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED'
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export const ProgramStatus = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED'
} as const;

export type ProgramStatus = typeof ProgramStatus[keyof typeof ProgramStatus];

export interface User {
  id: string;
  email: string;
  role: UserRoleType;
  isVerified: boolean;
  companyId?: string;
  organizationId?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
}

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
}

export interface Program {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  criteria: any;
  amountMin?: number;
  amountMax?: number;
  deadline?: string;
  status: ProgramStatus;
  sector: string[];
  companySize: CompanySize[];
  location: string[];
  tags: string[];
  requirements?: any;
  applicationForm?: any;
  createdAt: string;
  updatedAt: string;
  organization?: Organization;
  _count?: {
    applications: number;
  };
}

export interface Application {
  id: string;
  programId: string;
  companyId: string;
  status: ApplicationStatus;
  data: any;
  score?: number;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  program?: Program;
  company?: Company;
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  applicationId?: string;
  companyId?: string;
  uploadedAt: string;
}

export interface Message {
  id: string;
  applicationId: string;
  senderId: string;
  content: string;
  attachments: string[];
  readAt?: string;
  createdAt: string;
  sender?: User;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  readAt?: string;
  createdAt: string;
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

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRoleType;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
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

export interface CreateCompanyProfileRequest {
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

export interface CreateOrganizationProfileRequest {
  name: string;
  type: string;
  description?: string;
  website?: string;
  phone?: string;
  address?: string;
  contactInfo?: any;
}

export interface CreateProgramRequest {
  title: string;
  description: string;
  criteria: any;
  amountMin?: number;
  amountMax?: number;
  deadline?: string;
  sector: string[];
  companySize: CompanySize[];
  location: string[];
  tags: string[];
  requirements?: any;
  applicationForm?: any;
}

export interface CreateApplicationRequest {
  programId: string;
  data: any;
}