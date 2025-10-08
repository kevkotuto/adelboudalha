/**
 * Admin Products Service - Product Management
 */

import { apiClient } from './apiClient';
import type {
  AdminProduct,
  AdminListResponse,
  AdminResponse,
  ProductQueryParams,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/admin';

class AdminProductsService {
  /**
   * Get all products with filters
   * GET /api/admin/products
   */
  async getAllProducts(params?: ProductQueryParams): Promise<AdminListResponse<AdminProduct>> {
    try {
      // apiClient.get déjà extrait .data, donc response = {products: [], pagination: {}}
      const response = await apiClient.get<{
        products: AdminProduct[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>('/admin/products', { params });

      // Debug: Vérifier le premier produit
      if (response.products && response.products.length > 0) {
        const firstProduct = response.products[0];
        console.log('[AdminProductsService] First product sample:', {
          id: firstProduct.id,
          name: firstProduct.name,
          price: firstProduct.price,
          priceType: typeof firstProduct.price,
        });
      }

      return {
        data: response.products,
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('[AdminProductsService] Error fetching products:', error);
      throw error;
    }
  }

  /**
   * Create a new product
   * POST /api/admin/products
   */
  async createProduct(data: CreateProductRequest): Promise<AdminProduct> {
    try {
      const response = await apiClient.post<AdminResponse<AdminProduct>>(
        '/admin/products',
        data
      );
      return response.data;
    } catch (error) {
      console.error('[AdminProductsService] Error creating product:', error);
      throw error;
    }
  }

  /**
   * Update a product
   * PATCH /api/admin/products/:productId
   */
  async updateProduct(
    productId: string,
    data: UpdateProductRequest
  ): Promise<AdminProduct> {
    try {
      const response = await apiClient.patch<AdminResponse<AdminProduct>>(
        `/admin/products/${productId}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error('[AdminProductsService] Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete a product
   * DELETE /api/admin/products/:productId
   */
  async deleteProduct(productId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/products/${productId}`);
    } catch (error) {
      console.error('[AdminProductsService] Error deleting product:', error);
      throw error;
    }
  }
}

export const adminProductsService = new AdminProductsService();
export default adminProductsService;
