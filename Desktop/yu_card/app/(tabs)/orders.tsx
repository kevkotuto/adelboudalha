import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
  TextStyle,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Title, Paragraph, Caption } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Layout/Card';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import {
  useOrderStore,
  useOrders,
  useOrderStats,
  useOrdersLoading,
} from '@/stores/useOrderStore';
import { Order, OrderItem, OrderStatus as OrderStatusType } from '@/types';

type OrderStatus = 'all' | OrderStatusType;

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Order store
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const setStatusFilter = useOrderStore((state) => state.setStatusFilter);
  const clearFilters = useOrderStore((state) => state.clearFilters);

  const orders = useOrders();
  const stats = useOrderStats();
  const isLoading = useOrdersLoading();
  const error = useOrderStore((state) => state.error);
  const clearError = useOrderStore((state) => state.clearError);

  // Load orders on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchOrders();
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchOrders]);

  // Handle errors
  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [{ text: 'OK', onPress: () => clearError() }]);
    }
  }, [error]);

  // Handle status filter change with optimistic UI update
  const handleStatusChange = useCallback((status: OrderStatus) => {
    // Prevent redundant calls
    if (selectedStatus === status) return;

    setSelectedStatus(status);

    // Update filter in store and trigger fetch in one go
    if (status === 'all') {
      clearFilters();
    } else {
      setStatusFilter(status as OrderStatusType);
    }
  }, [selectedStatus, clearFilters, setStatusFilter]);

  // Memoize status filters to prevent recalculation on every render
  const statusFilters = useMemo<{ key: OrderStatus; label: string; color: string; count: number }[]>(() => [
    { key: 'all' as OrderStatus, label: t('common.all'), color: Colors.gray[500], count: stats.totalOrders },
    { key: 'PENDING' as OrderStatusType, label: t('orders.status.pending'), color: Colors.warning, count: stats.pendingOrders },
    { key: 'CONFIRMED' as OrderStatusType, label: t('orders.status.confirmed'), color: Colors.info, count: stats.confirmedOrders },
    { key: 'PROCESSING' as OrderStatusType, label: t('orders.status.processing'), color: Colors.primary, count: stats.processingOrders },
    { key: 'SHIPPED' as OrderStatusType, label: t('orders.status.shipped'), color: Colors.primary, count: stats.shippedOrders },
    { key: 'DELIVERED' as OrderStatusType, label: t('orders.status.delivered'), color: Colors.success, count: stats.deliveredOrders },
    { key: 'CANCELLED' as OrderStatusType, label: t('orders.status.cancelled'), color: Colors.error, count: stats.cancelledOrders },
  ], [t, stats]);

  // Memoize helper functions
  const getStatusColor = useCallback((status: string): string => {
    const filter = statusFilters.find(f => f.key === status);
    return filter?.color || Colors.gray[500];
  }, [statusFilters]);

  const getStatusIcon = useCallback((status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'PENDING': return 'time-outline';
      case 'CONFIRMED': return 'checkmark-circle-outline';
      case 'PROCESSING': return 'refresh-outline';
      case 'SHIPPED': return 'car-outline';
      case 'DELIVERED': return 'checkmark-done-circle';
      case 'CANCELLED': return 'close-circle-outline';
      case 'REFUNDED': return 'cash-outline';
      default: return 'ellipse-outline';
    }
  }, []);

  const getStatusLabel = useCallback((status: string): string => {
    switch (status) {
      case 'PENDING': return t('orders.status.pending');
      case 'CONFIRMED': return t('orders.status.confirmed');
      case 'PROCESSING': return t('orders.status.processing');
      case 'SHIPPED': return t('orders.status.shipped');
      case 'DELIVERED': return t('orders.status.delivered');
      case 'CANCELLED': return t('orders.status.cancelled');
      case 'REFUNDED': return 'Remboursée';
      default: return status;
    }
  }, [t]);

  const formatDate = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }, []);

  const formatAmount = useCallback((amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  }, []);

  const OrderCard = ({ order }: { order: Order }) => {
    // Get first item name or count
    // Backend may return 'orderItems' instead of 'items'
    const items = (order.items || (order as any).orderItems || []) as OrderItem[];
    const firstItemName = items[0]?.productName || 'Commande';
    const itemsCount = items.length;
    const displayName = itemsCount > 1
      ? `${firstItemName} +${itemsCount - 1} autre${itemsCount > 2 ? 's' : ''}`
      : firstItemName;

    return (
      <Pressable
        onPress={() => router.push(`/order/${order.id}`)}
        style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
      >
        <Card style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Title level={6} numberOfLines={1} style={styles.orderTitle}>
                {displayName}
              </Title>
              <Caption color="secondary">
                {t('orders.order_number')} {order.orderNumber}
              </Caption>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons
                name={getStatusIcon(order.status)}
                size={12}
                color={Colors.white}
                style={styles.statusIcon}
              />
              <Caption color="inverse" style={styles.statusText}>
                {getStatusLabel(order.status)}
              </Caption>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderRow}>
              <Caption color="secondary">{t('orders.order_date')}</Caption>
              <Caption>{formatDate(order.createdAt)}</Caption>
            </View>
            <View style={styles.orderRow}>
              <Caption color="secondary">{t('common.quantity')}</Caption>
              <Caption>{itemsCount} article{itemsCount > 1 ? 's' : ''}</Caption>
            </View>
            <View style={styles.orderRow}>
              <Caption color="secondary">{t('orders.order_total')}</Caption>
              <Paragraph size="small" style={styles.totalAmount}>
                {formatAmount(order.totalAmount)} {order.currency}
              </Paragraph>
            </View>
            <View style={styles.orderRow}>
              <Caption color="secondary">Paiement</Caption>
              <Caption>
                {order.paymentStatus === 'COMPLETED' ? '✓ Payé' : '⏳ En attente'}
              </Caption>
            </View>
            {order.tracking?.trackingNumber && (
              <View style={styles.orderRow}>
                <Caption color="secondary">{t('orders.tracking.number')}</Caption>
                <Caption>{order.tracking.trackingNumber}</Caption>
              </View>
            )}
          </View>

          <View style={styles.orderActions}>
            <View style={styles.actionButton}>
              <Ionicons name="eye-outline" size={16} color={Colors.primary} />
              <Caption color="accent" style={styles.actionText}>
                {t('orders.view_details')}
              </Caption>
            </View>
            {order.tracking && (
              <View style={styles.actionButton}>
                <Ionicons name="location-outline" size={16} color={Colors.primary} />
                <Caption color="accent" style={styles.actionText}>
                  {t('orders.track_order')}
                </Caption>
              </View>
            )}
          </View>
        </Card>
      </Pressable>
    );
  };

  // Show loading indicator
  if (isLoading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.screenContent}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Paragraph style={{ marginTop: Spacing.md }}>
              Chargement des commandes...
            </Paragraph>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.screenContent}>
        <View style={styles.header}>
          <Title level={2}>{t('orders.title')}</Title>
          {stats.totalOrders > 0 && (
            <Caption color="secondary">
              {stats.totalOrders} commande{stats.totalOrders > 1 ? 's' : ''}
            </Caption>
          )}
        </View>

        {/* Status Filters */}
        <View style={styles.filtersWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
            <View style={styles.filters}>
              {statusFilters.map((filter) => {
                const isActive = selectedStatus === filter.key;
                const isDisabled = isLoading || filter.count === 0;

                return (
                  <Pressable
                    key={filter.key}
                    style={({ pressed }) => [
                      styles.filterButton,
                      isActive && {
                        backgroundColor: filter.color,
                        borderColor: filter.color,
                      },
                      isDisabled && styles.filterButtonDisabled,
                      pressed && !isDisabled && styles.filterButtonPressed,
                    ]}
                    onPress={() => handleStatusChange(filter.key)}
                    disabled={isDisabled}
                  >
                    {isLoading && isActive && (
                      <ActivityIndicator
                        size="small"
                        color={Colors.white}
                        style={styles.filterLoader}
                      />
                    )}
                    <Paragraph
                      size="small"
                      color={isActive ? 'inverse' : 'secondary'}
                      style={
                        isDisabled && !isActive
                          ? StyleSheet.flatten([styles.filterText, styles.filterTextDisabled]) as TextStyle
                          : styles.filterText
                      }
                    >
                      {filter.label} ({filter.count})
                    </Paragraph>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Orders List */}
        {orders.length > 0 ? (
          <FlatList
            data={orders}
            renderItem={({ item }) => <OrderCard order={item} />}
            keyExtractor={(item) => item.id}
            style={styles.listContainer}
            contentContainerStyle={styles.ordersList}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor={Colors.primary}
                colors={[Colors.primary]}
              />
            }
          />
        ) : (
          <View style={styles.emptyContainer}>
            <EmptyState
              icon="bag-outline"
              title={
                selectedStatus === 'all'
                  ? t('orders.no_orders')
                  : 'Aucune commande'
              }
              description={
                selectedStatus === 'all'
                  ? 'Vous n\'avez pas encore passé de commande'
                  : `Aucune commande avec le statut "${statusFilters.find(f => f.key === selectedStatus)?.label}"`
              }
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  screenContent: {
    flex: 1,
    paddingHorizontal: Spacing.container.horizontal,
  },

  header: {
    paddingVertical: Spacing.lg,
  },

  filtersWrapper: {
    marginBottom: Spacing.lg,
    marginHorizontal: -Spacing.container.horizontal, // Compensate screen padding
  },

  filtersContainer: {
    flexGrow: 0,
  },

  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.container.horizontal,
  },

  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    flexDirection: 'row',
    alignItems: 'center',
  },

  filterText: {
    fontWeight: '600',
  },

  filterButtonDisabled: {
    opacity: 0.4,
  },

  filterButtonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  filterTextDisabled: {
    opacity: 0.5,
  },

  filterLoader: {
    marginRight: Spacing.xs,
  },

  listContainer: {
    flex: 1,
  },

  ordersList: {
    paddingBottom: Spacing.xl,
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['4xl'],
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  orderCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },

  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  orderInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },

  orderTitle: {
    marginBottom: Spacing.xs,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },

  statusIcon: {
    marginRight: Spacing.xs,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },

  orderDetails: {
    marginBottom: Spacing.md,
  },

  orderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  totalAmount: {
    fontWeight: '600',
    color: Colors.text.primary,
  },

  giftCardCode: {
    fontFamily: 'monospace',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },

  orderActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    paddingTop: Spacing.md,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  actionText: {
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },
});