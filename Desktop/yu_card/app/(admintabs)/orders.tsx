/**
 * Admin Orders - Gestion des commandes
 * Interface moderne en light mode connectée au backend Yu Card
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { SearchInput } from '@/components/ui/Inputs/SearchInput';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { InfoBox } from '@/components/ui/InfoBox';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { adminOrdersService } from '@/services/adminOrdersService';
import type { AdminOrder, AdminOrderItem, OrderStatus } from '@/types/admin';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type OrderStatusFilter = 'all' | OrderStatus;

interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
}

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<OrderStatusFilter>('all');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [giftCardCodes, setGiftCardCodes] = useState<Record<string, string>>({});
  const [assigningCodes, setAssigningCodes] = useState(false);
  const [manualCodeInput, setManualCodeInput] = useState<string>('');

  const statusFilters: { key: OrderStatusFilter; label: string; color: string; isPaymentFilter?: boolean }[] = [
    { key: 'all', label: 'Toutes', color: Colors.text.secondary },
    { key: 'PENDING', label: 'En attente', color: '#FF9800' },
    { key: 'CONFIRMED', label: 'Confirmées', color: '#2196F3' },
    { key: 'COMPLETED' as OrderStatusFilter, label: '💳 Payées', color: '#4CAF50', isPaymentFilter: true },
    { key: 'PROCESSING', label: 'En cours', color: '#9C27B0' },
    { key: 'SHIPPED', label: 'Expédiées', color: '#673AB7' },
    { key: 'DELIVERED', label: 'Livrées', color: '#4CAF50' },
    { key: 'CANCELLED', label: 'Annulées', color: '#f44336' },
  ];

  const loadOrders = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      // Loader partiel: plein écran seulement au premier chargement
      if (reset && page === 1 && orders.length === 0) {
        setLoading(true);
      } else if (page > 1) {
        setLoadingMore(true);
      }

      const params: any = {
        page,
        limit: 20,
      };

      if (selectedStatus !== 'all') {
        // Si le filtre est 'COMPLETED', c'est un filtre de paiement, pas de statut
        const filter = statusFilters.find(f => f.key === selectedStatus);
        if (filter?.isPaymentFilter) {
          params.paymentStatus = selectedStatus;
        } else {
          params.status = selectedStatus;
        }
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await adminOrdersService.getAllOrders(params);

      // response est déjà { orders: [], pagination: {} }
      const ordersData = response.orders || [];

      if (reset || page === 1) {
        setOrders(ordersData);
      } else {
        setOrders(prev => [...prev, ...ordersData]);
      }

      setHasMoreData(ordersData.length === 20);
      setCurrentPage(page);
    } catch (error) {
      console.error('[Orders] Error loading orders:', error);
      Alert.alert('Erreur', 'Impossible de charger les commandes');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [selectedStatus, searchQuery, orders.length]);

  useEffect(() => {
    loadOrders(1, true);
  }, [selectedStatus, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    loadOrders(1, true);
  }, [loadOrders]);

  const loadMoreOrders = useCallback(() => {
    if (hasMoreData && !loading && !loadingMore) {
      loadOrders(currentPage + 1);
    }
  }, [hasMoreData, loading, loadingMore, currentPage, loadOrders]);

  // Le filtrage est déjà fait côté backend via les params de la requête
  // Pas besoin de filtrage local supplémentaire

  const stats: OrderStats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'PENDING').length;
    const processingOrders = orders.filter(o => o.status === 'PROCESSING').length;
    const shippedOrders = orders.filter(o => o.status === 'SHIPPED').length;
    const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
    const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

    // Revenu total: uniquement les commandes avec paiement COMPLETED
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'COMPLETED')
      .reduce((sum, o) => sum + Number(o.totalAmount), 0);

    return {
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      totalRevenue,
    };
  }, [orders]);

  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminOrdersService.updateOrderStatus(orderId, newStatus);

      setOrders(prev =>
        prev.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

      Alert.alert('Succès', 'Statut de commande mis à jour');
    } catch (error) {
      console.error('[Orders] Error updating status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  }, [selectedOrder]);

  const confirmStatusUpdate = useCallback((orderId: string, newStatus: OrderStatus, orderNumber: string) => {
    const statusInfo = statusFilters.find(s => s.key === newStatus);

    Alert.alert(
      'Confirmer le changement',
      `Changer le statut de la commande ${orderNumber} vers "${statusInfo?.label}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => handleUpdateOrderStatus(orderId, newStatus),
        },
      ]
    );
  }, [handleUpdateOrderStatus, statusFilters]);

  // Marquer comme payé (pour paiements cash)
  const handleMarkAsPaid = useCallback(async (orderId: string) => {
    Alert.alert(
      'Confirmer le paiement',
      'Marquer cette commande comme payée (paiement cash) ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: async () => {
            try {
              const updatedOrder = await adminOrdersService.updatePaymentStatus(orderId, 'COMPLETED');

              // Refresh order details
              setSelectedOrder(updatedOrder);

              // Refresh orders list
              loadOrders(1, true);

              Alert.alert('Succès', 'Le paiement a été confirmé');
            } catch (error: any) {
              console.error('[Orders] Error marking as paid:', error);
              Alert.alert('Erreur', error?.message || 'Impossible de confirmer le paiement');
            }
          },
        },
      ]
    );
  }, [loadOrders]);

  // Option A: Attribution automatique depuis l'inventory
  const handleAutoAssignCodes = useCallback(async (orderId: string) => {
    try {
      setAssigningCodes(true);
      const result = await adminOrdersService.assignCodes(orderId);

      if (result.errors.length > 0) {
        // Certains codes n'ont pas pu être assignés
        const errorMessages = result.errors.map(
          (err) => `${err.giftCard}: besoin de ${err.needed} codes, seulement ${err.available} disponibles`
        ).join('\n\n');

        Alert.alert(
          'Stock insuffisant',
          `Impossible d'attribuer tous les codes:\n\n${errorMessages}`,
          [
            {
              text: 'Saisir manuellement',
              onPress: () => {
                // User can now use manual input below
              }
            },
            {
              text: 'Importer des codes',
              onPress: () => {
                // TODO: Navigate to gift-codes screen
                Alert.alert('Info', 'Allez dans l\'onglet "Codes Gift Cards" pour importer des codes');
              }
            },
            { text: 'OK', style: 'cancel' }
          ]
        );
      } else {
        Alert.alert('Succès', 'Tous les codes ont été assignés avec succès');
      }

      // Refresh order details
      if (selectedOrder) {
        const refreshedOrder = await adminOrdersService.getOrderDetails(orderId);

        // 🔍 DEBUG: Vérifier les codes reçus
        console.log('=== REFRESHED ORDER AFTER AUTO-ASSIGN ===');
        refreshedOrder.items.forEach((item, idx) => {
          console.log(`Item ${idx}: ${item.productName} (${item.productType})`);
          console.log(`  Quantity: ${item.quantity}`);
          console.log(`  giftCardCodes:`, item.giftCardCodes);
          console.log(`  Codes count:`, item.giftCardCodes?.length || 0);
          if (item.giftCardCodes && item.giftCardCodes.length > 0) {
            item.giftCardCodes.forEach((code, cIdx) => {
              console.log(`    Code ${cIdx + 1}: ${code.code} (${code.status})`);
            });
          }
        });

        setSelectedOrder(refreshedOrder);

        // Rafraîchir aussi la liste pour que la prochaine ouverture ait les codes
        loadOrders(currentPage, false);
      }
    } catch (error: any) {
      console.error('[Orders] Error auto-assigning codes:', error);
      Alert.alert(
        'Erreur',
        error?.message || 'Impossible d\'attribuer les codes automatiquement',
        [
          {
            text: 'Réessayer',
            onPress: () => handleAutoAssignCodes(orderId)
          },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
    } finally {
      setAssigningCodes(false);
    }
  }, [selectedOrder]);

  // Option B: Saisie manuelle code par code
  const handleManualAssignCode = useCallback(async (orderItemId: string, code: string) => {
    if (!code.trim()) {
      Alert.alert('Erreur', 'Veuillez saisir un code');
      return;
    }

    try {
      setAssigningCodes(true);
      const result = await adminOrdersService.assignManualCode(orderItemId, code.trim());

      if (result.itemComplete) {
        Alert.alert(
          'Code assigné',
          `${result.totalAssigned}/${result.totalRequired} codes assignés.\n\nTous les codes de cet item sont assignés !`
        );
      } else {
        Alert.alert(
          'Code assigné',
          `${result.totalAssigned}/${result.totalRequired} codes assignés.\n\nEncore ${result.remaining} code(s) à assigner.`
        );
      }

      // Clear input and refresh order
      setManualCodeInput('');
      if (selectedOrder) {
        const refreshedOrder = await adminOrdersService.getOrderDetails(selectedOrder.id);

        // 🔍 DEBUG: Vérifier les codes reçus
        console.log('=== REFRESHED ORDER AFTER MANUAL ASSIGN ===');
        refreshedOrder.items.forEach((item, idx) => {
          console.log(`Item ${idx}: ${item.productName} (${item.productType})`);
          console.log(`  Quantity: ${item.quantity}`);
          console.log(`  giftCardCodes:`, item.giftCardCodes);
          console.log(`  Codes count:`, item.giftCardCodes?.length || 0);
        });

        setSelectedOrder(refreshedOrder);

        // Rafraîchir aussi la liste
        loadOrders(currentPage, false);
      }
    } catch (error: any) {
      console.error('[Orders] Error manually assigning code:', error);
      Alert.alert('Erreur', error?.message || 'Impossible d\'assigner le code');
    } finally {
      setAssigningCodes(false);
    }
  }, [selectedOrder]);

  const getStatusColor = (status: OrderStatus): string => {
    const filter = statusFilters.find(f => f.key === status);
    return filter?.color || Colors.text.secondary;
  };

  const getStatusIcon = (status: OrderStatus): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'PENDING': return 'time-outline';
      case 'CONFIRMED': return 'checkmark-outline';
      case 'PROCESSING': return 'sync-outline';
      case 'SHIPPED': return 'airplane-outline';
      case 'DELIVERED': return 'checkmark-circle-outline';
      case 'CANCELLED': return 'close-circle-outline';
      default: return 'ellipse-outline';
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const OrderCard = ({ order }: { order: AdminOrder }) => {
    const statusInfo = statusFilters.find(s => s.key === order.status);

    return (
      <Pressable
        style={styles.orderCard}
        onPress={() => {
          // 🔍 DEBUG: Vérifier les codes lors de l'ouverture
          console.log('=== OPENING ORDER DETAILS ===');
          console.log('Order:', order.orderNumber);
          order.items.forEach((item, idx) => {
            if (item.productType === 'GIFT_CARD') {
              console.log(`Item ${idx}: ${item.productName}`);
              console.log(`  giftCardCodes:`, item.giftCardCodes);
              console.log(`  Codes count:`, item.giftCardCodes?.length || 0);
            }
          });

          setSelectedOrder(order);
          setShowDetailsModal(true);
        }}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Title level={6} style={styles.orderNumber}>
              {order.orderNumber}
            </Title>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons
                name={getStatusIcon(order.status)}
                size={12}
                color={Colors.white}
                style={styles.statusIcon}
              />
              <Caption style={styles.statusText}>{statusInfo?.label}</Caption>
            </View>
          </View>
          <Paragraph style={styles.orderAmount}>
            {formatCurrency(Number(order.totalAmount))}
          </Paragraph>
        </View>

        <View style={styles.orderDetails}>
          <View style={styles.orderRow}>
            <Ionicons name="person-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.orderDetailText}>{order.user.fullName}</Caption>
          </View>
          <View style={styles.orderRow}>
            <Ionicons name="call-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.orderDetailText}>{order.user.phone}</Caption>
          </View>
          <View style={styles.orderRow}>
            <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.orderDetailText}>{formatDate(order.createdAt)}</Caption>
          </View>
          <View style={styles.orderRow}>
            <Ionicons name="cube-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.orderDetailText}>
              {order.items.length} article{order.items.length > 1 ? 's' : ''}
            </Caption>
          </View>
        </View>

        <View style={styles.orderActions}>
          <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Paragraph style={styles.loadingText}>Chargement des commandes...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasMoreData && !loading && !loadingMore) {
            loadMoreOrders();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Header */}
        <View style={styles.header}>
          <Title level={2} style={styles.headerTitle}>Commandes</Title>
          <Paragraph color="secondary" style={styles.headerSubtitle}>
            {orders.length} commande{orders.length > 1 ? 's' : ''} trouvée{orders.length > 1 ? 's' : ''}
          </Paragraph>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="cash" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>
                {formatCurrency(stats.totalRevenue)}
              </Title>
              <Caption style={styles.statLabel}>Revenu total</Caption>
            </LinearGradient>
          </View>

          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#FF9800', '#F57C00']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="time" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{stats.pendingOrders}</Title>
              <Caption style={styles.statLabel}>En attente</Caption>
            </LinearGradient>
          </View>

          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="sync" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{stats.processingOrders}</Title>
              <Caption style={styles.statLabel}>En cours</Caption>
            </LinearGradient>
          </View>

          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#4CAF50', '#388E3C']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{stats.deliveredOrders}</Title>
              <Caption style={styles.statLabel}>Livrées</Caption>
            </LinearGradient>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Rechercher par numéro, client, téléphone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusFilters.map((filter) => (
              <Pressable
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedStatus === filter.key && {
                    backgroundColor: filter.color,
                  },
                ]}
                onPress={() => setSelectedStatus(filter.key)}
              >
                <Paragraph
                  size="small"
                  style={
                    selectedStatus === filter.key
                      ? { ...styles.filterText, ...styles.filterTextActive }
                      : styles.filterText
                  }
                >
                  {filter.label}
                </Paragraph>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          {orders.length > 0 ? (
            <>
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} />
              ))}
              {loadingMore && (
                <View style={styles.loadingMore}>
                  <LoadingSpinner size="small" />
                  <Caption style={styles.loadingMoreText}>Chargement...</Caption>
                </View>
              )}
            </>
          ) : (
            <EmptyState
              title="Aucune commande"
              description="Aucune commande ne correspond à vos critères"
              icon="receipt-outline"
            />
          )}
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Order Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Title level={3}>Détails de la commande</Title>
            <Pressable onPress={() => setShowDetailsModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          {selectedOrder && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Order Info */}
              <View style={styles.modalSection}>
                <View style={styles.modalSectionHeader}>
                  <Title level={5}>Informations</Title>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Ionicons
                      name={getStatusIcon(selectedOrder.status)}
                      size={12}
                      color={Colors.white}
                      style={styles.statusIcon}
                    />
                    <Caption style={styles.statusText}>
                      {statusFilters.find(s => s.key === selectedOrder.status)?.label}
                    </Caption>
                  </View>
                </View>

                <View style={styles.infoRow}>
                  <Caption style={styles.infoLabel}>Numéro de commande</Caption>
                  <Paragraph style={styles.infoValue}>{selectedOrder.orderNumber}</Paragraph>
                </View>
                <View style={styles.infoRow}>
                  <Caption style={styles.infoLabel}>Date de commande</Caption>
                  <Paragraph style={styles.infoValue}>{formatDate(selectedOrder.createdAt)}</Paragraph>
                </View>
                <View style={styles.infoRow}>
                  <Caption style={styles.infoLabel}>Montant total</Caption>
                  <Paragraph style={styles.infoValue}>{formatCurrency(Number(selectedOrder.totalAmount))}</Paragraph>
                </View>
                <View style={styles.infoRow}>
                  <Caption style={styles.infoLabel}>Statut de paiement</Caption>
                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor:
                          selectedOrder.paymentStatus === 'COMPLETED'
                            ? '#4CAF50'
                            : selectedOrder.paymentStatus === 'PENDING'
                            ? '#FF9800'
                            : selectedOrder.paymentStatus === 'FAILED'
                            ? '#f44336'
                            : Colors.text.secondary,
                      },
                    ]}
                  >
                    <Caption style={styles.statusText}>
                      {selectedOrder.paymentStatus === 'COMPLETED'
                        ? '💳 Payée'
                        : selectedOrder.paymentStatus === 'PENDING'
                        ? '⏳ En attente'
                        : selectedOrder.paymentStatus === 'FAILED'
                        ? '❌ Échoué'
                        : selectedOrder.paymentStatus}
                    </Caption>
                  </View>
                </View>

                {/* Bouton pour marquer comme payé si paiement en attente */}
                {selectedOrder.paymentStatus !== 'COMPLETED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onPress={() => handleMarkAsPaid(selectedOrder.id)}
                    style={{ marginTop: Spacing.sm }}
                  >
                    💵 Marquer comme payé (Cash)
                  </Button>
                )}
              </View>

              {/* Customer Info */}
              {selectedOrder.user && (
                <View style={styles.modalSection}>
                  <Title level={5} style={styles.modalSectionTitle}>Client</Title>
                  <View style={styles.infoRow}>
                    <Caption style={styles.infoLabel}>Nom</Caption>
                    <Paragraph style={styles.infoValue}>{selectedOrder.user.fullName}</Paragraph>
                  </View>
                  <View style={styles.infoRow}>
                    <Caption style={styles.infoLabel}>Téléphone</Caption>
                    <Paragraph style={styles.infoValue}>{selectedOrder.user.phone}</Paragraph>
                  </View>
                </View>
              )}

              {/* Items */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <View style={styles.modalSection}>
                  <Title level={5} style={styles.modalSectionTitle}>
                    Articles ({selectedOrder.items.length})
                  </Title>
                  {selectedOrder.items.map((item, index) => (
                  <View key={index}>
                    <View style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <View style={styles.itemNameRow}>
                          <Paragraph style={styles.itemName}>{item.productName}</Paragraph>
                          {item.productType === 'GIFT_CARD' && (
                            <View style={styles.giftCardBadge}>
                              <Ionicons name="gift" size={10} color={Colors.white} />
                              <Caption style={styles.giftCardBadgeText}>Gift Card</Caption>
                            </View>
                          )}
                        </View>
                        <Caption style={styles.itemDetails}>
                          Quantité: {item.quantity} × {formatCurrency(Number(item.unitPrice))}
                        </Caption>
                      </View>
                      <Paragraph style={styles.itemTotal}>
                        {formatCurrency(Number(item.totalPrice))}
                      </Paragraph>
                    </View>

                    {/* Gift Card Codes Management - Dual Workflow */}
                    {item.productType === 'GIFT_CARD' && selectedOrder.paymentStatus === 'COMPLETED' && (
                      <View style={styles.giftCardCodeContainer}>
                        {/* Codes déjà assignés */}
                        {item.giftCardCodes && item.giftCardCodes.length > 0 ? (
                          <View style={styles.giftCodeDistributed}>
                            <View style={styles.giftCodeHeader}>
                              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                              <Caption style={styles.giftCodeDistributedLabel}>
                                {item.giftCardCodes.length}/{item.quantity} code(s) assigné(s)
                              </Caption>
                            </View>
                            {item.giftCardCodes.map((code, idx) => (
                              <View key={code.id || idx} style={styles.giftCodeValue}>
                                <View style={styles.giftCodeRow}>
                                  <Paragraph style={styles.giftCodeText}>
                                    Code {idx + 1}: {code.code}
                                  </Paragraph>
                                  <View
                                    style={[
                                      styles.giftCodeStatusBadge,
                                      { backgroundColor: code.status === 'ACTIVE' ? '#4CAF50' : '#9E9E9E' },
                                    ]}
                                  >
                                    <Caption style={styles.giftCodeStatusText}>{code.status}</Caption>
                                  </View>
                                </View>
                                {code.activationDate && (
                                  <Caption style={styles.giftCodeDate}>
                                    Activé le {formatDate(code.activationDate)}
                                  </Caption>
                                )}
                              </View>
                            ))}

                            {/* Si tous les codes ne sont pas encore assignés */}
                            {item.giftCardCodes.length < item.quantity && (
                              <View style={styles.giftCodeInput}>
                                <Caption style={styles.giftCodeInputLabel}>
                                  ⏳ {item.quantity - item.giftCardCodes.length} code(s) restant(s) à assigner
                                </Caption>
                                <TextInput
                                  style={styles.giftCodeTextInput}
                                  placeholder="Saisir un code..."
                                  value={manualCodeInput}
                                  onChangeText={setManualCodeInput}
                                  autoCapitalize="characters"
                                  editable={!assigningCodes}
                                />
                                <Button
                                  variant="primary"
                                  size="sm"
                                  loading={assigningCodes}
                                  disabled={!manualCodeInput.trim() || assigningCodes}
                                  onPress={() => handleManualAssignCode(item.id, manualCodeInput)}
                                >
                                  Valider le code
                                </Button>
                              </View>
                            )}

                            {item.giftCardCodes.length === item.quantity && (
                              <Caption style={styles.giftCodeCompleteText}>
                                ✅ Tous les codes sont assignés et le client a été notifié
                              </Caption>
                            )}
                          </View>
                        ) : (
                          // Aucun code assigné - Afficher les 2 options
                          <View style={styles.giftCodeInput}>
                            <View style={styles.giftCodeInputHeader}>
                              <Ionicons name="alert-circle-outline" size={16} color="#FF9800" />
                              <Caption style={styles.giftCodeInputLabel}>
                                ⚠️ {item.quantity} code(s) à attribuer
                              </Caption>
                            </View>

                            <InfoBox
                              type="info"
                              message="Astuce: Importez d'abord des codes dans l'onglet 'Codes Gift Cards' pour une attribution automatique rapide."
                            />

                            {/* Attribution automatique depuis l'inventory */}
                            <Button
                              variant="primary"
                              size="sm"
                              loading={assigningCodes}
                              disabled={assigningCodes}
                              onPress={() => handleAutoAssignCodes(selectedOrder.id)}
                              style={styles.assignButton}
                            >
                              Attribuer depuis l'inventory
                            </Button>

                            <View style={styles.dividerWithText}>
                              <View style={styles.dividerLine} />
                              <Caption style={styles.dividerText}>OU</Caption>
                              <View style={styles.dividerLine} />
                            </View>

                            {/* Saisie manuelle */}
                            <TextInput
                              style={styles.giftCodeTextInput}
                              placeholder="Entrez le code 1..."
                              value={manualCodeInput}
                              onChangeText={setManualCodeInput}
                              autoCapitalize="characters"
                              editable={!assigningCodes}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              loading={assigningCodes}
                              disabled={!manualCodeInput.trim() || assigningCodes}
                              onPress={() => handleManualAssignCode(item.id, manualCodeInput)}
                              style={styles.assignButton}
                            >
                              Saisir manuellement
                            </Button>
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                  ))}
                </View>
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                {selectedOrder.status === 'PENDING' && (
                  <Button
                    variant="primary"
                    onPress={() => confirmStatusUpdate(selectedOrder.id, 'CONFIRMED', selectedOrder.orderNumber)}
                  >
                    Confirmer la commande
                  </Button>
                )}
                {selectedOrder.status === 'CONFIRMED' && (
                  <Button
                    variant="primary"
                    onPress={() => confirmStatusUpdate(selectedOrder.id, 'PROCESSING', selectedOrder.orderNumber)}
                  >
                    Marquer en cours
                  </Button>
                )}
                {selectedOrder.status === 'PROCESSING' && (
                  <Button
                    variant="primary"
                    onPress={() => confirmStatusUpdate(selectedOrder.id, 'SHIPPED', selectedOrder.orderNumber)}
                  >
                    Marquer comme expédiée
                  </Button>
                )}
                {selectedOrder.status === 'SHIPPED' && (
                  <Button
                    variant="primary"
                    onPress={() => confirmStatusUpdate(selectedOrder.id, 'DELIVERED', selectedOrder.orderNumber)}
                  >
                    Marquer comme livrée
                  </Button>
                )}
                {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'CONFIRMED' || selectedOrder.status === 'PROCESSING') && (
                  <Button
                    variant="outline"
                    onPress={() => confirmStatusUpdate(selectedOrder.id, 'CANCELLED', selectedOrder.orderNumber)}
                  >
                    Annuler la commande
                  </Button>
                )}
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },

  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },

  header: {
    paddingHorizontal: Spacing.lg,
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
    fontSize: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
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
    fontSize: 18,
    marginBottom: 2,
  },

  statLabel: {
    fontFamily: 'Ubuntu_400Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
  },

  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },

  filtersContainer: {
    paddingHorizontal: Spacing.lg,
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
  },

  filterTextActive: {
    color: Colors.white,
  },

  ordersContainer: {
    paddingHorizontal: Spacing.lg,
  },

  orderCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
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

  orderNumber: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },

  statusIcon: {
    marginRight: 4,
  },

  statusText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 10,
  },

  orderAmount: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    fontSize: 16,
  },

  orderDetails: {
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },

  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  orderDetailText: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  orderActions: {
    alignItems: 'flex-end',
  },

  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },

  loadingMoreText: {
    marginTop: Spacing.sm,
    color: Colors.text.secondary,
  },

  bottomPadding: {
    height: 120,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  modalSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  modalSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  modalSectionTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  infoLabel: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  infoValue: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
  },

  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  itemInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },

  itemName: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.primary,
    marginBottom: 2,
  },

  itemDetails: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 11,
  },

  itemTotal: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
  },

  modalActions: {
    gap: Spacing.md,
    marginVertical: Spacing.xl,
  },

  // Gift Card Code Styles
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: 2,
  },

  giftCardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    backgroundColor: Colors.primary,
    gap: 3,
  },

  giftCardBadgeText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 9,
  },

  giftCardCodeContainer: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.secondary,
  },

  giftCodeDistributed: {
    backgroundColor: '#e8f5e9',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },

  giftCodeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },

  giftCodeDistributedLabel: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: '#4CAF50',
    fontSize: 12,
  },

  giftCodeValue: {
    gap: 4,
  },

  giftCodeText: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    fontSize: 16,
    letterSpacing: 1,
  },

  giftCodeDate: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 11,
  },

  giftCodeInput: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    gap: Spacing.sm,
  },

  giftCodeInputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  giftCodeInputLabel: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  giftCodeTextInput: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontFamily: 'Ubuntu_500Medium',
    fontSize: 14,
    color: Colors.text.primary,
  },

  // New dual workflow styles
  giftCodeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  giftCodeStatusBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },

  giftCodeStatusText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 9,
  },

  giftCodeCompleteText: {
    fontFamily: 'Ubuntu_500Medium',
    color: '#4CAF50',
    fontSize: 12,
    marginTop: Spacing.sm,
    textAlign: 'center',
  },

  assignmentOption: {
    gap: Spacing.sm,
  },

  assignmentOptionTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    fontSize: 13,
  },

  assignmentOptionDesc: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 11,
  },

  assignButton: {
    marginTop: Spacing.xs,
  },

  dividerWithText: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.primary,
  },

  dividerText: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.secondary,
    fontSize: 11,
    marginHorizontal: Spacing.sm,
  },
});
