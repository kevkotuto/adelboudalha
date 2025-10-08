/**
 * Admin Dashboard - Vue d'ensemble
 * Interface moderne connectée au backend Yu Card
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { adminOrdersService } from '@/services/adminOrdersService';
import { adminService } from '@/services/adminService';
import type { AdminOrder, DashboardStats, OrderStatus } from '@/types/admin';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function AdminDashboardScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const loadDashboardStats = useCallback(async () => {
    try {
      const rawData = await adminService.getDashboardStats({ period: selectedPeriod });

      // Transform string numbers to actual numbers (backend returns strings for BigInt)
      const transformedData: DashboardStats = {
        ...rawData,
        overview: {
          totalUsers: Number(rawData.overview.totalUsers),
          totalOrders: Number(rawData.overview.totalOrders),
          totalRevenue: Number(rawData.overview.totalRevenue),
          totalProducts: Number(rawData.overview.totalProducts),
          totalGiftCards: Number(rawData.overview.totalGiftCards),
          averageOrderValue: Number(rawData.overview.averageOrderValue),
        },
        recentActivity: {
          ...rawData.recentActivity,
          pendingOrders: rawData.recentActivity.pendingOrders
            .map(order => ({
              ...order,
              totalAmount: Number(order.totalAmount),
            }))
            // Trier: CONFIRMED en premier, puis PENDING, puis le reste
            .sort((a, b) => {
              const statusPriority: Record<string, number> = {
                'CONFIRMED': 1,
                'PENDING': 2,
                'PROCESSING': 3,
                'SHIPPED': 4,
                'DELIVERED': 5,
                'CANCELLED': 6,
              };
              return (statusPriority[a.status] || 99) - (statusPriority[b.status] || 99);
            }),
          lowStockProducts: rawData.recentActivity.lowStockProducts.map(product => ({
            ...product,
            price: Number(product.price),
            stockQuantity: Number(product.stockQuantity),
          })),
        },
      };

      setStats(transformedData);
    } catch (error) {
      console.error('[Dashboard] Error:', error);
      Alert.alert('Erreur', 'Impossible de charger les statistiques');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDashboardStats();
  }, [loadDashboardStats]);

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
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

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'PENDING': return '#FF9800';
      case 'CONFIRMED': return '#2196F3';
      case 'PROCESSING': return '#9C27B0';
      case 'SHIPPED': return '#673AB7';
      case 'DELIVERED': return '#4CAF50';
      case 'CANCELLED': return '#f44336';
      case 'REFUNDED': return '#795548';
      default: return Colors.text.secondary;
    }
  };

  const getStatusIcon = (status: OrderStatus): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'PENDING': return 'time-outline';
      case 'CONFIRMED': return 'checkmark-outline';
      case 'PROCESSING': return 'sync-outline';
      case 'SHIPPED': return 'airplane-outline';
      case 'DELIVERED': return 'checkmark-circle-outline';
      case 'CANCELLED': return 'close-circle-outline';
      case 'REFUNDED': return 'arrow-undo-outline';
      default: return 'ellipse-outline';
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'CONFIRMED': return 'Confirmée';
      case 'PROCESSING': return 'En cours';
      case 'SHIPPED': return 'Expédiée';
      case 'DELIVERED': return 'Livrée';
      case 'CANCELLED': return 'Annulée';
      case 'REFUNDED': return 'Remboursée';
      default: return status;
    }
  };

  const handleUpdateOrderStatus = useCallback(async (orderId: string, newStatus: OrderStatus) => {
    try {
      await adminOrdersService.updateOrderStatus(orderId, newStatus);

      // Mise à jour locale
      if (stats) {
        const updatedOrders = stats.recentActivity.pendingOrders.map(order =>
          order.id === orderId ? { ...order, status: newStatus } : order
        );
        setStats({
          ...stats,
          recentActivity: {
            ...stats.recentActivity,
            pendingOrders: updatedOrders,
          },
        });
      }

      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
      }

      Alert.alert('Succès', 'Statut de commande mis à jour');
    } catch (error) {
      console.error('[Dashboard] Error updating status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  }, [stats, selectedOrder]);

  const confirmStatusUpdate = useCallback((orderId: string, newStatus: OrderStatus, orderNumber: string) => {
    Alert.alert(
      'Confirmer le changement',
      `Changer le statut de la commande ${orderNumber} vers "${getStatusLabel(newStatus)}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => handleUpdateOrderStatus(orderId, newStatus),
        },
      ]
    );
  }, [handleUpdateOrderStatus]);

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

  if (!stats) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="analytics-outline" size={64} color={Colors.text.secondary} />
          <Title level={4} style={styles.emptyTitle}>Aucune donnée</Title>
          <Paragraph style={styles.emptyText}>Impossible de charger les statistiques</Paragraph>
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Title level={2} style={styles.headerTitle}>Dashboard</Title>
          <Paragraph color="secondary" style={styles.headerSubtitle}>
            Vue d'ensemble de votre activité
          </Paragraph>
        </View>

        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {(['day', 'week', 'month', 'year'] as const).map((period) => (
              <Pressable
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Paragraph
                  size="small"
                  style={[
                    styles.periodText,
                    selectedPeriod === period && styles.periodTextActive,
                  ]}
                >
                  {period === 'day' && 'Aujourd\'hui'}
                  {period === 'week' && 'Cette semaine'}
                  {period === 'month' && 'Ce mois'}
                  {period === 'year' && 'Cette année'}
                </Paragraph>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {/* Revenue Card */}
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient
              colors={['#4CAF50', '#45a049']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="cash" size={24} color={Colors.white} />
              </View>
              <Title level={4} style={styles.statValue}>
                {formatCurrency(stats.overview.totalRevenue)}
              </Title>
              <Caption style={styles.statLabel}>Revenu total</Caption>
            </LinearGradient>
          </View>

          {/* Orders Card */}
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient
              colors={[Colors.primary, '#e5c535']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="receipt" size={24} color={Colors.white} />
              </View>
              <Title level={4} style={styles.statValue}>
                {formatNumber(stats.overview.totalOrders)}
              </Title>
              <Caption style={styles.statLabel}>Commandes</Caption>
            </LinearGradient>
          </View>

          {/* Users Card */}
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={24} color={Colors.white} />
              </View>
              <Title level={4} style={styles.statValue}>
                {formatNumber(stats.overview.totalUsers)}
              </Title>
              <Caption style={styles.statLabel}>Utilisateurs</Caption>
            </LinearGradient>
          </View>

          {/* Average Order Value Card */}
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient
              colors={['#9C27B0', '#7B1FA2']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="trending-up" size={24} color={Colors.white} />
              </View>
              <Title level={4} style={styles.statValue}>
                {formatCurrency(stats.overview.averageOrderValue)}
              </Title>
              <Caption style={styles.statLabel}>Panier moyen</Caption>
            </LinearGradient>
          </View>

          {/* Products Card */}
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="cube" size={24} color={Colors.white} />
              </View>
              <Title level={4} style={styles.statValue}>
                {formatNumber(stats.overview.totalProducts)}
              </Title>
              <Caption style={styles.statLabel}>Produits</Caption>
            </LinearGradient>
          </View>

          {/* Gift Cards Card */}
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient
              colors={['#E91E63', '#C2185B']}
              style={styles.statGradient}
            >
              <View style={styles.statIconContainer}>
                <Ionicons name="gift" size={24} color={Colors.white} />
              </View>
              <Title level={4} style={styles.statValue}>
                {formatNumber(stats.overview.totalGiftCards)}
              </Title>
              <Caption style={styles.statLabel}>Gift Cards</Caption>
            </LinearGradient>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Title level={4} style={styles.sectionTitle}>Activité récente</Title>

          {/* Pending Orders */}
          {stats.recentActivity.pendingOrders.length > 0 && (
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleRow}>
                  <View style={[styles.activityIconBadge, { backgroundColor: '#FF9800' }]}>
                    <Ionicons name="time" size={16} color={Colors.white} />
                  </View>
                  <Title level={5} style={styles.activityTitle}>
                    Commandes en attente
                  </Title>
                </View>
                <View style={styles.activityBadge}>
                  <Caption style={styles.activityBadgeText}>
                    {stats.recentActivity.pendingOrders.length}
                  </Caption>
                </View>
              </View>

              {stats.recentActivity.pendingOrders.slice(0, 5).map((order, index) => (
                <Pressable
                  key={order.id}
                  style={[
                    styles.listItem,
                    index === 0 && styles.listItemFirst,
                  ]}
                  onPress={() => {
                    setSelectedOrder(order);
                    setShowDetailsModal(true);
                  }}
                >
                  <View style={styles.listItemLeft}>
                    <View style={styles.orderNumberRow}>
                      <Paragraph style={styles.listItemTitle}>
                        {order.orderNumber}
                      </Paragraph>
                      <View style={[styles.orderStatusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                        <Ionicons
                          name={getStatusIcon(order.status)}
                          size={10}
                          color={Colors.white}
                          style={{ marginRight: 3 }}
                        />
                        <Caption style={styles.orderStatusText}>{getStatusLabel(order.status)}</Caption>
                      </View>
                    </View>
                    <Caption style={styles.listItemSubtitle}>
                      {order.user.fullName}
                    </Caption>
                  </View>
                  <View style={styles.listItemRight}>
                    <Paragraph style={styles.listItemValue}>
                      {formatCurrency(order.totalAmount)}
                    </Paragraph>
                    <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} style={{ marginTop: 4 }} />
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {/* Low Stock Products */}
          {stats.recentActivity.lowStockProducts.length > 0 && (
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleRow}>
                  <View style={[styles.activityIconBadge, { backgroundColor: '#f44336' }]}>
                    <Ionicons name="warning" size={16} color={Colors.white} />
                  </View>
                  <Title level={5} style={styles.activityTitle}>
                    Stock faible
                  </Title>
                </View>
                <View style={[styles.activityBadge, { backgroundColor: '#ffebee' }]}>
                  <Caption style={[styles.activityBadgeText, { color: '#f44336' }]}>
                    {stats.recentActivity.lowStockProducts.length}
                  </Caption>
                </View>
              </View>

              {stats.recentActivity.lowStockProducts.slice(0, 5).map((product, index) => (
                <View
                  key={product.id}
                  style={[
                    styles.listItem,
                    index === 0 && styles.listItemFirst,
                  ]}
                >
                  <View style={styles.listItemLeft}>
                    <Paragraph style={styles.listItemTitle}>
                      {product.name}
                    </Paragraph>
                    <Caption style={styles.listItemSubtitle}>
                      SKU: {product.sku}
                    </Caption>
                  </View>
                  <View style={styles.listItemRight}>
                    <View style={styles.stockBadge}>
                      <Caption style={styles.stockBadgeText}>
                        {product.stockQuantity} restants
                      </Caption>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Recent Users */}
          {stats.recentActivity.recentUsers.length > 0 && (
            <View style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <View style={styles.activityTitleRow}>
                  <View style={[styles.activityIconBadge, { backgroundColor: '#4CAF50' }]}>
                    <Ionicons name="person-add" size={16} color={Colors.white} />
                  </View>
                  <Title level={5} style={styles.activityTitle}>
                    Nouveaux utilisateurs
                  </Title>
                </View>
                <View style={[styles.activityBadge, { backgroundColor: '#e8f5e9' }]}>
                  <Caption style={[styles.activityBadgeText, { color: '#4CAF50' }]}>
                    {stats.recentActivity.recentUsers.length}
                  </Caption>
                </View>
              </View>

              {stats.recentActivity.recentUsers.slice(0, 5).map((user, index) => (
                <View
                  key={user.id}
                  style={[
                    styles.listItem,
                    index === 0 && styles.listItemFirst,
                  ]}
                >
                  <View style={styles.listItemLeft}>
                    <Paragraph style={styles.listItemTitle}>
                      {user.fullName}
                    </Paragraph>
                    <Caption style={styles.listItemSubtitle}>
                      {user.phone}
                    </Caption>
                  </View>
                  <View style={styles.listItemRight}>
                    <View style={[styles.statusBadge, { backgroundColor: '#e8f5e9' }]}>
                      <Caption style={[styles.statusBadgeText, { color: '#4CAF50' }]}>
                        Actif
                      </Caption>
                    </View>
                  </View>
                </View>
              ))}
            </View>
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
                  <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(selectedOrder.status) }]}>
                    <Ionicons
                      name={getStatusIcon(selectedOrder.status)}
                      size={14}
                      color={Colors.white}
                      style={{ marginRight: 4 }}
                    />
                    <Caption style={styles.statusTextLarge}>
                      {getStatusLabel(selectedOrder.status)}
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
                    <View key={index} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Paragraph style={styles.itemName}>{item.productName}</Paragraph>
                        <Caption style={styles.itemDetails}>
                          Quantité: {item.quantity} × {formatCurrency(Number(item.unitPrice))}
                        </Caption>
                      </View>
                      <Paragraph style={styles.itemTotal}>
                        {formatCurrency(Number(item.totalPrice))}
                      </Paragraph>
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

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  emptyTitle: {
    marginTop: Spacing.lg,
    color: Colors.text.primary,
  },

  emptyText: {
    marginTop: Spacing.xs,
    color: Colors.text.secondary,
    textAlign: 'center',
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

  periodContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  periodButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    marginRight: Spacing.sm,
  },

  periodButtonActive: {
    backgroundColor: Colors.primary,
  },

  periodText: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.secondary,
  },

  periodTextActive: {
    color: Colors.white,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  statCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },

  statGradient: {
    padding: Spacing.lg,
    justifyContent: 'space-between',
    minHeight: 140,
  },

  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  statValue: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.white,
    fontSize: 20,
    marginBottom: Spacing.xs,
  },

  statLabel: {
    fontFamily: 'Ubuntu_400Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
  },

  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
  },

  activityCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  activityTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  activityIconBadge: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  activityTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    fontSize: 16,
  },

  activityBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
  },

  activityBadgeText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    fontSize: 12,
  },

  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  listItemFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },

  listItemLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },

  listItemTitle: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.primary,
    marginBottom: 2,
  },

  listItemSubtitle: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  listItemRight: {
    alignItems: 'flex-end',
  },

  listItemValue: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
  },

  stockBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#ffebee',
  },

  stockBadgeText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: '#f44336',
    fontSize: 11,
  },

  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },

  statusBadgeText: {
    fontFamily: 'Ubuntu_600SemiBold',
    fontSize: 11,
  },

  bottomPadding: {
    height: 120,
  },

  // Order-specific styles
  orderNumberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 2,
  },

  orderStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },

  orderStatusText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 9,
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

  statusBadgeLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },

  statusTextLarge: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 12,
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
});
