import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  SearchRequest,
  SearchResponse,
  AutocompleteRequest,
  AutocompleteResponse,
  CategorySearchRequest,
  TrendingRequest,
  TrendingResponse,
  SearchHistory,
  SearchAnalytics,
  SearchHealth,
  PaginatedResponse,
} from '@/types';

// ==================================
// SEARCH SERVICE
// ==================================

export class SearchService {
  // ==================================
  // MAIN SEARCH
  // ==================================

  /**
   * Perform global search (products + categories)
   */
  async search(searchParams: SearchRequest): Promise<SearchResponse> {
    try {
      const backendResponse: any = await apiClient.get(
        API_ENDPOINTS.SEARCH.BASE,
        { params: searchParams }
      );

      // Transform backend response format to frontend format
      const results = backendResponse.results || [];
      const giftCards: any[] = [];
      const physicalProducts: any[] = [];
      const categories: any[] = [];

      // Separate results by type
      results.forEach((item: any) => {
        // Item can be either { _source: {...}, _type: '...' } or directly the data
        const data = item._source || item;
        const itemType = item._type || data.type;

        if (itemType === 'gift_card') {
          giftCards.push(data);
        } else if (itemType === 'physical_product' || itemType === 'product') {
          physicalProducts.push(data);
        } else if (itemType === 'category') {
          categories.push(data);
        }
      });

      return {
        giftCards,
        physicalProducts,
        categories,
        total: backendResponse.total || 0,
        totalGiftCards: giftCards.length,
        totalPhysicalProducts: physicalProducts.length,
        totalCategories: categories.length,
        page: backendResponse.searchParams?.page || 1,
        limit: backendResponse.searchParams?.size || searchParams.limit || 20,
        totalPages: Math.ceil((backendResponse.total || 0) / (backendResponse.searchParams?.size || searchParams.limit || 20)),
        searchTime: backendResponse.took || backendResponse.searchTime || 0,
      };
    } catch (error) {
      console.error('Failed to perform search:', error);
      // Return empty search response as fallback
      return {
        giftCards: [],
        physicalProducts: [],
        categories: [],
        total: 0,
        totalGiftCards: 0,
        totalPhysicalProducts: 0,
        totalCategories: 0,
        page: 1,
        limit: searchParams.limit || 20,
        totalPages: 0,
        searchTime: 0,
      };
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async autocomplete(autocompleteParams: AutocompleteRequest): Promise<AutocompleteResponse> {
    try {
      const backendResponse: any = await apiClient.get(
        API_ENDPOINTS.SEARCH.AUTOCOMPLETE,
        { params: autocompleteParams }
      );

      // Backend returns { query, suggestions: [], related: [], timestamp }
      // Frontend expects { suggestions: [{ text, type }], total }
      const suggestions = (backendResponse.suggestions || []).map((item: any) => {
        if (typeof item === 'string') {
          return { text: item, type: 'query' };
        }
        return item;
      });

      // Add related results as suggestions too
      const relatedSuggestions = (backendResponse.related || []).map((item: any) => {
        if (typeof item === 'string') {
          return { text: item, type: 'related' };
        }
        return item;
      });

      const allSuggestions = [...suggestions, ...relatedSuggestions];

      return {
        suggestions: allSuggestions,
        total: allSuggestions.length,
      };
    } catch (error) {
      console.error('Failed to get autocomplete suggestions:', error);
      // Return empty suggestions as fallback
      return {
        suggestions: [],
        total: 0,
      };
    }
  }

  /**
   * Search within a specific category
   */
  async searchInCategory(
    categoryId: string,
    searchParams: CategorySearchRequest
  ): Promise<SearchResponse> {
    try {
      const backendResponse: any = await apiClient.get(
        API_ENDPOINTS.SEARCH.CATEGORY(categoryId),
        { params: searchParams }
      );

      // Transform backend response format to frontend format
      const results = backendResponse.results || [];
      const giftCards: any[] = [];
      const physicalProducts: any[] = [];
      const categories: any[] = [];

      // Separate results by type
      results.forEach((item: any) => {
        // Item can be either { _source: {...}, _type: '...' } or directly the data
        const data = item._source || item;
        const itemType = item._type || data.type;

        if (itemType === 'gift_card') {
          giftCards.push(data);
        } else if (itemType === 'physical_product' || itemType === 'product') {
          physicalProducts.push(data);
        } else if (itemType === 'category') {
          categories.push(data);
        }
      });

      return {
        giftCards,
        physicalProducts,
        categories,
        total: backendResponse.total || 0,
        totalGiftCards: giftCards.length,
        totalPhysicalProducts: physicalProducts.length,
        totalCategories: categories.length,
        page: backendResponse.searchParams?.page || 1,
        limit: backendResponse.searchParams?.size || searchParams.size || 20,
        totalPages: Math.ceil((backendResponse.total || 0) / (backendResponse.searchParams?.size || searchParams.size || 20)),
        searchTime: backendResponse.took || backendResponse.searchTime || 0,
      };
    } catch (error) {
      console.error(`Failed to search in category ${categoryId}:`, error);
      // Return empty search response as fallback
      return {
        giftCards: [],
        physicalProducts: [],
        categories: [],
        total: 0,
        totalGiftCards: 0,
        totalPhysicalProducts: 0,
        totalCategories: 0,
        page: 1,
        limit: searchParams.size || 20,
        totalPages: 0,
        searchTime: 0,
      };
    }
  }

  /**
   * Get trending searches and products
   */
  async getTrending(trendingParams?: TrendingRequest): Promise<TrendingResponse> {
    try {
      const backendResponse: any = await apiClient.get(
        API_ENDPOINTS.SEARCH.TRENDING,
        { params: trendingParams }
      );

      return {
        period: backendResponse.period || '7d',
        trending_searches: backendResponse.trending_searches || [],
        popular_categories: backendResponse.popular_categories || [],
        rising_searches: backendResponse.rising_searches || [],
      };
    } catch (error) {
      console.error('Failed to fetch trending data:', error);
      // Return empty trending data as fallback
      return {
        period: trendingParams?.period || '7d',
        trending_searches: [],
        popular_categories: [],
        rising_searches: [],
      };
    }
  }

  // ==================================
  // SEARCH HISTORY
  // ==================================

  /**
   * Get user search history
   */
  async getSearchHistory(page = 1, limit = 20): Promise<any> {
    try {
      const backendResponse: any = await apiClient.get(
        API_ENDPOINTS.SEARCH.HISTORY,
        { params: { page, limit } }
      );

      return {
        recentSearches: backendResponse.recentSearches || [],
        preferences: backendResponse.preferences || { categories: [], brands: [] },
        pagination: backendResponse.pagination || { page, limit, total: 0, totalPages: 0 },
      };
    } catch (error) {
      console.error('Failed to fetch search history:', error);
      // Return empty history as fallback
      return {
        recentSearches: [],
        preferences: { categories: [], brands: [] },
        pagination: { page, limit, total: 0, totalPages: 0 },
      };
    }
  }

  /**
   * Clear user search history
   */
  async clearSearchHistory(): Promise<{ success: boolean; cleared: number }> {
    try {
      return await apiClient.delete<{ success: boolean; cleared: number }>(
        API_ENDPOINTS.SEARCH.HISTORY
      );
    } catch (error) {
      console.error('Failed to clear search history:', error);
      return { success: false, cleared: 0 };
    }
  }

  // ==================================
  // ADMIN FUNCTIONS
  // ==================================

  /**
   * Get search analytics (Admin only)
   */
  async getSearchAnalytics(): Promise<SearchAnalytics> {
    try {
      return await apiClient.get<SearchAnalytics>(
        API_ENDPOINTS.SEARCH.ANALYTICS
      );
    } catch (error) {
      console.error('Failed to fetch search analytics:', error);
      throw error; // Admin functions should throw to indicate failure
    }
  }

  /**
   * Initialize search indices (Admin only)
   */
  async initializeIndices(): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post<{ success: boolean; message: string }>(
        API_ENDPOINTS.SEARCH.ADMIN.INIT_INDICES
      );
    } catch (error) {
      console.error('Failed to initialize search indices:', error);
      throw error; // Admin functions should throw to indicate failure
    }
  }

