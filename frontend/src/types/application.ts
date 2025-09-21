export interface Application {
  id: string;
  programId: string;
  companyId: string;
  status: 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  data: any;
  score?: number;
  submittedAt?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
  program: {
    id: string;
    title: string;
    description?: string;
    deadline?: string;
    amountMin?: number;
    amountMax?: number;
    requirements?: any;
    applicationForm?: any;
    organization: {
      id: string;
      name: string;
      type: string;
    };
  };
  company?: {
    id: string;
    name: string;
    sector: string;
    size: string;
    location: string;
    description?: string;
  };
  documents?: Document[];
  messages?: Message[];
}

export interface Document {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
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
  sender: {
    id: string;
    email: string;
    role: string;
  };
}

export interface CreateApplicationData {
  programId: string;
  data: any;
}

export interface ApplicationFilters {
  status?: string;
  programId?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationStatistics {
  totalApplications: number;
  applicationsByStatus: Record<string, number>;
}