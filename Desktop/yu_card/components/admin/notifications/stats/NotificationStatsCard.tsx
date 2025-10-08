import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';

import { Caption, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

interface NotificationStatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export const NotificationStatsCard: React.FC<NotificationStatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  iconColor,
  trend,
  trendValue,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.admin.dark : Colors.admin.light;

  const getTrendIcon = () => {
    if (trend === 'up') return 'trending-up';
    if (trend === 'down') return 'trending-down';
    return 'remove';
  };

  const getTrendColor = () => {
    if (trend === 'up') return Colors.admin.light.status.success;
    if (trend === 'down') return Colors.admin.light.status.error;
    return theme.text.tertiary;
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background.card,
          borderColor: isDark ? theme.border.primary : Colors.gray[200],
        },
      ]}
    >
      {/* Icon avec cercle coloré */}
      <View style={styles.header}>
        <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
          <Ionicons name={icon} size={22} color={iconColor} />
        </View>
        {trend && trendValue && (
          <View style={styles.trendContainer}>
            <Ionicons name={getTrendIcon()} size={14} color={getTrendColor()} />
            <Caption style={[styles.trendText, { color: getTrendColor() }]}>{trendValue}</Caption>
          </View>
        )}
      </View>

      {/* Value - Grande et en gras */}
      <Title level={2} style={[styles.value, { color: theme.text.primary }]}>
        {value}
      </Title>

      {/* Title */}
      <Caption style={[styles.title, { color: theme.text.secondary }]}>{title}</Caption>

      {/* Subtitle optionnel */}
      {subtitle && (
        <Caption style={[styles.subtitle, { color: theme.text.tertiary }]}>{subtitle}</Caption>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginRight: Spacing.md,
    minWidth: 160,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
  },
  value: {
    fontWeight: '700',
    fontFamily: 'Ubuntu_700Bold',
    marginBottom: Spacing.xs,
    fontSize: 32,
    lineHeight: 38,
  },
  title: {
    fontSize: 13,
    fontFamily: 'Ubuntu_500Medium',
    fontWeight: '500',
  },
  subtitle: {
    fontSize: 11,
    marginTop: 4,
    fontFamily: 'Ubuntu_400Regular',
  },
});
