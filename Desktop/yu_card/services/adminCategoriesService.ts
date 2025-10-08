/**
 * Admin Categories Service - Category Management
 */

import { apiClient } from './apiClient';
import type {
  AdminCategory,
  AdminResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/admin';

class AdminCategoriesService {
  /**
   * Get all categories with hierarchy
   * GET /api/admin/categories
   */
  async getAllCategories(): Promise<AdminCategory[]> {
    try {
      // apiClient.get déjà extrait .data
      const response = await apiClient.get<AdminCategory[]>('/admin/categories');
      return response;
    } catch (error) {
      console.error('[AdminCategoriesService] Error fetching categories:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   * POST /api/admin/categories
   */
  async createCategory(data: CreateCategoryRequest): Promise<AdminCategory> {
    try {
      const response = await apiClient.post<AdminCategory>('/admin/categories', data);
      return response;
    } catch (error) {
      console.error('[AdminCategoriesService] Error creating category:', error);
      throw error;
    }
  }

  /**
   * Update a category
   * PATCH /api/admin/categories/:categoryId
   */
  async updateCategory(
    categoryId: string,
    data: UpdateCategoryRequest
  ): Promise<AdminCategory> {
    try {
      const response = await apiClient.patch<AdminCategory>(
        `/admin/categories/${categoryId}`,
        data
      );
      return response;
    } catch (error) {
      console.error('[AdminCategoriesService] Error updating category:', error);
      throw error;
    }
  }

  /**
   * Delete a category
   * DELETE /api/admin/categories/:categoryId
   */
  async deleteCategory(categoryId: string): Promise<void> {
    try {
      await apiClient.delete(`/admin/categories/${categoryId}`);
    } catch (error) {
      console.error('[AdminCategoriesService] Error deleting category:', error);
      throw error;
    }
  }
}

export const adminCategoriesService = new AdminCategoriesService();
export default adminCategoriesService;
