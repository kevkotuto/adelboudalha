/**
 * EmptyState Component
 * Displays a friendly empty state message with icon
 */

import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Title, Paragraph } from '../Typography';
import { Colors, Spacing } from '@/constants';

interface EmptyStateProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  iconColor?: string;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  iconColor = Colors.text.tertiary,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={iconColor} />
      </View>
      <Title style={styles.title}>{title}</Title>
      {description && (
        <Paragraph style={styles.description}>{description}</Paragraph>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
    paddingHorizontal: Spacing.lg,
  },
  iconContainer: {
    marginBottom: Spacing.lg,
    opacity: 0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: Spacing.xs,
    color: Colors.text.secondary,
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    color: Colors.text.tertiary,
    maxWidth: 280,
  },
});
