import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Title, Paragraph, Caption } from '../Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';

interface DimensionsData {
  length?: number;
  width?: number;
  height?: number;
}

interface DimensionsCardProps {
  dimensions?: DimensionsData;
  weight?: string | number;
  title?: string;
}

export function DimensionsCard({
  dimensions,
  weight,
  title = 'Dimensions & Poids',
}: DimensionsCardProps) {
  // Don't render if no data
  if (!dimensions && !weight) {
    return null;
  }

  const formatDimension = (value: number | undefined): string => {
    if (!value) return '-';
    return `${value} cm`;
  };

  const formatWeight = (value: string | number | undefined): string => {
    if (!value) return '-';
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(numValue) ? '-' : `${numValue} kg`;
  };

  const hasDimensions = dimensions && (dimensions.length || dimensions.width || dimensions.height);

  return (
    <View style={styles.container}>
      <Title level={6} style={styles.title}>
        {title}
      </Title>

      <View style={styles.content}>
        {/* Dimensions Section */}
        {hasDimensions && (
          <View style={styles.section}>
            <View style={styles.iconContainer}>
              <Ionicons name="cube-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.infoContainer}>
              <Caption color="secondary" style={styles.label}>
                Dimensions (L × l × H)
              </Caption>
              <Paragraph style={styles.value}>
                {formatDimension(dimensions!.length)} × {formatDimension(dimensions!.width)} × {formatDimension(dimensions!.height)}
              </Paragraph>
            </View>
          </View>
        )}

        {/* Weight Section */}
        {weight && (
          <View style={[styles.section, hasDimensions && styles.sectionBorder]}>
            <View style={styles.iconContainer}>
              <Ionicons name="scale-outline" size={24} color={Colors.primary} />
            </View>
            <View style={styles.infoContainer}>
              <Caption color="secondary" style={styles.label}>
                Poids
              </Caption>
              <Paragraph style={styles.value}>
                {formatWeight(weight)}
              </Paragraph>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },

  title: {
    marginBottom: Spacing.md,
  },

  content: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
  },

  section: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },

  sectionBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoContainer: {
    flex: 1,
  },

  label: {
    fontSize: 12,
    marginBottom: Spacing.xs,
  },

  value: {
    fontWeight: '600',
    fontSize: 15,
  },
});
