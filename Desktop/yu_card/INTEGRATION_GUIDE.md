# Guide d'intégration Cart & Orders avec Backend

Ce guide explique comment utiliser les nouveaux stores Zustand pour le panier et les commandes avec les vraies données du backend.

## 📦 Architecture

### Services
- **`cartService`** - Service pour les appels API du panier
- **`orderService`** - Service pour les appels API des commandes

### Stores Zustand
- **`useCartStore`** - Gestion d'état du panier
- **`useOrderStore`** - Gestion d'état des commandes

## 🛒 Utilisation du Cart Store

### 1. Importer le store

```tsx
import { useCartStore, useCartItems, useCartTotal, useCartItemsCount } from '@/stores/useCartStore';
```

### 2. Charger le panier

```tsx
import { useEffect } from 'react';

function MyComponent() {
  const fetchCart = useCartStore(state => state.fetchCart);
  const items = useCartItems();
  const total = useCartTotal();
  const itemsCount = useCartItemsCount();
  const isLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    fetchCart();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      <Text>Articles: {itemsCount}</Text>
      <Text>Total: {total} CFA</Text>
    </View>
  );
}
```

### 3. Ajouter un article au panier

```tsx
function ProductCard({ product }: { product: GiftCard | PhysicalProduct }) {
  const addToCart = useCartStore(state => state.addToCart);
  const isAdding = useCartStore(state => state.isAdding);

  const handleAddToCart = async () => {
    try {
      if ('brand' in product) {
        // Gift Card
        await addToCart('GIFT_CARD', product.id, 1, product.price);
      } else {
        // Physical Product
        await addToCart('PHYSICAL_PRODUCT', product.id, 1);
      }
      Alert.alert('Succès', 'Article ajouté au panier');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter au panier');
    }
  };

  return (
    <Button
      onPress={handleAddToCart}
      disabled={isAdding}
      title={isAdding ? 'Ajout...' : 'Ajouter au panier'}
    />
  );
}
```

### 4. Mettre à jour la quantité

```tsx
function CartItemComponent({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const isUpdating = useCartStore(state => state.isUpdating);

  const handleQuantityChange = async (newQuantity: number) => {
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la quantité');
    }
  };

  return (
    <View>
      <Button
        onPress={() => handleQuantityChange(item.quantity - 1)}
        disabled={isUpdating}
        title="-"
      />
      <Text>{item.quantity}</Text>
      <Button
        onPress={() => handleQuantityChange(item.quantity + 1)}
        disabled={isUpdating}
        title="+"
      />
    </View>
  );
}
```

### 5. Supprimer un article

```tsx
function CartItemComponent({ item }: { item: CartItem }) {
  const removeItem = useCartStore(state => state.removeItem);
  const isRemoving = useCartStore(state => state.isRemoving);

  const handleRemove = async () => {
    try {
      await removeItem(item.id);
      Alert.alert('Succès', 'Article supprimé');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de supprimer l\'article');
    }
  };

  return (
    <Button
      onPress={handleRemove}
      disabled={isRemoving}
      title="Supprimer"
    />
  );
}
```

### 6. Vider le panier

```tsx
function CartScreen() {
  const clearCart = useCartStore(state => state.clearCart);
  const items = useCartItems();
  const isLoading = useCartStore(state => state.isLoading);

  const handleClearCart = async () => {
    Alert.alert(
      'Confirmation',
      'Voulez-vous vraiment vider votre panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
              Alert.alert('Succès', 'Panier vidé');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de vider le panier');
            }
          },
        },
      ]
    );
  };

  if (items.length === 0) {
    return <Text>Votre panier est vide</Text>;
  }

  return (
    <View>
      {/* Liste des articles */}
      <Button
        onPress={handleClearCart}
        disabled={isLoading}
        title="Vider le panier"
      />
    </View>
  );
}
```

## 📦 Utilisation du Order Store

### 1. Importer le store

```tsx
import {
  useOrderStore,
  useOrders,
  useCurrentOrder,
  useOrderStats
} from '@/stores/useOrderStore';
```

### 2. Charger les commandes

