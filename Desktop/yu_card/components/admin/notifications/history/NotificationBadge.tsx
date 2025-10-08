import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Caption } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

interface NotificationBadgeProps {
  label: string;
  color: string;
  variant?: 'solid' | 'outlined' | 'soft';
}

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  label,
  color,
  variant = 'soft',
}) => {
  const getBackgroundColor = () => {
    if (variant === 'solid') return color;
    if (variant === 'outlined') return 'transparent';
    return color + '20'; // soft background
  };

  const getTextColor = () => {
    if (variant === 'solid') return Colors.white;
    return color;
  };

  const getBorderColor = () => {
    if (variant === 'outlined') return color;
    return 'transparent';
  };

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
        },
      ]}
    >
      <Caption
        style={[
          styles.badgeText,
          {
            color: getTextColor(),
          },
        ]}
      >
        {label}
      </Caption>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
  },
});
