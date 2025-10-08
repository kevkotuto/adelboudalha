import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CartFloatingButton } from '@/components/ui/Buttons/CartFloatingButton';
import { GiftCard } from '@/components/ui/Cards/GiftCard';
import { ProductCard } from '@/components/ui/Cards/ProductCard';
import { QuickFilters } from '@/components/ui/Filters/QuickFilters';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { AdvancedFiltersModal, type FilterValues } from '@/components/ui/Modals/AdvancedFiltersModal';
import { CartBottomSheet } from '@/components/ui/Modals/CartBottomSheet';
import { SearchSuggestions } from '@/components/ui/Search/SearchSuggestions';
import { ProductSkeleton } from '@/components/ui/Skeleton/ProductSkeleton';
import { TextSkeleton } from '@/components/ui/Skeleton/TextSkeleton';
import { Caption } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { categoriesService } from '@/services/categoriesService';
import { buildImageUrl, getFirstImageUrl } from '@/services/config';
import { searchService } from '@/services/searchService';
import type { Category, GiftCard as GiftCardType, PhysicalProduct } from '@/types/models';

const { width } = Dimensions.get('window');

interface CombinedItem {
  id: string;
  type: 'gift_card' | 'physical_product';
  data: GiftCardType | PhysicalProduct;
}

interface SearchParams {
  query?: string;
  type?: string;
  categoryId?: string;
  categoryName?: string;
}

// Quick filters are now using translation keys and will be transformed in the component
const QUICK_FILTERS_CONFIG = [
  { id: 'all', labelKey: 'common.all', value: 'all' },
  { id: 'gift_cards', labelKey: 'filter.gift_cards', icon: 'card' as const, value: 'gift_card' },
  { id: 'products', labelKey: 'filter.products', icon: 'phone-portrait' as const, value: 'product' },
  { id: 'featured', labelKey: 'common.popular', icon: 'star' as const, value: 'featured' },
  { id: 'promo', labelKey: 'common.discount', icon: 'pricetag' as const, value: 'promo' },
];

const SEARCH_SUGGESTIONS = [
  'iPhone 15 Pro',
  'PlayStation Gift Card',
  'AirPods Pro',
  'Xbox Live',
  'MacBook Air',
  'Samsung Galaxy',
];

const RECENT_SEARCHES = [
  'Gift cards gaming',
  'iPhone',
  'PlayStation 5',
];

