import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  TextInputProps as RNTextInputProps,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';
import { Caption } from '../Typography';

interface TextInputProps extends Omit<RNTextInputProps, 'style'> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  icon?: string;
  onRightIconPress?: () => void;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  style?: ViewStyle;
  disabled?: boolean;
  required?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  icon,
  onRightIconPress,
  variant = 'outlined',
  size = 'md',
  containerStyle,
  inputStyle,
  style,
  disabled = false,
  required = false,
  secureTextEntry,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isSecure, setIsSecure] = useState(secureTextEntry);

  // Use icon as leftIcon if provided
  const effectiveLeftIcon = icon || leftIcon;

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 40,
          paddingHorizontal: Spacing.md,
          fontSize: Typography.sizes.sm,
        };
      case 'md':
        return {
          height: 48,
          paddingHorizontal: Spacing.lg,
          fontSize: Typography.sizes.base,
        };
      case 'lg':
        return {
          height: 56,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.sizes.lg,
        };
      default:
        return {
          height: 48,
          paddingHorizontal: Spacing.lg,
          fontSize: Typography.sizes.base,
        };
    }
  };

  const getVariantStyles = () => {
    if (variant === 'filled') {
      return {
        backgroundColor: Colors.background.secondary,
        borderWidth: 0,
      };
    }

    // Outlined variant
    return {
      backgroundColor: Colors.white,
      borderWidth: 1,
      borderColor: error
        ? Colors.error
        : isFocused
        ? Colors.primary
        : Colors.border.primary,
    };
  };

  const handleRightIconPress = () => {
    if (secureTextEntry) {
      setIsSecure(!isSecure);
    } else if (onRightIconPress) {
      onRightIconPress();
    }
  };

  const getRightIcon = () => {
    if (secureTextEntry) {
      return isSecure ? 'eye-off' : 'eye';
    }
    return rightIcon;
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <View style={[containerStyle, style]}>
      {label && (
        <Caption
          variant="label"
          color="primary"
          style={styles.label}
        >
          {label}
          {required && <Caption color="accent"> *</Caption>}
        </Caption>
      )}

      <View
        style={[
          styles.inputContainer,
          variantStyles,
          sizeStyles,
          disabled && styles.disabled,
          error && styles.error,
          isFocused && styles.focused,
        ]}
      >
        {effectiveLeftIcon && (
          <Ionicons
            name={effectiveLeftIcon as any}
            size={20}
            color={
              disabled
                ? Colors.text.tertiary
                : error
                ? Colors.error
                : isFocused
                ? Colors.primary
                : Colors.text.secondary
            }
            style={styles.leftIcon}
          />
        )}

        <RNTextInput
          {...props}
          style={[
            styles.input,
            {
              fontSize: sizeStyles.fontSize,
              fontFamily: Typography.fonts.ubuntu.regular,
              color: disabled ? Colors.text.tertiary : Colors.text.primary,
            },
            inputStyle,
          ]}
          placeholderTextColor={Colors.text.tertiary}
          secureTextEntry={isSecure}
          editable={!disabled}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />

        {(rightIcon || secureTextEntry) && (
          <Pressable
            onPress={handleRightIconPress}
            style={styles.rightIconContainer}
            disabled={!onRightIconPress && !secureTextEntry}
          >
            <Ionicons
              name={getRightIcon() as keyof typeof Ionicons.glyphMap}
              size={20}
              color={
                disabled
                  ? Colors.text.tertiary
                  : error
                  ? Colors.error
                  : isFocused
                  ? Colors.primary
                  : Colors.text.secondary
              }
            />
          </Pressable>
        )}
      </View>

      {(error || hint) && (
        <Caption
          color={error ? 'accent' : 'secondary'}
          style={styles.helperText}
        >
          {error || hint}
        </Caption>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  label: {
    marginBottom: Spacing.xs,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.input,
    ...Shadows.input,
  },

  input: {
    flex: 1,
    paddingVertical: 0, // Reset default padding
  },

  leftIcon: {
    marginRight: Spacing.md,
  },

  rightIconContainer: {
    padding: Spacing.xs,
    marginLeft: Spacing.md,
  },

  focused: {
    ...Shadows.md,
  },

  error: {
    borderColor: Colors.error,
  },

  disabled: {
    backgroundColor: Colors.gray[100],
    opacity: 0.6,
  },

  helperText: {
    marginTop: Spacing.xs,
  },
});

export default TextInput;