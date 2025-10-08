import { BottomSheetBackdrop, BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import React, { forwardRef, useCallback, useEffect, useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { useCartItems, useCartStore, useCartTotal } from '@/stores/useCartStore';
import { CartItem } from '@/types';
import { Button, IconButton } from '../Buttons';
import { Divider, EmptyState } from '../Layout';
import { Caption, Paragraph, Title } from '../Typography';

interface CartBottomSheetProps {
  onClose?: () => void;
  onCheckout?: () => void;
}

export const CartBottomSheet = forwardRef<BottomSheetModal, CartBottomSheetProps>(
  function CartBottomSheet({ onClose, onCheckout }, ref) {
    const { t } = useTranslation();
    const fetchCart = useCartStore((state) => state.fetchCart);
    const removeItem = useCartStore((state) => state.removeItem);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const clearCart = useCartStore((state) => state.clearCart);
    const isUpdating = useCartStore((state) => state.isUpdating);
    const isRemoving = useCartStore((state) => state.isRemoving);

    const items = useCartItems();
    const total = useCartTotal();
    const currency = 'CFA';

    const snapPoints = useMemo(() => ['70%', '85%'], []);

    // Debug logs
    React.useEffect(() => {
      console.log('📊 CartBottomSheet - Items:', items.length);
      console.log('📊 CartBottomSheet - Total:', total);
      console.log('📊 CartBottomSheet - Items detail:', JSON.stringify(items, null, 2));
    }, [items, total]);

    // Load cart on mount AND when items change
    useEffect(() => {
      fetchCart();
    }, [fetchCart]);

    // Refresh cart when bottom sheet might be opening
    const handleSheetChange = useCallback((index: number) => {
      if (index >= 0) {
        // Bottom sheet is opening/opened, refresh cart
        fetchCart();
      }
    }, [fetchCart]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.5}
          enableTouchThrough={false}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="close"
          style={[{ backgroundColor: 'rgba(0, 0, 0, 1)' }, StyleSheet.absoluteFillObject]}
        />
      ),
      []
    );

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat('fr-FR').format(amount);
    };

    const CartItemComponent = ({ item }: { item: CartItem }) => {
      // Get product details based on type
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

      // Get stock info
      const stockQuantity = item.productType === 'GIFT_CARD'
        ? (item.giftCard?.stockQuantity || 999)
        : (item.physicalProduct?.stockQuantity || 999);

      const handleUpdateQuantity = async (newQuantity: number) => {
        if (newQuantity <= 0) {
          await removeItem(item.id);
          return;
        }
        await updateQuantity(item.id, newQuantity);
      };

      const disabled = isUpdating || isRemoving;

      return (
        <View style={[styles.cartItem, disabled && { opacity: 0.6 }]}>
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

          <View style={styles.itemInfo}>
            <Paragraph numberOfLines={2} weight="medium">
              {productName || 'Produit'}
            </Paragraph>
            {productBrand && <Caption color="secondary">{productBrand}</Caption>}

            {item.productType === 'GIFT_CARD' && item.giftCardAmount && (
              <Caption color="accent">
                {t('cart.gift_card')} - {formatAmount(Number(item.giftCardAmount))} CFA
              </Caption>
            )}

            <View style={styles.priceQuantityRow}>
              <Paragraph color="primary" weight="medium">
                {formatAmount(unitPrice)} CFA
              </Paragraph>
            </View>
          </View>

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
              onPress={() => removeItem(item.id)}
              iconColor={Colors.error}
              style={styles.deleteButton}
              disabled={disabled}
            />
          </View>
        </View>
      );
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={true}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onChange={handleSheetChange}
      >
        <BottomSheetView style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Title level={3}>
              {t('cart.title')} ({items.length})
            </Title>

            <View style={styles.headerActions}>
              {items.length > 0 && (
                <Pressable
                  onPress={clearCart}
                  style={styles.clearButton}
                >
                  <Caption style={{ color: Colors.error }}>{t('cart.clear_all')}</Caption>
                </Pressable>
              )}

              <IconButton
                icon="close"
                variant="ghost"
                size="sm"
                onPress={onClose}
              />
            </View>
          </View>

          <Divider style={styles.headerDivider} />

          {/* Cart Items */}
          {items.length > 0 ? (
            <>
              <BottomSheetScrollView
                style={styles.itemsList}
                showsVerticalScrollIndicator={false}
              >
                {items.map((item) => (
                  <CartItemComponent key={item.id} item={item} />
                ))}
              </BottomSheetScrollView>

              {/* Summary */}
              <View style={styles.summary}>
                <Divider style={styles.summaryDivider} />

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

                <Divider style={styles.totalDivider} />

                <View style={styles.totalRow}>
                  <Title level={5}>{t('cart.total')}</Title>
                  <Title level={5} color="primary">
                    {formatAmount(total)} {currency}
                  </Title>
                </View>

                {/* Checkout Button */}
                <Button
                  variant="primary"
                  size="lg"
                  onPress={onCheckout}
                  style={styles.checkoutButton}
                  fullWidth
                >
                  {t('cart.checkout')}
                </Button>
              </View>
            </>
          ) : (
            <View style={styles.emptyContainer}>
              <EmptyState
                icon="bag-outline"
                title={t('cart.empty')}
                description={t('cart.empty_description')}
              />

              <Button
                variant="outline"
                onPress={onClose}
                style={styles.continueShoppingButton}
              >
                {t('cart.continue_shopping')}
              </Button>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },

  handleIndicator: {
    backgroundColor: Colors.gray[300],
    width: 40,
  },

  contentContainer: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100, // Safe area for tab bar + extra padding
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
  },

  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  clearButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },

  headerDivider: {
    marginBottom: Spacing.lg,
  },

  itemsList: {
    maxHeight: 300,
    marginBottom: Spacing.md,
  },

  cartItem: {
    flexDirection: 'row',
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
  },

  itemImageContainer: {
    width: 60,
    height: 60,
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
    justifyContent: 'space-between',
  },

  priceQuantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },

  quantityControls: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginLeft: Spacing.sm,
  },

  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  quantityButton: {
    padding: Spacing.xs,
  },

  quantityValue: {
    paddingHorizontal: Spacing.sm,
    minWidth: 32,
    alignItems: 'center',
  },

  deleteButton: {
    marginTop: Spacing.sm,
  },

  summary: {
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  summaryDivider: {
    marginBottom: Spacing.md,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  totalDivider: {
    marginVertical: Spacing.md,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  checkoutButton: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
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

export default CartBottomSheet;