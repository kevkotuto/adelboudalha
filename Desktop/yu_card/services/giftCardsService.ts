import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  GiftCard,
  GiftCardsQueryParams
} from '@/types/models';
import { PaginatedResponse } from '@/types/api';

/**
 * Gift Cards Service
 * Handles all gift card-related API calls
 */

export class GiftCardsService {
  /**
   * Get all gift cards with optional filters
   */
  async getGiftCards(params?: GiftCardsQueryParams): Promise<PaginatedResponse<GiftCard>> {
    try {
      const queryParams: Record<string, string> = {};

      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.category) queryParams.category = params.category;
      if (params?.brand) queryParams.brand = params.brand;
      if (params?.minAmount) queryParams.minAmount = String(params.minAmount);
      if (params?.maxAmount) queryParams.maxAmount = String(params.maxAmount);
      if (params?.featured !== undefined) queryParams.featured = String(params.featured);
      if (params?.popular !== undefined) queryParams.popular = String(params.popular);
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await apiClient.getPaginated<GiftCard>(
        API_ENDPOINTS.GIFT_CARDS.BASE,
        queryParams
      );

      // Backend returns 'data' instead of 'items', transform the response
      if (response && typeof response === 'object') {
        const backendResponse = response as any;
        if (backendResponse.data && !backendResponse.items) {
          return {
            items: backendResponse.data,
            pagination: backendResponse.pagination || {
              page: params?.page || 1,
              limit: params?.limit || 10,
              total: backendResponse.data.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          };
        }
      }

      return response;
    } catch (error) {
      console.error('Failed to fetch gift cards:', error);
      throw error;
    }
  }

  /**
   * Get gift card by ID
   */
  async getGiftCardById(id: string): Promise<GiftCard> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.GIFT_CARDS.BY_ID(id)
      );

      // Backend returns { giftCard: {...} }, extract the gift card
      if (response && typeof response === 'object') {
        if (response.giftCard) {
          return response.giftCard;
        }
      }

      // If response is already a GiftCard object, return it
      return response;
    } catch (error) {
      // Don't log 404 errors (expected when checking if an ID is a gift card)
      const is404 = error instanceof Error && error.message.includes('not found');
      if (!is404) {
        console.error(`Failed to fetch gift card ${id}:`, error);
      }
      throw error;
    }
  }

  /**
   * Get popular/featured gift cards
   */
  async getPopularGiftCards(limit: number = 10): Promise<GiftCard[]> {
    try {
      // Try the popular endpoint first
      try {
        const response = await apiClient.get<GiftCard[]>(
          API_ENDPOINTS.GIFT_CARDS.POPULAR,
          { params: { limit: String(limit) } }
        );
        return response;
      } catch (popularError: any) {
        // If 404, fallback to main endpoint with popular filter
        if (popularError?.response?.status === 404 || popularError?.message?.includes('Route not found')) {
          console.warn('Popular endpoint not available, using filtered query');
          const response = await this.getGiftCards({
            popular: true,
            limit,
            sort: 'title',
            order: 'asc',
          });
          return response.items || [];
        }
        throw popularError;
      }
    } catch (error) {
      console.error('Failed to fetch popular gift cards:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Get featured gift cards
   */
  async getFeaturedGiftCards(limit: number = 10): Promise<GiftCard[]> {
    try {
      // Try the featured endpoint first
      try {
        const response = await apiClient.get<GiftCard[]>(
          API_ENDPOINTS.GIFT_CARDS.FEATURED,
          { params: { limit: String(limit) } }
        );
        return response;
      } catch (featuredError: any) {
        // If 404, fallback to main endpoint with featured filter
        if (featuredError?.response?.status === 404 || featuredError?.message?.includes('Route not found')) {
          console.warn('Featured endpoint not available, using filtered query');
          const response = await this.getGiftCards({
            featured: true,
            limit,
            sort: 'title',
            order: 'asc',
          });
          return response.items || [];
        }
        throw featuredError;
      }
    } catch (error) {
      console.error('Failed to fetch featured gift cards:', error);
      return [];
    }
  }

  /**
   * Get gift cards by category
   */
  async getGiftCardsByCategory(categorySlug: string, limit: number = 20): Promise<GiftCard[]> {
    try {
      const response = await this.getGiftCards({
        category: categorySlug,
        limit,
      });

      return response.items || [];
    } catch (error) {
      console.error(`Failed to fetch gift cards for category ${categorySlug}:`, error);
      return [];
    }
  }

  /**
   * Get gift cards by brand
   */
  async getGiftCardsByBrand(brand: string, limit: number = 20): Promise<GiftCard[]> {
    try {
      const response = await this.getGiftCards({
        brand,
        limit,
      });

      return response.items || [];
    } catch (error) {
      console.error(`Failed to fetch gift cards for brand ${brand}:`, error);
      return [];
    }
  }

  /**
   * Search gift cards
   */
  async searchGiftCards(
    query: string,
    filters?: Omit<GiftCardsQueryParams, 'page' | 'limit'>
  ): Promise<PaginatedResponse<GiftCard>> {
    try {
      const queryParams: Record<string, string> = {
        q: query,
      };

      if (filters?.category) queryParams.category = filters.category;
      if (filters?.brand) queryParams.brand = filters.brand;
      if (filters?.minAmount) queryParams.minAmount = String(filters.minAmount);
      if (filters?.maxAmount) queryParams.maxAmount = String(filters.maxAmount);
      if (filters?.sort) queryParams.sort = filters.sort;
      if (filters?.order) queryParams.order = filters.order;

      const response = await apiClient.getPaginated<GiftCard>(
        API_ENDPOINTS.GIFT_CARDS.SEARCH,
        queryParams
      );

      return response;
    } catch (error) {
      console.error('Failed to search gift cards:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const giftCardsService = new GiftCardsService();
export default giftCardsService;
