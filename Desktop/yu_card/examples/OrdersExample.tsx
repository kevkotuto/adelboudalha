/**
 * Exemple d'utilisation du Order Store avec les vraies données backend
 *
 * Ce fichier montre comment gérer les commandes dans vos composants
 */

import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, ActivityIndicator, ScrollView } from 'react-native';
import {
  useOrderStore,
  useOrders,
  useCurrentOrder,
  useOrderStats,
  useOrdersLoading,
} from '@/stores/useOrderStore';
import { useCartStore } from '@/stores/useCartStore';
import { Order, OrderStatus } from '@/types';
import Button from '@/components/ui/Buttons/Button';
import Title from '@/components/ui/Typography/Title';
import Paragraph from '@/components/ui/Typography/Paragraph';
import Container from '@/components/ui/Layout/Container';
import Card from '@/components/ui/Layout/Card';
import { Colors } from '@/constants/Colors';

// ==================================
// ORDERS LIST SCREEN EXAMPLE
// ==================================

export function OrdersListScreenExample() {
  const fetchOrders = useOrderStore((state) => state.fetchOrders);
  const setStatusFilter = useOrderStore((state) => state.setStatusFilter);
  const clearFilters = useOrderStore((state) => state.clearFilters);
  const fetchMoreOrders = useOrderStore((state) => state.fetchMoreOrders);

  const orders = useOrders();
  const stats = useOrderStats();
  const isLoading = useOrdersLoading();
  const isLoadingMore = useOrderStore((state) => state.isLoadingMore);
  const error = useOrderStore((state) => state.error);
  const clearError = useOrderStore((state) => state.clearError);
  const statusFilter = useOrderStore((state) => state.statusFilter);
  const page = useOrderStore((state) => state.page);
  const totalPages = useOrderStore((state) => state.totalPages);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [{ text: 'OK', onPress: () => clearError() }]);
    }
  }, [error]);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      fetchMoreOrders();
    }
  };

  if (isLoading && orders.length === 0) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Paragraph style={{ marginTop: 16 }}>Chargement des commandes...</Paragraph>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View style={{ flex: 1 }}>
        {/* Header with Stats */}
        <View style={{ padding: 16 }}>
          <Title level={2}>Mes Commandes</Title>
          <View style={{ flexDirection: 'row', marginTop: 12, gap: 12 }}>
            <Card style={{ flex: 1, padding: 12 }}>
              <Paragraph size="small" style={{ color: Colors.gray[600] }}>
                Total
              </Paragraph>
              <Paragraph weight="bold" size="large">
                {stats.totalOrders}
              </Paragraph>
            </Card>
            <Card style={{ flex: 1, padding: 12 }}>
              <Paragraph size="small" style={{ color: Colors.gray[600] }}>
                Dépensé
              </Paragraph>
              <Paragraph weight="bold" size="large">
                {(stats.totalSpent / 1000).toFixed(0)}k
              </Paragraph>
            </Card>
          </View>
        </View>

        {/* Filter Buttons */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, marginBottom: 12 }}
        >
          <Button
            variant={statusFilter === null ? 'primary' : 'outline'}
            size="small"
            onPress={() => clearFilters()}
          >
            Toutes ({stats.totalOrders})
          </Button>
          <Button
            variant={statusFilter === 'PENDING' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setStatusFilter('PENDING')}
          >
            En attente ({stats.pendingOrders})
          </Button>
          <Button
            variant={statusFilter === 'CONFIRMED' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setStatusFilter('CONFIRMED')}
          >
            Confirmées ({stats.confirmedOrders})
          </Button>
          <Button
            variant={statusFilter === 'DELIVERED' ? 'primary' : 'outline'}
            size="small"
            onPress={() => setStatusFilter('DELIVERED')}
          >
            Livrées ({stats.deliveredOrders})
          </Button>
        </ScrollView>

        {/* Orders List */}
        {orders.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
            <Title level={3}>Aucune commande</Title>
            <Paragraph style={{ marginTop: 8, textAlign: 'center' }}>
              {statusFilter
                ? 'Aucune commande avec ce statut'
                : 'Vous n\'avez pas encore passé de commande'}
            </Paragraph>
          </View>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <OrderCard order={item} />}
            contentContainerStyle={{ padding: 16 }}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <ActivityIndicator color={Colors.primary} />
                </View>
              ) : null
            }
          />
        )}
      </View>
    </Container>
  );
}

