import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  Category,
  CategoriesQueryParams
} from '@/types/models';
import { PaginatedResponse } from '@/types/api';

/**
 * Categories Service
 * Handles all category-related API calls
 */

export class CategoriesService {
  /**
   * Get all categories with optional filters
   */
  async getCategories(params?: CategoriesQueryParams): Promise<PaginatedResponse<Category>> {
    try {
      const queryParams: Record<string, string> = {};

      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.type) queryParams.type = params.type;
      if (params?.parentId) queryParams.parentId = params.parentId;
      if (params?.includeInactive !== undefined) {
        queryParams.includeInactive = String(params.includeInactive);
      }
      if (params?.includeChildren !== undefined) {
        queryParams.includeChildren = String(params.includeChildren);
      }

      // Use apiClient.get instead of getPaginated to get raw response
      const response = await apiClient.get<any>(
        API_ENDPOINTS.CATEGORIES.BASE,
        { params: queryParams }
      );

      console.log('[CategoriesService] Raw response:', {
        hasData: !!response?.data,
        hasPagination: !!response?.pagination,
        isArray: Array.isArray(response),
        responseType: typeof response,
        keys: response ? Object.keys(response) : [],
      });

      // Backend returns { data: [...], pagination: {...} }
      // apiClient.get extracts response.data.data, so we get { data: [...], pagination: {...} }
      if (response && typeof response === 'object') {
        const backendResponse = response as any;

        // Check if response has 'data' array
        if (backendResponse.data && Array.isArray(backendResponse.data)) {
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

        // Fallback: if response is already in correct format with 'items'
        if (backendResponse.items) {
          return backendResponse as PaginatedResponse<Category>;
        }

        // Fallback: if response is a direct array
        if (Array.isArray(backendResponse)) {
          return {
            items: backendResponse,
            pagination: {
              page: params?.page || 1,
              limit: params?.limit || 10,
              total: backendResponse.length,
              totalPages: 1,
              hasNext: false,
              hasPrev: false,
            },
          };
        }
      }

      console.error('[CategoriesService] Unexpected response format:', response);
      return {
        items: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
      };
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Get category by ID
   */
  async getCategoryById(id: string, includeProducts: boolean = false): Promise<Category> {
    try {
      const queryParams = includeProducts ? { includeProducts: 'true' } : {};

      const response = await apiClient.get<Category>(
        API_ENDPOINTS.CATEGORIES.BY_ID(id),
        { params: queryParams }
      );

      return response;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string, includeProducts: boolean = false): Promise<Category> {
    try {
      const queryParams = includeProducts ? { includeProducts: 'true' } : {};

      const response = await apiClient.get<Category>(
        API_ENDPOINTS.CATEGORIES.BY_SLUG(slug),
        { params: queryParams }
      );

      return response;
    } catch (error) {
      console.error(`Failed to fetch category by slug ${slug}:`, error);
      throw error;
    }
  }

  /**
   * Get root categories (no parent)
   */
  async getRootCategories(type?: 'GIFT_CARD' | 'PHYSICAL_PRODUCT' | 'BOTH'): Promise<Category[]> {
    try {
      const params: CategoriesQueryParams = {
        parentId: 'null',
        includeChildren: true,
        limit: 50,
      };

      if (type) {
        params.type = type;
      }

      const response = await this.getCategories(params);
      return response.items || [];
    } catch (error) {
      console.error('Failed to fetch root categories:', error);
      throw error;
    }
  }

  /**
   * Get popular categories (by product count)
   */
  async getPopularCategories(limit: number = 6): Promise<Category[]> {
    try {
      const response = await this.getCategories({
        limit,
        includeChildren: false,
        parentId: 'null',
      });

      // Sort by total products count
      const sorted = (response.items || []).sort((a, b) => {
        const aCount = (a._count?.giftCards || 0) + (a._count?.physicalProducts || 0);
        const bCount = (b._count?.giftCards || 0) + (b._count?.physicalProducts || 0);
        return bCount - aCount;
      });

      return sorted.slice(0, limit);
    } catch (error) {
      console.error('Failed to fetch popular categories:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
export const categoriesService = new CategoriesService();
export default categoriesService;
