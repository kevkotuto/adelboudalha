import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Spacing, BorderRadius, Shadows } from '@/constants';
import { Caption } from '../Typography/Caption';
import { useCartItemsCount, useCartTotal } from '@/stores/useCartStore';
import useTranslation from '@/hooks/useTranslation';

interface CartFloatingButtonProps {
  onPress: () => void;
  style?: any;
}

export const CartFloatingButton: React.FC<CartFloatingButtonProps> = ({
  onPress,
  style,
}) => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const itemCount = useCartItemsCount();
  const total = useCartTotal();
  const currency = 'CFA';

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  // N'afficher le bouton que si le panier contient des articles
  if (itemCount === 0) {
    return null;
  }

  return (
    <View style={[styles.container, { bottom: insets.bottom + Spacing.lg }, style]}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.pressed,
          Shadows.card,
        ]}
      >
        <View style={styles.content}>
          {/* Badge avec nombre d'articles */}
          <View style={styles.leftSection}>
            <View style={styles.iconContainer}>
              <Ionicons name="bag" size={22} color={Colors.white} />
              {itemCount > 0 && (
                <View style={styles.badge}>
                  <Caption color="inverse" style={styles.badgeText}>
                    {itemCount > 99 ? '99+' : itemCount}
                  </Caption>
                </View>
              )}
            </View>
            <View style={styles.textContainer}>
              <Caption color="inverse" style={styles.itemCountText}>
                {itemCount} {itemCount === 1 ? t('cart.item') : t('cart.items')}
              </Caption>
            </View>
          </View>

          {/* Total et flèche */}
          <View style={styles.rightSection}>
            <Caption color="inverse" style={styles.totalText}>
              {formatAmount(total)} {currency}
            </Caption>
            <Ionicons name="chevron-forward" size={18} color={Colors.white} />
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 1000,
  },

  button: {
    backgroundColor: Colors.black,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 56,
  },

  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  iconContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },

  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.black,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },

  textContainer: {
    flex: 1,
  },

  itemCountText: {
    fontSize: 14,
    fontWeight: '600',
  },

  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  totalText: {
    fontSize: 16,
    fontWeight: '700',
    marginRight: Spacing.sm,
  },
});

export default CartFloatingButton;