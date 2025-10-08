import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';
import { Caption } from '../Typography';

interface NumberInputProps {
  value?: string | number;
  onValueChange?: (value: number) => void;
  onChangeText?: (value: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string; // e.g., "$", "€"
  suffix?: string; // e.g., "CFA", "%"
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  style?: ViewStyle;
  disabled?: boolean;
  required?: boolean;
  showSteppers?: boolean; // Show +/- buttons
  decimalPlaces?: number;
  icon?: string;
  keyboardType?: 'numeric' | 'decimal-pad' | 'number-pad';
}

export const NumberInput: React.FC<NumberInputProps> = ({
  value,
  onValueChange,
  onChangeText,
  label,
  error,
  hint,
  placeholder = '0',
  min,
  max,
  step = 1,
  prefix,
  suffix,
  variant = 'outlined',
  size = 'md',
  containerStyle,
  inputStyle,
  style,
  disabled = false,
  required = false,
  showSteppers = false,
  decimalPlaces = 0,
  icon,
  keyboardType = 'numeric',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [textValue, setTextValue] = useState(
    value !== undefined ? (typeof value === 'string' ? value : formatNumber(value)) : ''
  );

  function formatNumber(num: number): string {
    if (decimalPlaces > 0) {
      return num.toFixed(decimalPlaces);
    }
    return num.toString();
  }

  // Synchroniser l'état interne avec la prop value quand elle change
  useEffect(() => {
    if (value !== undefined) {
      const formatted = typeof value === 'string' ? value : formatNumber(value);
      setTextValue(formatted);
    } else {
      setTextValue('');
    }
  }, [value, decimalPlaces]);

  function parseNumber(text: string): number {
    const cleaned = text.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  const handleTextChange = (text: string) => {
    setTextValue(text);

    // Support both string and number callbacks
    if (onChangeText) {
      onChangeText(text);
    }

    if (onValueChange) {
      const numValue = parseNumber(text);
      const clampedValue = clampValue(numValue);
      onValueChange(clampedValue);
    }
  };

  const clampValue = (val: number): number => {
    let clamped = val;
    if (min !== undefined && clamped < min) clamped = min;
    if (max !== undefined && clamped > max) clamped = max;
    return clamped;
  };

  const handleStepChange = (direction: 'up' | 'down') => {
    const currentValue = value || 0;
    const newValue = direction === 'up'
      ? currentValue + step
      : currentValue - step;

    const clampedValue = clampValue(newValue);
    setTextValue(formatNumber(clampedValue));

    if (onValueChange) {
      onValueChange(clampedValue);
    }
  };

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
        {icon && (
          <Ionicons
            name={icon as any}
            size={20}
            color={isFocused ? Colors.primary : Colors.text.tertiary}
            style={styles.icon}
          />
        )}

        {prefix && (
          <Caption
            color={disabled ? 'tertiary' : 'secondary'}
            style={styles.prefix}
          >
            {prefix}
          </Caption>
        )}

        <RNTextInput
          style={[
            styles.input,
            {
              fontSize: sizeStyles.fontSize,
              fontFamily: Typography.fonts.ubuntu.regular,
              color: disabled ? Colors.text.tertiary : Colors.text.primary,
              textAlign: icon ? 'left' : 'right',
            },
            inputStyle,
          ]}
          value={textValue}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          keyboardType={keyboardType}
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {suffix && (
          <Caption
            color={disabled ? 'tertiary' : 'secondary'}
            style={styles.suffix}
          >
            {suffix}
          </Caption>
        )}

        {showSteppers && (
          <View style={styles.steppers}>
            <Pressable
              onPress={() => handleStepChange('up')}
              style={[styles.stepperButton, styles.stepperUp]}
              disabled={disabled || (max !== undefined && (value || 0) >= max)}
            >
              <Ionicons
                name="chevron-up"
                size={16}
                color={Colors.text.secondary}
              />
            </Pressable>
            <Pressable
              onPress={() => handleStepChange('down')}
              style={[styles.stepperButton, styles.stepperDown]}
              disabled={disabled || (min !== undefined && (value || 0) <= min)}
            >
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.text.secondary}
              />
            </Pressable>
          </View>
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
    paddingVertical: 0,
  },

  icon: {
    marginRight: Spacing.sm,
  },

  prefix: {
    marginRight: Spacing.xs,
  },

  suffix: {
    marginLeft: Spacing.xs,
  },

  steppers: {
    marginLeft: Spacing.xs,
  },

  stepperButton: {
    width: 24,
    height: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },

  stepperUp: {
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: 1,
  },

  stepperDown: {
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
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

export default NumberInput;