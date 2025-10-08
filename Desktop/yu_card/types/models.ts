// ==================================
// BACKEND MODEL TYPES
// ==================================
// These types match the backend Prisma schema

import { ProductType } from './api';

// ==================================
// CATEGORY
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

  // Relations (optional, included based on query params)
  parent?: CategoryParent;
  children?: CategoryChild[];
  _count?: {
    giftCards: number;
    physicalProducts: number;
  };
}

export interface CategoryParent {
  id: string;
  name: string;
  slug: string;
}

export interface CategoryChild {
  id: string;
  name: string;
  slug: string;
  type: ProductType;
  isActive: boolean;
  displayOrder: number;
  _count?: {
    giftCards: number;
    physicalProducts: number;
  };
}

// ==================================
// GIFT CARD
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

  // Relations (optional)
  category?: Category;
}

// ==================================
// PHYSICAL PRODUCT
// ==================================

export interface Specification {
  key: string;
  value: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface PhysicalProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  categoryId?: string;
  description?: string;
  price: string | number; // Backend sends as string
  originalPrice?: string | number; // Backend sends as string
  currency: string;
  discountPercentage: string | number; // Backend sends as string
  stockQuantity: number;
  sku?: string;
  weightKg?: string | number; // Backend sends as string
  dimensionsCm?: ProductDimensions;
  specifications?: Specification[] | Record<string, any>; // Can be array or object
  images: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  deliveryTimeDays: number;
  warrantyMonths: number;
  rating: string | number; // Backend sends as string
  reviewCount: number;
  displayOrder: number;
  metaKeywords: string[];
  createdAt: string;
  updatedAt: string;

  // Relations (optional)
  category?: Category;
  reviews?: any[];
  favorites?: any[];
  _count?: {
    reviews: number;
    favorites: number;
  };
  isFavorited?: boolean;
  favoriteCount?: number;
}

// ==================================
// SEARCH
// ==================================

export interface SearchResult {
  id: string;
  score: number;
  type: 'gift_card' | 'physical_product';
  data: GiftCard | PhysicalProduct;
  highlight?: Record<string, string[]>;
}

export interface SearchResponse {
  hits: SearchResult[];
  total: number;
  suggestions?: Record<string, string[]>;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface AutocompleteSuggestion {
  text: string;
  type: 'query' | 'product' | 'giftcard' | 'category' | 'brand';
  score: number;
}

// ==================================
// API QUERY PARAMETERS
// ==================================

export interface CategoriesQueryParams {
  page?: number;
  limit?: number;
  type?: ProductType;
  parentId?: string | 'null';
  includeInactive?: boolean;
  includeChildren?: boolean;
}

export interface GiftCardsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minAmount?: number;
  maxAmount?: number;
  featured?: boolean;
  popular?: boolean;
  sort?: 'amount' | 'title' | 'created' | '_score';
  order?: 'asc' | 'desc';
}

export interface ProductsQueryParams {
  page?: number;
  limit?: number;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  popular?: boolean;
  sort?: 'price' | 'name' | 'rating' | 'created' | '_score';
  order?: 'asc' | 'desc';
}

export interface SearchQueryParams {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  productType?: 'all' | 'gift_card' | 'physical_product';
  inStock?: boolean;
  featured?: boolean;
  popular?: boolean;
  page?: number;
  limit?: number;
  sort?: 'price' | 'rating' | 'name' | 'created' | '_score';
  order?: 'asc' | 'desc';
}

// ==================================
// HELPER TYPES
// ==================================

export type SortOption = 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popularity';

export interface FilterState {
  categories: string[];
  priceRange?: { min: number; max: number };
  brands: string[];
  inStock: boolean;
  featured: boolean;
  popular: boolean;
}
