import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  Category,
  GiftCard,
  PhysicalProduct,
  ProductReview,
  Favorite,
  GetCategoriesRequest,
  GetGiftCardsRequest,
  GetPhysicalProductsRequest,
  CreateReviewRequest,
  UpdateStockRequest,
  ProductSearchResponse,
  PopularProductsResponse,
  FeaturedProductsResponse,
  RelatedProductsResponse,
  PaginatedResponse,
  ProductType,
  FileUpload,
  UploadProgressCallback,
} from '@/types';

// ==================================
// PRODUCT SERVICE
// ==================================

export class ProductService {
  // ==================================
  // CATEGORY MANAGEMENT
  // ==================================

  /**
   * Get all categories with optional filters
   */
  async getCategories(params?: GetCategoriesRequest): Promise<PaginatedResponse<Category>> {
    return await apiClient.getPaginated<Category>(
      API_ENDPOINTS.CATEGORIES.BASE,
      params
    );
  }

  /**
   * Get category by ID
   */
  async getCategoryById(categoryId: string, includeProducts?: boolean): Promise<Category> {
    return await apiClient.get<Category>(
      API_ENDPOINTS.CATEGORIES.BY_ID(categoryId),
      { params: { includeProducts } }
    );
  }

  /**
   * Get category by slug
   */
  async getCategoryBySlug(slug: string, includeProducts?: boolean): Promise<Category> {
    return await apiClient.get<Category>(
      API_ENDPOINTS.CATEGORIES.BY_SLUG(slug),
      { params: { includeProducts } }
    );
  }

  // ==================================
  // GIFT CARDS
  // ==================================

  /**
   * Get gift cards with filters and pagination
   */
  async getGiftCards(params?: GetGiftCardsRequest): Promise<PaginatedResponse<GiftCard>> {
    return await apiClient.getPaginated<GiftCard>(
      API_ENDPOINTS.GIFT_CARDS.BASE,
      params
    );
  }

  /**
   * Get gift card by ID or slug
   */
  async getGiftCardById(giftCardId: string): Promise<GiftCard> {
    return await apiClient.get<GiftCard>(
      API_ENDPOINTS.GIFT_CARDS.BY_ID(giftCardId)
    );
  }

  /**
   * Get gift cards by category
   */
  async getGiftCardsByCategory(categoryId: string, params?: any): Promise<PaginatedResponse<GiftCard>> {
    return await apiClient.getPaginated<GiftCard>(
      API_ENDPOINTS.GIFT_CARDS.BY_CATEGORY(categoryId),
      params
    );
  }

  /**
   * Get featured gift cards
   */
  async getFeaturedGiftCards(limit?: number): Promise<{ giftCards: GiftCard[] }> {
    try {
      return await apiClient.get<{ giftCards: GiftCard[] }>(
        API_ENDPOINTS.GIFT_CARDS.FEATURED,
        { params: { limit } }
      );
    } catch (error: any) {
      // If 404 or route not found, fall back to filtered query
      if (error?.response?.status === 404 || error?.message?.includes('Route not found')) {
        console.warn('Featured gift cards endpoint not available, using filtered query');
        const response = await this.getGiftCards({
          featured: true,
          limit: limit || 10,
        } as any);
        return { giftCards: response.items || [] };
      }
      console.error('Failed to fetch featured gift cards:', error);
      return { giftCards: [] };
    }
  }

  /**
   * Get popular gift cards
   */
  async getPopularGiftCards(limit?: number): Promise<{ giftCards: GiftCard[] }> {
    try {
      return await apiClient.get<{ giftCards: GiftCard[] }>(
        API_ENDPOINTS.GIFT_CARDS.POPULAR,
        { params: { limit } }
      );
    } catch (error: any) {
      // If 404 or route not found, fall back to filtered query
      if (error?.response?.status === 404 || error?.message?.includes('Route not found')) {
        console.warn('Popular gift cards endpoint not available, using filtered query');
        const response = await this.getGiftCards({
          popular: true,
          limit: limit || 10,
        } as any);
        return { giftCards: response.items || [] };
      }
      console.error('Failed to fetch popular gift cards:', error);
      return { giftCards: [] };
    }
  }

  /**
   * Search gift cards
   */
  async searchGiftCards(query: string, filters?: any): Promise<PaginatedResponse<GiftCard>> {
    return await apiClient.getPaginated<GiftCard>(
      API_ENDPOINTS.GIFT_CARDS.SEARCH,
      { query, ...filters }
    );
  }

  /**
   * Get gift card variants
   */
  async getGiftCardVariants(giftCardId: string): Promise<{ variants: any[] }> {
    return await apiClient.get<{ variants: any[] }>(
      API_ENDPOINTS.GIFT_CARDS.VARIANTS(giftCardId)
    );
  }

