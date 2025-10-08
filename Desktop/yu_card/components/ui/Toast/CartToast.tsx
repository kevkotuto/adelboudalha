import React from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { BaseToastProps } from 'react-native-toast-message';
import { Colors, Spacing, BorderRadius, Typography } from '@/constants';
import { Title, Paragraph } from '../Typography';
import { Ionicons } from '@expo/vector-icons';

/**
 * Custom Toast component for Cart actions
 * Follows Yu Card design system: chick yellow, black, white, minimal shadows
 */
export const CartToast: React.FC<BaseToastProps> = ({
  text1,
  text2,
  onPress,
  props,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        props?.variant === 'error' && styles.errorContainer,
      ]}
    >
      <View style={styles.iconContainer}>
        <Ionicons
          name={props?.variant === 'error' ? 'close-circle' : 'checkmark-circle'}
          size={24}
          color={props?.variant === 'error' ? Colors.error : Colors.success}
        />
      </View>

      <View style={styles.contentContainer}>
        {text1 && (
          <Title level={6} style={styles.title}>
            {text1}
          </Title>
        )}
        {text2 && (
          <Paragraph size="small" color="secondary" style={styles.subtitle}>
            {text2}
          </Paragraph>
        )}
      </View>

      {onPress && (
        <View style={styles.actionContainer}>
          <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
        </View>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    // Minimal shadow per design guidelines
    shadowColor: Colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorContainer: {
    borderLeftColor: Colors.error,
  },
  iconContainer: {
    marginRight: Spacing.sm,
  },
  contentContainer: {
    flex: 1,
  },
  title: {
    marginBottom: 2,
    fontFamily: Typography.fonts.ubuntu.medium,
  },
  subtitle: {
    fontFamily: Typography.fonts.ubuntu.regular,
  },
  actionContainer: {
    marginLeft: Spacing.sm,
  },
});

export default CartToast;