  /**
   * Reindex search data (Admin only)
   */
  async reindexData(): Promise<{ success: boolean; message: string; indexedItems: number }> {
    try {
      return await apiClient.post<{ success: boolean; message: string; indexedItems: number }>(
        API_ENDPOINTS.SEARCH.ADMIN.REINDEX
      );
    } catch (error) {
      console.error('Failed to reindex search data:', error);
      throw error; // Admin functions should throw to indicate failure
    }
  }

  /**
   * Check search service health
   */
  async checkHealth(): Promise<SearchHealth> {
    try {
      return await apiClient.get<SearchHealth>(
        API_ENDPOINTS.SEARCH.HEALTH
      );
    } catch (error) {
      console.error('Failed to check search service health:', error);
      // Return degraded health status as fallback
      return {
        status: 'unhealthy',
        elasticsearch: { connected: false, clusterHealth: 'red' },
        database: { connected: false },
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// ==================================
// SEARCH HELPER FUNCTIONS
// ==================================

export const searchHelpers = {
  /**
   * Clean search query
   */
  cleanSearchQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      .replace(/[^\w\s\u00C0-\u017F]/g, '') // Remove special chars except accented letters
      .replace(/\s+/g, ' '); // Normalize whitespace
  },

  /**
   * Validate search query
   */
  validateSearchQuery(query: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!query || !query.trim()) {
      errors.push('La recherche ne peut pas être vide');
    }

    if (query.trim().length < 2) {
      errors.push('La recherche doit contenir au moins 2 caractères');
    }

    if (query.trim().length > 100) {
      errors.push('La recherche ne peut pas dépasser 100 caractères');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Highlight search terms in text
   */
  highlightSearchTerms(text: string, searchQuery: string): string {
    if (!searchQuery || !text) return text;

    const terms = searchQuery.split(' ').filter(term => term.length > 1);
    let highlightedText = text;

    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return highlightedText;
  },

  /**
   * Generate search suggestions
   */
  generateSuggestions(query: string): string[] {
    const suggestions: string[] = [];
    const cleanQuery = searchHelpers.cleanSearchQuery(query);

    if (cleanQuery.length < 2) return suggestions;

    // Common product categories and terms in French
    const commonTerms = [
      'carte cadeau',
      'téléphone',
      'smartphone',
      'ordinateur',
      'laptop',
      'tablette',
      'écouteurs',
      'casque',
      'montre',
      'accessoire',
      'chargeur',
      'batterie',
      'gaming',
      'jeux',
      'console',
    ];

    // Brand suggestions
    const brands = [
      'samsung',
      'apple',
      'iphone',
      'huawei',
      'tecno',
      'infinix',
      'itel',
      'oppo',
      'vivo',
      'xiaomi',
    ];

    // Find matching terms
    const matchingTerms = commonTerms.filter(term =>
      term.includes(cleanQuery) || cleanQuery.includes(term)
    );

    const matchingBrands = brands.filter(brand =>
      brand.includes(cleanQuery) || cleanQuery.includes(brand)
    );

    // Combine suggestions
    suggestions.push(...matchingTerms.slice(0, 3));
    suggestions.push(...matchingBrands.slice(0, 2));

    return suggestions;
  },

  /**
   * Format search filters for display
   */
  formatFiltersForDisplay(filters: Record<string, any>): string[] {
    const displayFilters: string[] = [];

    if (filters.category) {
      displayFilters.push(`Catégorie: ${filters.category}`);
    }

    if (filters.brand) {
      displayFilters.push(`Marque: ${filters.brand}`);
    }

    if (filters.minPrice && filters.maxPrice) {
      displayFilters.push(
        `Prix: ${filters.minPrice} - ${filters.maxPrice} XOF`
      );
    } else if (filters.minPrice) {
      displayFilters.push(`Prix min: ${filters.minPrice} XOF`);
    } else if (filters.maxPrice) {
      displayFilters.push(`Prix max: ${filters.maxPrice} XOF`);
    }

    if (filters.productType) {
      const typeLabels = {
        GIFT_CARD: 'Cartes cadeaux',
        PHYSICAL_PRODUCT: 'Produits physiques',
      };
      displayFilters.push(`Type: ${typeLabels[filters.productType] || filters.productType}`);
    }

    return displayFilters;
  },

  /**
   * Get sort options for search
   */
  getSortOptions(): Array<{ value: string; label: string }> {
    return [
      { value: 'relevance', label: 'Pertinence' },
      { value: 'price_asc', label: 'Prix croissant' },
      { value: 'price_desc', label: 'Prix décroissant' },
      { value: 'rating', label: 'Mieux notés' },
      { value: 'popularity', label: 'Popularité' },
      { value: 'newest', label: 'Plus récents' },
    ];
  },

  /**
   * Analyze search results
   */
  analyzeSearchResults(searchResponse: SearchResponse): {
    hasResults: boolean;
    totalResults: number;
    resultTypes: {
      giftCards: number;
      physicalProducts: number;
      categories: number;
    };
    searchTime: string;
    isEmpty: boolean;
  } {
    const totalResults = searchResponse.total;
    const resultTypes = {
      giftCards: searchResponse.totalGiftCards,
      physicalProducts: searchResponse.totalPhysicalProducts,
      categories: searchResponse.totalCategories,
    };

    return {
      hasResults: totalResults > 0,
      totalResults,
      resultTypes,
      searchTime: `${searchResponse.searchTime}ms`,
      isEmpty: totalResults === 0,
    };
  },

  /**
   * Get search result summary
   */
  getSearchResultSummary(
    query: string,
    searchResponse: SearchResponse
  ): string {
    const { totalResults } = searchResponse;

    if (totalResults === 0) {
      return `Aucun résultat pour "${query}"`;
    }

    if (totalResults === 1) {
      return `1 résultat pour "${query}"`;
    }

    return `${totalResults} résultats pour "${query}"`;
  },

  /**
   * Build search URL
   */
  buildSearchUrl(query: string, filters?: Record<string, any>): string {
    const params = new URLSearchParams({ q: query });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    return `/search?${params.toString()}`;
  },

  /**
   * Parse search URL parameters
   */
  parseSearchUrl(url: string): {
    query: string;
    filters: Record<string, string>;
  } {
    const urlObj = new URL(url, 'https://example.com');
    const params = urlObj.searchParams;

    const query = params.get('q') || '';
    const filters: Record<string, string> = {};

    params.forEach((value, key) => {
      if (key !== 'q') {
        filters[key] = value;
      }
    });

    return { query, filters };
  },

  /**
   * Track search interaction
   */
  trackSearchInteraction(
    query: string,
    resultClicked?: {
      type: 'gift_card' | 'physical_product' | 'category';
      id: string;
      position: number;
    }
  ): void {
    // This would typically send analytics data
    console.log('Search interaction:', {
      query,
      timestamp: new Date().toISOString(),
      resultClicked,
    });
  },

  /**
   * Get popular search categories
   */
  getPopularSearchCategories(): string[] {
    return [
      'Smartphones',
      'Cartes cadeaux',
      'Ordinateurs portables',
      'Écouteurs',
      'Montres connectées',
      'Accessoires téléphone',
      'Gaming',
      'Tablettes',
    ];
  },

  /**
   * Format search time
   */
  formatSearchTime(timeMs: number): string {
    if (timeMs < 1000) {
      return `${timeMs}ms`;
    }

    const seconds = (timeMs / 1000).toFixed(1);
    return `${seconds}s`;
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const searchService = new SearchService();
export default searchService;