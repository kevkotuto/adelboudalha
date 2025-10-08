# Guide de Migration - Cart & Orders Backend Integration

Ce guide explique comment migrer de l'ancien système de panier (mock data) vers le nouveau système intégré avec le backend.

## 📋 Vue d'ensemble

### Avant (Ancien système)
- ✗ Données stockées localement uniquement
- ✗ Pas de synchronisation avec le serveur
- ✗ Pas de gestion des commandes
- ✗ Types de données incompatibles avec l'API

### Après (Nouveau système)
- ✓ Données synchronisées avec le backend
- ✓ Gestion complète du panier (CRUD)
- ✓ Système de commandes intégré
- ✓ Types alignés avec l'API backend
- ✓ Gestion des erreurs améliorée
- ✓ États de chargement

## 🔄 Migration du Cart Store

### Ancien fichier: `stores/cartStore.ts`
### Nouveau fichier: `stores/useCartStore.ts`

### Changements principaux

#### 1. Import du store

**Avant:**
```tsx
import useCartStore from '@/stores/cartStore';
```

**Après:**
```tsx
import { useCartStore, useCartItems, useCartTotal } from '@/stores/useCartStore';
```

#### 2. Structure des données

**Avant:**
```typescript
interface CartItem {
  id: string;
  type: 'gift_card' | 'physical_product';
  productId: string;
  name: string;
  price: number;
  quantity: number;
  // ...
}
```

**Après:**
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
  // ...
}
```

#### 3. Méthodes du store

**Avant:**
```tsx
const addItem = useCartStore(state => state.addItem);
addItem(product, quantity);
```

**Après:**
```tsx
const addToCart = useCartStore(state => state.addToCart);
await addToCart('GIFT_CARD', productId, quantity, amount);
```

#### 4. Chargement initial

**Avant:**
```tsx
// Pas de chargement, données locales uniquement
const items = useCartStore(state => state.items);
```

**Après:**
```tsx
const fetchCart = useCartStore(state => state.fetchCart);
const items = useCartItems();

