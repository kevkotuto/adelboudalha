/**
 * Admin Gift Cards Service - Gift Card Management & Inventory
 */

import { apiClient } from './apiClient';
import type {
  AdminGiftCard,
  AdminListResponse,
  AdminResponse,
  ProductQueryParams,
  CreateGiftCardRequest,
  UpdateGiftCardRequest,
  GiftCardInventoryCode,
  InventorySummary,
  ImportCodesResult,
  InventoryQueryParams,
} from '@/types/admin';

class AdminGiftCardsService {
  /**
   * Get all gift cards with filters
   * GET /api/admin/gift-cards
   */
  async getAllGiftCards(params?: ProductQueryParams): Promise<AdminListResponse<AdminGiftCard>> {
    try {
      // apiClient.get déjà extrait .data, donc response = {giftCards: [], pagination: {}}
      const response = await apiClient.get<{
        giftCards: AdminGiftCard[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>('/admin/gift-cards', { params });

      return {
        data: response.giftCards,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('[AdminGiftCardsService] Error fetching gift cards:', error);
      throw error;
    }
  }

  /**
   * Create a new gift card
   * POST /api/admin/gift-cards
   */
  async createGiftCard(data: CreateGiftCardRequest): Promise<AdminGiftCard> {
    try {
      const response = await apiClient.post<AdminGiftCard>('/admin/gift-cards', data);
      return response;
    } catch (error) {
      console.error('[AdminGiftCardsService] Error creating gift card:', error);
      throw error;
    }
  }

  /**
   * Update a gift card
   * PATCH /api/admin/gift-cards/:giftCardId
   */
  async updateGiftCard(
    giftCardId: string,
    data: UpdateGiftCardRequest
  ): Promise<AdminGiftCard> {
    try {
      const response = await apiClient.patch<AdminGiftCard>(
        `/admin/gift-cards/${giftCardId}`,
        data
      );
      return response;
    } catch (error) {
      console.error('[AdminGiftCardsService] Error updating gift card:', error);
      throw error;
    }
  }

  /**
   * Delete a gift card
   * DELETE /api/admin/gift-cards/:giftCardId
   */
  async deleteGiftCard(giftCardId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/gift-cards/${giftCardId}`);
    } catch (error) {
      console.error('[AdminGiftCardsService] Error deleting gift card:', error);
      throw error;
    }
  }

  // ============================================
  // Inventory Management
  // ============================================

  /**
   * Import codes from CSV file
   * POST /api/admin/gift-cards/:giftCardId/codes/import
   */
  async importCodes(giftCardId: string, file: File): Promise<ImportCodesResult> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<ImportCodesResult>(
        `/admin/gift-cards/${giftCardId}/codes/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      console.error('[AdminGiftCardsService] Error importing codes:', error);
      throw error;
    }
  }

  /**
   * Get inventory codes for a gift card
   * GET /api/admin/gift-cards/:giftCardId/inventory
   */
  async getInventory(
    giftCardId: string,
    params?: InventoryQueryParams
  ): Promise<AdminListResponse<GiftCardInventoryCode>> {
    try {
      const response = await apiClient.get<{
        data: GiftCardInventoryCode[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
          hasNext: boolean;
          hasPrev: boolean;
        };
        stats: Record<string, number>;
      }>(`/admin/gift-cards/${giftCardId}/inventory`, { params });

      console.log('[AdminGiftCardsService] Items count:', response?.data?.length || 0);

      return {
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('[AdminGiftCardsService] Error fetching inventory:', error);
      throw error;
    }
  }

  /**
   * Get inventory summary for all gift cards
   * GET /api/admin/gift-cards/inventory/summary
   */
  async getInventorySummary(): Promise<{
    giftCards: InventorySummary[];
    alerts: {
      lowStock: InventorySummary[];
      outOfStock: InventorySummary[];
    };
  }> {
    try {
      const response = await apiClient.get<{
        giftCards: InventorySummary[];
        alerts: {
          lowStock: InventorySummary[];
          outOfStock: InventorySummary[];
        };
      }>('/admin/gift-cards/inventory/summary');
      return response;
    } catch (error) {
      console.error('[AdminGiftCardsService] Error fetching inventory summary:', error);
      throw error;
    }
  }

  /**
   * Delete an inventory code (only AVAILABLE codes)
   * DELETE /api/admin/gift-cards/inventory/codes/:codeId
   */
  async deleteInventoryCode(codeId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/gift-cards/inventory/codes/${codeId}`);
    } catch (error) {
      console.error('[AdminGiftCardsService] Error deleting inventory code:', error);
      throw error;
    }
  }
}

export const adminGiftCardsService = new AdminGiftCardsService();
export default adminGiftCardsService;
