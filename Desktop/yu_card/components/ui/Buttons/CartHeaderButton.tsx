import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Colors, Spacing, BorderRadius } from '@/constants';
import { Caption } from '../Typography/Caption';
import { useCartItemsCount } from '@/stores/useCartStore';

interface CartHeaderButtonProps {
  onPress: () => void;
  style?: any;
}

export const CartHeaderButton: React.FC<CartHeaderButtonProps> = ({
  onPress,
  style,
}) => {
  const itemCount = useCartItemsCount();

  // N'afficher le badge que si le panier contient des articles
  const showBadge = itemCount > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        style,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="bag" size={24} color={Colors.white} />

        {showBadge && (
          <View style={styles.badge}>
            <Caption color="inverse" style={styles.badgeText}>
              {itemCount > 99 ? '99+' : itemCount}
            </Caption>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.black,
    justifyContent: 'center',
    alignItems: 'center',
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },

  iconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
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
    borderColor: Colors.white,
  },

  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
  },
});

export default CartHeaderButton;