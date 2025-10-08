/**
 * Admin Audit Service - Audit Logs
 */

import { apiClient } from './apiClient';
import type {
  AuditLog,
  AdminListResponse,
  AuditQueryParams,
} from '@/types/admin';

class AdminAuditService {
  /**
   * Get audit logs with filters
   * GET /api/admin/audit-logs
   */
  async getAuditLogs(params?: AuditQueryParams): Promise<AdminListResponse<AuditLog>> {
    try {
      const response = await apiClient.get<{
        success: boolean;
        data: {
          logs: AuditLog[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
          };
        };
      }>('/admin/audit-logs', { params });

      return {
        data: response.data.data.logs,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      console.error('[AdminAuditService] Error fetching audit logs:', error);
      throw error;
    }
  }
}

export const adminAuditService = new AdminAuditService();
export default adminAuditService;