// ==================================
// ORDER CARD
// ==================================

function OrderCard({ order }: { order: Order }) {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return Colors.warning;
      case 'CONFIRMED':
      case 'DELIVERED':
        return Colors.success;
      case 'PROCESSING':
      case 'SHIPPED':
        return Colors.info;
      case 'CANCELLED':
      case 'REFUNDED':
        return Colors.error;
      default:
        return Colors.gray[500];
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'CONFIRMED':
        return 'Confirmée';
      case 'PROCESSING':
        return 'En cours';
      case 'SHIPPED':
        return 'Expédiée';
      case 'DELIVERED':
        return 'Livrée';
      case 'CANCELLED':
        return 'Annulée';
      case 'REFUNDED':
        return 'Remboursée';
      default:
        return status;
    }
  };

  return (
    <Card
      style={{ marginBottom: 12, padding: 16 }}
      onPress={() => {
        // Navigate to order details
        Alert.alert('Info', `Voir commande #${order.orderNumber}`);
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
        <View>
          <Paragraph weight="bold">#{order.orderNumber}</Paragraph>
          <Paragraph size="small" style={{ color: Colors.gray[600], marginTop: 4 }}>
            {new Date(order.createdAt).toLocaleDateString('fr-FR')}
          </Paragraph>
        </View>
        <View
          style={{
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            backgroundColor: getStatusColor(order.status) + '20',
          }}
        >
          <Paragraph size="small" style={{ color: getStatusColor(order.status) }}>
            {getStatusLabel(order.status)}
          </Paragraph>
        </View>
      </View>

      <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: Colors.gray[200] }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Paragraph size="small" style={{ color: Colors.gray[600] }}>
            {order.items.length} article{order.items.length > 1 ? 's' : ''}
          </Paragraph>
          <Paragraph weight="bold">{order.totalAmount.toLocaleString()} CFA</Paragraph>
        </View>
      </View>
    </Card>
  );
}

// ==================================
// CREATE ORDER / CHECKOUT EXAMPLE
// ==================================

interface CheckoutScreenExampleProps {
  onSuccess?: (orderId: string) => void;
}

export function CheckoutScreenExample({ onSuccess }: CheckoutScreenExampleProps) {
  const createOrder = useOrderStore((state) => state.createOrder);
  const clearCart = useCartStore((state) => state.clearCart);
  const isCreating = useOrderStore((state) => state.isCreating);

  const cartItems = useCartStore((state) => state.items);
  const cartTotal = useCartStore((state) => state.total);

  const [phone, setPhone] = useState('+225');
  const [notes, setNotes] = useState('');

  const handleCreateOrder = async () => {
    if (!phone || phone.length < 10) {
      Alert.alert('Erreur', 'Veuillez entrer un numéro de téléphone valide');
      return;
    }

    if (cartItems.length === 0) {
      Alert.alert('Erreur', 'Votre panier est vide');
      return;
    }

    try {
      const newOrder = await createOrder({
        paymentMethod: 'WAVE',
        contactPhone: phone,
        notes: notes || undefined,
      });

      // Clear cart after successful order
      await clearCart();

      Alert.alert(
        'Commande créée',
        `Votre commande #${newOrder.orderNumber} a été créée avec succès`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (onSuccess) {
                onSuccess(newOrder.id);
              }
            },
          },
        ]
      );
    } catch (error) {
      // Error already handled by store
      console.error('Checkout error:', error);
    }
  };

  return (
    <Container>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Title level={2}>Finaliser la commande</Title>

        {/* Cart Summary */}
        <Card style={{ marginTop: 16, padding: 16 }}>
          <Paragraph weight="bold" style={{ marginBottom: 12 }}>
            Résumé
          </Paragraph>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Paragraph>{cartItems.length} articles</Paragraph>
            <Paragraph weight="bold">{cartTotal.toLocaleString()} CFA</Paragraph>
          </View>
        </Card>

        {/* Payment Info */}
        <Card style={{ marginTop: 16, padding: 16 }}>
          <Paragraph weight="bold" style={{ marginBottom: 12 }}>
            Paiement Wave
          </Paragraph>
          <Paragraph size="small" style={{ color: Colors.gray[600], marginBottom: 12 }}>
            Entrez votre numéro Wave pour le paiement
          </Paragraph>

          {/* Phone Input - Simplified for example */}
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.gray[300],
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Paragraph>{phone}</Paragraph>
          </View>
        </Card>

        {/* Notes */}
        <Card style={{ marginTop: 16, padding: 16 }}>
          <Paragraph weight="bold" style={{ marginBottom: 12 }}>
            Notes (optionnel)
          </Paragraph>
          <View
            style={{
              borderWidth: 1,
              borderColor: Colors.gray[300],
              borderRadius: 8,
              padding: 12,
            }}
          >
            <Paragraph>{notes || 'Ex: Livraison rapide svp'}</Paragraph>
          </View>
        </Card>

        {/* Action Button */}
        <Button
          variant="primary"
          onPress={handleCreateOrder}
          disabled={isCreating}
          style={{ marginTop: 24 }}
        >
          {isCreating ? 'Création en cours...' : 'Créer la commande'}
        </Button>
      </ScrollView>
    </Container>
  );
}

