/**
 * TextArea Component - Optimized for long text input
 * Features: Auto-expand, character count, clear visibility
 */

import React, { useState } from 'react';
import {
  View,
  TextInput as RNTextInput,
  StyleSheet,
  Pressable,
  ViewStyle,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants';
import { Caption, Paragraph } from '../Typography';

interface TextAreaProps extends Omit<RNTextInputProps, 'style' | 'multiline'> {
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  maxLength?: number;
  minHeight?: number;
  maxHeight?: number;
  showCharCount?: boolean;
  containerStyle?: ViewStyle;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  error,
  hint,
  required = false,
  maxLength,
  minHeight = 120,
  maxHeight = 300,
  showCharCount = true,
  containerStyle,
  disabled = false,
  value,
  onChangeText,
  placeholder,
  icon,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [height, setHeight] = useState(minHeight);

  const charCount = value?.length || 0;
  const hasError = !!error;
  const showCount = showCharCount && (maxLength || charCount > 0);

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Label */}
      {label && (
        <View style={styles.labelContainer}>
          <View style={styles.labelRow}>
            {icon && (
              <Ionicons
                name={icon}
                size={16}
                color={Colors.text.secondary}
                style={styles.labelIcon}
              />
            )}
            <Paragraph style={styles.label}>
              {label}
              {required && <Caption style={styles.required}> *</Caption>}
            </Paragraph>
          </View>
          {showCount && (
            <Caption style={[
              styles.charCount,
              maxLength && charCount > maxLength && styles.charCountError
            ]}>
              {charCount}{maxLength ? `/${maxLength}` : ''}
            </Caption>
          )}
        </View>
      )}

      {/* TextArea Container */}
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasError && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        <RNTextInput
          {...props}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          multiline
          textAlignVertical="top"
          editable={!disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={maxLength}
          onContentSizeChange={(event) => {
            const newHeight = Math.min(
              Math.max(event.nativeEvent.contentSize.height, minHeight),
              maxHeight
            );
            setHeight(newHeight);
          }}
          style={[
            styles.input,
            {
              height: Math.max(height, minHeight),
              maxHeight,
            },
            disabled && styles.inputDisabled,
          ]}
        />

        {/* Expand Indicator */}
        {height >= maxHeight && (
          <View style={styles.expandIndicator}>
            <Ionicons name="arrow-down" size={12} color={Colors.text.tertiary} />
            <Caption style={styles.expandText}>Scroll pour plus</Caption>
          </View>
        )}
      </View>

      {/* Hint or Error */}
      {(hint || error) && (
        <View style={styles.footer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={12} color={Colors.error} />
              <Caption style={styles.errorText}>{error}</Caption>
            </View>
          ) : hint ? (
            <Caption style={styles.hint}>{hint}</Caption>
          ) : null}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  labelIcon: {
    marginRight: Spacing.xs,
  },

  label: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.primary,
    fontSize: 14,
  },

  required: {
    color: Colors.error,
    fontFamily: 'Ubuntu_600SemiBold',
  },

  charCount: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontFamily: 'Ubuntu_400Regular',
  },

  charCountError: {
    color: Colors.error,
    fontFamily: 'Ubuntu_600SemiBold',
  },

  inputContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5,
    borderColor: Colors.border.primary,
    padding: Spacing.sm,
    position: 'relative',
  },

  inputContainerFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },

  inputContainerError: {
    borderColor: Colors.error,
    borderWidth: 1.5,
  },

  inputContainerDisabled: {
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.border.secondary,
  },

  input: {
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 14,
    color: Colors.text.primary,
    padding: Spacing.sm,
    lineHeight: 20,
  },

  inputDisabled: {
    color: Colors.text.tertiary,
  },

  expandIndicator: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    gap: 4,
  },

  expandText: {
    fontSize: 10,
    color: Colors.text.tertiary,
  },

  footer: {
    marginTop: Spacing.xs,
  },

  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  errorText: {
    color: Colors.error,
    fontSize: 12,
  },

  hint: {
    color: Colors.text.secondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
});
