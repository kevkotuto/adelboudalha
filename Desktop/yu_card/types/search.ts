import { GiftCard, PhysicalProduct, Category } from './product';

// ==================================
// SEARCH REQUEST TYPES
// ==================================

export interface SearchRequest {
  q?: string;
  type?: 'all' | 'products' | 'gift_cards';
  category?: string;
  subcategory?: string;
  brand?: string;
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  featured?: boolean;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest';
  page?: number;
  size?: number;
  include_suggestions?: boolean;
  include_aggregations?: boolean;
  language?: 'fr' | 'en' | 'ar' | 'es' | 'bm';
}

export interface AutocompleteRequest {
  q: string;
  type?: 'all' | 'products' | 'gift_cards';
  category?: string;
  limit?: number;
}

export interface CategorySearchRequest {
  q?: string;
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'popularity' | 'newest';
  min_price?: number;
  max_price?: number;
  min_rating?: number;
  in_stock?: boolean;
  on_sale?: boolean;
  featured?: boolean;
  page?: number;
  size?: number;
}

export interface TrendingRequest {
  period?: '1d' | '7d' | '30d';
  type?: 'all' | 'products' | 'gift_cards';
  limit?: number;
}

// ==================================
// SEARCH RESPONSE TYPES
// ==================================

export interface SearchResponse {
  giftCards: GiftCard[];
  physicalProducts: PhysicalProduct[];
  categories: Category[];
  total: number;
  totalGiftCards: number;
  totalPhysicalProducts: number;
  totalCategories: number;
  facets?: SearchFacets;
  suggestions?: string[];
  searchTime: number;
}

export interface AutocompleteResponse {
  query: string;
  suggestions: string[];
  related: string[];
  timestamp?: string;
}

export interface TrendingResponse {
  period: string;
  trending_searches: string[];
  popular_categories: Array<{
    name: string;
    searches: number;
    growth: string;
  }>;
  rising_searches: Array<{
    query: string;
    growth: string;
  }>;
}

export interface SearchHistoryResponse {
  recentSearches: string[];
  preferences: {
    categories: string[];
    brands: string[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SearchFacets {
  brands: Array<{
    name: string;
    count: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
    count: number;
  }>;
  priceRanges: Array<{
    min: number;
    max: number;
    count: number;
  }>;
  ratings: Array<{
    rating: number;
    count: number;
  }>;
}

// ==================================
// SEARCH HISTORY TYPES
// ==================================

export interface SearchHistory {
  id: string;
  userId: string;
  query: string;
  resultsCount: number;
  searchTime: number;
  createdAt: string;
}

// ==================================
// SEARCH ANALYTICS TYPES (Admin)
// ==================================

export interface SearchAnalytics {
  totalSearches: number;
  uniqueSearches: number;
  avgResultsPerSearch: number;
  avgSearchTime: number;
  topSearches: Array<{
    query: string;
    count: number;
    resultsCount: number;
  }>;
  noResultSearches: Array<{
    query: string;
    count: number;
  }>;
  searchTrends: Array<{
    date: string;
    searchCount: number;
  }>;
}

// ==================================
// SEARCH HEALTH TYPES
// ==================================

export interface SearchHealth {
  elasticsearch: {
    status: string;
    cluster: string;
    nodes: number;
  };
  indices: {
    products: boolean;
    gift_cards: boolean;
    search_history: boolean;
    suggestions: boolean;
  };
}