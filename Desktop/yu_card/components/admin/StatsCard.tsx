/**
 * StatsCard Component - Admin Statistics Card
 * Displays key metrics with icon and optional subtitle
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Title, Paragraph, Caption } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Layout/Card';
import { Colors, Spacing, BorderRadius } from '@/constants';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  style?: any;
  onPress?: () => void;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  accentColor?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  color,
  style,
  onPress,
  backgroundColor = Colors.admin.dark.background.card,
  borderColor = Colors.admin.dark.border.primary,
  textColor = Colors.admin.dark.text.primary,
  secondaryTextColor = Colors.admin.dark.text.secondary,
  accentColor = Colors.admin.dark.text.accent,
}) => {
  return (
    <Card
      style={[
        styles.container,
        {
          backgroundColor,
          borderColor,
        },
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        <Title level={4} style={[styles.value, { color: textColor }]}>
          {value}
        </Title>
      </View>
      <Caption style={[styles.title, { color: secondaryTextColor }]}>
        {title}
      </Caption>
      {subtitle && (
        <Caption style={[styles.subtitle, { color: accentColor }]}>
          {subtitle}
        </Caption>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.md,
    marginRight: Spacing.md,
    minWidth: 120,
    borderWidth: 1,
  },

  header: {
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  value: {
    fontWeight: '700',
    fontFamily: 'Ubuntu_700Bold',
  },

  title: {
    fontSize: 11,
    textAlign: 'center',
    textTransform: 'uppercase',
    fontFamily: 'Ubuntu_400Regular',
  },

  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
  },
});