useEffect(() => {
  fetchCart(); // Charge depuis le serveur
}, []);
```

## 🔄 Migration des composants

### Exemple 1: Écran du panier

**Avant:**
```tsx
function CartScreen() {
  const items = useCartStore(state => state.items);
  const total = useCartStore(state => state.total);
  const removeItem = useCartStore(state => state.removeItem);

  return (
    <View>
      {items.map(item => (
        <View key={item.id}>
          <Text>{item.name}</Text>
          <Button onPress={() => removeItem(item.productId)}>
            Supprimer
          </Button>
        </View>
      ))}
      <Text>Total: {total} CFA</Text>
    </View>
  );
}
```

**Après:**
```tsx
function CartScreen() {
  const fetchCart = useCartStore(state => state.fetchCart);
  const removeItem = useCartStore(state => state.removeItem);
  const items = useCartItems();
  const total = useCartTotal();
  const isLoading = useCartStore(state => state.isLoading);

  useEffect(() => {
    fetchCart();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <View>
      {items.map(item => (
        <View key={item.id}>
          <Text>
            {item.productType === 'GIFT_CARD'
              ? item.giftCard?.title
              : item.physicalProduct?.name}
          </Text>
          <Button onPress={() => removeItem(item.id)}>
            Supprimer
          </Button>
        </View>
      ))}
      <Text>Total: {total} CFA</Text>
    </View>
  );
}
```

### Exemple 2: Bouton Ajouter au panier

**Avant:**
```tsx
function AddToCartButton({ product }: { product: GiftCardData }) {
  const addItem = useCartStore(state => state.addItem);

  return (
    <Button onPress={() => addItem(product, 1)}>
      Ajouter au panier
    </Button>
  );
}
```

**Après:**
```tsx
function AddToCartButton({ product }: { product: GiftCard }) {
  const addToCart = useCartStore(state => state.addToCart);
  const isAdding = useCartStore(state => state.isAdding);

  const handleAdd = async () => {
    try {
      await addToCart('GIFT_CARD', product.id, 1, product.price);
      Alert.alert('Succès', 'Article ajouté');
    } catch (error) {
      Alert.alert('Erreur', 'Échec de l\'ajout');
    }
  };

  return (
    <Button onPress={handleAdd} disabled={isAdding}>
      {isAdding ? 'Ajout...' : 'Ajouter au panier'}
    </Button>
  );
}
```

### Exemple 3: Mise à jour de la quantité

**Avant:**
```tsx
function QuantityControl({ productId, quantity }: any) {
  const updateQuantity = useCartStore(state => state.updateQuantity);

  return (
    <View>
      <Button onPress={() => updateQuantity(productId, quantity - 1)}>-</Button>
      <Text>{quantity}</Text>
      <Button onPress={() => updateQuantity(productId, quantity + 1)}>+</Button>
    </View>
  );
}
```

**Après:**
```tsx
function QuantityControl({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const isUpdating = useCartStore(state => state.isUpdating);

  const handleUpdate = async (newQty: number) => {
    try {
      await updateQuantity(item.id, newQty);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour');
    }
  };

  return (
    <View>
      <Button
        onPress={() => handleUpdate(item.quantity - 1)}
        disabled={isUpdating}
      >
        -
      </Button>
      <Text>{item.quantity}</Text>
      <Button
        onPress={() => handleUpdate(item.quantity + 1)}
        disabled={isUpdating}
      >
        +
      </Button>
    </View>
  );
}
```

## 📦 Intégration du système de commandes

Le nouveau système inclut la gestion complète des commandes.

### Créer une commande depuis le panier

```tsx
import { useOrderStore } from '@/stores/useOrderStore';
import { useCartStore } from '@/stores/useCartStore';

function CheckoutScreen() {
  const createOrder = useOrderStore(state => state.createOrder);
  const clearCart = useCartStore(state => state.clearCart);
  const isCreating = useOrderStore(state => state.isCreating);

  const handleCheckout = async () => {
    try {
      const order = await createOrder({
        paymentMethod: 'WAVE',
        contactPhone: '+2250500808585',
        notes: 'Livraison rapide',
      });

      // Vider le panier après succès
      await clearCart();

      // Naviguer vers la page de confirmation
      router.push(`/order/${order.id}`);
    } catch (error) {
      Alert.alert('Erreur', 'Échec de la création de la commande');
    }
  };

  return (
    <Button onPress={handleCheckout} disabled={isCreating}>
      {isCreating ? 'Création...' : 'Passer la commande'}
    </Button>
  );
}
```

### Afficher la liste des commandes

```tsx
import { useOrderStore, useOrders } from '@/stores/useOrderStore';

function OrdersScreen() {
  const fetchOrders = useOrderStore(state => state.fetchOrders);
  const orders = useOrders();
  const isLoading = useOrderStore(state => state.isLoading);

  useEffect(() => {
    fetchOrders();
  }, []);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <FlatList
      data={orders}
      renderItem={({ item }) => (
        <View>
          <Text>Commande #{item.orderNumber}</Text>
          <Text>Statut: {item.status}</Text>
          <Text>Total: {item.totalAmount} CFA</Text>
        </View>
      )}
    />
  );
}
```

## 🔍 Points d'attention

### 1. Gestion des erreurs

Le nouveau système gère automatiquement les erreurs, mais vous devez les afficher à l'utilisateur:

```tsx
const error = useCartStore(state => state.error);
const clearError = useCartStore(state => state.clearError);

useEffect(() => {
  if (error) {
    Alert.alert('Erreur', error, [
      { text: 'OK', onPress: () => clearError() }
    ]);
  }
}, [error]);
```

### 2. États de chargement

Utilisez les états de chargement pour désactiver les boutons et afficher des indicateurs:

```tsx
const isAdding = useCartStore(state => state.isAdding);
const isUpdating = useCartStore(state => state.isUpdating);
const isRemoving = useCartStore(state => state.isRemoving);

<Button disabled={isAdding || isUpdating || isRemoving}>
  Action
</Button>
```

### 3. Synchronisation automatique

Le panier vérifie automatiquement s'il doit se synchroniser:

```tsx
const fetchCart = useCartStore(state => state.fetchCart);
const needsSync = useCartStore(state => state.needsSync);

useFocusEffect(
  useCallback(() => {
    if (needsSync()) {
      fetchCart();
    }
  }, [])
);
```

### 4. ProductType

Attention au changement de format:
- Ancien: `'gift_card' | 'physical_product'`
- Nouveau: `'GIFT_CARD' | 'PHYSICAL_PRODUCT'`

### 5. Identification des produits

**Avant:**
- `productId` unique pour identifier l'article

**Après:**
- `id` pour l'item du panier (généré par le backend)
- `giftCardId` OU `physicalProductId` pour identifier le produit

## 📝 Checklist de migration

- [ ] Remplacer l'import de `cartStore` par `useCartStore`
- [ ] Ajouter `fetchCart()` dans les composants qui affichent le panier
- [ ] Mettre à jour les appels à `addItem` vers `addToCart`
- [ ] Modifier `removeItem` pour utiliser `item.id` au lieu de `productId`
- [ ] Ajouter la gestion des états de chargement (`isAdding`, `isUpdating`, etc.)
- [ ] Ajouter la gestion des erreurs avec `error` et `clearError`
- [ ] Mettre à jour l'accès aux données produit (`item.giftCard?.title` au lieu de `item.name`)
- [ ] Changer `type` en `productType` avec les valeurs en majuscules
- [ ] Implémenter le système de commandes avec `useOrderStore`
- [ ] Ajouter la création de commande dans le processus de checkout
- [ ] Tester tous les flux (ajout, mise à jour, suppression, checkout)

## 🚀 Avantages du nouveau système

1. **Synchronisation serveur** - Les données sont toujours à jour
2. **Multi-device** - Le panier est synchronisé entre appareils
3. **Persistance** - Les données survivent à la fermeture de l'app
4. **Commandes** - Système complet de gestion des commandes
5. **Types sûrs** - Types TypeScript alignés avec l'API
6. **Gestion d'erreurs** - Meilleure gestion des cas d'erreur
7. **UX améliorée** - États de chargement et retours utilisateur

## 📚 Ressources

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Guide complet d'utilisation
- [examples/CartExample.tsx](./examples/CartExample.tsx) - Exemples de composants Cart
- [examples/OrdersExample.tsx](./examples/OrdersExample.tsx) - Exemples de composants Orders
- [stores/useCartStore.ts](./stores/useCartStore.ts) - Store du panier
- [stores/useOrderStore.ts](./stores/useOrderStore.ts) - Store des commandes
- [services/cartService.ts](./services/cartService.ts) - Service API du panier
- [services/orderService.ts](./services/orderService.ts) - Service API des commandes

## ❓ Questions fréquentes

### Q: Que faire si le backend n'est pas disponible?
R: Le store gère automatiquement les erreurs réseau. Les données persistées dans AsyncStorage restent disponibles.

### Q: Comment tester sans backend?
R: Utilisez les fichiers d'exemple dans `/examples` qui peuvent fonctionner indépendamment.

### Q: Puis-je utiliser les deux systèmes en parallèle?
R: Oui, pendant la migration. Mais renommez l'ancien store pour éviter les conflits.

### Q: Les données de l'ancien panier seront-elles perdues?
R: Oui, mais vous pouvez créer une fonction de migration si nécessaire.

### Q: Comment gérer les Gift Cards avec montants personnalisés?
R: Utilisez le paramètre `giftCardAmount` dans `addToCart()`:
```tsx
await addToCart('GIFT_CARD', cardId, 1, customAmount);
```