// ==================================
// ORDER DETAILS SCREEN EXAMPLE
// ==================================

export function OrderDetailScreenExample({ orderId }: { orderId: string }) {
  const fetchOrderById = useOrderStore((state) => state.fetchOrderById);
  const cancelOrder = useOrderStore((state) => state.cancelOrder);

  const currentOrder = useCurrentOrder();
  const isLoading = useOrdersLoading();
  const isCancelling = useOrderStore((state) => state.isCancelling);

  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId]);

  const handleCancelOrder = () => {
    if (!currentOrder) return;

    Alert.alert(
      'Annuler la commande',
      'Voulez-vous vraiment annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(currentOrder.id, 'Annulée par le client');
              Alert.alert('Succès', 'Commande annulée');
            } catch (error) {
              // Error already handled by store
            }
          },
        },
      ]
    );
  };

  if (isLoading || !currentOrder) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </Container>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(currentOrder.status);

  return (
    <Container>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
        <Title level={2}>Commande #{currentOrder.orderNumber}</Title>

        {/* Order Info */}
        <Card style={{ marginTop: 16, padding: 16 }}>
          <Paragraph weight="bold" style={{ marginBottom: 12 }}>
            Informations
          </Paragraph>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Paragraph size="small" style={{ color: Colors.gray[600] }}>
                Statut
              </Paragraph>
              <Paragraph weight="bold">{currentOrder.status}</Paragraph>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Paragraph size="small" style={{ color: Colors.gray[600] }}>
                Date
              </Paragraph>
              <Paragraph>{new Date(currentOrder.createdAt).toLocaleDateString('fr-FR')}</Paragraph>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Paragraph size="small" style={{ color: Colors.gray[600] }}>
                Paiement
              </Paragraph>
              <Paragraph>{currentOrder.paymentStatus}</Paragraph>
            </View>
          </View>
        </Card>

        {/* Order Items */}
        <Card style={{ marginTop: 16, padding: 16 }}>
          <Paragraph weight="bold" style={{ marginBottom: 12 }}>
            Articles
          </Paragraph>
          {currentOrder.items.map((item) => (
            <View
              key={item.id}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: Colors.gray[200],
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Paragraph>{item.productName}</Paragraph>
                  <Paragraph size="small" style={{ color: Colors.gray[600], marginTop: 4 }}>
                    Qté: {item.quantity}
                  </Paragraph>
                </View>
                <Paragraph weight="bold">{item.totalPrice.toLocaleString()} CFA</Paragraph>
              </View>
            </View>
          ))}
        </Card>

        {/* Total */}
        <Card style={{ marginTop: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Paragraph weight="bold">Total</Paragraph>
            <Paragraph weight="bold" size="large">
              {currentOrder.totalAmount.toLocaleString()} CFA
            </Paragraph>
          </View>
        </Card>

        {/* Cancel Button */}
        {canCancel && (
          <Button
            variant="outline"
            onPress={handleCancelOrder}
            disabled={isCancelling}
            style={{ marginTop: 24 }}
          >
            {isCancelling ? 'Annulation...' : 'Annuler la commande'}
          </Button>
        )}
      </ScrollView>
    </Container>
  );
}

export default OrdersListScreenExample;