  /**
   * Purchase gift card
   */
  async purchaseGiftCard(purchaseData: {
    giftCardId: string;
    amount: number;
    quantity?: number;
    recipientEmail?: string;
    message?: string;
  }): Promise<{ orderId: string; paymentUrl: string }> {
    return await apiClient.post<{ orderId: string; paymentUrl: string }>(
      API_ENDPOINTS.GIFT_CARDS.PURCHASE,
      purchaseData
    );
  }

  /**
   * Get user's purchased gift cards
   */
  async getMyGiftCards(params?: any): Promise<PaginatedResponse<GiftCard>> {
    return await apiClient.getPaginated<GiftCard>(
      API_ENDPOINTS.GIFT_CARDS.MY_CARDS,
      params
    );
  }

  /**
   * Redeem gift card
   */
  async redeemGiftCard(code: string): Promise<{ success: boolean; message: string; balance?: number }> {
    return await apiClient.post<{ success: boolean; message: string; balance?: number }>(
      API_ENDPOINTS.GIFT_CARDS.REDEEM,
      { code }
    );
  }

  /**
   * Transfer gift card
   */
  async transferGiftCard(transferData: {
    giftCardId: string;
    recipientEmail: string;
    message?: string;
  }): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.GIFT_CARDS.TRANSFER,
      transferData
    );
  }

  // ==================================
  // PHYSICAL PRODUCTS
  // ==================================

  /**
   * Get physical products with filters and pagination
   */
  async getPhysicalProducts(params?: GetPhysicalProductsRequest): Promise<PaginatedResponse<PhysicalProduct>> {
    return await apiClient.getPaginated<PhysicalProduct>(
      API_ENDPOINTS.PRODUCTS.BASE,
      params
    );
  }

  /**
   * Get physical product by ID or slug
   */
  async getPhysicalProductById(productId: string): Promise<PhysicalProduct> {
    return await apiClient.get<PhysicalProduct>(
      API_ENDPOINTS.PRODUCTS.BY_ID(productId)
    );
  }

  /**
   * Get featured physical products
   */
  async getFeaturedPhysicalProducts(limit?: number): Promise<{ products: PhysicalProduct[] }> {
    try {
      return await apiClient.get<{ products: PhysicalProduct[] }>(
        API_ENDPOINTS.PRODUCTS.FEATURED,
        { params: { limit } }
      );
    } catch (error: any) {
      // If 404 or route not found, fall back to filtered query
      if (error?.response?.status === 404 || error?.message?.includes('Route not found')) {
        console.warn('Featured products endpoint not available, using filtered query');
        const response = await this.getPhysicalProducts({
          featured: true,
          limit: limit || 10,
        } as any);
        return { products: response.items || [] };
      }
      console.error('Failed to fetch featured products:', error);
      return { products: [] };
    }
  }

  /**
   * Get popular physical products
   */
  async getPopularPhysicalProducts(limit?: number): Promise<{ products: PhysicalProduct[] }> {
    try {
      return await apiClient.get<{ products: PhysicalProduct[] }>(
        API_ENDPOINTS.PRODUCTS.POPULAR,
        { params: { limit } }
      );
    } catch (error: any) {
      // If 404 or route not found, fall back to filtered query
      if (error?.response?.status === 404 || error?.message?.includes('Route not found')) {
        console.warn('Popular products endpoint not available, using filtered query');
        const response = await this.getPhysicalProducts({
          popular: true,
          limit: limit || 10,
        } as any);
        return { products: response.items || [] };
      }
      console.error('Failed to fetch popular products:', error);
      return { products: [] };
    }
  }

  // ==================================
  // PRODUCT RELATIONS
  // ==================================

  /**
   * Get related products
   */
  async getRelatedProducts(productId: string, limit?: number): Promise<{ products: PhysicalProduct[] }> {
    return await apiClient.get<{ products: PhysicalProduct[] }>(
      API_ENDPOINTS.PRODUCTS.RELATED(productId),
      { params: { limit } }
    );
  }

  // ==================================
  // PRODUCT REVIEWS
  // ==================================

  /**
   * Create product review
   */
  async createReview(reviewData: CreateReviewRequest): Promise<ProductReview> {
    // Determine the endpoint based on product type
    const endpoint = reviewData.productType === 'GIFT_CARD'
      ? `/products/${reviewData.giftCardId}/reviews`
      : `/products/${reviewData.physicalProductId}/reviews`;

    return await apiClient.post<ProductReview>(endpoint, reviewData);
  }

  /**
   * Get product reviews
   */
  async getProductReviews(
    productId: string,
    productType: ProductType,
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<ProductReview>> {
    return await apiClient.getPaginated<ProductReview>(
      `/products/${productId}/reviews`,
      { page, limit, productType }
    );
  }

  // ==================================
  // FAVORITES
  // ==================================

  /**
   * Add product to favorites
   */
  async addToFavorites(
    productType: ProductType,
    giftCardId?: string,
    physicalProductId?: string
  ): Promise<Favorite> {
    return await apiClient.post<Favorite>('/favorites', {
      productType,
      giftCardId,
      physicalProductId,
    });
  }

  /**
   * Remove product from favorites
   */
  async removeFromFavorites(favoriteId: string): Promise<{ success: boolean }> {
    return await apiClient.delete<{ success: boolean }>(`/favorites/${favoriteId}`);
  }

  /**
   * Get user favorites
   */
  async getFavorites(page = 1, limit = 20): Promise<PaginatedResponse<Favorite>> {
    return await apiClient.getPaginated<Favorite>(
      '/favorites',
      { page, limit }
    );
  }

  // ==================================
  // ADMIN FUNCTIONS
  // ==================================

  /**
   * Create new category (Admin only)
   */
  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    return await apiClient.post<Category>(
      API_ENDPOINTS.CATEGORIES.BASE,
      categoryData
    );
  }

  /**
   * Update category (Admin only)
   */
  async updateCategory(
    categoryId: string,
    categoryData: Partial<Category>
  ): Promise<Category> {
    return await apiClient.put<Category>(
      API_ENDPOINTS.CATEGORIES.BY_ID(categoryId),
      categoryData
    );
  }

  /**
   * Delete category (Admin only)
   */
  async deleteCategory(categoryId: string): Promise<{ success: boolean }> {
    return await apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.CATEGORIES.BY_ID(categoryId)
    );
  }

  /**
   * Create new product (Admin only)
   */
  async createProduct(
    productData: Partial<GiftCard | PhysicalProduct>
  ): Promise<GiftCard | PhysicalProduct> {
    return await apiClient.post<GiftCard | PhysicalProduct>(
      API_ENDPOINTS.PRODUCTS.BASE,
      productData
    );
  }

  /**
   * Update product (Admin only)
   */
  async updateProduct(
    productId: string,
    productData: Partial<GiftCard | PhysicalProduct>
  ): Promise<GiftCard | PhysicalProduct> {
    return await apiClient.put<GiftCard | PhysicalProduct>(
      API_ENDPOINTS.PRODUCTS.BY_ID(productId),
      productData
    );
  }

  /**
   * Delete product (Admin only)
   */
  async deleteProduct(productId: string): Promise<{ success: boolean }> {
    return await apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.PRODUCTS.BY_ID(productId)
    );
  }

  /**
   * Update product stock (Admin only)
   */
  async updateStock(stockData: UpdateStockRequest): Promise<{
    success: boolean;
    newStock: number;
  }> {
    return await apiClient.patch<{
      success: boolean;
      newStock: number;
    }>(
      API_ENDPOINTS.PRODUCTS.STOCK(stockData.productId),
      stockData
    );
  }

  /**
   * Upload product images (Admin only)
   */
  async uploadProductImages(
    productId: string,
    files: FileUpload[],
    onProgress?: UploadProgressCallback
  ): Promise<{ imageUrls: string[] }> {
    return await apiClient.upload<{ imageUrls: string[] }>(
      API_ENDPOINTS.PRODUCTS.IMAGES(productId),
      files,
      undefined,
      onProgress
    );
  }
}