export default function SearchResultsV2Screen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams() as SearchParams;
  const cartBottomSheetRef = useRef<BottomSheetModal>(null);

  // States
  const [searchQuery, setSearchQuery] = useState(params.query || '');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>(['all']);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [searchResults, setSearchResults] = useState<CombinedItem[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Advanced filter states
  const [filterValues, setFilterValues] = useState<Omit<FilterValues, 'sortBy'>>({
    type: params.type === 'gift_card' ? 'gift_cards' : params.type === 'product' ? 'products' : 'all',
    categories: params.categoryId ? [params.categoryId] : [],
  });

  // Transform filters with translations
  const QUICK_FILTERS = useMemo(() => {
    return QUICK_FILTERS_CONFIG.map(filter => ({
      id: filter.id,
      label: t(filter.labelKey),
      icon: filter.icon,
      value: filter.value,
    }));
  }, [t]);

  // Load categories for filter modal
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesService.getCategories({
        limit: 50,
        includeChildren: false,
      });
      setCategories(response.items || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  // Synchronize activeFilters when filterValues change (for visual consistency)
  useEffect(() => {
    const newActiveFilters: string[] = [];

    if (filterValues.type === 'gift_cards') {
      newActiveFilters.push('gift_cards');
    } else if (filterValues.type === 'products') {
      newActiveFilters.push('products');
    }

    if (filterValues.featured) {
      newActiveFilters.push('featured');
    }

    if (filterValues.onSale) {
      newActiveFilters.push('promo');
    }

    // If no filters are active, show 'all'
    if (newActiveFilters.length === 0) {
      newActiveFilters.push('all');
    }

    setActiveFilters(newActiveFilters);
  }, [filterValues]);

  // Load search results from API
  useEffect(() => {
    performSearch();
  }, [searchQuery, sortBy, filterValues]);

  // Get autocomplete suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.length >= 2) {
        try {
          const response = await searchService.autocomplete({ q: searchQuery, limit: 10 });
          setFilteredSuggestions(response.suggestions || []);
        } catch (error) {
          console.error('Failed to load suggestions:', error);
          setFilteredSuggestions([]);
        }
      } else {
        setFilteredSuggestions([]);
      }
    };

    const debounce = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const performSearch = async () => {
    try {
      setLoading(true);

      // Build search parameters matching new API
      const searchParams: any = {
        q: searchQuery || undefined,
        page: 1,
        size: 50,
        include_suggestions: true,
        include_aggregations: true,
      };

      // Apply type filter (use filterValues as single source of truth)
      if (filterValues.type && filterValues.type !== 'all') {
        searchParams.type = filterValues.type;
      }

      // Add category filter
      if (filterValues.categories && filterValues.categories.length > 0) {
        searchParams.category = filterValues.categories[0]; // API accepts single category ID
      }

      // Add price filters
      if (filterValues.minPrice) {
        searchParams.min_price = filterValues.minPrice;
      }
      if (filterValues.maxPrice) {
        searchParams.max_price = filterValues.maxPrice;
      }

      // Add rating filter
      if (filterValues.minRating) {
        searchParams.min_rating = filterValues.minRating;
      }

      // Add stock filter
      if (filterValues.inStock) {
        searchParams.in_stock = true;
      }

      // Add featured filter
      if (filterValues.featured) {
        searchParams.featured = true;
      }

      // Add on_sale filter for promo items
      if (filterValues.onSale) {
        searchParams.on_sale = true;
      }

      // Apply sorting
      searchParams.sort = sortBy || 'relevance';

      const response = await searchService.search(searchParams);

      // Transform search results to CombinedItem format
      const combinedItems: CombinedItem[] = [];

      // Add gift cards only if we're showing all or filtering for gift cards
      if ((filterValues.type === 'all' || filterValues.type === 'gift_cards') &&
          response.giftCards && Array.isArray(response.giftCards)) {
        response.giftCards.forEach(giftCard => {
          combinedItems.push({
            id: giftCard.id,
            type: 'gift_card',
            data: giftCard,
          });
        });
      }

      // Add physical products only if we're showing all or filtering for products
      if ((filterValues.type === 'all' || filterValues.type === 'products') &&
          response.physicalProducts && Array.isArray(response.physicalProducts)) {
        response.physicalProducts.forEach(product => {
          combinedItems.push({
            id: product.id,
            type: 'physical_product',
            data: product,
          });
        });
      }

      setSearchResults(combinedItems);
      setTotalResults(response.total);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setTotalResults(0);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await performSearch();
    } finally {
      setRefreshing(false);
    }
  };

  // Use search results directly (already filtered and sorted by backend)
  const combinedData = useMemo<CombinedItem[]>(() => {
    return searchResults;
  }, [searchResults]);

  // Handle filter press
  const handleFilterPress = useCallback((filterId: string) => {
    if (filterId === 'all') {
      // Reset all filters
      setActiveFilters(['all']);
      setFilterValues({
        type: 'all',
        categories: [],
      });
    } else if (filterId === 'gift_cards') {
      // Filter only gift cards
      setActiveFilters(['gift_cards']);
      setFilterValues(prev => ({
        ...prev,
        type: 'gift_cards',
      }));
    } else if (filterId === 'products') {
      // Filter only products
      setActiveFilters(['products']);
      setFilterValues(prev => ({
        ...prev,
        type: 'products',
      }));
    } else if (filterId === 'featured') {
      // Toggle featured filter
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        const isActive = prev.includes('featured');
        if (isActive) {
          const updated = newFilters.filter(f => f !== 'featured');
          return updated.length === 0 ? ['all'] : updated;
        } else {
          return [...newFilters, 'featured'];
        }
      });
      setFilterValues(prev => ({
        ...prev,
        featured: !prev.featured,
      }));
    } else if (filterId === 'promo') {
      // Toggle promo/sale filter
      setActiveFilters(prev => {
        const newFilters = prev.filter(f => f !== 'all');
        const isActive = prev.includes('promo');
        if (isActive) {
          const updated = newFilters.filter(f => f !== 'promo');
          return updated.length === 0 ? ['all'] : updated;
        } else {
          return [...newFilters, 'promo'];
        }
      });
      setFilterValues(prev => ({
        ...prev,
        onSale: !prev.onSale,
      }));
    }
  }, []);

  // Handle suggestion press
  const handleSuggestionPress = useCallback((suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  }, []);

  // Handle advanced filters
  const handleAdvancedFiltersApply = useCallback((filters: FilterValues) => {
    const { sortBy: newSort, ...restFilters } = filters;
    setFilterValues(restFilters);
    setSortBy(newSort);

    // Update active quick filters based on advanced filter selections
    const newActiveFilters: string[] = [];
    if (filters.featured) newActiveFilters.push('featured');
    if (filters.onSale) newActiveFilters.push('promo');
    if (filters.type === 'gift_cards') newActiveFilters.push('gift_cards');
    if (filters.type === 'products') newActiveFilters.push('products');

    setActiveFilters(newActiveFilters.length > 0 ? newActiveFilters : ['all']);
  }, []);

  // Cart handlers
  const handleCartPress = useCallback(() => {
    setIsCartOpen(true);
    cartBottomSheetRef.current?.present();
  }, []);

  const handleCartClose = useCallback(() => {
    setIsCartOpen(false);
    cartBottomSheetRef.current?.close();
  }, []);

  const handleCheckout = useCallback(() => {
    setIsCartOpen(false);
    cartBottomSheetRef.current?.close();
    router.push('/(tabs)/cart');
  }, []);

  // Render item
  const renderItem = useCallback(({ item, index }: { item: CombinedItem; index: number }) => {
    const isFirstInRow = index % 2 === 0;

    if (item.type === 'gift_card') {
      const giftCard = item.data as GiftCardType;
      const gradientColors: [string, string] = giftCard.gradientStart && giftCard.gradientEnd
        ? [giftCard.gradientStart, giftCard.gradientEnd]
        : ['#F4D03F', '#FDD835'];

      // Build full image URL
      const imageUrl = buildImageUrl(giftCard.imageUrl);

      return (
        <View style={[styles.itemContainer, isFirstInRow && styles.firstColumn]}>
          <GiftCard
            id={giftCard.id}
            title={giftCard.title}
            brand={giftCard.brand}
            image={imageUrl ? { uri: imageUrl } : undefined}
            amount={giftCard.fixedAmounts?.[0] ? Number(giftCard.fixedAmounts[0]) : (giftCard.minAmount ? Number(giftCard.minAmount) : undefined)}
            currency={giftCard.currency}
            gradientColors={gradientColors}
            popular={giftCard.isPopular}
            discount={Number(giftCard.discountPercentage) || undefined}
            giftCardData={giftCard as any}
            onPress={() => router.push(`/${giftCard.id}`)}
          />
        </View>
      );
    } else {
      const product = item.data as PhysicalProduct;
      // Get first image URL from the product images array
      const imageUrl = getFirstImageUrl(product.images);

      return (
        <View style={[styles.itemContainer, isFirstInRow && styles.firstColumn]}>
          <ProductCard
            id={product.id}
            name={product.name}
            brand={product.brand}
            price={Number(product.price)}
            currency={product.currency}
            image={imageUrl ? { uri: imageUrl } : undefined}
            inStock={product.stockQuantity > 0}
            rating={Number(product.rating) || 0}
            reviewCount={product.reviewCount || 0}
            onPress={() => router.push(`/${product.id}`)}
          />
        </View>
      );
    }
  }, []);

  // Header component
  const ListHeader = () => {
    const categoryName = params.categoryName;
    return (
      <View style={styles.resultsInfo}>
        <Caption color="secondary">
          {totalResults} {t('search.results_found') || 'résultats trouvés'}
          {categoryName && ` dans ${categoryName}`}
        </Caption>
      </View>
    );
  };

  // Loading header component
  const LoadingHeader = () => (
    <View style={styles.resultsInfo}>
      <TextSkeleton width="40%" height={14} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Fixed Search Bar */}
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBar}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
            </Pressable>

            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color={Colors.text.tertiary} />
              <TextInput
                style={styles.searchInput}
                placeholder={t('common.search') || 'Rechercher...'}
                placeholderTextColor={Colors.text.tertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                returnKeyType="search"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
                </Pressable>
              )}
            </View>

            <Pressable
              style={styles.filterButton}
              onPress={() => setShowAdvancedFilters(true)}
            >
              <Ionicons name="options-outline" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>
        </View>

        {/* Search Suggestions - Moved outside searchBarContainer */}
        <SearchSuggestions
          suggestions={filteredSuggestions}
          recentSearches={searchQuery.length === 0 ? RECENT_SEARCHES : []}
          onSuggestionPress={handleSuggestionPress}
          visible={showSuggestions}
        />

        {/* Quick Filters */}
        <QuickFilters
          filters={QUICK_FILTERS}
          activeFilters={activeFilters}
          onFilterPress={handleFilterPress}
          onClearAll={() => {
            setActiveFilters(['all']);
            setFilterValues({ type: 'all', categories: [] });
          }}
        />

        {/* Results */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <LoadingHeader />
            <ProductSkeleton count={6} />
          </View>
        ) : combinedData.length === 0 ? (
          <EmptyState
            icon="search"
            title={t('search.no_results') || 'Aucun résultat'}
            description={
              searchQuery
                ? `Aucun résultat pour "${searchQuery}"`
                : 'Essayez de modifier vos filtres'
            }
            variant="minimal"
          />
        ) : (
          <FlashList
            data={combinedData}
            renderItem={renderItem}
            numColumns={2}
            estimatedItemSize={200}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            ListHeaderComponent={<ListHeader />}
            keyExtractor={(item) => `${item.type}-${item.id}`}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />
        )}

        {/* Advanced Filters Modal */}
        <AdvancedFiltersModal
          visible={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          onApply={handleAdvancedFiltersApply}
          currentFilters={filterValues}
          currentSort={sortBy}
          availableCategories={categories.map(cat => ({ id: cat.id, name: cat.name }))}
        />

        {/* Floating Cart Button */}
        {!isCartOpen && <CartFloatingButton onPress={handleCartPress} />}
      </View>

      {/* Cart Bottom Sheet */}
      <CartBottomSheet
        ref={cartBottomSheetRef}
        onClose={handleCartClose}
        onCheckout={handleCheckout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },

  content: {
    flex: 1,
        zIndex: 1,
  },

  searchBarContainer: {
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  backButton: {
    padding: Spacing.xs,
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.xs,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text.primary,
  },

  filterButton: {
    padding: Spacing.xs,
  },

  resultsInfo: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  list: {
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.sm,
  },

  itemContainer: {
    flex: 1,
    maxWidth: (width - Spacing.lg * 2) / 2,
    marginHorizontal: Spacing.xs,
    marginBottom: Spacing.md,
  },

  firstColumn: {
    marginLeft: Spacing.md,
    marginRight: Spacing.xs,
  },

  loadingContainer: {
    flex: 1,
  },
});