```tsx
import { useEffect } from 'react';

function OrdersScreen() {
  const fetchOrders = useOrderStore(state => state.fetchOrders);
  const orders = useOrders();
  const isLoading = useOrderStore(state => state.isLoading);
  const stats = useOrderStats();

  useEffect(() => {
    fetchOrders();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      <Text>Total commandes: {stats.totalOrders}</Text>
      <Text>Dépenses totales: {stats.totalSpent} CFA</Text>
      <FlatList
        data={orders}
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </View>
  );
}
```

### 3. Créer une commande

```tsx
function CheckoutScreen() {
  const createOrder = useOrderStore(state => state.createOrder);
  const clearCart = useCartStore(state => state.clearCart);
  const isCreating = useOrderStore(state => state.isCreating);
  const router = useRouter();

  const [phone, setPhone] = useState('+225');
  const [shippingAddressId, setShippingAddressId] = useState<string>();

  const handleCreateOrder = async () => {
    try {
      const newOrder = await createOrder({
        paymentMethod: 'WAVE',
        contactPhone: phone,
        shippingAddressId,
        billingAddressId: shippingAddressId,
        notes: 'Livraison rapide svp',
      });

      // Clear cart after successful order
      await clearCart();

      // Navigate to order confirmation
      router.push(`/order/${newOrder.id}`);

      Alert.alert('Succès', 'Commande créée avec succès');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la commande');
    }
  };

  return (
    <View>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="Numéro Wave"
      />
      {/* Address selection */}
      <Button
        onPress={handleCreateOrder}
        disabled={isCreating}
        title={isCreating ? 'Création...' : 'Créer la commande'}
      />
    </View>
  );
}
```

### 4. Afficher les détails d'une commande

```tsx
function OrderDetailScreen({ orderId }: { orderId: string }) {
  const fetchOrderById = useOrderStore(state => state.fetchOrderById);
  const currentOrder = useCurrentOrder();
  const isLoading = useOrderStore(state => state.isLoading);

  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId]);

  if (isLoading || !currentOrder) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      <Text>Commande #{currentOrder.orderNumber}</Text>
      <Text>Statut: {currentOrder.status}</Text>
      <Text>Total: {currentOrder.totalAmount} CFA</Text>

      {currentOrder.items.map((item) => (
        <View key={item.id}>
          <Text>{item.productName}</Text>
          <Text>Quantité: {item.quantity}</Text>
          <Text>Prix: {item.totalPrice} CFA</Text>
        </View>
      ))}
    </View>
  );
}
```

### 5. Annuler une commande

```tsx
function OrderActions({ order }: { order: Order }) {
  const cancelOrder = useOrderStore(state => state.cancelOrder);
  const isCancelling = useOrderStore(state => state.isCancelling);

  const handleCancel = async () => {
    Alert.alert(
      'Annulation',
      'Voulez-vous annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder(order.id, 'Changement d\'avis');
              Alert.alert('Succès', 'Commande annulée');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible d\'annuler la commande');
            }
          },
        },
      ]
    );
  };

  // Only show cancel button for pending/confirmed orders
  if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
    return null;
  }

  return (
    <Button
      onPress={handleCancel}
      disabled={isCancelling}
      title={isCancelling ? 'Annulation...' : 'Annuler la commande'}
    />
  );
}
```

### 6. Filtrer les commandes

```tsx
function OrdersScreen() {
  const setStatusFilter = useOrderStore(state => state.setStatusFilter);
  const clearFilters = useOrderStore(state => state.clearFilters);
  const orders = useOrders();

  return (
    <View>
      <View style={{ flexDirection: 'row' }}>
        <Button title="Toutes" onPress={() => clearFilters()} />
        <Button title="En attente" onPress={() => setStatusFilter('PENDING')} />
        <Button title="Confirmées" onPress={() => setStatusFilter('CONFIRMED')} />
        <Button title="Livrées" onPress={() => setStatusFilter('DELIVERED')} />
        <Button title="Annulées" onPress={() => setStatusFilter('CANCELLED')} />
      </View>

      <FlatList
        data={orders}
        renderItem={({ item }) => <OrderCard order={item} />}
      />
    </View>
  );
}
```

