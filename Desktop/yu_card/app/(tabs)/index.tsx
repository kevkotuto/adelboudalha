import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState, useEffect } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';

import { CategorieCard } from '@/components/ui/Cards/CategorieCard';
import { GiftCard } from '@/components/ui/Cards/GiftCard';
import { ProductCard } from '@/components/ui/Cards/ProductCard';
import { Container } from '@/components/ui/Layout/Container';
import { SearchBar } from '@/components/ui/SearchBar';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { CartBottomSheet, CartHeaderButton } from '@/components/ui';
import { ProductSkeleton } from '@/components/ui/Skeleton/ProductSkeleton';
import { GiftCardSkeleton } from '@/components/ui/Skeleton/GiftCardSkeleton';
import { TextSkeleton } from '@/components/ui/Skeleton/TextSkeleton';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { giftCardsService } from '@/services/giftCardsService';
import { productsService } from '@/services/productsService';
import { categoriesService } from '@/services/categoriesService';
import { buildImageUrl, getFirstImageUrl } from '@/services/config';
import type { GiftCard as GiftCardType, PhysicalProduct, Category } from '@/types/models';

const { width } = Dimensions.get('window');

// Default categories fallback with images
const DEFAULT_CATEGORIES = [
  { id: '1', name: 'Apple', image: require('@/assets/mock/categories/apple.png') },
  { id: '2', name: 'Google', image: require('@/assets/mock/categories/google.png') },
  { id: '3', name: 'Nintendo', image: require('@/assets/mock/categories/nintendo.png') },
  { id: '4', name: 'PlayStation', image: require('@/assets/mock/categories/playstation.png') },
  { id: '5', name: 'Steam', image: require('@/assets/mock/categories/steam.png') },
  { id: '6', name: 'Xbox', image: require('@/assets/mock/categories/xbox.png') },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const cartBottomSheetRef = useRef<BottomSheetModal>(null);

  // State for real data
  const [popularGiftCards, setPopularGiftCards] = useState<GiftCardType[]>([]);
  const [popularProducts, setPopularProducts] = useState<PhysicalProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load data from API
  useEffect(() => {
    loadHomeData();
  }, []);

  const loadHomeData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      // Try to get popular items first, if empty fallback to regular list
      const [giftCardsPopular, productsPopular, categoriesResponse] = await Promise.all([
        giftCardsService.getGiftCards({ popular: true, limit: 10 }),
        productsService.getProducts({ popular: true, limit: 10 }),
        categoriesService.getCategories({ page: 1, limit: 6 }),
      ]);

      // If no popular gift cards, get regular list
      let giftCardsResponse = giftCardsPopular;
      if (!giftCardsPopular.items || giftCardsPopular.items.length === 0) {
        console.log('No popular gift cards, fetching regular list...');
        giftCardsResponse = await giftCardsService.getGiftCards({ limit: 10 });
      }

      // If no popular products, get regular list
      let productsResponse = productsPopular;
      if (!productsPopular.items || productsPopular.items.length === 0) {
        console.log('No popular products, fetching regular list...');
        productsResponse = await productsService.getProducts({ limit: 10 });
      }

      console.log('Gift cards from API:', giftCardsResponse);
      console.log('Products from API:', productsResponse);
      console.log('Categories from API:', categoriesResponse);

      setPopularGiftCards(giftCardsResponse.items || []);
      setPopularProducts(productsResponse.items || []);

      // Map categories to include images (fallback to default if iconUrl not available)
      const categoriesData = categoriesResponse.items || [];
      console.log('Categories items:', categoriesData);

      if (categoriesData && categoriesData.length > 0) {
        const mappedCategories = categoriesData.map((cat, index) => {
          // Build full URL for icon if available
          const iconUrl = buildImageUrl(cat.iconUrl);
          console.log(`Category ${cat.name}: iconUrl=${cat.iconUrl}, built=${iconUrl}`);

          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            image: iconUrl
              ? { uri: iconUrl }
              : DEFAULT_CATEGORIES[index % DEFAULT_CATEGORIES.length]?.image,
          };
        });
        console.log('Mapped categories:', mappedCategories);
        setCategories(mappedCategories);
      } else {
        // If no categories from API, use defaults as fallback
        console.log('No categories from API, using defaults');
        setCategories(DEFAULT_CATEGORIES);
      }
    } catch (error) {
      console.error('Failed to load home data:', error);
      // Use default categories as fallback on error
      setCategories(DEFAULT_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadHomeData();
    } finally {
      setRefreshing(false);
    }
  };

  const handleCartPress = () => {
    cartBottomSheetRef.current?.present();
  };

  const handleCheckout = () => {
    cartBottomSheetRef.current?.close();
    router.push('/(tabs)/cart');
  };

  const handleSearchPress = () => {
    try {
      router.push('/search');
    } catch (error) {
      console.error('Navigation error:', error);
    }
  };

  const SectionHeader = ({ title, onSeeAll }: { title: string; onSeeAll?: () => void }) => (
    <View style={styles.sectionHeader}>
      <Title level={7}>{title}</Title>
      {onSeeAll && (
        <Pressable onPress={onSeeAll} style={styles.seeAllButton}>
          <Caption color="accent" style={styles.seeAllText}>
            {t('home.see_all')}
          </Caption>
          <Ionicons name="chevron-forward" size={16} color={Colors.primaryDark} />
        </Pressable>
      )}
    </View>
  );

  const renderGiftCard = ({ item, index }: { item: GiftCardType; index: number }) => {
    // Convert backend data to component props
    const gradientColors: [string, string] = item.gradientStart && item.gradientEnd
      ? [item.gradientStart, item.gradientEnd]
      : ['#F4D03F', '#FDD835'];

    // Build full image URL
    const imageUrl = buildImageUrl(item.imageUrl);

    return (
      <View
        style={[
          styles.horizontalItem,
          index === 0 && styles.firstItem,
          index === popularGiftCards.length - 1 && styles.lastItem,
        ]}
      >
        <GiftCard
          id={item.id}
          title={item.title}
          brand={item.brand}
          image={imageUrl ? { uri: imageUrl } : undefined}
          amount={item.fixedAmounts?.[0] ? Number(item.fixedAmounts[0]) : (item.minAmount ? Number(item.minAmount) : undefined)}
          currency={item.currency}
          gradientColors={gradientColors}
          popular={item.isPopular}
          discount={Number(item.discountPercentage) || undefined}
          giftCardData={item as any}
          onPress={() => {
            router.push(`/${item.id}`);
          }}
        />
      </View>
    );
  };

  const renderProduct = ({ item, index }: { item: PhysicalProduct; index: number }) => {
    // Get first image URL from the product images array
    const imageUrl = getFirstImageUrl(item.images);

    return (
      <View
        style={[
          styles.horizontalItem,
          index === 0 && styles.firstItem,
          index === popularProducts.length - 1 && styles.lastItem,
        ]}
      >
        <ProductCard
          id={item.id}
          name={item.name}
          brand={item.brand}
          price={Number(item.price)}
          currency={item.currency}
          image={imageUrl ? { uri: imageUrl } : undefined}
          inStock={item.stockQuantity > 0}
          rating={Number(item.rating) || 0}
          reviewCount={item.reviewCount || 0}
          onPress={() => {
            router.push(`/${item.id}`);
          }}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <Container>
        <FlatList
          data={[]}
          renderItem={() => null}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <View>
                  <Title level={3}>{t('home.welcome') || 'Bienvenue'}</Title>
                  <Paragraph color="secondary" style={styles.subtitle}>
                    {t('home.subtitle') || 'Découvrez nos cartes cadeaux et produits'}
                  </Paragraph>
                </View>
                <CartHeaderButton onPress={handleCartPress} />
              </View>

              {/* Search Bar */}
              <View style={styles.searchBarContainer}>
                <SearchBar
                  placeholder="Rechercher..."
                  onPress={handleSearchPress}
                  style={styles.searchBar}
                />
              </View>

              {/* Categories */}
              {loading ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <TextSkeleton width="60%" height={24} />
                    <TextSkeleton width="20%" height={16} />
                  </View>
                  <View style={styles.categoriesGrid}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <View key={i} style={styles.categorySkeletonItem}>
                        <TextSkeleton width="100%" height={80} style={{ borderRadius: BorderRadius.md }} />
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <CategorieCard
                  title="Catégories populaires"
                  categories={categories}
                  numberOfColumns={3}
                  numberOfLines={2}
                  onSeeAll={() => {
                    router.push('/categories');
                  }}
                  onCategoryPress={(category) => {
                    router.push({
                      pathname: '/search-results',
                      params: {
                        categoryId: category.id,
                        categoryName: category.name,
                      },
                    });
                  }}
                />
              )}

              {/* Popular Gift Cards */}
              <View style={styles.section}>
                <SectionHeader
                  title={t('home.popular_gift_cards') || 'Cartes cadeaux populaires'}
                  onSeeAll={loading ? undefined : () => {
                    router.push({
                      pathname: '/search-results',
                      params: { type: 'gift_card' }
                    });
                  }}
                />
                {loading ? (
                  <View style={styles.horizontalList}>
                    {[1, 2, 3].map((i) => (
                      <View key={i} style={styles.horizontalItem}>
                        <GiftCardSkeleton />
                      </View>
                    ))}
                  </View>
                ) : (
                  <FlatList
                    data={popularGiftCards}
                    renderItem={renderGiftCard}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                  />
                )}
              </View>

              {/* Popular Products */}
              <View style={styles.section}>
                <SectionHeader
                  title={t('home.popular_products') || 'Produits populaires'}
                  onSeeAll={loading ? undefined : () => {
                    router.push({
                      pathname: '/search-results',
                      params: { type: 'product' }
                    });
                  }}
                />
                {loading ? (
                  <View style={styles.horizontalList}>
                    {[1, 2, 3].map((i) => (
                      <View key={i} style={styles.horizontalItem}>
                        <ProductSkeleton count={1} />
                      </View>
                    ))}
                  </View>
                ) : (
                  <FlatList
                    data={popularProducts}
                    renderItem={renderProduct}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.horizontalList}
                  />
                )}
              </View>

              {/* Bottom padding */}
              <View style={styles.bottomPadding} />
            </>
          }
        />
      </Container>


      {/* Bottom sheet du panier */}
      <CartBottomSheet
        ref={cartBottomSheetRef}
        onClose={() => cartBottomSheetRef.current?.close()}
        onCheckout={handleCheckout}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingTop: Spacing['4xl'],
    paddingBottom: Spacing.lg,
  },

  subtitle: {
    marginTop: Spacing.xs,
  },

  searchBarContainer: {
    marginBottom: Spacing.xl,
  },

  searchBar: {
    width: '100%',
  },

  section: {
    marginBottom: Spacing.xl,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  seeAllText: {
    fontWeight: '600',
    marginRight: Spacing.xs,
  },

  horizontalList: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
  },

  horizontalItem: {
    width: width * 0.45,
    marginHorizontal: Spacing.xs,
  },

  firstItem: {
    marginLeft: 0,
  },

  lastItem: {
    marginRight: Spacing.md,
  },

  bottomPadding: {
    height: Spacing.xl,
  },

  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  categorySkeletonItem: {
    width: (width - Spacing.md * 2 - Spacing.sm * 2) / 3,
  },
});