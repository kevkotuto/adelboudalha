import { TimestampFields, ID, PhoneNumber, Email } from './index';

export interface NotificationTemplate extends TimestampFields {
  id: ID;
  name: string;
  title: string;
  body: string;
  category: NotificationCategory;
  variables: string[];
  isActive: boolean;
}

export interface Notification extends TimestampFields {
  id: ID;
  title: string;
  body: string;
  category: NotificationCategory;
  type: NotificationType;
  status: NotificationStatus;
  scheduledAt?: string;
  sentAt?: string;
  targetAudience: TargetAudience;
  recipients?: NotificationRecipient[];
  templateId?: ID;
  metadata?: Record<string, any>;
  stats?: NotificationStats;
  createdBy: ID;
}

export type NotificationCategory =
  | 'order_updates'
  | 'promotions'
  | 'system_alerts'
  | 'account'
  | 'delivery'
  | 'payment'
  | 'marketing'
  | 'general';

export type NotificationType = 'push' | 'sms' | 'email' | 'in_app';

export type NotificationStatus =
  | 'draft'
  | 'scheduled'
  | 'sending'
  | 'sent'
  | 'failed'
  | 'cancelled';

export interface TargetAudience {
  type: 'all' | 'segment' | 'individual';
  segments?: string[];
  userIds?: string[];
  filters?: {
    location?: string[];
    ageRange?: { min: number; max: number };
    orderHistory?: 'new_customers' | 'returning_customers' | 'vip_customers';
    lastActiveWithin?: number; // days
  };
}

export interface NotificationRecipient extends TimestampFields {
  id: ID;
  userId: ID;
  notificationId: ID;
  status: NotificationRecipientStatus;
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  clickedAt?: string;
  errorMessage?: string;
  deviceTokens?: string[];
  metadata?: Record<string, any>;
}

export type NotificationRecipientStatus =
  | 'pending'
  | 'sent'
  | 'delivered'
  | 'read'
  | 'clicked'
  | 'failed';

export interface NotificationStats {
  totalRecipients: number;
  sent: number;
  delivered: number;
  read: number;
  clicked: number;
  failed: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
  bounceRate: number;
}

export interface CreateNotificationRequest {
  title: string;
  body: string;
  category: NotificationCategory;
  type: NotificationType;
  targetAudience: TargetAudience;
  scheduledAt?: string;
  templateId?: ID;
  metadata?: Record<string, any>;
  actionUrl?: string;
  imageUrl?: string;
  sound?: string;
  badge?: number;
}

export interface UpdateNotificationRequest {
  title?: string;
  body?: string;
  category?: NotificationCategory;
  scheduledAt?: string;
  status?: NotificationStatus;
  metadata?: Record<string, any>;
  actionUrl?: string;
  imageUrl?: string;
}

export interface NotificationListParams {
  page?: number;
  limit?: number;
  category?: NotificationCategory;
  status?: NotificationStatus;
  type?: NotificationType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  createdBy?: ID;
}

export interface CreateTemplateRequest {
  name: string;
  title: string;
  body: string;
  category: NotificationCategory;
  variables?: string[];
  defaultMetadata?: Record<string, any>;
}

export interface UpdateTemplateRequest {
  name?: string;
  title?: string;
  body?: string;
  category?: NotificationCategory;
  variables?: string[];
  isActive?: boolean;
  defaultMetadata?: Record<string, any>;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalClicked: number;
  averageDeliveryRate: number;
  averageReadRate: number;
  averageClickRate: number;
  categoryBreakdown: {
    category: NotificationCategory;
    count: number;
    deliveryRate: number;
    readRate: number;
    clickRate: number;
  }[];
  dailyStats: {
    date: string;
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
  }[];
  topPerformingNotifications: {
    id: ID;
    title: string;
    sentAt: string;
    deliveryRate: number;
    readRate: number;
    clickRate: number;
  }[];
}

export interface DeviceToken extends TimestampFields {
  id: ID;
  userId: ID;
  token: string;
  platform: DevicePlatform;
  isActive: boolean;
  lastUsed: string;
  appVersion?: string;
  osVersion?: string;
}

export type DevicePlatform = 'ios' | 'android' | 'web';

export interface UserSegment extends TimestampFields {
  id: ID;
  name: string;
  description?: string;
  filters: {
    location?: string[];
    ageRange?: { min: number; max: number };
    orderHistory?: 'new_customers' | 'returning_customers' | 'vip_customers';
    lastActiveWithin?: number;
    totalSpent?: { min?: number; max?: number };
    orderCount?: { min?: number; max?: number };
    registeredAfter?: string;
    registeredBefore?: string;
    hasCompletedOrders?: boolean;
    preferredCategories?: string[];
  };
  userCount: number;
  isActive: boolean;
  createdBy: ID;
}

export interface NotificationSchedule {
  id: ID;
  notificationId: ID;
  scheduledAt: string;
  status: 'scheduled' | 'sent' | 'failed' | 'cancelled';
  attempts: number;
  lastAttemptAt?: string;
  errorMessage?: string;
}

export interface NotificationEvent extends TimestampFields {
  id: ID;
  notificationId: ID;
  recipientId: ID;
  eventType: NotificationEventType;
  deviceToken?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

export type NotificationEventType =
  | 'sent'
  | 'delivered'
  | 'read'
  | 'clicked'
  | 'bounced'
  | 'failed';

export interface NotificationPreferences extends TimestampFields {
  id: ID;
  userId: ID;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  categories: {
    [K in NotificationCategory]: boolean;
  };
  quietHours?: {
    enabled: boolean;
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    timezone: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  category?: string;
  imageUrl?: string;
  actionUrl?: string;
  buttons?: {
    title: string;
    action: string;
  }[];
}

export interface SMSNotificationPayload {
  message: string;
  phoneNumber: PhoneNumber;
  metadata?: Record<string, any>;
}

export interface EmailNotificationPayload {
  subject: string;
  body: string;
  htmlBody?: string;
  to: Email;
  cc?: Email[];
  bcc?: Email[];
  attachments?: {
    filename: string;
    content: string;
    contentType: string;
  }[];
}

export interface NotificationCampaign extends TimestampFields {
  id: ID;
  name: string;
  description?: string;
  notifications: ID[];
  status: 'draft' | 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  targetAudience: TargetAudience;
  stats: {
    totalNotifications: number;
    totalRecipients: number;
    totalSent: number;
    totalDelivered: number;
    totalRead: number;
    totalClicked: number;
  };
  createdBy: ID;
}