### 7. Suivre une commande

```tsx
function OrderTrackingScreen({ orderId }: { orderId: string }) {
  const trackOrder = useOrderStore(state => state.trackOrder);
  const [trackingInfo, setTrackingInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTracking();
  }, [orderId]);

  const loadTracking = async () => {
    setIsLoading(true);
    try {
      const info = await trackOrder(orderId);
      setTrackingInfo(info);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de charger le suivi');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!trackingInfo) {
    return <Text>Aucune information de suivi disponible</Text>;
  }

  return (
    <View>
      <Text>Statut: {trackingInfo.status}</Text>
      <Text>Numéro de suivi: {trackingInfo.tracking?.trackingNumber}</Text>

      {trackingInfo.events?.map((event: any) => (
        <View key={event.id}>
          <Text>{event.description}</Text>
          <Text>{new Date(event.eventDate).toLocaleDateString()}</Text>
        </View>
      ))}
    </View>
  );
}
```

## 🔄 Pagination des commandes

```tsx
function OrdersScreen() {
  const fetchMoreOrders = useOrderStore(state => state.fetchMoreOrders);
  const orders = useOrders();
  const isLoadingMore = useOrderStore(state => state.isLoadingMore);
  const page = useOrderStore(state => state.page);
  const totalPages = useOrderStore(state => state.totalPages);

  const handleLoadMore = () => {
    if (page < totalPages && !isLoadingMore) {
      fetchMoreOrders();
    }
  };

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => <OrderCard order={item} />}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      ListFooterComponent={
        isLoadingMore ? <LoadingSpinner /> : null
      }
    />
  );
}
```

## 🎯 Bonnes pratiques

### 1. Gestion des erreurs

```tsx
function MyComponent() {
  const error = useCartStore(state => state.error);
  const clearError = useCartStore(state => state.clearError);

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [
        { text: 'OK', onPress: () => clearError() }
      ]);
    }
  }, [error]);
}
```

### 2. Synchronisation automatique

```tsx
function CartScreen() {
  const fetchCart = useCartStore(state => state.fetchCart);
  const needsSync = useCartStore(state => state.needsSync);

  useFocusEffect(
    useCallback(() => {
      if (needsSync()) {
        fetchCart();
      }
    }, [])
  );
}
```

### 3. Optimistic Updates (optionnel)

Pour une meilleure UX, vous pouvez mettre à jour l'UI immédiatement avant l'appel API:

```tsx
const updateQuantity = async (itemId: string, newQuantity: number) => {
  // Update UI immediately
  set(state => ({
    items: state.items.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    )
  }));

  try {
    // Then update server
    await cartService.updateCartItem(itemId, { quantity: newQuantity });
  } catch (error) {
    // Revert on error
    await fetchCart();
    throw error;
  }
};
```

## 📋 Types disponibles

### CartItem
```typescript
interface CartItem {
  id: string;
  userId: string;
  productType: 'GIFT_CARD' | 'PHYSICAL_PRODUCT';
  giftCardId?: string;
  physicalProductId?: string;
  quantity: number;
  giftCardAmount?: number;
  giftCard?: GiftCard;
  physicalProduct?: PhysicalProduct;
}
```

### Order
```typescript
interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  items: OrderItem[];
  // ... autres champs
}
```

## 🔐 Notes importantes

1. **Authentification requise**: Toutes les routes nécessitent un token Bearer valide
2. **Payment Method**: Seul `WAVE` est supporté actuellement
3. **Phone Format**: Les numéros de téléphone doivent être au format international (+225...)
4. **Persistence**: Les stores sont automatiquement sauvegardés dans AsyncStorage
5. **Sync**: Les données sont automatiquement synchronisées toutes les 5 minutes

## 🚀 Prochaines étapes

1. Intégrer les nouveaux stores dans vos écrans existants
2. Remplacer l'ancien `useCartStore` par le nouveau `useCartStore`
3. Tester tous les flux (ajout au panier, création de commande, etc.)
4. Ajouter la gestion des adresses de livraison
5. Intégrer le paiement Wave
