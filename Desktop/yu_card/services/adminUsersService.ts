/**
 * Admin Users Service - User Management
 */

import { apiClient } from './apiClient';
import type {
  AdminUser,
  AdminListResponse,
  AdminResponse,
  UserQueryParams,
  UpdateUserStatusRequest,
  UserWallet,
  WalletAdjustment,
  WalletTransaction,
} from '@/types/admin';

class AdminUsersService {
  /**
   * Get all users with filters
   * GET /api/admin/users
   */
  async getAllUsers(params?: UserQueryParams): Promise<AdminListResponse<AdminUser>> {
    try {
      // apiClient.get déjà extrait .data, donc response = {users: [], pagination: {}}
      const response = await apiClient.get<{
        users: AdminUser[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>('/admin/users', { params });

      return {
        data: response.users,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('[AdminUsersService] Error fetching users:', error);
      throw error;
    }
  }

  /**
   * Update user status (activate/suspend)
   * PATCH /api/admin/users/:userId/status
   */
  async updateUserStatus(
    userId: string,
    data: UpdateUserStatusRequest
  ): Promise<void> {
    try {
      await apiClient.patch(`/admin/users/${userId}/status`, data);
    } catch (error) {
      console.error('[AdminUsersService] Error updating user status:', error);
      throw error;
    }
  }

  /**
   * Get user activity details
   * GET /api/admin/users/:userId/activity
   */
  async getUserActivity(userId: string): Promise<{
    user: AdminUser;
    recentOrders: any[];
    recentReviews: any[];
    wallet: {
      balance: number;
      transactions: WalletTransaction[];
    };
    recentNotifications: any[];
  }> {
    try {
      const response = await apiClient.get<AdminResponse<any>>(
        `/admin/users/${userId}/activity`
      );
      return response.data;
    } catch (error) {
      console.error('[AdminUsersService] Error fetching user activity:', error);
      throw error;
    }
  }

  /**
   * Adjust user wallet balance
   * POST /api/admin/wallet/adjust
   */
  async adjustWalletBalance(data: WalletAdjustment): Promise<{
    wallet: UserWallet;
    transaction: WalletTransaction;
  }> {
    try {
      const response = await apiClient.post<AdminResponse<{
        wallet: UserWallet;
        transaction: WalletTransaction;
      }>>('/admin/wallet/adjust', data);
      return response.data;
    } catch (error) {
      console.error('[AdminUsersService] Error adjusting wallet:', error);
      throw error;
    }
  }
}

export const adminUsersService = new AdminUsersService();
export default adminUsersService;