// ==================================
// PRODUCT HELPER FUNCTIONS
// ==================================

export const productHelpers = {
  /**
   * Format price for display
   */
  formatPrice(price: number, currency = 'XOF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  },

  /**
   * Calculate discount percentage
   */
  calculateDiscountPercentage(originalPrice: number, currentPrice: number): number {
    if (originalPrice <= currentPrice) return 0;
    return Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  },

  /**
   * Get discount amount
   */
  getDiscountAmount(originalPrice: number, discountPercentage: number): number {
    return Math.round((originalPrice * discountPercentage) / 100);
  },

  /**
   * Check if product is on sale
   */
  isProductOnSale(product: GiftCard | PhysicalProduct): boolean {
    if ('originalPrice' in product && product.originalPrice) {
      return product.originalPrice > ('price' in product ? product.price : 0);
    }
    return product.discountPercentage > 0;
  },

  /**
   * Get product rating stars
   */
  getRatingStars(rating: number): string {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return '★'.repeat(fullStars) +
           (hasHalfStar ? '☆' : '') +
           '☆'.repeat(emptyStars);
  },

  /**
   * Format review count
   */
  formatReviewCount(count: number): string {
    if (count === 0) return 'Aucun avis';
    if (count === 1) return '1 avis';
    return `${count} avis`;
  },

  /**
   * Check if product is in stock
   */
  isInStock(product: GiftCard | PhysicalProduct): boolean {
    return product.stockQuantity > 0 || product.stockQuantity === -1; // -1 means unlimited
  },

  /**
   * Get stock status
   */
  getStockStatus(product: GiftCard | PhysicalProduct): {
    inStock: boolean;
    isLimited: boolean;
    message: string;
  } {
    const { stockQuantity } = product;

    if (stockQuantity === -1) {
      return {
        inStock: true,
        isLimited: false,
        message: 'En stock',
      };
    }

    if (stockQuantity === 0) {
      return {
        inStock: false,
        isLimited: false,
        message: 'Rupture de stock',
      };
    }

    if (stockQuantity <= 5) {
      return {
        inStock: true,
        isLimited: true,
        message: `Plus que ${stockQuantity} en stock`,
      };
    }

    return {
      inStock: true,
      isLimited: false,
      message: 'En stock',
    };
  },

  /**
   * Get gift card amount options
   */
  getGiftCardAmountOptions(giftCard: GiftCard): number[] {
    if (giftCard.fixedAmounts && Array.isArray(giftCard.fixedAmounts)) {
      return giftCard.fixedAmounts;
    }

    // Generate default amounts based on min/max
    const min = giftCard.minAmount || 1000;
    const max = giftCard.maxAmount || 100000;

    return [5000, 10000, 25000, 50000, 100000].filter(
      amount => amount >= min && amount <= max
    );
  },

  /**
   * Validate gift card amount
   */
  validateGiftCardAmount(amount: number, giftCard: GiftCard): boolean {
    const { minAmount, maxAmount, fixedAmounts } = giftCard;

    if (fixedAmounts && Array.isArray(fixedAmounts)) {
      return fixedAmounts.includes(amount);
    }

    if (minAmount && amount < minAmount) return false;
    if (maxAmount && amount > maxAmount) return false;

    return true;
  },

  /**
   * Get product image URL with fallback
   */
  getProductImageUrl(product: GiftCard | PhysicalProduct): string {
    if ('imageUrl' in product) {
      return product.imageUrl;
    }

    if ('images' in product && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }

    return '/placeholder-product.png';
  },

  /**
   * Get product type display name
   */
  getProductTypeDisplayName(type: ProductType): string {
    switch (type) {
      case 'GIFT_CARD':
        return 'Carte cadeau';
      case 'PHYSICAL_PRODUCT':
        return 'Produit physique';
      default:
        return type;
    }
  },

  /**
   * Sort products by criteria
   */
  sortProducts<T extends GiftCard | PhysicalProduct>(
    products: T[],
    sortBy: string
  ): T[] {
    const sortedProducts = [...products];

    switch (sortBy) {
      case 'price_asc':
        return sortedProducts.sort((a, b) => {
          const priceA = 'price' in a ? a.price : 0;
          const priceB = 'price' in b ? b.price : 0;
          return priceA - priceB;
        });

      case 'price_desc':
        return sortedProducts.sort((a, b) => {
          const priceA = 'price' in a ? a.price : 0;
          const priceB = 'price' in b ? b.price : 0;
          return priceB - priceA;
        });

      case 'rating':
        return sortedProducts.sort((a, b) => (b.rating || 0) - (a.rating || 0));

      case 'popularity':
        return sortedProducts.sort((a, b) => {
          const popularityA = a.isPopular ? 1 : 0;
          const popularityB = b.isPopular ? 1 : 0;
          return popularityB - popularityA;
        });

      case 'newest':
        return sortedProducts.sort((a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      default:
        return sortedProducts;
    }
  },

  /**
   * Filter products by criteria
   */
  filterProducts<T extends GiftCard | PhysicalProduct>(
    products: T[],
    filters: {
      category?: string;
      brand?: string;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
    }
  ): T[] {
    return products.filter(product => {
      // Category filter
      if (filters.category && product.categoryId !== filters.category) {
        return false;
      }

      // Brand filter
      if (filters.brand && product.brand.toLowerCase() !== filters.brand.toLowerCase()) {
        return false;
      }

      // Price range filter
      const price = 'price' in product ? product.price : 0;
      if (filters.minPrice && price < filters.minPrice) {
        return false;
      }
      if (filters.maxPrice && price > filters.maxPrice) {
        return false;
      }

      // Stock filter
      if (filters.inStock && !productHelpers.isInStock(product)) {
        return false;
      }

      return true;
    });
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const productService = new ProductService();
export default productService;