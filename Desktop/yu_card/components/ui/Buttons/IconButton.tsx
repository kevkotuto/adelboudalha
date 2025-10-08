import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants';

interface IconButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  iconColor?: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  icon,
  onPress,
  variant = 'ghost',
  size = 'md',
  disabled = false,
  loading = false,
  style,
  iconColor,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          width: 32,
          height: 32,
          borderRadius: BorderRadius.sm,
        };
      case 'md':
        return {
          width: 40,
          height: 40,
          borderRadius: BorderRadius.md,
        };
      case 'lg':
        return {
          width: 48,
          height: 48,
          borderRadius: BorderRadius.lg,
        };
      default:
        return {
          width: 40,
          height: 40,
          borderRadius: BorderRadius.md,
        };
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: Colors.primary,
          borderWidth: 0,
        };
      case 'secondary':
        return {
          backgroundColor: Colors.black,
          borderWidth: 0,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: Colors.border.dark,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
    }
  };

  const getIconColor = () => {
    if (iconColor) return iconColor;

    switch (variant) {
      case 'primary':
        return Colors.black; // Icône noire sur fond jaune
      case 'secondary':
        return Colors.white; // Icône blanche sur fond noir
      case 'outline':
        return Colors.black; // Icône noire pour outline
      case 'ghost':
        return Colors.text.secondary; // Icône grise pour ghost
      default:
        return Colors.text.secondary;
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 16;
      case 'md':
        return 20;
      case 'lg':
        return 24;
      default:
        return 20;
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const iconColorValue = getIconColor();
  const iconSize = getIconSize();

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        sizeStyles,
        variantStyles,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        !isDisabled && variant !== 'ghost' && Shadows.button,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={iconColorValue}
        />
      ) : (
        <Ionicons
          name={icon}
          size={iconSize}
          color={iconColorValue}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
    ...Shadows.pressed,
  },
});

export default IconButton;