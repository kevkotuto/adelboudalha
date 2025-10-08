import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { NotificationTypeAdmin } from '@/types/adminNotifications';

interface NotificationTypeFilterProps {
  selectedType: NotificationTypeAdmin | 'all';
  onSelectType: (type: NotificationTypeAdmin | 'all') => void;
}

const TYPE_FILTERS: {
  key: NotificationTypeAdmin | 'all';
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { key: 'all', label: 'Tous', color: Colors.gray[600], icon: 'grid' },
  { key: 'PROMOTION', label: 'Promos', color: '#E91E63', icon: 'pricetag' },
  { key: 'SYSTEM', label: 'Système', color: '#FF9800', icon: 'warning' },
  { key: 'ORDER', label: 'Commandes', color: '#2196F3', icon: 'cart' },
  { key: 'PAYMENT', label: 'Paiements', color: '#4CAF50', icon: 'card' },
  { key: 'DELIVERY', label: 'Livraisons', color: '#9C27B0', icon: 'car' },
  { key: 'GIFT_CARD', label: 'Cartes', color: '#F44336', icon: 'gift' },
];

export const NotificationTypeFilter: React.FC<NotificationTypeFilterProps> = ({
  selectedType,
  onSelectType,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.admin.dark : Colors.admin.light;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {TYPE_FILTERS.map(filter => {
        const isSelected = selectedType === filter.key;
        return (
          <Pressable
            key={filter.key}
            style={({ pressed }) => [
              styles.filterChip,
              {
                backgroundColor: isSelected
                  ? filter.color
                  : isDark
                    ? theme.background.tertiary
                    : Colors.gray[100],
                borderColor: isSelected ? filter.color : theme.border.primary,
              },
              pressed && styles.pressed,
            ]}
            onPress={() => onSelectType(filter.key)}
          >
            <View style={styles.chipContent}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isSelected
                      ? Colors.white + '20'
                      : filter.color + '15',
                  },
                ]}
              >
                <Ionicons
                  name={filter.icon}
                  size={14}
                  color={isSelected ? Colors.white : filter.color}
                />
              </View>
              <Caption
                style={[
                  styles.filterText,
                  {
                    color: isSelected ? Colors.white : theme.text.primary,
                  },
                ]}
              >
                {filter.label}
              </Caption>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
  },
  content: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.95 }],
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  iconContainer: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
  },
});
