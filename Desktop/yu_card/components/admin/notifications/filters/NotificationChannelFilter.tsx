import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { NotificationChannel } from '@/types/adminNotifications';

interface NotificationChannelFilterProps {
  selectedChannel: NotificationChannel | 'all';
  onSelectChannel: (channel: NotificationChannel | 'all') => void;
}

const CHANNEL_FILTERS: {
  key: NotificationChannel | 'all';
  label: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
  badge?: string;
}[] = [
  { key: 'all', label: 'Tous canaux', color: Colors.gray[600], icon: 'layers' },
  { key: 'PUSH', label: 'Push', color: '#2196F3', icon: 'notifications', badge: 'Gratuit' },
  { key: 'SMS', label: 'SMS', color: '#FF9800', icon: 'chatbubbles', badge: '25 XOF' },
  { key: 'IN_APP', label: 'In-App', color: '#9C27B0', icon: 'phone-portrait', badge: 'Gratuit' },
];

export const NotificationChannelFilter: React.FC<NotificationChannelFilterProps> = ({
  selectedChannel,
  onSelectChannel,
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
      {CHANNEL_FILTERS.map(filter => {
        const isSelected = selectedChannel === filter.key;
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
            onPress={() => onSelectChannel(filter.key)}
          >
            <View style={styles.chipContent}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor: isSelected ? Colors.white + '20' : filter.color + '15',
                  },
                ]}
              >
                <Ionicons
                  name={filter.icon}
                  size={14}
                  color={isSelected ? Colors.white : filter.color}
                />
              </View>
              <View style={styles.textContainer}>
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
                {filter.badge && isSelected && (
                  <Caption
                    style={[
                      styles.badgeText,
                      {
                        color: Colors.white,
                        opacity: 0.8,
                      },
                    ]}
                  >
                    {filter.badge}
                  </Caption>
                )}
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
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
  textContainer: {
    flexDirection: 'column',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '500',
    fontFamily: 'Ubuntu_500Medium',
  },
});
