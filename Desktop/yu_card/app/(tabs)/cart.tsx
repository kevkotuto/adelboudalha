import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useRef, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button, IconButton } from '@/components/ui/Buttons';
import { Card, Container, Divider, EmptyState } from '@/components/ui/Layout';
import { WaveBottomSheet } from '@/components/ui/Payment';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { useCartItems, useCartStore, useCartTotal } from '@/stores/useCartStore';
import { useOrderStore } from '@/stores/useOrderStore';
import { CartItem } from '@/types/order'; // Explicit import from order.ts to use correct CartItem type

export default function CartScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const waveBottomSheetRef = useRef<BottomSheetModal>(null);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Cart store
  const fetchCart = useCartStore((state) => state.fetchCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const clearCart = useCartStore((state) => state.clearCart);

  const items = useCartItems();
  const total = useCartTotal();
  const currency = 'CFA';

  const isLoading = useCartStore((state) => state.isLoading);
  const isUpdating = useCartStore((state) => state.isUpdating);
  const isRemoving = useCartStore((state) => state.isRemoving);
  const error = useCartStore((state) => state.error);
  const clearError = useCartStore((state) => state.clearError);

  // Order store for checkout
  const createOrder = useOrderStore((state) => state.createOrder);
  const isCreating = useOrderStore((state) => state.isCreating);

  // Load cart on mount
  React.useEffect(() => {
    fetchCart();
  }, []);

  // Open Wave payment bottom sheet when order is created
  React.useEffect(() => {
    if (currentOrderId) {
      console.log('💳 Opening Wave payment bottom sheet for order:', currentOrderId);
      // Use setTimeout to ensure the bottom sheet is mounted before opening
      setTimeout(() => {
        if (waveBottomSheetRef.current) {
          console.log('✅ WaveBottomSheet ref is available, opening...');
          waveBottomSheetRef.current.present();
        } else {
          console.error('❌ WaveBottomSheet ref is null!');
        }
      }, 100);
    }
  }, [currentOrderId]);

  // Debug logging for items
  React.useEffect(() => {
    console.log('🛒 Cart Screen - Items state:', {
      itemsLength: items.length,
      items: items.map(item => ({
        id: item.id,
        productType: item.productType,
        quantity: item.quantity,
        hasGiftCard: !!item.giftCard,
        hasPhysicalProduct: !!item.physicalProduct,
      })),
    });
  }, [items]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error, [{ text: 'OK', onPress: () => clearError() }]);
    }
  }, [error]);

  // Handle pull-to-refresh
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCart();
    } catch (error) {
      console.error('Failed to refresh cart:', error);
    } finally {
      setRefreshing(false);
    }
  }, [fetchCart]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const handleCheckout = async () => {
    if (items.length === 0) return;

    try {
      // Step 1: Verify cart on backend before creating order
      console.log('🔄 Refreshing cart from backend before checkout...');
      await fetchCart();

      // Get fresh items after refresh
      const freshItems = useCartStore.getState().items;
      console.log('📦 Fresh cart items from backend:', freshItems.length);

      if (freshItems.length === 0) {
        Alert.alert('Erreur', 'Votre panier est vide. Veuillez ajouter des produits avant de passer commande.');
        return;
      }

      // Step 2: Check if order contains physical products
      const hasPhysicalProducts = freshItems.some(
        (item) => item.productType === 'PHYSICAL_PRODUCT'
      );

      console.log('📦 Creating order with items:', freshItems);
      console.log('🏠 Has physical products:', hasPhysicalProducts);

      // Step 3: Create order with items from cart
      // Note: Backend automatically uses cart items
      const orderData: any = {
        paymentMethod: 'WAVE',
        contactPhone: '+225', // Will be provided by Wave payment card
        notes: 'Commande depuis l\'application mobile',
      };

      // Only include addresses if there are physical products
      // For digital-only orders (gift cards), don't send address fields at all
      // The backend validation requires these fields, so we omit them entirely for digital products

      const newOrder = await createOrder(orderData);

      console.log('📦 Cart received order:', newOrder);
      console.log('📦 Order type:', typeof newOrder);
      console.log('📦 Order keys:', newOrder ? Object.keys(newOrder) : 'null');

      // Validate order response
      if (!newOrder || !newOrder.id) {
        console.error('❌ Invalid order received in cart:', newOrder);
        throw new Error('Erreur lors de la création de la commande. Veuillez réessayer.');
      }

      console.log('✅ Order created:', newOrder.id, newOrder.orderNumber);

      // Step 3: Store order ID (useEffect will open the bottom sheet)
      console.log('📝 Setting currentOrderId to trigger bottom sheet opening...');
      setCurrentOrderId(newOrder.id);

    } catch (error: any) {
      console.error('❌ Failed to create order:', error);
      Alert.alert('Erreur', error.message || 'Impossible de créer la commande');
    }
  };

  const handlePaymentSuccess = async (orderId: string) => {
    console.log('🎉 Payment successful for order:', orderId);

    try {
      // Step 1: Close the Wave payment bottom sheet
      waveBottomSheetRef.current?.close();

      // Step 2: Reset current order ID
      setCurrentOrderId(null);

      // Step 3: Clear the cart after successful payment
      console.log('🧹 Clearing cart after successful payment...');
      await clearCart();
      console.log('✅ Cart cleared successfully');

      // Step 4: Force refresh cart from backend to ensure UI is updated
      console.log('🔄 Fetching cart from backend to update UI...');
      await fetchCart();
      console.log('✅ Cart UI updated');

      // Step 4: Show success message and navigate
      Alert.alert(
        '🎉 Paiement réussi !',
        'Votre commande a été confirmée avec succès.\n\nVous pouvez consulter les détails de votre commande.',
        [
          {
            text: '📦 Voir la commande',
            onPress: () => {
              console.log('📦 Navigating to order details:', orderId);
              router.push(`/order/${orderId}`);
            },
          },
          {
            text: '📋 Mes commandes',
            onPress: () => {
              console.log('📋 Navigating to orders list');
              router.push('/(tabs)/orders');
            },
          },
        ],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('❌ Failed to clear cart after payment:', error);
      // Force refresh cart even if clearing fails
      try {
        await fetchCart();
      } catch (fetchError) {
        console.error('❌ Failed to fetch cart after payment:', fetchError);
      }
      // Still navigate even if cart clearing fails
      Alert.alert(
        '⚠️ Attention',
        'Le paiement a réussi mais le panier n\'a pas pu être vidé.\n\nVous pouvez consulter votre commande.',
        [
          {
            text: 'Voir la commande',
            onPress: () => router.push(`/order/${orderId}`),
          },
        ]
      );
    }
  };

  const handlePaymentError = useCallback((error: string) => {
    waveBottomSheetRef.current?.close();
    Alert.alert('Erreur de paiement', error, [
      {
        text: 'Réessayer',
        onPress: () => {
          if (currentOrderId) {
            waveBottomSheetRef.current?.present();
          }
        },
      },
      {
        text: 'Annuler',
        style: 'cancel',
        onPress: () => {
          // Reset order ID on cancel
          setCurrentOrderId(null);
        },
      },
    ]);
  }, [currentOrderId]);

  const CartItemComponent = ({ item }: { item: CartItem }) => {
    // Debug: Log the full item to understand its structure
    console.log('🔍 CartItemComponent - Full item:', JSON.stringify(item, null, 2));

    // Get product details based on type
    const product = item.productType === 'GIFT_CARD' ? item.giftCard : item.physicalProduct;
    const productName = item.productType === 'GIFT_CARD'
      ? item.giftCard?.title
      : item.physicalProduct?.name;
    const productBrand = item.productType === 'GIFT_CARD'
      ? item.giftCard?.brand
      : item.physicalProduct?.brand;

    // Get image
    const imageUrl = item.productType === 'GIFT_CARD'
      ? item.giftCard?.imageUrl
      : (item.physicalProduct?.images?.[0] || null);

    // Calculate prices (convert to number if string)
    const unitPrice = item.productType === 'GIFT_CARD'
      ? Number(item.giftCardAmount || 0)
      : Number(item.physicalProduct?.price || 0);
    const totalPrice = unitPrice * item.quantity;

    console.log('🎯 CartItemComponent - Extracted data:', {
      productType: item.productType,
      productName,
      productBrand,
      imageUrl,
      unitPrice,
      totalPrice,
      hasGiftCard: !!item.giftCard,
      hasPhysicalProduct: !!item.physicalProduct,
    });

    // Get stock info
    const stockQuantity = product?.stockQuantity || 999;

    const handleRemove = async () => {
      Alert.alert(
        'Supprimer',
        'Voulez-vous retirer cet article du panier ?',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: async () => {
              try {
                await removeItem(item.id);
              } catch (error) {
                // Error already handled by store
              }
            },
          },
        ]
      );
    };

    const handleUpdateQuantity = async (newQuantity: number) => {
      if (newQuantity <= 0) {
        handleRemove();
        return;
      }

      try {
        await updateQuantity(item.id, newQuantity);
      } catch (error) {
        // Error already handled by store
      }
    };

    const disabled = isUpdating || isRemoving;

    return (
      <View style={[styles.cartItem, disabled && { opacity: 0.6 }]}>
        {/* Image */}
        <View style={styles.itemImageContainer}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.itemImage}
              contentFit="contain"
            />
          ) : (
            <View style={[styles.itemImage, { backgroundColor: Colors.gray[300] }]} />
          )}
        </View>

        {/* Product Info */}
        <View style={styles.itemInfo}>
          <Paragraph numberOfLines={2} weight="medium">
            {productName || 'Produit'}
          </Paragraph>
          {productBrand && <Caption color="secondary">{productBrand}</Caption>}

          {item.productType === 'GIFT_CARD' && item.giftCardAmount && (
            <Caption color="accent" style={{ marginTop: Spacing.xs }}>
              {t('cart.gift_card')} - {formatAmount(Number(item.giftCardAmount))} CFA
            </Caption>
          )}

          {item.productType === 'PHYSICAL_PRODUCT' && (
            <View style={styles.deliveryInfo}>
              <Ionicons name="car-outline" size={14} color={Colors.info} />
              <Caption color="secondary" style={styles.deliveryText}>
                {t('cart.delivery')}: 2-3 jours
              </Caption>
            </View>
          )}

          <Paragraph color="primary" weight="medium" style={{ marginTop: Spacing.sm }}>
            {formatAmount(unitPrice)} CFA
          </Paragraph>
        </View>

        {/* Quantity Controls */}
        <View style={styles.quantityControls}>
          <View style={styles.quantitySelector}>
            <IconButton
              icon="remove"
              size="sm"
              variant="ghost"
              onPress={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={disabled || item.quantity <= 1}
              style={styles.quantityButton}
            />

            <View style={styles.quantityValue}>
              <Caption weight="medium">{item.quantity}</Caption>
            </View>

            <IconButton
              icon="add"
              size="sm"
              variant="ghost"
              onPress={() => handleUpdateQuantity(item.quantity + 1)}
              disabled={disabled || item.quantity >= stockQuantity}
              style={styles.quantityButton}
            />
          </View>

          <IconButton
            icon="trash-outline"
            size="sm"
            variant="ghost"
            onPress={handleRemove}
            iconColor={Colors.error}
            style={styles.deleteButton}
            disabled={disabled}
          />
        </View>

        {/* Stock Warning */}
        {stockQuantity && item.quantity >= stockQuantity && (
          <View style={styles.stockWarning}>
            <Ionicons name="warning-outline" size={14} color={Colors.warning} />
            <Caption style={{ ...styles.stockWarningText, color: Colors.warning }}>
              {t('cart.max_quantity_reached')}
            </Caption>
          </View>
        )}
      </View>
    );
  };

  const handleClearCart = async () => {
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
            } catch (error) {
              // Error already handled by store
            }
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Title level={2}>
        {t('cart.title')} ({items.length})
      </Title>

      <Button
        variant="ghost"
        size="sm"
        onPress={handleClearCart}
        disabled={isLoading}
        textStyle={{ color: Colors.error }}
      >
        {t('cart.clear_all')}
      </Button>
    </View>
  );

  const renderFooter = () => (
    <Card style={styles.summaryCard}>
      <Title level={5} style={styles.summaryTitle}>
        {t('cart.order_summary')}
      </Title>

      <View style={styles.summaryRow}>
        <Paragraph color="secondary">{t('cart.subtotal')}</Paragraph>
        <Paragraph weight="medium">
          {formatAmount(total)} {currency}
        </Paragraph>
      </View>

      <View style={styles.summaryRow}>
        <Paragraph color="secondary">{t('cart.delivery')}</Paragraph>
        <Caption style={{ color: Colors.success }}>{t('cart.free_delivery')}</Caption>
      </View>

      <View style={styles.summaryRow}>
        <Paragraph color="secondary">{t('cart.taxes')}</Paragraph>
        <Caption color="secondary">{t('cart.included')}</Caption>
      </View>

      <Divider style={styles.summaryDivider} />

      <View style={styles.totalRow}>
        <Title level={5}>{t('cart.total')}</Title>
        <Title level={5} color="primary">
          {formatAmount(total)} {currency}
        </Title>
      </View>

      <Button
        variant="primary"
        size="lg"
        onPress={handleCheckout}
        style={styles.checkoutButton}
        fullWidth
        disabled={isCreating || isLoading}
      >
        {isCreating ? (
          <>
            <ActivityIndicator size="small" color={Colors.white} />
            <Caption color="inverse">Création en cours...</Caption>
          </>
        ) : (
          <>
            <Ionicons name="card-outline" size={20} color={Colors.white} />
            {t('cart.checkout_with_wave')}
          </>
        )}
      </Button>

      <View style={styles.paymentInfo}>
        <Ionicons name="shield-checkmark-outline" size={16} color={Colors.success} />
        <Caption color="secondary" style={styles.paymentInfoText}>
          {t('cart.secure_payment_wave')}
        </Caption>
      </View>
    </Card>
  );

  // Show loading indicator on initial load
  if (isLoading && items.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <Container variant="fullscreen">
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Paragraph style={{ marginTop: Spacing.md }}>
              Chargement du panier...
            </Paragraph>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {items.length > 0 ? (
        <View style={styles.container}>
          <FlatList
            data={items}
            renderItem={({ item }) => <CartItemComponent item={item} />}
            keyExtractor={(item) => item.id}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            contentContainerStyle={styles.flatListContent}
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
        </View>
      ) : (
        <Container variant="fullscreen">
          {/* Header même quand vide */}
          <View style={styles.header}>
            <Title level={2}>
              {t('cart.title')} (0)
            </Title>
          </View>

          <View style={styles.emptyContainer}>
            <EmptyState
              icon="bag-outline"
              title={t('cart.empty')}
              description={t('cart.empty_description')}
            />

            <Button
              variant="primary"
              onPress={() => router.push('/(tabs)/')}
              style={styles.continueShoppingButton}
            >
              {t('cart.continue_shopping')}
            </Button>
          </View>
        </Container>
      )}

      {/* Wave Payment Bottom Sheet - Always mounted for reliable ref access */}
      <WaveBottomSheet
        ref={waveBottomSheetRef}
        orderId={currentOrderId || ''}
        amount={total}
        currency={currency}
        description={t('cart.checkout_description')}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
        onClose={() => waveBottomSheetRef.current?.close()}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  flatListContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },

  cartItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginBottom: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
  },

  itemImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },

  itemImage: {
    width: '100%',
    height: '100%',
  },

  itemInfo: {
    flex: 1,
    gap: Spacing.xs,
  },

  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliveryText: {
    marginLeft: Spacing.xs,
    fontSize: 12,
  },

  quantityControls: {
    gap: Spacing.sm,
    alignItems: 'center',
  },

  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  quantityValue: {
    minWidth: 10,
    alignItems: 'center',
  },

  quantityButton: {
    padding: Spacing.sm,
  },

  deleteButton: {
    marginTop: Spacing.xs,
  },

  stockWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.warning + '20',
    borderRadius: BorderRadius.sm,
  },

  stockWarningText: {
    marginLeft: Spacing.xs,
    fontSize: 12,
  },

  summaryCard: {
    padding: Spacing.lg,
    marginTop: Spacing.md,
  },

  summaryTitle: {
    marginBottom: Spacing.lg,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  summaryDivider: {
    marginVertical: Spacing.md,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paymentInfoText: {
    marginLeft: Spacing.xs,
    fontSize: 12,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },

  continueShoppingButton: {
    marginTop: Spacing.xl,
  },
});
