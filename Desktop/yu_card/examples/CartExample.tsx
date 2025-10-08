/**
 * Exemple d'utilisation du nouveau Cart Store avec les vraies données backend
 *
 * Ce fichier montre comment intégrer le panier dans vos composants
 */

import React, { useEffect, useState } from 'react';
import { View, FlatList, Alert, ActivityIndicator } from 'react-native';
import { useCartStore, useCartItems, useCartTotal, useCartItemsCount } from '@/stores/useCartStore';
import { CartItem } from '@/types';
import Button from '@/components/ui/Buttons/Button';
import Title from '@/components/ui/Typography/Title';
import Paragraph from '@/components/ui/Typography/Paragraph';
import Container from '@/components/ui/Layout/Container';
import Card from '@/components/ui/Layout/Card';
import { Colors } from '@/constants/Colors';

// ==================================
// CART SCREEN EXAMPLE
// ==================================

export function CartScreenExample() {
  const fetchCart = useCartStore((state) => state.fetchCart);
  const clearCart = useCartStore((state) => state.clearCart);

  const items = useCartItems();
  const total = useCartTotal();
  const itemsCount = useCartItemsCount();

  const isLoading = useCartStore((state) => state.isLoading);
  const error = useCartStore((state) => state.error);
  const clearError = useCartStore((state) => state.clearError);

  useEffect(() => {
    // Charger le panier au montage du composant
    fetchCart();
  }, []);

  useEffect(() => {
    // Afficher les erreurs
    if (error) {
      Alert.alert('Erreur', error, [
        { text: 'OK', onPress: () => clearError() }
      ]);
    }
  }, [error]);

  const handleClearCart = () => {
    Alert.alert(
      'Vider le panier',
      'Êtes-vous sûr de vouloir vider votre panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
              Alert.alert('Succès', 'Panier vidé');
            } catch (err) {
              // Error already handled by store
            }
          }
        }
      ]
    );
  };

  if (isLoading && items.length === 0) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Paragraph style={{ marginTop: 16 }}>Chargement du panier...</Paragraph>
        </View>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Title level={2}>Panier vide</Title>
          <Paragraph style={{ marginTop: 8, textAlign: 'center' }}>
            Votre panier est vide. Ajoutez des articles pour commencer vos achats.
          </Paragraph>
        </View>
      </Container>
    );
  }

  return (
    <Container>
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View>
            <Title level={2}>Mon Panier</Title>
            <Paragraph>{itemsCount} article{itemsCount > 1 ? 's' : ''}</Paragraph>
          </View>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="small"
              onPress={handleClearCart}
              disabled={isLoading}
            >
              Vider
            </Button>
          )}
        </View>

        {/* Cart Items */}
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <CartItemCard item={item} />}
          contentContainerStyle={{ padding: 16 }}
        />

        {/* Footer - Total */}
        <Card style={{ margin: 16, padding: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <Paragraph>Sous-total</Paragraph>
            <Paragraph weight="bold">{total.toLocaleString()} CFA</Paragraph>
          </View>

          <Button
            variant="primary"
            onPress={() => {
              // Navigate to checkout
              Alert.alert('Info', 'Navigation vers la page de paiement');
            }}
          >
            Passer la commande
          </Button>
        </Card>
      </View>
    </Container>
  );
}

// ==================================
// CART ITEM CARD
// ==================================

function CartItemCard({ item }: { item: CartItem }) {
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const isUpdating = useCartStore((state) => state.isUpdating);
  const isRemoving = useCartStore((state) => state.isRemoving);

  const [isProcessing, setIsProcessing] = useState(false);

  // Get product details based on type
  const product = item.productType === 'GIFT_CARD' ? item.giftCard : item.physicalProduct;
  const productName = item.productType === 'GIFT_CARD'
    ? item.giftCard?.title
    : item.physicalProduct?.name;
  const productBrand = item.productType === 'GIFT_CARD'
    ? item.giftCard?.brand
    : item.physicalProduct?.brand;

  // Calculate prices
  const unitPrice = item.productType === 'GIFT_CARD'
    ? (item.giftCardAmount || 0)
    : (item.physicalProduct?.price || 0);
  const totalPrice = unitPrice * item.quantity;

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) {
      handleRemove();
      return;
    }

    setIsProcessing(true);
    try {
      await updateQuantity(item.id, newQuantity);
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de mettre à jour la quantité');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemove = () => {
    Alert.alert(
      'Supprimer',
      'Voulez-vous retirer cet article du panier ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            setIsProcessing(true);
            try {
              await removeItem(item.id);
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'article');
            } finally {
              setIsProcessing(false);
            }
          }
        }
      ]
    );
  };

  const disabled = isProcessing || isUpdating || isRemoving;

  return (
    <Card style={{ marginBottom: 12, padding: 12, opacity: disabled ? 0.6 : 1 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {/* Product Info */}
        <View style={{ flex: 1 }}>
          <Paragraph weight="bold">{productName}</Paragraph>
          <Paragraph size="small" style={{ color: Colors.gray[600], marginTop: 4 }}>
            {productBrand}
          </Paragraph>
          {item.productType === 'GIFT_CARD' && item.giftCardAmount && (
            <Paragraph size="small" style={{ color: Colors.gray[600], marginTop: 4 }}>
              Montant: {item.giftCardAmount.toLocaleString()} CFA
            </Paragraph>
          )}
          <Paragraph weight="bold" style={{ marginTop: 8 }}>
            {totalPrice.toLocaleString()} CFA
          </Paragraph>
        </View>

        {/* Quantity Controls */}
        <View style={{ alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <Button
            variant="ghost"
            size="small"
            onPress={handleRemove}
            disabled={disabled}
          >
            Supprimer
          </Button>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Button
              variant="outline"
              size="small"
              onPress={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={disabled}
            >
              -
            </Button>
            <Paragraph weight="bold">{item.quantity}</Paragraph>
            <Button
              variant="outline"
              size="small"
              onPress={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={disabled}
            >
              +
            </Button>
          </View>
        </View>
      </View>
    </Card>
  );
}

// ==================================
// ADD TO CART BUTTON EXAMPLE
// ==================================

interface AddToCartButtonProps {
  productType: 'GIFT_CARD' | 'PHYSICAL_PRODUCT';
  productId: string;
  giftCardAmount?: number;
  quantity?: number;
}

export function AddToCartButton({
  productType,
  productId,
  giftCardAmount,
  quantity = 1,
}: AddToCartButtonProps) {
  const addToCart = useCartStore((state) => state.addToCart);
  const isAdding = useCartStore((state) => state.isAdding);

  const handleAddToCart = async () => {
    try {
      await addToCart(productType, productId, quantity, giftCardAmount);
      Alert.alert('Succès', 'Article ajouté au panier');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'article au panier');
    }
  };

  return (
    <Button
      variant="primary"
      onPress={handleAddToCart}
      disabled={isAdding}
    >
      {isAdding ? 'Ajout en cours...' : 'Ajouter au panier'}
    </Button>
  );
}

export default CartScreenExample;
