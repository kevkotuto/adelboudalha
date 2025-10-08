import { ProductType, GiftCardStatus } from './api';

// ==================================
// CATEGORY TYPES
// ==================================

export interface Category {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  description?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  parent?: Category;
  children?: Category[];
  productCount?: number;
}

// ==================================
// GIFT CARD TYPES
// ==================================

export interface GiftCard {
  id: string;
  title: string;
  brand: string;
  slug: string;
  categoryId?: string;
  description?: string;
  termsConditions?: string;
  usageInstructions?: string;
  imageUrl: string;
  backgroundImageUrl?: string;
  backgroundColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
  minAmount?: number;
  maxAmount?: number;
  fixedAmounts?: number[];
  currency: string;
  discountPercentage: number;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  stockQuantity: number;
  validityDays: number;
  region?: string;
  displayOrder: number;
  metaKeywords: string[];
  createdAt: string;
  updatedAt: string;
  category?: Category;
  rating?: number;
  reviewCount?: number;
}

export interface GiftCardCode {
  id: string;
  code: string;
  orderItemId?: string;
  giftCardId: string;
  userId?: string;
  amount: number;
  currency: string;
  status: GiftCardStatus;
  activationDate?: string;
  expiryDate?: string;
  usedDate?: string;
  usedByUserId?: string;
  createdAt: string;
  updatedAt: string;
  giftCard?: GiftCard;
}

// ==================================
// PHYSICAL PRODUCT TYPES
// ==================================

export interface PhysicalProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  categoryId?: string;
  description?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  discountPercentage: number;
  stockQuantity: number;
  sku?: string;
  weightKg?: number;
  dimensionsCm?: {
    length: number;
    width: number;
    height: number;
  };
  specifications?: Record<string, any>;
  images: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  deliveryTimeDays: number;
  warrantyMonths: number;
  rating: number;
  reviewCount: number;
  displayOrder: number;
  metaKeywords: string[];
  createdAt: string;
  updatedAt: string;
  category?: Category;
}

// ==================================
// REVIEW TYPES
// ==================================

export interface ProductReview {
  id: string;
  userId: string;
  productType: ProductType;
  giftCardId?: string;
  physicalProductId?: string;
  orderItemId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isVisible: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    fullName: string;
    avatarUrl?: string;
  };
}

export interface Favorite {
  id: string;
  userId: string;
  productType: ProductType;
  giftCardId?: string;
  physicalProductId?: string;
  createdAt: string;
  giftCard?: GiftCard;
  physicalProduct?: PhysicalProduct;
}

// ==================================
// REQUEST TYPES
// ==================================

export interface GetCategoriesRequest {
  page?: number;
  limit?: number;
  type?: ProductType;
  parentId?: string;
  includeProducts?: boolean;
}

export interface GetProductsRequest {
  page?: number;
  limit?: number;
  categoryId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest';
  q?: string;
}

export interface GetGiftCardsRequest extends GetProductsRequest {}

export interface GetPhysicalProductsRequest extends GetProductsRequest {}

export interface CreateReviewRequest {
  productType: ProductType;
  giftCardId?: string;
  physicalProductId?: string;
  orderItemId?: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface UpdateStockRequest {
  productId: string;
  stockQuantity: number;
  operation: 'set' | 'increment' | 'decrement';
}

// ==================================
// RESPONSE TYPES
// ==================================

export interface ProductSearchResponse {
  giftCards: GiftCard[];
  physicalProducts: PhysicalProduct[];
  categories: Category[];
  total: number;
  suggestions?: string[];
}

export interface PopularProductsResponse {
  giftCards: GiftCard[];
  physicalProducts: PhysicalProduct[];
}

export interface FeaturedProductsResponse {
  giftCards: GiftCard[];
  physicalProducts: PhysicalProduct[];
}

export interface RelatedProductsResponse {
  giftCards: GiftCard[];
  physicalProducts: PhysicalProduct[];
}