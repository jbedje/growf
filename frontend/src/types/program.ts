export interface Program {
  id: string;
  organizationId: string;
  title: string;
  description: string;
  criteria: any;
  amountMin?: number;
  amountMax?: number;
  deadline?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED';
  sector: string[];
  companySize: string[];
  location: string[];
  tags: string[];
  requirements?: any;
  applicationForm?: any;
  createdAt: string;
  updatedAt: string;
  organization: {
    id: string;
    name: string;
    type: string;
  };
  _count?: {
    applications: number;
  };
}

export interface CreateProgramData {
  title: string;
  description: string;
  criteria: any;
  amountMin?: number;
  amountMax?: number;
  deadline?: string;
  sector: string[];
  companySize: string[];
  location: string[];
  tags: string[];
  requirements?: any;
  applicationForm?: any;
  organizationId?: string; // Pour les admins/superadmins
}

export interface ProgramFilters {
  status?: string;
  sector?: string;
  search?: string;
  location?: string;
  page?: number;
  limit?: number;
}

export interface ProgramStatistics {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
}