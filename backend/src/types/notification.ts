export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  readAt?: string;
  applicationId?: string;
  relatedEntity?: {
    type: 'message' | 'document' | 'application' | 'program';
    id: string;
  };
}

export enum NotificationType {
  NEW_MESSAGE = 'NEW_MESSAGE',
  NEW_DOCUMENT = 'NEW_DOCUMENT',
  APPLICATION_STATUS_CHANGE = 'APPLICATION_STATUS_CHANGE',
  APPLICATION_REVIEWED = 'APPLICATION_REVIEWED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  PROGRAM_DEADLINE_APPROACHING = 'PROGRAM_DEADLINE_APPROACHING',
  NEW_PROGRAM_AVAILABLE = 'NEW_PROGRAM_AVAILABLE',
  COMPANY_VERIFICATION = 'COMPANY_VERIFICATION'
}

export interface CreateNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: any;
  applicationId?: string;
  relatedEntity?: {
    type: 'message' | 'document' | 'application' | 'program';
    id: string;
  };
}

export interface NotificationPreferences {
  id: string;
  userId: string;
  emailNotifications: boolean;
  browserNotifications: boolean;
  types: {
    [key in NotificationType]: boolean;
  };
}