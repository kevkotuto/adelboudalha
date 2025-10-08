import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: NotificationCategory;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  type: NotificationType;
  status: NotificationStatus;
  scheduledAt?: string;
  sentAt?: string;
  targetAudience: TargetAudience;
  recipients?: NotificationRecipient[];
  templateId?: string;
  metadata?: Record<string, any>;
  stats?: NotificationStats;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
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

export interface NotificationRecipient {
  id: string;
  userId: string;
  status: 'pending' | 'sent' | 'delivered' | 'read' | 'failed';
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  errorMessage?: string;
  deviceTokens?: string[];
}

export interface NotificationStats {
  totalRecipients: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
  clicked: number;
  deliveryRate: number;
  readRate: number;
  clickRate: number;
}

export interface CreateNotificationRequest {
  title: string;
  body: string;
  category: NotificationCategory;
  type: NotificationType;
  targetAudience: TargetAudience;
  scheduledAt?: string;
  templateId?: string;
  metadata?: Record<string, any>;
}

export interface UpdateNotificationRequest {
  title?: string;
  body?: string;
  category?: NotificationCategory;
  scheduledAt?: string;
  status?: NotificationStatus;
  metadata?: Record<string, any>;
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
  createdBy?: string;
}

export interface CreateTemplateRequest {
  name: string;
  title: string;
  body: string;
  category: NotificationCategory;
  variables?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  title?: string;
  body?: string;
  category?: NotificationCategory;
  variables?: string[];
  isActive?: boolean;
}

export interface NotificationAnalytics {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  averageDeliveryRate: number;
  averageReadRate: number;
  categoryBreakdown: {
    category: NotificationCategory;
    count: number;
    deliveryRate: number;
    readRate: number;
  }[];
  dailyStats: {
    date: string;
    sent: number;
    delivered: number;
    read: number;
  }[];
}

export interface DeviceToken {
  id: string;
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  isActive: boolean;
  lastUsed: string;
  createdAt: string;
}

class NotificationService {
  // Notification management
  async getAllNotifications(params: NotificationListParams = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notifications`, { params });
    return response.data;
  }

  async getNotificationById(id: string) {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notifications/${id}`);
    return response.data;
  }

  async createNotification(data: CreateNotificationRequest) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/notifications`, data);
    return response.data;
  }

  async updateNotification(id: string, data: UpdateNotificationRequest) {
    const response = await apiClient.put(`${API_ENDPOINTS.ADMIN.BASE}/notifications/${id}`, data);
    return response.data;
  }

  async deleteNotification(id: string) {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADMIN.BASE}/notifications/${id}`);
    return response.data;
  }

  async sendNotification(id: string) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/notifications/${id}/send`);
    return response.data;
  }

  async cancelNotification(id: string) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/notifications/${id}/cancel`);
    return response.data;
  }

  async duplicateNotification(id: string) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/notifications/${id}/duplicate`);
    return response.data;
  }

  // Template management
  async getAllTemplates() {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notification-templates`);
    return response.data;
  }

  async getTemplateById(id: string) {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notification-templates/${id}`);
    return response.data;
  }

  async createTemplate(data: CreateTemplateRequest) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/notification-templates`, data);
    return response.data;
  }

  async updateTemplate(id: string, data: UpdateTemplateRequest) {
    const response = await apiClient.put(`${API_ENDPOINTS.ADMIN.BASE}/notification-templates/${id}`, data);
    return response.data;
  }

  async deleteTemplate(id: string) {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADMIN.BASE}/notification-templates/${id}`);
    return response.data;
  }

  // Analytics and reporting
  async getNotificationStats(id: string) {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notifications/${id}/stats`);
    return response.data as NotificationStats;
  }

  async getAnalytics(dateFrom?: string, dateTo?: string) {
    const params = { dateFrom, dateTo };
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notifications/analytics`, { params });
    return response.data as NotificationAnalytics;
  }

  async exportNotifications(params: NotificationListParams & { format?: 'csv' | 'xlsx' } = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notifications/export`, {
      params,
      responseType: 'blob',
    });
    return response.data;
  }

  // Device token management
  async getAllDeviceTokens(params: { page?: number; limit?: number; platform?: string } = {}) {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/device-tokens`, { params });
    return response.data;
  }

  async registerDeviceToken(token: string, platform: 'ios' | 'android' | 'web', userId?: string) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/device-tokens`, {
      token,
      platform,
      userId,
    });
    return response.data;
  }

  async removeDeviceToken(tokenId: string) {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADMIN.BASE}/device-tokens/${tokenId}`);
    return response.data;
  }

  async getUserDeviceTokens(userId: string) {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/users/${userId}/device-tokens`);
    return response.data;
  }

  // Audience management
  async getAudienceSize(targetAudience: TargetAudience) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/notifications/audience-size`, {
      targetAudience,
    });
    return response.data;
  }

  async getUserSegments() {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/user-segments`);
    return response.data;
  }

  async createUserSegment(name: string, filters: any) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/user-segments`, {
      name,
      filters,
    });
    return response.data;
  }

  // Test notifications
  async sendTestNotification(notificationData: CreateNotificationRequest, testUserIds: string[]) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/notifications/test`, {
      ...notificationData,
      testUserIds,
    });
    return response.data;
  }

  async sendTestPushNotification(title: string, body: string, deviceTokens: string[]) {
    const response = await apiClient.post(`${API_ENDPOINTS.ADMIN.BASE}/notifications/test-push`, {
      title,
      body,
      deviceTokens,
    });
    return response.data;
  }

  // Bulk operations
  async bulkUpdateNotifications(notificationIds: string[], updates: Partial<UpdateNotificationRequest>) {
    const response = await apiClient.put(`${API_ENDPOINTS.ADMIN.BASE}/notifications/bulk`, {
      notificationIds,
      updates,
    });
    return response.data;
  }

  async bulkDeleteNotifications(notificationIds: string[]) {
    const response = await apiClient.delete(`${API_ENDPOINTS.ADMIN.BASE}/notifications/bulk`, {
      data: { notificationIds },
    });
    return response.data;
  }

  // Scheduling
  async getScheduledNotifications() {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notifications/scheduled`);
    return response.data;
  }

  async rescheduleNotification(id: string, scheduledAt: string) {
    const response = await apiClient.put(`${API_ENDPOINTS.ADMIN.BASE}/notifications/${id}/reschedule`, {
      scheduledAt,
    });
    return response.data;
  }

  // Health check
  async checkNotificationServiceHealth() {
    const response = await apiClient.get(`${API_ENDPOINTS.ADMIN.BASE}/notifications/health`);
    return response.data;
  }

  // Real-time updates (would typically use WebSocket in production)
  async subscribeToNotificationUpdates(callback: (notification: Notification) => void) {
    // Simulate real-time updates with polling
    const interval = setInterval(async () => {
      try {
        const notifications = await this.getAllNotifications({ limit: 10 });
        notifications.items?.forEach((notification: Notification) => {
          callback(notification);
        });
      } catch (error) {
        console.error('Error fetching notification updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }
}

export const notificationService = new NotificationService();