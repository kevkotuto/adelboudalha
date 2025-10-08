import React from 'react';
import { View, ViewStyle, StyleSheet, Pressable } from 'react-native';
import { Colors, BorderRadius, Shadows, Spacing } from '@/constants';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  onPress?: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
  disabled?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  onPress,
  style,
  backgroundColor = Colors.white,
  disabled = false,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'elevated':
        return {
          ...Shadows.lg,
          borderWidth: 0,
        };
      case 'outlined':
        return {
          borderWidth: 1,
          borderColor: Colors.border.primary,
          ...Shadows.none,
        };
      case 'flat':
        return {
          borderWidth: 0,
          ...Shadows.none,
        };
      case 'default':
      default:
        return {
          ...Shadows.card,
          borderWidth: 0,
        };
    }
  };

  const getPaddingStyles = () => {
    switch (padding) {
      case 'none':
        return { padding: 0 };
      case 'sm':
        return { padding: Spacing.sm };
      case 'md':
        return { padding: Spacing.md };
      case 'lg':
        return { padding: Spacing.lg };
      case 'xl':
        return { padding: Spacing.xl };
      default:
        return { padding: Spacing.md };
    }
  };

  const CardComponent = onPress ? Pressable : View;

  return (
    <CardComponent
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }: { pressed?: boolean }) => [
        styles.card,
        {
          backgroundColor,
          borderRadius: BorderRadius.card,
        },
        getVariantStyles(),
        getPaddingStyles(),
        disabled && styles.disabled,
        onPress && pressed && styles.pressed,
        style,
      ]}
    >
      {children}
    </CardComponent>
  );
};

const styles = StyleSheet.create({
  card: {
    // Base card styles
  },

  disabled: {
    opacity: 0.6,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default Card;