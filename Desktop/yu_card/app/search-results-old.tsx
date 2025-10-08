import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { IconButton } from '@/components/ui/Buttons/IconButton';
import { GiftCard } from '@/components/ui/Cards/GiftCard';
import { ProductCard } from '@/components/ui/Cards/ProductCard';
import { Container } from '@/components/ui/Layout/Container';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { LoadingSpinner } from '@/components/ui/Layout/LoadingSpinner';
import { FilterBottomSheet } from '@/components/ui/Modals/FilterBottomSheet';
import { SortBottomSheet } from '@/components/ui/Modals/SortBottomSheet';
import { Caption, Title } from '@/components/ui/Typography';
import { Colors, Spacing } from '@/constants';
import {
  GiftCardData,
  mockGiftCards,
  mockPhysicalProducts,
  PhysicalProductData
} from '@/data/mockData';
import useTranslation from '@/hooks/useTranslation';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'gift_card' | 'product';
type SortType = 'relevance' | 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'rating';
type CategoryType = 'all' | 'gaming' | 'tech' | 'entertainment' | 'smartphone' | 'tablet' | 'accessories' | 'laptop' | 'shopping';

interface CombinedItem {
  id: string;
  type: 'gift_card' | 'product';
  data: GiftCardData | PhysicalProductData;
}

interface SearchResultsParams {
  query?: string;
  type?: FilterType;
  category?: CategoryType;
}

