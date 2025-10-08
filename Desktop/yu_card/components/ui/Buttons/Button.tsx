import React from 'react';
import {
  Pressable,
  View,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';
import { Paragraph } from '../Typography';

interface ButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: Spacing.lg,
          borderRadius: BorderRadius.button,
        };
      case 'md':
        return {
          height: 48,
          paddingHorizontal: Spacing.xl,
          borderRadius: BorderRadius.button,
        };
      case 'lg':
        return {
          height: 56,
          paddingHorizontal: Spacing['2xl'],
          borderRadius: BorderRadius.button,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: Spacing.xl,
          borderRadius: BorderRadius.button,
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
          backgroundColor: Colors.white,
          borderWidth: 2,
          borderColor: Colors.primary,
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          borderWidth: 0,
        };
      default:
        return {
          backgroundColor: Colors.primary,
          borderWidth: 0,
        };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return Colors.black; // Texte noir sur fond jaune
      case 'secondary':
        return Colors.white; // Texte blanc sur fond noir
      case 'outline':
        return Colors.black; // Texte noir pour outline
      case 'ghost':
        return Colors.black; // Texte noir pour ghost
      default:
        return Colors.black;
    }
  };

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return Typography.styles.buttonSmall;
      case 'md':
        return Typography.styles.button;
      case 'lg':
        return Typography.styles.buttonLarge;
      default:
        return Typography.styles.button;
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
  const textColor = getTextColor();
  const textSize = getTextSize();
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
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        pressed && styles.pressed,
        !isDisabled && variant !== 'ghost' && Shadows.button,
        style,
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator
            size="small"
            color={textColor}
            style={styles.loader}
          />
        ) : (
          <>
            {leftIcon && (
              <Ionicons
                name={leftIcon}
                size={iconSize}
                color={textColor}
                style={styles.leftIcon}
              />
            )}

            <Paragraph
              style={[
                textSize,
                { color: textColor },
                textStyle,
              ]}
            >
              {children}
            </Paragraph>

            {rightIcon && (
              <Ionicons
                name={rightIcon}
                size={iconSize}
                color={textColor}
                style={styles.rightIcon}
              />
            )}
          </>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullWidth: {
    width: '100%',
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
    ...Shadows.pressed,
  },

  loader: {
    marginHorizontal: Spacing.xs,
  },

  leftIcon: {
    marginRight: Spacing.xs,
  },

  rightIcon: {
    marginLeft: Spacing.xs,
  },
});

export default Button;