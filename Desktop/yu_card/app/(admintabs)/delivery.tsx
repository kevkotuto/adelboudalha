import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Modal,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { LinearGradient } from 'expo-linear-gradient';
import { Title, Paragraph, Caption } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Layout/Container';
import { Card } from '@/components/ui/Layout/Card';
import { Button } from '@/components/ui/Buttons/Button';
import { SearchInput } from '@/components/ui/Inputs/SearchInput';
import { TextInput } from '@/components/ui/Inputs/TextInput';
import { LoadingSpinner } from '@/components/ui/Layout/LoadingSpinner';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { deliveryService } from '@/services/deliveryService';
import { Delivery, DeliveryStatus, Driver, UpdateDeliveryRequest } from '@/types';

type DeliveryStatusFilter = 'all' | DeliveryStatus;

interface DeliveryStats {
  totalDeliveries: number;
  pendingDeliveries: number;
  assignedDeliveries: number;
  inTransitDeliveries: number;
  deliveredDeliveries: number;
  failedDeliveries: number;
}

export default function AdminDeliveryScreen() {
  const { t } = useTranslation();
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<DeliveryStatusFilter>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [selectedDriver, setSelectedDriver] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const statusFilters: { key: DeliveryStatusFilter; label: string; color: string }[] = [
    { key: 'all', label: 'Tous', color: Colors.text.secondary },
    { key: 'pending', label: 'En attente', color: '#FF9800' },
    { key: 'assigned', label: 'Affecté', color: '#2196F3' },
    { key: 'in_transit', label: 'En transit', color: '#9C27B0' },
    { key: 'delivered', label: 'Livré', color: '#4CAF50' },
    { key: 'failed', label: 'Échec', color: '#f44336' },
  ];

  const loadDeliveries = async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      }

      const filters: any = {
        page,
        limit: 20,
      };

      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }

      if (searchQuery.trim()) {
        filters.search = searchQuery.trim();
      }

      const response = await deliveryService.getAllDeliveries(filters);

      if (reset || page === 1) {
        setDeliveries(response.data);
      } else {
        setDeliveries(prev => [...prev, ...response.data]);
      }

      setHasMoreData(response.data.length === 20);
      setCurrentPage(page);
    } catch (error) {
      console.error('Erreur lors du chargement des livraisons:', error);
      Alert.alert('Erreur', 'Impossible de charger les livraisons');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadDrivers = async () => {
    try {
      const response = await deliveryService.getAllDrivers({ status: 'available' });
      setDrivers(response.data?.items || response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des livreurs:', error);
    }
  };

  useEffect(() => {
    loadDeliveries(1, true);
    loadDrivers();
  }, [selectedStatus, searchQuery]);

  const onRefresh = () => {
    setRefreshing(true);
    setCurrentPage(1);
    loadDeliveries(1, true);
    loadDrivers();
  };

  const loadMoreDeliveries = () => {
    if (hasMoreData && !loading) {
      loadDeliveries(currentPage + 1);
    }
  };

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(delivery => {
      if (selectedStatus !== 'all' && delivery.status !== selectedStatus) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          delivery.trackingCode.toLowerCase().includes(query) ||
          delivery.orderId.toLowerCase().includes(query) ||
          delivery.recipientName.toLowerCase().includes(query) ||
          delivery.address.city.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [deliveries, selectedStatus, searchQuery]);

  const stats: DeliveryStats = useMemo(() => {
    const totalDeliveries = deliveries.length;
    const pendingDeliveries = deliveries.filter(d => d.status === 'pending').length;
    const assignedDeliveries = deliveries.filter(d => d.status === 'assigned').length;
    const inTransitDeliveries = deliveries.filter(d => d.status === 'in_transit').length;
    const deliveredDeliveries = deliveries.filter(d => d.status === 'delivered').length;
    const failedDeliveries = deliveries.filter(d => d.status === 'failed').length;

    return {
      totalDeliveries,
      pendingDeliveries,
      assignedDeliveries,
      inTransitDeliveries,
      deliveredDeliveries,
      failedDeliveries,
    };
  }, [deliveries]);

  const handleAssignDriver = async (deliveryId: string, driverId: string) => {
    try {
      setAssigning(true);

      await deliveryService.assignDriver(deliveryId, { driverId });

      // Mise à jour locale
      setDeliveries(prev =>
        prev.map(delivery =>
          delivery.id === deliveryId
            ? {
                ...delivery,
                driverId,
                driver: drivers.find(d => d.id === driverId),
                status: 'assigned' as DeliveryStatus,
              }
            : delivery
        )
      );

      Alert.alert('Succès', 'Livreur affecté avec succès !');
      setShowAssignModal(false);
      setSelectedDriver('');
      setSelectedDelivery(null);
    } catch (error) {
      console.error('Erreur lors de l\'affectation du livreur:', error);
      Alert.alert('Erreur', 'Impossible d\'affecter le livreur');
    } finally {
      setAssigning(false);
    }
  };

  const handleUpdateDeliveryStatus = async (deliveryId: string, newStatus: DeliveryStatus) => {
    try {
      const updateData: UpdateDeliveryRequest = {
        status: newStatus,
      };

      if (newStatus === 'delivered') {
        updateData.deliveredAt = new Date().toISOString();
      }

      await deliveryService.updateDelivery(deliveryId, updateData);

      // Mise à jour locale
      setDeliveries(prev =>
        prev.map(delivery =>
          delivery.id === deliveryId
            ? { ...delivery, ...updateData }
            : delivery
        )
      );

      Alert.alert('Succès', 'Statut de livraison mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  const confirmStatusUpdate = (deliveryId: string, newStatus: DeliveryStatus, trackingCode: string) => {
    const statusInfo = statusFilters.find(s => s.key === newStatus);

    Alert.alert(
      'Confirmer le changement',
      `Changer le statut de la livraison ${trackingCode} vers "${statusInfo?.label}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => handleUpdateDeliveryStatus(deliveryId, newStatus),
        },
      ]
    );
  };

  const confirmAssignDriver = () => {
    if (!selectedDelivery || !selectedDriver) {
      Alert.alert('Erreur', 'Veuillez sélectionner un livreur');
      return;
    }

    const driver = drivers.find(d => d.id === selectedDriver);

    Alert.alert(
      'Confirmer l\'affectation',
      `Affecter la livraison ${selectedDelivery.trackingCode} à ${driver?.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Affecter',
          onPress: () => handleAssignDriver(selectedDelivery.id, selectedDriver),
        },
      ]
    );
  };

  const handleCallCustomer = (phoneNumber: string, customerName: string) => {
    Alert.alert(
      'Contacter le client',
      `Appeler ${customerName} au ${phoneNumber} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Appeler',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`);
          },
        },
      ]
    );
  };

  const getNextStatus = (currentStatus: DeliveryStatus): DeliveryStatus | null => {
    const statusFlow: Record<DeliveryStatus, DeliveryStatus | null> = {
      pending: null, // Doit être affecté
      assigned: 'picked_up',
      picked_up: 'in_transit',
      in_transit: 'out_for_delivery',
      out_for_delivery: 'delivered',
      delivered: null,
      failed: null,
      cancelled: null,
      returned: null,
    };

    return statusFlow[currentStatus] || null;
  };

  const getStatusColor = (status: DeliveryStatus): string => {
    const filter = statusFilters.find(f => f.key === status);
    return filter?.color || Colors.text.secondary;
  };

  const getStatusIcon = (status: DeliveryStatus): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'assigned': return 'person-outline';
      case 'picked_up': return 'cube-outline';
      case 'in_transit': return 'car-outline';
      case 'out_for_delivery': return 'bicycle-outline';
      case 'delivered': return 'checkmark-circle-outline';
      case 'failed': return 'close-circle-outline';
      case 'cancelled': return 'ban-outline';
      case 'returned': return 'return-down-back-outline';
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

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const StatsCard = ({ title, value, icon, colors: gradientColors }: {
    title: string;
    value: number;
    icon: keyof typeof Ionicons.glyphMap;
    colors: string[];
  }) => (
    <LinearGradient
      colors={gradientColors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statsCard}
    >
      <View style={styles.statsHeader}>
        <View style={styles.statsIconContainer}>
          <Ionicons name={icon} size={24} color={Colors.white} />
        </View>
      </View>
      <Title level={3} style={styles.statsValue}>
        {value}
      </Title>
      <Caption style={styles.statsTitle}>
        {title}
      </Caption>
    </LinearGradient>
  );

  const DeliveryCard = ({ delivery }: { delivery: Delivery }) => {
    const nextStatus = getNextStatus(delivery.status);
    const statusInfo = statusFilters.find(s => s.key === delivery.status);

    return (
      <Card style={styles.deliveryCard}>
        <View style={styles.deliveryHeader}>
          <View style={styles.deliveryInfo}>
            <View style={styles.deliveryTitleRow}>
              <Title level={6} style={styles.deliveryTitle}>
                {delivery.trackingCode}
              </Title>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(delivery.status) }]}>
                <Ionicons
                  name={getStatusIcon(delivery.status)}
                  size={12}
                  color={Colors.white}
                  style={styles.statusIcon}
                />
                <Caption style={styles.statusText}>
                  {statusInfo?.label}
                </Caption>
              </View>
            </View>
            <Paragraph style={styles.productName}>
              {delivery.order.items[0]?.productName || 'Produit'}
            </Paragraph>
            <Caption style={styles.orderInfo}>
              Commande: {delivery.order.orderNumber}
            </Caption>
          </View>
        </View>

        <View style={styles.deliveryDetails}>
          <View style={styles.customerSection}>
            <Caption style={styles.sectionTitle}>Client</Caption>
            <Paragraph size="small" style={styles.customerName}>
              {delivery.customerName}
            </Paragraph>
            <Caption style={styles.customerPhone}>
              {delivery.customerPhone}
            </Caption>
          </View>

          <View style={styles.addressSection}>
            <Caption style={styles.sectionTitle}>Adresse de livraison</Caption>
            <Paragraph size="small" style={styles.address}>
              {delivery.deliveryAddress.addressLine1}
              {delivery.deliveryAddress.addressLine2 && `, ${delivery.deliveryAddress.addressLine2}`}
            </Paragraph>
            <Paragraph size="small" style={styles.address}>
              {delivery.deliveryAddress.city}, {delivery.deliveryAddress.region}
            </Paragraph>
          </View>

          {delivery.driver && (
            <View style={styles.driverSection}>
              <Caption style={styles.sectionTitle}>Livreur affecté</Caption>
              <Paragraph size="small" style={styles.driverName}>
                {delivery.driver.name}
              </Paragraph>
              <Caption style={styles.driverPhone}>
                {delivery.driver.phone}
              </Caption>
            </View>
          )}

          <View style={styles.deliveryMeta}>
            <View style={styles.metaItem}>
              <Caption style={styles.metaLabel}>Livraison estimée</Caption>
              <Paragraph size="small" style={styles.metaValue}>
                {formatDate(delivery.estimatedDeliveryDate)}
              </Paragraph>
            </View>
            <View style={styles.metaItem}>
              <Caption style={styles.metaLabel}>Coût de livraison</Caption>
              <Paragraph size="small" style={styles.metaValue}>
                {formatAmount(delivery.deliveryCost)} F
              </Paragraph>
            </View>
          </View>

          {delivery.notes && (
            <View style={styles.notesSection}>
              <Caption style={styles.sectionTitle}>Notes</Caption>
              <Paragraph size="small" style={styles.notes}>
                {delivery.notes}
              </Paragraph>
            </View>
          )}
        </View>

        <View style={styles.deliveryActions}>
          <Button
            variant="outline"
            size="small"
            onPress={() => {
              console.log('View delivery details:', delivery.id);
            }}
          >
            Détails
          </Button>

          {delivery.status === 'PENDING' && (
            <Button
              variant="primary"
              size="small"
              onPress={() => {
                setSelectedDelivery(delivery);
                setShowAssignModal(true);
              }}
            >
              Affecter livreur
            </Button>
          )}

          {nextStatus && (
            <Button
              variant="primary"
              size="small"
              onPress={() => confirmStatusUpdate(delivery.id, nextStatus, delivery.trackingCode)}
            >
              {statusFilters.find(s => s.key === nextStatus)?.label}
            </Button>
          )}

          <Pressable
            style={styles.contactButton}
            onPress={() => handleCallCustomer(delivery.customerPhone, delivery.customerName)}
          >
            <Ionicons name="call-outline" size={16} color={Colors.primary} />
          </Pressable>
        </View>
      </Card>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Container>
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" color={Colors.primary} />
            <Paragraph style={styles.loadingText}>Chargement des livraisons...</Paragraph>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Container>
        <View style={styles.header}>
          <Title level={2} style={styles.headerTitle}>
            Gestion des Livraisons
          </Title>
          <Paragraph style={styles.headerSubtitle}>
            {filteredDeliveries.length} livraison(s) trouvée(s)
          </Paragraph>
        </View>

        {/* Stats Cards */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Total livraisons"
              value={stats.totalDeliveries}
              icon="car-outline"
              colors={['#2196F3', '#1976D2']}
            />
            <StatsCard
              title="En attente"
              value={stats.pendingDeliveries}
              icon="time-outline"
              colors={['#FF9800', '#F57C00']}
            />
            <StatsCard
              title="En transit"
              value={stats.inTransitDeliveries}
              icon="car-sport-outline"
              colors={['#9C27B0', '#7B1FA2']}
            />
            <StatsCard
              title="Livrées"
              value={stats.deliveredDeliveries}
              icon="checkmark-circle-outline"
              colors={['#4CAF50', '#388E3C']}
            />
            <StatsCard
              title="Échecs"
              value={stats.failedDeliveries}
              icon="close-circle-outline"
              colors={['#f44336', '#d32f2f']}
            />
          </View>
        </ScrollView>

        <SearchInput
          placeholder="Rechercher par tracking, client, commande, ville..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersContainer}>
          <View style={styles.filters}>
            {statusFilters.map((filter) => (
              <Pressable
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedStatus === filter.key && {
                    backgroundColor: filter.color,
                    borderColor: filter.color,
                  }
                ]}
                onPress={() => setSelectedStatus(filter.key)}
              >
                <Paragraph
                  size="small"
                  style={[
                    styles.filterText,
                    selectedStatus === filter.key && { color: Colors.white }
                  ]}
                >
                  {filter.label}
                </Paragraph>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        <ScrollView
          style={styles.content}
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
            if (isCloseToBottom && hasMoreData && !loading) {
              loadMoreDeliveries();
            }
          }}
          scrollEventThrottle={400}
        >
          {filteredDeliveries.length > 0 ? (
            <View style={styles.deliveriesList}>
              {filteredDeliveries.map((delivery) => (
                <DeliveryCard key={delivery.id} delivery={delivery} />
              ))}
              {hasMoreData && (
                <View style={styles.loadingMore}>
                  <LoadingSpinner size="small" color={Colors.primary} />
                </View>
              )}
            </View>
          ) : (
            <EmptyState
              title="Aucune livraison trouvée"
              description="Aucune livraison ne correspond à vos critères"
              icon="car-outline"
            />
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>

        {/* Modal d'affectation de livreur */}
        <Modal
          visible={showAssignModal}
          animationType="slide"
          presentationStyle="pageSheet"
        >
          <SafeAreaView style={styles.modalContainer}>
            <Container>
              <View style={styles.modalHeader}>
                <Title level={3}>
                  Affecter un livreur
                </Title>
                <Pressable onPress={() => setShowAssignModal(false)}>
                  <Ionicons name="close" size={24} color={Colors.text.primary} />
                </Pressable>
              </View>

              <ScrollView style={styles.modalContent}>
                {selectedDelivery && (
                  <>
                    <Card style={styles.deliveryInfo}>
                      <Title level={5} style={styles.deliveryInfoTitle}>
                        Informations de livraison
                      </Title>
                      <View style={styles.deliveryInfoDetails}>
                        <Paragraph>
                          Tracking: {selectedDelivery.trackingCode}
                        </Paragraph>
                        <Paragraph>
                          Produit: {selectedDelivery.order.items[0]?.productName || 'Produit'}
                        </Paragraph>
                        <Paragraph>
                          Client: {selectedDelivery.customerName}
                        </Paragraph>
                        <Paragraph>
                          Adresse: {selectedDelivery.deliveryAddress.addressLine1}
                          {selectedDelivery.deliveryAddress.addressLine2 && `, ${selectedDelivery.deliveryAddress.addressLine2}`}, {selectedDelivery.deliveryAddress.city}
                        </Paragraph>
                        <Paragraph>
                          Livraison estimée: {formatDate(selectedDelivery.estimatedDeliveryDate)}
                        </Paragraph>
                      </View>
                    </Card>

                    <Title level={5} style={styles.driversTitle}>
                      Livreurs disponibles
                    </Title>

                    <View style={styles.driversList}>
                      {drivers.filter(driver => driver.isAvailable).map((driver) => (
                        <Pressable
                          key={driver.id}
                          style={[
                            styles.driverItem,
                            selectedDriver === driver.id && {
                              backgroundColor: Colors.primary + '20',
                              borderColor: Colors.primary,
                            }
                          ]}
                          onPress={() => setSelectedDriver(driver.id)}
                        >
                          <View style={styles.driverItemContent}>
                            <View style={[
                              styles.driverAvatar,
                              selectedDriver === driver.id && {
                                backgroundColor: Colors.primary,
                              }
                            ]}>
                              <Ionicons
                                name="person"
                                size={20}
                                color={selectedDriver === driver.id ? Colors.white : Colors.primary}
                              />
                            </View>
                            <View style={styles.driverDetails}>
                              <Paragraph style={styles.driverName}>
                                {driver.name}
                              </Paragraph>
                              <Caption>
                                {driver.phone}
                              </Caption>
                              {driver.vehicleInfo && (
                                <Caption style={styles.vehicleInfo}>
                                  {driver.vehicleInfo.type} - {driver.vehicleInfo.licensePlate}
                                </Caption>
                              )}
                            </View>
                          </View>
                          {selectedDriver === driver.id && (
                            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </>
                )}
              </ScrollView>

              <View style={styles.modalActions}>
                <Button
                  variant="outline"
                  onPress={() => setShowAssignModal(false)}
                  style={styles.modalButton}
                  disabled={assigning}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onPress={confirmAssignDriver}
                  style={styles.modalButton}
                  disabled={!selectedDriver || assigning}
                  loading={assigning}
                >
                  Affecter
                </Button>
              </View>
            </Container>
          </SafeAreaView>
        </Modal>
      </Container>
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
    paddingVertical: Spacing.xl * 2,
  },

  loadingText: {
    marginTop: Spacing.lg,
    color: Colors.text.secondary,
  },

  header: {
    paddingVertical: Spacing.lg,
  },

  headerTitle: {
    fontFamily: 'Ubuntu_700Bold',
    marginBottom: Spacing.xs,
    color: Colors.text.primary,
  },

  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
  },

  statsContainer: {
    marginBottom: Spacing.lg,
  },

  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
  },

  statsCard: {
    padding: Spacing.lg,
    marginRight: Spacing.md,
    minWidth: 140,
    borderRadius: BorderRadius.lg,
  },

  statsHeader: {
    marginBottom: Spacing.sm,
  },

  statsIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  statsValue: {
    color: Colors.white,
    fontWeight: '700',
    fontFamily: 'Ubuntu_700Bold',
    marginBottom: Spacing.xs,
  },

  statsTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.white,
    opacity: 0.9,
  },

  searchInput: {
    marginBottom: Spacing.md,
  },

  filtersContainer: {
    marginBottom: Spacing.lg,
  },

  filters: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },

  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    backgroundColor: Colors.background.card,
    borderColor: Colors.border.primary,
  },

  filterText: {
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.secondary,
  },

  content: {
    flex: 1,
  },

  deliveriesList: {
    paddingBottom: Spacing.xl,
  },

  bottomPadding: {
    height: 120,
  },

  deliveryCard: {
    marginBottom: Spacing.md,
    padding: Spacing.lg,
  },

  deliveryHeader: {
    marginBottom: Spacing.md,
  },

  deliveryInfo: {},

  deliveryTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  deliveryTitle: {
    fontWeight: '700',
    fontFamily: 'Ubuntu_700Bold',
    flex: 1,
    color: Colors.text.primary,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },

  statusIcon: {
    marginRight: Spacing.xs,
  },

  statusText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
  },

  productName: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
    color: Colors.text.secondary,
  },

  orderInfo: {
    fontSize: 12,
    color: Colors.text.tertiary,
  },

  deliveryDetails: {
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },

  customerSection: {},

  sectionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.xs,
    fontSize: 12,
    textTransform: 'uppercase',
    color: Colors.text.secondary,
  },

  customerName: {
    fontWeight: '600',
    color: Colors.text.primary,
  },

  customerPhone: {
    fontSize: 12,
    marginTop: 2,
    color: Colors.text.secondary,
  },

  addressSection: {},

  address: {
    lineHeight: 18,
    color: Colors.text.primary,
  },

  driverSection: {},

  driverName: {
    fontWeight: '600',
    color: Colors.text.primary,
  },

  driverPhone: {
    fontSize: 12,
    marginTop: 2,
    color: Colors.text.secondary,
  },

  deliveryMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
  },

  metaItem: {
    flex: 1,
  },

  metaLabel: {
    color: Colors.text.secondary,
  },

  metaValue: {
    fontWeight: '600',
    marginTop: 2,
    color: Colors.text.primary,
  },

  notesSection: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.tertiary,
  },

  notes: {
    fontStyle: 'italic',
    marginTop: Spacing.xs,
    color: Colors.text.primary,
  },

  deliveryActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  contactButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.background.secondary,
  },

  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },

  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  modalContent: {
    flex: 1,
    paddingVertical: Spacing.lg,
  },

  deliveryInfoTitle: {
    marginBottom: Spacing.md,
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
  },

  deliveryInfoDetails: {
    gap: Spacing.xs,
  },

  driversTitle: {
    marginBottom: Spacing.md,
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
  },

  driversList: {
    gap: Spacing.sm,
  },

  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    backgroundColor: Colors.background.card,
    borderColor: Colors.border.primary,
  },

  driverItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    backgroundColor: Colors.background.tertiary,
  },

  driverDetails: {
    flex: 1,
  },

  vehicleInfo: {
    fontSize: 11,
    marginTop: 2,
    color: Colors.text.tertiary,
  },

  modalActions: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    gap: Spacing.md,
  },

  modalButton: {
    flex: 1,
  },
})