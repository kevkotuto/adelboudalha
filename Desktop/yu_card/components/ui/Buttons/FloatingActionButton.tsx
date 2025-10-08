import React from 'react';
import {
  Pressable,
  StyleSheet,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, Shadows } from '@/constants';

interface FloatingActionButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  icon,
  onPress,
  size = 'md',
  disabled = false,
  loading = false,
  style,
  position = 'bottom-right',
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          width: 48,
          height: 48,
          borderRadius: 24,
        };
      case 'md':
        return {
          width: 56,
          height: 56,
          borderRadius: 28,
        };
      case 'lg':
        return {
          width: 64,
          height: 64,
          borderRadius: 32,
        };
      default:
        return {
          width: 56,
          height: 56,
          borderRadius: 28,
        };
    }
  };

  const getPositionStyles = () => {
    const offset = Spacing['2xl'];

    switch (position) {
      case 'bottom-right':
        return {
          position: 'absolute' as const,
          bottom: offset,
          right: offset,
        };
      case 'bottom-left':
        return {
          position: 'absolute' as const,
          bottom: offset,
          left: offset,
        };
      case 'top-right':
        return {
          position: 'absolute' as const,
          top: offset,
          right: offset,
        };
      case 'top-left':
        return {
          position: 'absolute' as const,
          top: offset,
          left: offset,
        };
      default:
        return {
          position: 'absolute' as const,
          bottom: offset,
          right: offset,
        };
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 20;
      case 'md':
        return 24;
      case 'lg':
        return 28;
      default:
        return 24;
    }
  };

  const sizeStyles = getSizeStyles();
  const positionStyles = getPositionStyles();
  const iconSize = getIconSize();

  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.fab,
        sizeStyles,
        positionStyles,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        !isDisabled && Shadows.lg,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={Colors.black}
        />
      ) : (
        <Ionicons
          name={icon}
          size={iconSize}
          color={Colors.black}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  fab: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6, // Android shadow
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
});

export default FloatingActionButton;