/**
 * Admin Products & Gift Cards - Professional CRUD Management
 * Complete management interface with image upload and advanced filtering
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ImageUploader } from '@/components/admin/products/ImageUploader';
import { ProductFormModal } from '@/components/admin/products/ProductFormModal';
import { ProductListItem } from '@/components/admin/products/ProductListItem';
import { FloatingActionButton } from '@/components/ui/Buttons/FloatingActionButton';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { SearchInput } from '@/components/ui/Inputs/SearchInput';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { adminCategoriesService } from '@/services/adminCategoriesService';
import { adminGiftCardsService } from '@/services/adminGiftCardsService';
import { adminProductsService } from '@/services/adminProductsService';
import type { AdminGiftCard, AdminProduct } from '@/types/admin';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type ProductType = 'product' | 'gift_card';
type CombinedItem = (AdminProduct | AdminGiftCard) & { type: ProductType };
type FilterType = 'all' | 'product' | 'gift_card' | 'active' | 'inactive' | 'low_stock';

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function AdminProductsScreen() {
  // =======================
  // STATE
  // =======================
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [giftCards, setGiftCards] = useState<AdminGiftCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<ProductType>('product');
  const [editItem, setEditItem] = useState<CombinedItem | null>(null);

  // Pagination state
  const [productsPage, setProductsPage] = useState(1);
  const [giftCardsPage, setGiftCardsPage] = useState(1);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [hasMoreGiftCards, setHasMoreGiftCards] = useState(true);
  const ITEMS_PER_PAGE = 20;

  // =======================
  // COMPUTED DATA
  // =======================
  const combinedItems: CombinedItem[] = [
    ...products.map(p => ({ ...p, type: 'product' as const })),
    ...giftCards.map(gc => ({ ...gc, type: 'gift_card' as const })),
  ];

  const stats = {
    totalProducts: products.length,
    totalGiftCards: giftCards.length,
    activeItems: combinedItems.filter(i => i?.isActive).length,
    inactiveItems: combinedItems.filter(i => !i?.isActive).length,
    lowStock: products.filter(p => p && p?.stockQuantity != null && p.stockQuantity < 5 && p.stockQuantity > 0).length,
    outOfStock: products.filter(p => p && p?.stockQuantity != null && p.stockQuantity === 0).length,
  };

  const filteredItems = combinedItems.filter(item => {
    // Type filter
    if (activeFilter === 'product' && item.type !== 'product') return false;
    if (activeFilter === 'gift_card' && item.type !== 'gift_card') return false;
    if (activeFilter === 'active' && !item.isActive) return false;
    if (activeFilter === 'inactive' && item.isActive) return false;
    if (activeFilter === 'low_stock' && item.type === 'product') {
      const product = item as AdminProduct;
      if (product.stockQuantity == null || product.stockQuantity >= 5) return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const name = ((item as AdminProduct).name || (item as AdminGiftCard).title)?.toLowerCase() || '';
      const brand = (item as any).brand?.toLowerCase() || '';
      const sku = (item as AdminProduct).sku?.toLowerCase() || '';

      return name.includes(query) || brand.includes(query) || sku.includes(query);
    }

    return true;
  });

  // =======================
  // DATA LOADING
  // =======================
  const loadData = useCallback(async (isRefreshing = false) => {
    try {
      const [productsData, giftCardsData, categoriesData] = await Promise.all([
        adminProductsService.getAllProducts({ page: 1, limit: ITEMS_PER_PAGE }),
        adminGiftCardsService.getAllGiftCards({ page: 1, limit: ITEMS_PER_PAGE }),
        adminCategoriesService.getAllCategories(),
      ]);

      setProducts(productsData.data || []);
      setGiftCards(giftCardsData.data || []);
      setCategories(categoriesData || []);

      // Reset pagination
      setProductsPage(1);
      setGiftCardsPage(1);
      setHasMoreProducts((productsData.data || []).length >= ITEMS_PER_PAGE);
      setHasMoreGiftCards((giftCardsData.data || []).length >= ITEMS_PER_PAGE);
    } catch (error) {
      console.error('[Products] Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ITEMS_PER_PAGE]);

  const loadMoreProducts = useCallback(async () => {
    if (!hasMoreProducts || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = productsPage + 1;
      const productsData = await adminProductsService.getAllProducts({
        page: nextPage,
        limit: ITEMS_PER_PAGE,
      });

      if (productsData.data && productsData.data.length > 0) {
        setProducts(prev => [...prev, ...productsData.data]);
        setProductsPage(nextPage);
        setHasMoreProducts(productsData.data.length >= ITEMS_PER_PAGE);
      } else {
        setHasMoreProducts(false);
      }
    } catch (error) {
      console.error('[Products] Error loading more products:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMoreProducts, loadingMore, productsPage, ITEMS_PER_PAGE]);

  const loadMoreGiftCards = useCallback(async () => {
    if (!hasMoreGiftCards || loadingMore) return;

    setLoadingMore(true);
    try {
      const nextPage = giftCardsPage + 1;
      const giftCardsData = await adminGiftCardsService.getAllGiftCards({
        page: nextPage,
        limit: ITEMS_PER_PAGE,
      });

      if (giftCardsData.data && giftCardsData.data.length > 0) {
        setGiftCards(prev => [...prev, ...giftCardsData.data]);
        setGiftCardsPage(nextPage);
        setHasMoreGiftCards(giftCardsData.data.length >= ITEMS_PER_PAGE);
      } else {
        setHasMoreGiftCards(false);
      }
    } catch (error) {
      console.error('[Products] Error loading more gift cards:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMoreGiftCards, loadingMore, giftCardsPage, ITEMS_PER_PAGE]);

  const handleLoadMore = useCallback(() => {
    // Load more based on active filter
    if (activeFilter === 'product' || activeFilter === 'all') {
      if (hasMoreProducts && !loadingMore) {
        loadMoreProducts();
      }
    }
    if (activeFilter === 'gift_card' || activeFilter === 'all') {
      if (hasMoreGiftCards && !loadingMore) {
        loadMoreGiftCards();
      }
    }
  }, [activeFilter, hasMoreProducts, hasMoreGiftCards, loadingMore, loadMoreProducts, loadMoreGiftCards]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  // =======================
  // CRUD OPERATIONS
  // =======================
  const handleCreate = (type: ProductType) => {
    setFormType(type);
    setEditItem(null);
    setShowFormModal(true);
  };

  const handleEdit = (item: CombinedItem) => {
    console.log('[Products] Edit item clicked:', {
      id: item.id,
      type: item.type,
      price: (item as any).price,
      priceType: typeof (item as any).price,
      fullItem: JSON.stringify(item, null, 2)
    });
    setFormType(item.type);
    setEditItem(item);
    setShowFormModal(true);
  };

  const handleDelete = (item: CombinedItem) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${(item as any).name || (item as any).title} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              if (item.type === 'product') {
                await adminProductsService.deleteProduct(item.id);
                setProducts(prev => prev.filter(p => p.id !== item.id));
              } else {
                await adminGiftCardsService.deleteGiftCard(item.id);
                setGiftCards(prev => prev.filter(gc => gc.id !== item.id));
              }
              Alert.alert('Succès', 'Élément supprimé avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible de supprimer');
            }
          },
        },
      ]
    );
  };

  const handleToggleActive = async (item: CombinedItem) => {
    try {
      const newStatus = !item.isActive;

      if (item.type === 'product') {
        await adminProductsService.updateProduct(item.id, { isActive: newStatus });
        setProducts(prev =>
          prev.map(p => (p.id === item.id ? { ...p, isActive: newStatus } : p))
        );
      } else {
        await adminGiftCardsService.updateGiftCard(item.id, { isActive: newStatus });
        setGiftCards(prev =>
          prev.map(gc => (gc.id === item.id ? { ...gc, isActive: newStatus } : gc))
        );
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de modifier le statut');
    }
  };

  const handleFormSubmit = async (data: any, type: ProductType) => {
    try {
      if (editItem) {
        // Update
        if (type === 'product') {
          const updated = await adminProductsService.updateProduct(editItem.id, data);
          console.log('[Products] Updated product received:', updated);
          // Merge with existing product to preserve all fields
          setProducts(prev => prev.map(p => {
            if (p.id === editItem.id) {
              return { ...p, ...updated };
            }
            return p;
          }));
        } else {
          const updated = await adminGiftCardsService.updateGiftCard(editItem.id, data);
          console.log('[Products] Updated gift card received:', updated);
          // Merge with existing gift card to preserve all fields
          setGiftCards(prev => prev.map(gc => {
            if (gc.id === editItem.id) {
              return { ...gc, ...updated };
            }
            return gc;
          }));
        }
        Alert.alert('Succès', 'Élément mis à jour avec succès');
      } else {
        // Create
        if (type === 'product') {
          const created = await adminProductsService.createProduct(data);
          setProducts(prev => [created, ...prev]);
        } else {
          const created = await adminGiftCardsService.createGiftCard(data);
          setGiftCards(prev => [created, ...prev]);
        }
        Alert.alert('Succès', 'Élément créé avec succès');
      }

      setShowFormModal(false);
      setEditItem(null);
    } catch (error: any) {
      console.error('[Products] Form submit error:', error);
      throw error; // Let the modal handle it
    }
  };

  // =======================
  // RENDER HELPERS
  // =======================
  const renderStatCard = (
    icon: keyof typeof Ionicons.glyphMap,
    value: number,
    label: string,
    colors: string[],
    onPress?: () => void
  ) => (
    <Pressable
      style={[styles.statCard, { width: CARD_WIDTH }]}
      onPress={onPress}
    >
      <LinearGradient colors={colors} style={styles.statGradient}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon} size={20} color={Colors.white} />
        </View>
        <Title level={4} style={styles.statValue}>
          {value}
        </Title>
        <Caption style={styles.statLabel}>{label}</Caption>
      </LinearGradient>
    </Pressable>
  );

  const renderFilterButton = (filter: FilterType, label: string) => {
    const isActive = activeFilter === filter;
    return (
      <Pressable
        key={filter}
        style={[
          styles.filterButton,
          isActive && { backgroundColor: Colors.primary },
        ]}
        onPress={() => setActiveFilter(filter)}
      >
        <Caption style={[styles.filterText, isActive && styles.filterTextActive]}>
          {label}
        </Caption>
      </Pressable>
    );
  };

  const renderItem = ({ item }: { item: CombinedItem }) => (
    <ProductListItem
      item={item}
      onEdit={() => handleEdit(item)}
      onDelete={() => handleDelete(item)}
      onToggleActive={() => handleToggleActive(item)}
    />
  );

  // =======================
  // MAIN RENDER
  // =======================
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Paragraph style={styles.loadingText}>Chargement...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={filteredItems}
        keyExtractor={item => `${item.type}-${item.id}`}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {/* Header */}
            <View style={styles.header}>
              <Title level={2} style={styles.headerTitle}>
                Produits & Gift Cards
              </Title>
              <Paragraph style={styles.headerSubtitle}>
                {filteredItems.length} élément{filteredItems.length > 1 ? 's' : ''}
              </Paragraph>
            </View>

            {/* Stats */}
            <View style={styles.statsGrid}>
              {renderStatCard(
                'cube',
                stats.totalProducts,
                'Produits',
                ['#2196F3', '#1976D2'],
                () => setActiveFilter('product')
              )}
              {renderStatCard(
                'gift',
                stats.totalGiftCards,
                'Gift Cards',
                [Colors.primary, '#e5c535'],
                () => setActiveFilter('gift_card')
              )}
              {renderStatCard(
                'checkmark-circle',
                stats.activeItems,
                'Actifs',
                ['#4CAF50', '#388E3C'],
                () => setActiveFilter('active')
              )}
              {renderStatCard(
                'alert-circle',
                stats.lowStock,
                'Stock faible',
                ['#FF9800', '#F57C00'],
                () => setActiveFilter('low_stock')
              )}
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
              <SearchInput
                placeholder="Rechercher par nom, marque, SKU..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {renderFilterButton('all', 'Tous')}
                {renderFilterButton('product', 'Produits')}
                {renderFilterButton('gift_card', 'Gift Cards')}
                {renderFilterButton('active', 'Actifs')}
                {renderFilterButton('inactive', 'Inactifs')}
                {renderFilterButton('low_stock', 'Stock faible')}
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={
          <EmptyState
            icon="cube-outline"
            title="Aucun élément"
            description="Commencez par créer un produit ou une gift card"
          />
        }
        ListFooterComponent={
          <>
            {loadingMore && (
              <View style={styles.loadingMoreContainer}>
                <LoadingSpinner size="small" />
                <Caption style={styles.loadingMoreText}>Chargement...</Caption>
              </View>
            )}
            <View style={styles.bottomPadding} />
          </>
        }
      />

      {/* FAB */}
      <View style={styles.fabContainer}>
        <Pressable
          style={[styles.fab, { bottom: 0 }]}
          onPress={() => handleCreate('product')}
        >
          <Ionicons name="phone-portrait" size={20} color={Colors.white} />
          <Caption style={styles.fabLabel}>Produit</Caption>
        </Pressable>
        <Pressable
          style={styles.fab}
          onPress={() => handleCreate('gift_card')}
        >
          <Ionicons name="gift" size={20} color={Colors.white} />
          <Caption style={styles.fabLabel}>Gift Card</Caption>
        </Pressable>
      </View>

      {/* Form Modal */}
      <ProductFormModal
        visible={showFormModal}
        onClose={() => {
          setShowFormModal(false);
          setEditItem(null);
        }}
        onSubmit={handleFormSubmit}
        type={formType}
        editData={editItem || undefined}
        categories={categories}
      />
    </SafeAreaView>
  );
}

// =======================
// STYLES
// =======================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },

  listContent: {
    paddingHorizontal: Spacing.lg,
  },

  header: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  headerTitle: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  headerSubtitle: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  statCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  statGradient: {
    padding: Spacing.md,
    minHeight: 110,
  },

  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  statValue: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.white,
    fontSize: 24,
    marginBottom: 2,
  },

  statLabel: {
    fontFamily: 'Ubuntu_400Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
  },

  searchContainer: {
    marginBottom: Spacing.md,
  },

  filtersContainer: {
    marginBottom: Spacing.lg,
  },

  filterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    marginRight: Spacing.sm,
  },

  filterText: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  filterTextActive: {
    color: Colors.white,
  },

  bottomPadding: {
    height: 120,
  },

  loadingMoreContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    gap: Spacing.sm,
  },

  loadingMoreText: {
    color: Colors.text.secondary,
    fontFamily: 'Ubuntu_400Regular',
  },

  fabContainer: {
    position: 'absolute',
    bottom: 100,
    right: Spacing.lg,
    gap: Spacing.md,
  },

  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.full,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  fabLabel: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 12,
  },
});
