import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useMemo, useState, useEffect, useRef } from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryImageCard } from '@/components/ui/Cards/CategoryImageCard';
import { Container } from '@/components/ui/Layout/Container';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { Caption, Title } from '@/components/ui/Typography';
import { TextSkeleton } from '@/components/ui/Skeleton/TextSkeleton';
import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { categoriesService } from '@/services/categoriesService';
import { buildImageUrl } from '@/services/config';
import type { Category } from '@/types/models';

const { width } = Dimensions.get('window');

type FilterType = 'all' | 'gift_cards' | 'products';

// Fallback category images
const DEFAULT_CATEGORY_IMAGES: Record<string, any> = {
  gaming: require('@/assets/mock/categories/playstation.png'),
  tech: require('@/assets/mock/categories/apple.png'),
  entertainment: require('@/assets/mock/categories/google.png'),
  nintendo: require('@/assets/mock/categories/nintendo.png'),
  xbox: require('@/assets/mock/categories/xbox.png'),
  steam: require('@/assets/mock/categories/steam.png'),
};

export default function CategoriesScreen() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Load categories from API
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesService.getCategories({
        limit: 50,
        includeChildren: false,
      });
      setCategories(response.items || []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCategories();
    } finally {
      setRefreshing(false);
    }
  };

  // Get category count from backend data
  const getCategoryCount = (category: Category) => {
    if (!category._count) return 0;

    switch (activeFilter) {
      case 'gift_cards':
        return category._count.giftCards || 0;
      case 'products':
        return category._count.physicalProducts || 0;
      default:
        return (category._count.giftCards || 0) + (category._count.physicalProducts || 0);
    }
  };

  // Calculate filter badge counts
  const filterBadges = useMemo(() => {
    const totalGiftCards = categories.reduce((sum, cat) => sum + (cat._count?.giftCards || 0), 0);
    const totalProducts = categories.reduce((sum, cat) => sum + (cat._count?.physicalProducts || 0), 0);

    return [
      { id: 'all', label: 'Tout', count: totalGiftCards + totalProducts },
      { id: 'gift_cards', label: 'Cartes cadeaux', count: totalGiftCards },
      { id: 'products', label: 'Produits', count: totalProducts },
    ];
  }, [categories]);

  // Filtrage des catégories selon la recherche
  const filteredCategories = useMemo(() => {
    let filtered = categories;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by active filter (gift cards vs products)
    if (activeFilter !== 'all') {
      filtered = filtered.filter(category => {
        const count = getCategoryCount(category);
        return count > 0;
      });
    }

    return filtered;
  }, [categories, searchQuery, activeFilter]);

  const handleCategoryPress = (category: Category) => {
    // Navigation vers search-results avec les paramètres appropriés
    router.push({
      pathname: '/search-results',
      params: {
        categoryId: category.id,
        categoryName: category.name,
        type: activeFilter === 'all' ? undefined : activeFilter.replace('_cards', '_card'),
      }
    });
  };

  const renderFilterBadge = ({ item }: { item: typeof filterBadges[0] }) => {
    const isActive = activeFilter === item.id;
    return (
      <Pressable
        style={[
          styles.filterBadge,
          isActive && styles.filterBadgeActive,
        ]}
        onPress={() => setActiveFilter(item.id as FilterType)}
      >
        <Caption
          style={[
            styles.filterBadgeText,
            isActive && styles.filterBadgeTextActive,
          ]}
        >
          {item.label}
        </Caption>
        <View style={[
          styles.filterBadgeCount,
          isActive && styles.filterBadgeCountActive,
        ]}>
          <Caption style={[
            styles.filterCountText,
            isActive && styles.filterCountTextActive,
          ]}>
            {item.count}
          </Caption>
        </View>
      </Pressable>
    );
  };

  // Separate component for animated category item
  const CategoryItem = ({ item, index }: { item: Category; index: number }) => {
    // Get image from iconUrl or fallback to default
    const iconUrl = item.iconUrl ? buildImageUrl(item.iconUrl) : null;
    const image = iconUrl
      ? { uri: iconUrl }
      : DEFAULT_CATEGORY_IMAGES[item.slug] || DEFAULT_CATEGORY_IMAGES['gaming'];

    // Animation
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    useEffect(() => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          delay: index * 50,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 400,
          delay: index * 50,
          useNativeDriver: true,
        }),
      ]).start();
    }, [index]);

    return (
      <Animated.View
        style={[
          styles.categoryCard,
          {
            opacity: fadeAnim,
            transform: [{ translateY }],
          },
        ]}
      >
        <CategoryImageCard
          title={item.name}
          image={image}
          onPress={() => handleCategoryPress(item)}
        />
      </Animated.View>
    );
  };

  const renderCategory = ({ item, index }: { item: Category; index: number }) => {
    return <CategoryItem item={item} index={index} />;
  };

  const CategorySkeleton = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonImage} />
        <View style={styles.skeletonTextContainer}>
          <TextSkeleton width="70%" height={14} />
        </View>
      </View>
    </View>
  );

  const LoadingHeader = () => (
    <View>
      {/* Title Skeleton */}
      <View style={styles.header}>
        <TextSkeleton width="50%" height={28} />
        <View style={{ marginTop: Spacing.xs }}>
          <TextSkeleton width="80%" height={14} />
        </View>
      </View>

      {/* Search Bar Skeleton */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <View style={styles.skeletonSearchIcon} />
          <View style={{ flex: 1 }}>
            <TextSkeleton width="60%" height={16} />
          </View>
        </View>
      </View>

      {/* Filter Badges Skeleton */}
      <View style={styles.filtersSection}>
        <View style={styles.filtersList}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.skeletonFilterBadge}>
              <TextSkeleton width={80} height={14} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const ListHeader = () => (
    <View>
      {/* Title */}
      <View style={styles.header}>
        <Title level={2}>Catégories</Title>
        <Caption color="secondary" style={styles.subtitle}>
          Explorez nos produits par catégorie
        </Caption>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={Colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une catégorie..."
            placeholderTextColor={Colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={Colors.text.tertiary} />
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Badges */}
      <View style={styles.filtersSection}>
        <FlatList
          data={filterBadges}
          renderItem={renderFilterBadge}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
          keyExtractor={(item) => item.id}
        />
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <Container>
          <LoadingHeader />
          <View style={styles.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CategorySkeleton key={i} />
            ))}
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Container>
        <FlatList
          data={filteredCategories}
          renderItem={renderCategory}
          numColumns={2}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={<ListHeader />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <EmptyState
              icon="search"
              title="Aucune catégorie trouvée"
              description={`Aucune catégorie ne correspond à "${searchQuery}"`}
              variant="minimal"
            />
          }
        />
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    paddingVertical: Spacing.xl,
  },

  subtitle: {
    marginTop: Spacing.xs,
    fontSize: 14,
  },

  searchContainer: {
    marginBottom: Spacing.lg,
  },

  searchBar: {
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

  filtersSection: {
    marginBottom: Spacing.lg,
  },

  filtersList: {
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },

  filterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    gap: Spacing.xs,
  },

  filterBadgeActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  filterBadgeText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.secondary,
  },

  filterBadgeTextActive: {
    color: Colors.black,
    fontWeight: '600',
  },

  filterBadgeCount: {
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },

  filterBadgeCountActive: {
    backgroundColor: Colors.black,
  },

  filterCountText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.text.secondary,
  },

  filterCountTextActive: {
    color: Colors.white,
  },

  list: {
    paddingBottom: Spacing.xl,
  },

  row: {
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
  },

  categoryCard: {
    flex: 1,
    maxWidth: (width - Spacing.lg * 2 - Spacing.md) / 2,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.sm,
  },

  // Skeleton styles
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.sm,
  },

  skeletonContainer: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    marginHorizontal: Spacing.xs,
    marginVertical: Spacing.sm,
  },

  skeletonCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  skeletonImage: {
    width: '100%',
    height: 120,
    backgroundColor: Colors.gray[100],
  },

  skeletonTextContainer: {
    padding: Spacing.md,
  },

  skeletonSearchIcon: {
    width: 20,
    height: 20,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.gray[100],
  },

  skeletonFilterBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
});