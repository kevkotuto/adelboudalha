/**
 * Admin Service - Dashboard & General Admin Operations
 * Integrates with Yu Card Backend API
 */

import { apiClient } from './apiClient';
import type {
  DashboardStats,
  DashboardQueryParams,
  FinancialReport,
  ReportQueryParams,
  AdminResponse,
} from '@/types/admin';

class AdminService {
  /**
   * Get dashboard statistics
   * GET /api/admin/dashboard
   */
  async getDashboardStats(params?: DashboardQueryParams): Promise<DashboardStats> {
    try {
      // apiClient.get already extracts response.data.data
      const data = await apiClient.get<DashboardStats>(
        '/admin/dashboard',
        { params }
      );
      return data;
    } catch (error) {
      console.error('[AdminService] Error fetching dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get financial report
   * GET /api/admin/reports/financial
   */
  async getFinancialReport(params?: ReportQueryParams): Promise<FinancialReport> {
    try {
      // apiClient.get already extracts response.data.data
      const data = await apiClient.get<FinancialReport>(
        '/admin/reports/financial',
        { params }
      );
      return data;
    } catch (error) {
      console.error('[AdminService] Error fetching financial report:', error);
      throw error;
    }
  }

  /**
   * Export orders to CSV
   * GET /api/admin/export/orders
   */
  async exportOrders(startDate?: string, endDate?: string): Promise<Blob> {
    try {
      const params: any = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const response = await apiClient.get('/admin/export/orders', {
        params,
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('[AdminService] Error exporting orders:', error);
      throw error;
    }
  }

  /**
   * Export users to CSV
   * GET /api/admin/export/users
   */
  async exportUsers(): Promise<Blob> {
    try {
      const response = await apiClient.get('/admin/export/users', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('[AdminService] Error exporting users:', error);
      throw error;
    }
  }

  /**
   * Send push notifications
   * POST /api/admin/notifications/send
   */
  async sendPushNotifications(data: {
    title: string;
    message: string;
    userIds?: string[];
    data?: Record<string, any>;
  }): Promise<{
    sent: number;
    failed: number;
    total: number;
  }> {
    try {
      // apiClient.post already extracts response.data.data
      const result = await apiClient.post<{
        sent: number;
        failed: number;
        total: number;
      }>('/admin/notifications/send', data);
      return result;
    } catch (error) {
      console.error('[AdminService] Error sending notifications:', error);
      throw error;
    }
  }

  /**
   * Send test notification to a specific user
   * POST /api/admin/notifications/test/:userId
   */
  async sendTestNotification(userId: string): Promise<void> {
    try {
      await apiClient.post(`/admin/notifications/test/${userId}`);
    } catch (error) {
      console.error('[AdminService] Error sending test notification:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
export default adminService;
