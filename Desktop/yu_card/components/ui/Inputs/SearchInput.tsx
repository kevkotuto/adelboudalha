import React, { useState, useRef } from 'react';
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';

interface SearchInputProps extends Omit<RNTextInputProps, 'style'> {
  onSearch?: (query: string) => void;
  onClear?: () => void;
  placeholder?: string;
  variant?: 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  disabled?: boolean;
  autoFocus?: boolean;
  showClearButton?: boolean;
  debounceMs?: number; // Debounce search calls
}

export const SearchInput: React.FC<SearchInputProps> = ({
  onSearch,
  onClear,
  placeholder = 'Rechercher...',
  variant = 'filled',
  size = 'md',
  containerStyle,
  inputStyle,
  disabled = false,
  autoFocus = false,
  showClearButton = true,
  debounceMs = 300,
  value,
  onChangeText,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState(value || '');
  const debounceRef = useRef<NodeJS.Timeout>();
  const inputRef = useRef<RNTextInput>(null);

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: 36,
          paddingHorizontal: Spacing.md,
          fontSize: Typography.sizes.sm,
        };
      case 'md':
        return {
          height: 44,
          paddingHorizontal: Spacing.lg,
          fontSize: Typography.sizes.base,
        };
      case 'lg':
        return {
          height: 52,
          paddingHorizontal: Spacing.xl,
          fontSize: Typography.sizes.lg,
        };
      default:
        return {
          height: 44,
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
      borderColor: isFocused ? Colors.primary : Colors.border.primary,
    };
  };

  const handleTextChange = (text: string) => {
    setQuery(text);

    // Call parent onChangeText if provided
    if (onChangeText) {
      onChangeText(text);
    }

    // Debounced search
    if (onSearch && debounceMs > 0) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(() => {
        onSearch(text);
      }, debounceMs);
    } else if (onSearch) {
      onSearch(text);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onChangeText) {
      onChangeText('');
    }
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch('');
    }

    // Clear debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Focus input after clear
    inputRef.current?.focus();
  };

  const handleSubmit = () => {
    if (onSearch) {
      // Clear any pending debounced search
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      onSearch(query);
    }
  };

  const sizeStyles = getSizeStyles();
  const variantStyles = getVariantStyles();
  const showClear = showClearButton && query.length > 0;

  return (
    <View style={[containerStyle]}>
      <View
        style={[
          styles.inputContainer,
          variantStyles,
          sizeStyles,
          disabled && styles.disabled,
          isFocused && styles.focused,
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color={
            disabled
              ? Colors.text.tertiary
              : isFocused
              ? Colors.primary
              : Colors.text.secondary
          }
          style={styles.searchIcon}
        />

        <RNTextInput
          {...props}
          ref={inputRef}
          style={[
            styles.input,
            {
              fontSize: sizeStyles.fontSize,
              fontFamily: Typography.fonts.ubuntu.regular,
              color: disabled ? Colors.text.tertiary : Colors.text.primary,
            },
            inputStyle,
          ]}
          value={query}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          editable={!disabled}
          autoFocus={autoFocus}
          returnKeyType="search"
          onSubmitEditing={handleSubmit}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
        />

        {showClear && (
          <Pressable
            onPress={handleClear}
            style={styles.clearButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="close-circle"
              size={20}
              color={Colors.text.secondary}
            />
          </Pressable>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.input,
    ...Shadows.input,
  },

  searchIcon: {
    marginRight: Spacing.md,
  },

  input: {
    flex: 1,
    paddingVertical: 0,
  },

  clearButton: {
    padding: Spacing.xs,
    marginLeft: Spacing.xs,
  },

  focused: {
    ...Shadows.md,
  },

  disabled: {
    backgroundColor: Colors.gray[100],
    opacity: 0.6,
  },
});

export default SearchInput;