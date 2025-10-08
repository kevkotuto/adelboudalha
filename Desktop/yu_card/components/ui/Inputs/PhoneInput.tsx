import React, { useState } from 'react';
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
import { Caption, Paragraph } from '../Typography';

interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

interface PhoneInputProps {
  value?: string;
  onValueChange?: (phone: string, countryCode: string) => void;
  label?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
  required?: boolean;
  defaultCountry?: string; // Default country code
  onCountrySelect?: () => void; // Callback to open country picker
}

// Quelques codes de pays pour l'exemple (vous pouvez étendre cette liste)
const COUNTRY_CODES: CountryCode[] = [
  { code: 'SN', name: 'Sénégal', dialCode: '+221', flag: '🇸🇳' },
  { code: 'ML', name: 'Mali', dialCode: '+223', flag: '🇲🇱' },
  { code: 'BF', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫' },
  { code: 'CI', name: 'Côte d\'Ivoire', dialCode: '+225', flag: '🇨🇮' },
  { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value = '',
  onValueChange,
  label,
  error,
  hint,
  placeholder = '70 123 45 67',
  variant = 'outlined',
  size = 'md',
  containerStyle,
  inputStyle,
  disabled = false,
  required = false,
  defaultCountry = 'SN',
  onCountrySelect,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(
    COUNTRY_CODES.find(c => c.code === defaultCountry) || COUNTRY_CODES[0]
  );

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

  const handleTextChange = (text: string) => {
    // Format phone number (remove non-digits, add spaces)
    const digits = text.replace(/\D/g, '');
    let formatted = digits;

    // Format selon le pays (exemple pour les numéros sénégalais)
    if (selectedCountry.code === 'SN' && digits.length >= 2) {
      formatted = digits.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    } else if (digits.length >= 3) {
      // Format générique
      formatted = digits.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }

    if (onValueChange) {
      onValueChange(formatted, selectedCountry.dialCode);
    }
  };

  const handleCountryPress = () => {
    if (onCountrySelect) {
      onCountrySelect();
    }
    // Ici vous pourriez ouvrir un modal de sélection de pays
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();

  return (
    <View style={[containerStyle]}>
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
        <Pressable
          onPress={handleCountryPress}
          style={styles.countrySelector}
          disabled={disabled}
        >
          <Paragraph size="base" style={styles.flag}>
            {selectedCountry.flag}
          </Paragraph>
          <Paragraph
            size="base"
            color="secondary"
            style={styles.dialCode}
          >
            {selectedCountry.dialCode}
          </Paragraph>
          <Ionicons
            name="chevron-down"
            size={16}
            color={Colors.text.secondary}
          />
        </Pressable>

        <View style={styles.separator} />

        <RNTextInput
          style={[
            styles.input,
            {
              fontSize: sizeStyles.fontSize,
              fontFamily: Typography.fonts.ubuntu.regular,
              color: disabled ? Colors.text.tertiary : Colors.text.primary,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          keyboardType="phone-pad"
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
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

  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: Spacing.md,
  },

  flag: {
    marginRight: Spacing.xs,
  },

  dialCode: {
    marginRight: Spacing.xs,
    minWidth: 40,
  },

  separator: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border.primary,
    marginRight: Spacing.md,
  },

  input: {
    flex: 1,
    paddingVertical: 0,
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

export default PhoneInput;