export default function SearchResultsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams() as SearchResultsParams;

  // Refs
  const filterBottomSheetRef = useRef<BottomSheet>(null);
  const sortBottomSheetRef = useRef<BottomSheet>(null);

  // States
  const [loading] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterType>(params.type || 'all');
  const [activeCategory, setActiveCategory] = useState<CategoryType>(params.category || 'all');
  const [sortBy, setSortBy] = useState<SortType>('relevance');

  // Temporary states for filter modal
  const [tempFilter, setTempFilter] = useState<FilterType>(activeFilter);
  const [tempCategory, setTempCategory] = useState<CategoryType>(activeCategory);

  // Get title based on navigation context
  const getScreenTitle = () => {
    if (params.query) {
      return `${t('common.search')} "${params.query}"`;
    }
    if (params.type === 'gift_card') {
      return t('home.popular_gift_cards') || 'Cartes cadeaux populaires';
    }
    if (params.type === 'product') {
      return t('home.popular_products') || 'Produits populaires';
    }
    return t('search.results') || 'Résultats';
  };

  // Combine and filter data
  const combinedData = useMemo<CombinedItem[]>(() => {
    let giftCards: CombinedItem[] = [];
    let products: CombinedItem[] = [];

    // Filter gift cards
    if (activeFilter === 'all' || activeFilter === 'gift_card') {
      let filteredGiftCards = mockGiftCards;

      // Category filter
      if (activeCategory !== 'all') {
        filteredGiftCards = filteredGiftCards.filter(item => item.category === activeCategory);
      }

      // Search query filter
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredGiftCards = filteredGiftCards.filter(item =>
          item.title.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }

      giftCards = filteredGiftCards.map(item => ({
        id: item.id,
        type: 'gift_card' as const,
        data: item
      }));
    }

    // Filter products
    if (activeFilter === 'all' || activeFilter === 'product') {
      let filteredProducts = mockPhysicalProducts;

      // Category filter
      if (activeCategory !== 'all') {
        filteredProducts = filteredProducts.filter(item => item.category === activeCategory);
      }

      // Search query filter
      if (params.query) {
        const query = params.query.toLowerCase();
        filteredProducts = filteredProducts.filter(item =>
          item.name.toLowerCase().includes(query) ||
          item.brand.toLowerCase().includes(query) ||
          item.category.toLowerCase().includes(query)
        );
      }

      products = filteredProducts.map(item => ({
        id: item.id,
        type: 'product' as const,
        data: item
      }));
    }

    // Combine and shuffle
    const combined = [...giftCards, ...products];

    // Sort
    return combined.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          const aPopular = 'popular' in a.data ? a.data.popular : false;
          const bPopular = 'popular' in b.data ? b.data.popular : false;
          return bPopular ? 1 : aPopular ? -1 : 0;

        case 'price_asc':
          const aPrice = 'amount' in a.data ? a.data.amount || 0 : (a.data as PhysicalProductData).price;
          const bPrice = 'amount' in b.data ? b.data.amount || 0 : (b.data as PhysicalProductData).price;
          return aPrice - bPrice;

        case 'price_desc':
          const aPriceDesc = 'amount' in a.data ? a.data.amount || 0 : (a.data as PhysicalProductData).price;
          const bPriceDesc = 'amount' in b.data ? b.data.amount || 0 : (b.data as PhysicalProductData).price;
          return bPriceDesc - aPriceDesc;

        case 'rating':
          const aRating = 'rating' in a.data ? a.data.rating || 0 : 5;
          const bRating = 'rating' in b.data ? b.data.rating || 0 : 5;
          return bRating - aRating;

        default:
          return 0;
      }
    });
  }, [activeFilter, activeCategory, sortBy, params.query]);

  // Render item
  const renderItem = useCallback(({ item, index }: { item: CombinedItem; index: number }) => {
    const isFirstInRow = index % 2 === 0;
    const isLastInRow = index % 2 === 1;

    if (item.type === 'gift_card') {
      const giftCard = item.data as GiftCardData;
      return (
        <View style={[
          styles.itemContainer,
          isFirstInRow && styles.firstColumn,
          isLastInRow && styles.lastColumn
        ]}>
          <View style={styles.typeBadge}>
            <Caption color="inverse" style={styles.typeBadgeText}>
              {t('filter.gift_card') || 'Carte cadeau'}
            </Caption>
          </View>
          <GiftCard
            title={giftCard.title}
            brand={giftCard.brand}
            image={giftCard.image}
            amount={giftCard.amount}
            currency={giftCard.currency}
            gradientColors={giftCard.gradientColors}
            popular={giftCard.popular}
            discount={giftCard.discount}
            onPress={() => {
              console.log('Gift Card pressed:', giftCard.id);
            }}
          />
        </View>
      );
    } else {
      const product = item.data as PhysicalProductData;
      return (
        <View style={[
          styles.itemContainer,
          isFirstInRow && styles.firstColumn,
          isLastInRow && styles.lastColumn
        ]}>
          <View style={[styles.typeBadge, styles.productBadge]}>
            <Caption color="inverse" style={styles.typeBadgeText}>
              {t('filter.product') || 'Produit'}
            </Caption>
          </View>
          <ProductCard
            name={product.name}
            brand={product.brand}
            price={product.price}
            currency={product.currency}
            image={product.images?.[0]}
            rating={product.rating}
            reviewCount={product.reviewCount}
            category={product.category}
            onPress={() => {
              console.log('Product pressed:', product.id);
            }}
          />
        </View>
      );
    }
  }, [t]);

  // Modal handlers
  const handleOpenFilters = () => {
    setTempFilter(activeFilter);
    setTempCategory(activeCategory);
    filterBottomSheetRef.current?.expand();
  };

  const handleApplyFilters = () => {
    setActiveFilter(tempFilter);
    setActiveCategory(tempCategory);
    filterBottomSheetRef.current?.close();
  };

  const handleOpenSort = () => {
    sortBottomSheetRef.current?.expand();
  };

  const handleSortChange = (newSortBy: SortType) => {
    setSortBy(newSortBy);
  };

  const FilterBar = () => (
    <View style={styles.filterBar}>
      <Pressable
        style={styles.filterButton}
        onPress={handleOpenFilters}
      >
        <Ionicons name="options" size={20} color={Colors.text.primary} />
        <Caption style={styles.filterButtonText}>
          {t('common.filter') || 'Filtrer'}
        </Caption>
        {(activeFilter !== 'all' || activeCategory !== 'all') && (
          <View style={styles.filterIndicator} />
        )}
      </Pressable>

      <Pressable
        style={styles.sortButton}
        onPress={handleOpenSort}
      >
        <Ionicons name="swap-vertical" size={20} color={Colors.text.primary} />
        <Caption style={styles.sortButtonText}>
          {t('common.sort') || 'Trier'}
        </Caption>
      </Pressable>
    </View>
  );

  const ResultsHeader = () => (
    <View style={styles.resultsHeader}>
      <Caption color="secondary">
        {combinedData.length} {t('search.results_found') || 'résultats trouvés'}
      </Caption>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <IconButton
            icon="arrow-back"
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backButton}
          />
          <View style={styles.headerContent}>
            <Title level={6} numberOfLines={1}>
              {getScreenTitle()}
            </Title>
          </View>
        </View>

        {/* Filter Bar */}
        <FilterBar />

        {/* Results */}
        {loading ? (
          <LoadingSpinner />
        ) : combinedData.length === 0 ? (
          <EmptyState
            icon="search"
            title={t('search.no_results') || 'Aucun résultat'}
            description={params.query
              ? `${t('search.no_results_for') || 'Aucun résultat pour'} "${params.query}"`
              : t('search.try_different_filters') || 'Essayez des filtres différents'
            }
          />
        ) : (
          <FlatList
            data={combinedData}
            renderItem={renderItem}
            numColumns={2}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.list}
            columnWrapperStyle={styles.row}
            ListHeaderComponent={<ResultsHeader />}
            keyExtractor={(item) => `${item.type}-${item.id}`}
          />
        )}
      </Container>

      {/* Filter Modal */}
      <FilterBottomSheet
        ref={filterBottomSheetRef}
        activeFilter={tempFilter}
        activeCategory={tempCategory}
        onFilterChange={setTempFilter}
        onCategoryChange={setTempCategory}
        onApply={handleApplyFilters}
        onClose={() => filterBottomSheetRef.current?.close()}
      />

      {/* Sort Modal */}
      <SortBottomSheet
        ref={sortBottomSheetRef}
        activeSortBy={sortBy}
        onSortChange={handleSortChange}
        onClose={() => sortBottomSheetRef.current?.close()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: Spacing['2xl'],
    backgroundColor: Colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  backButton: {
    marginRight: Spacing.sm,
  },

  headerContent: {
    flex: 1,
  },

  filterBar: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderRadius: Spacing.sm,
    position: 'relative',
  },

  filterButtonText: {
    marginLeft: Spacing.xs,
  },

  filterIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[100],
    borderRadius: Spacing.sm,
  },

  sortButtonText: {
    marginLeft: Spacing.xs,
  },

  resultsHeader: {
    paddingVertical: Spacing.md,
  },

  list: {
    paddingBottom: Spacing.xl,
  },

  row: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xs,
  },

  itemContainer: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    marginBottom: Spacing.md,
    position: 'relative',
  },

  firstColumn: {
    marginRight: Spacing.xs,
  },

  lastColumn: {
    marginLeft: Spacing.xs,
  },

  typeBadge: {
    position: 'absolute',
    top: Spacing.sm,
    left: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    backgroundColor: Colors.primary,
    borderRadius: 4,
    zIndex: 10,
  },

  productBadge: {
    backgroundColor: Colors.black,
  },

  typeBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
});