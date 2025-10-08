/**
 * Admin Orders Service - Order Management & Gift Card Code Assignment
 */

import { apiClient } from './apiClient';
import type {
  AdminOrder,
  AdminListResponse,
  AdminResponse,
  OrderQueryParams,
  UpdateOrderStatusRequest,
  AssignCodesResult,
  ManualAssignResult,
  OrderCodesDetails,
  AssignManualCodeRequest,
} from '@/types/admin';

class AdminOrdersService {
  /**
   * Get all orders with filters
   * GET /api/admin/orders
   */
  async getAllOrders(params?: OrderQueryParams): Promise<{ orders: AdminOrder[]; pagination: any }> {
    try {
      // apiClient.get already extracts response.data.data
      // Backend returns: { success: true, data: { orders: [], pagination: {} } }
      const data = await apiClient.get<{ orders: AdminOrder[]; pagination: any }>(
        '/admin/orders',
        { params }
      );

      return data;
    } catch (error) {
      console.error('[AdminOrdersService] Error fetching orders:', error);
      throw error;
    }
  }

  // Alias pour compatibilité
  async getOrders(params?: OrderQueryParams): Promise<{ orders: AdminOrder[]; pagination: any }> {
    return this.getAllOrders(params);
  }

  /**
   * Update order status
   * PATCH /api/admin/orders/:orderId/status
   */
  async updateOrderStatus(
    orderId: string,
    status: string
  ): Promise<AdminOrder> {
    try {
      // apiClient.patch already extracts response.data.data
      const order = await apiClient.patch<AdminOrder>(
        `/admin/orders/${orderId}/status`,
        { status }
      );
      return order;
    } catch (error) {
      console.error('[AdminOrdersService] Error updating order status:', error);
      throw error;
    }
  }

  /**
   * Update payment status (for cash payments)
   * PATCH /api/admin/orders/:orderId/payment-status
   */
  async updatePaymentStatus(
    orderId: string,
    paymentStatus: string
  ): Promise<AdminOrder> {
    try {
      const order = await apiClient.patch<AdminOrder>(
        `/admin/orders/${orderId}/payment-status`,
        { paymentStatus }
      );
      return order;
    } catch (error) {
      console.error('[AdminOrdersService] Error updating payment status:', error);
      throw error;
    }
  }

  /**
   * Get order details
   * GET /api/admin/orders/:orderId
   */
  async getOrderDetails(orderId: string): Promise<AdminOrder> {
    try {
      // apiClient.get already extracts response.data.data
      const order = await apiClient.get<AdminOrder>(
        `/admin/orders/${orderId}`
      );
      return order;
    } catch (error) {
      console.error('[AdminOrdersService] Error fetching order details:', error);
      throw error;
    }
  }

  // ============================================
  // Gift Card Code Assignment
  // ============================================

  /**
   * Assign codes automatically from inventory (Option A - Batch)
   * POST /api/admin/orders/:orderId/assign-codes
   *
   * Note: Backend may return success=false even when assignment works,
   * so we need to check the response data structure directly
   */
  async assignCodes(orderId: string): Promise<AssignCodesResult> {
    try {
      const result = await apiClient.post<AssignCodesResult>(
        `/admin/orders/${orderId}/assign-codes`
      );
      return result;
    } catch (error: any) {
      // Backend may return success=false with valid data structure
      // Check if error response contains valid AssignCodesResult structure
      if (error?.response?.data?.data) {
        const data = error.response.data.data;
        // If it has the expected structure (results and errors arrays), return it
        if (Array.isArray(data.results) && Array.isArray(data.errors)) {
          console.log('[AdminOrdersService] Backend returned success=false but valid data, using it');
          return data as AssignCodesResult;
        }
      }

      console.error('[AdminOrdersService] Error assigning codes:', error);
      throw error;
    }
  }

  /**
   * Get order codes details (assigned codes)
   * GET /api/admin/orders/:orderId/codes
   */
  async getOrderCodes(orderId: string): Promise<OrderCodesDetails> {
    try {
      const details = await apiClient.get<OrderCodesDetails>(
        `/admin/orders/${orderId}/codes`
      );
      return details;
    } catch (error) {
      console.error('[AdminOrdersService] Error fetching order codes:', error);
      throw error;
    }
  }

  /**
   * Assign manual code to an order item (Option B - One by one)
   * POST /api/admin/order-items/:orderItemId/assign-code
   */
  async assignManualCode(
    orderItemId: string,
    code: string
  ): Promise<ManualAssignResult> {
    try {
      const result = await apiClient.post<ManualAssignResult>(
        `/admin/order-items/${orderItemId}/assign-code`,
        { code }
      );
      return result;
    } catch (error) {
      console.error('[AdminOrdersService] Error assigning manual code:', error);
      throw error;
    }
  }
}

export const adminOrdersService = new AdminOrdersService();
export default adminOrdersService;
