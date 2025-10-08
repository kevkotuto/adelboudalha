import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  PhysicalProduct,
  ProductsQueryParams
} from '@/types/models';
import { PaginatedResponse } from '@/types/api';

/**
 * Products Service
 * Handles all physical product-related API calls
 */

export class ProductsService {
  /**
   * Get all products with optional filters
   */
  async getProducts(params?: ProductsQueryParams): Promise<PaginatedResponse<PhysicalProduct>> {
    try {
      const queryParams: Record<string, string> = {};

      if (params?.page) queryParams.page = String(params.page);
      if (params?.limit) queryParams.limit = String(params.limit);
      if (params?.category) queryParams.category = params.category;
      if (params?.brand) queryParams.brand = params.brand;
      if (params?.minPrice) queryParams.minPrice = String(params.minPrice);
      if (params?.maxPrice) queryParams.maxPrice = String(params.maxPrice);
      if (params?.inStock !== undefined) queryParams.inStock = String(params.inStock);
      if (params?.featured !== undefined) queryParams.featured = String(params.featured);
      if (params?.popular !== undefined) queryParams.popular = String(params.popular);
      if (params?.sort) queryParams.sort = params.sort;
      if (params?.order) queryParams.order = params.order;

      const response = await apiClient.getPaginated<PhysicalProduct>(
        API_ENDPOINTS.PRODUCTS.BASE,
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
      console.error('Failed to fetch products:', error);
      throw error;
    }
  }

  /**
   * Get product by ID
   */
  async getProductById(id: string): Promise<PhysicalProduct> {
    try {
      const response = await apiClient.get<any>(
        API_ENDPOINTS.PRODUCTS.BY_ID(id)
      );

      // Backend returns { product: {...} }, extract the product
      if (response && typeof response === 'object') {
        if (response.product) {
          return response.product;
        }
      }

      // If response is already a PhysicalProduct object, return it
      return response;
    } catch (error) {
      // Don't log 404 errors (expected when checking if an ID is a product)
      const is404 = error instanceof Error && error.message.includes('not found');
      if (!is404) {
        console.error(`Failed to fetch product ${id}:`, error);
      }
      throw error;
    }
  }

  /**
   * Get popular/featured products
   */
  async getPopularProducts(limit: number = 10): Promise<PhysicalProduct[]> {
    try {
      // Try the popular endpoint first
      try {
        const response = await apiClient.get<PhysicalProduct[]>(
          API_ENDPOINTS.PRODUCTS.POPULAR,
          { params: { limit: String(limit) } }
        );
        return response;
      } catch (popularError: any) {
        // If 404, fallback to main endpoint with popular filter
        if (popularError?.response?.status === 404 || popularError?.message?.includes('Route not found')) {
          console.warn('Popular products endpoint not available, using filtered query');
          const response = await this.getProducts({
            popular: true,
            limit,
            sort: 'name',
            order: 'asc',
          });
          return response.items || [];
        }
        throw popularError;
      }
    } catch (error) {
      console.error('Failed to fetch popular products:', error);
      // Return empty array as fallback
      return [];
    }
  }

  /**
   * Get featured products
   */
  async getFeaturedProducts(limit: number = 10): Promise<PhysicalProduct[]> {
    try {
      // Try the featured endpoint first
      try {
        const response = await apiClient.get<PhysicalProduct[]>(
          API_ENDPOINTS.PRODUCTS.FEATURED,
          { params: { limit: String(limit) } }
        );
        return response;
      } catch (featuredError: any) {
        // If 404, fallback to main endpoint with featured filter
        if (featuredError?.response?.status === 404 || featuredError?.message?.includes('Route not found')) {
          console.warn('Featured products endpoint not available, using filtered query');
          const response = await this.getProducts({
            featured: true,
            limit,
            sort: 'name',
            order: 'asc',
          });
          return response.items || [];
        }
        throw featuredError;
      }
    } catch (error) {
      console.error('Failed to fetch featured products:', error);
      return [];
    }
  }

  /**
   * Get products by category
   */
  async getProductsByCategory(categorySlug: string, limit: number = 20): Promise<PhysicalProduct[]> {
    try {
      const response = await this.getProducts({
        category: categorySlug,
        limit,
      });

      return response.items || [];
    } catch (error) {
      console.error(`Failed to fetch products for category ${categorySlug}:`, error);
      return [];
    }
  }

  /**
   * Get products by brand
   */
  async getProductsByBrand(brand: string, limit: number = 20): Promise<PhysicalProduct[]> {
    try {
      const response = await this.getProducts({
        brand,
        limit,
      });

      return response.items || [];
    } catch (error) {
      console.error(`Failed to fetch products for brand ${brand}:`, error);
      return [];
    }
  }

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit: number = 6): Promise<PhysicalProduct[]> {
    try {
      const response = await apiClient.get<PhysicalProduct[]>(
        API_ENDPOINTS.PRODUCTS.RELATED(productId),
        { params: { limit: String(limit) } }
      );

      return response;
    } catch (error) {
      console.error(`Failed to fetch related products for ${productId}:`, error);
      return [];
    }
  }

  /**
   * Check product stock
   */
  async checkStock(productId: string): Promise<{ inStock: boolean; quantity: number }> {
    try {
      const response = await apiClient.get<{ inStock: boolean; quantity: number }>(
        API_ENDPOINTS.PRODUCTS.STOCK(productId)
      );

      return response;
    } catch (error) {
      console.error(`Failed to check stock for product ${productId}:`, error);
      return { inStock: false, quantity: 0 };
    }
  }
}

// Create and export singleton instance
export const productsService = new ProductsService();
export default productsService;
