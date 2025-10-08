/**
 * StatusBadge Component - Display status with color coding
 * Used for orders, payments, notifications, etc.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Caption } from '@/components/ui/Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';
import type { OrderStatus, PaymentStatus } from '@/types/admin';

interface StatusBadgeProps {
  status: OrderStatus | PaymentStatus | string;
  type?: 'order' | 'payment' | 'notification' | 'user' | 'custom';
  label?: string;
  showIcon?: boolean;
  style?: any;
}

const getStatusConfig = (
  status: string,
  type: string = 'custom'
): { color: string; icon: keyof typeof Ionicons.glyphMap; label?: string } => {
  // Order statuses
  if (type === 'order') {
    switch (status) {
      case 'PENDING':
        return { color: Colors.admin.dark.status.pending, icon: 'time-outline' };
      case 'CONFIRMED':
        return { color: Colors.admin.dark.status.info, icon: 'checkmark-outline' };
      case 'PROCESSING':
        return { color: Colors.admin.dark.status.warning, icon: 'hourglass-outline' };
      case 'SHIPPED':
        return { color: Colors.admin.dark.status.info, icon: 'car-outline' };
      case 'DELIVERED':
        return { color: Colors.admin.dark.status.success, icon: 'checkmark-circle-outline' };
      case 'CANCELLED':
        return { color: Colors.admin.dark.status.error, icon: 'close-circle-outline' };
      case 'REFUNDED':
        return { color: Colors.admin.dark.text.secondary, icon: 'arrow-back-outline' };
      default:
        return { color: Colors.admin.dark.text.secondary, icon: 'ellipse-outline' };
    }
  }

  // Payment statuses
  if (type === 'payment') {
    switch (status) {
      case 'PENDING':
        return { color: Colors.admin.dark.status.warning, icon: 'time-outline' };
      case 'PROCESSING':
        return { color: Colors.admin.dark.status.info, icon: 'sync-outline' };
      case 'COMPLETED':
        return { color: Colors.admin.dark.status.success, icon: 'checkmark-circle-outline' };
      case 'FAILED':
        return { color: Colors.admin.dark.status.error, icon: 'close-circle-outline' };
      case 'REFUNDED':
        return { color: Colors.admin.dark.text.secondary, icon: 'arrow-back-outline' };
      default:
        return { color: Colors.admin.dark.text.secondary, icon: 'ellipse-outline' };
    }
  }

  // Notification statuses
  if (type === 'notification') {
    switch (status) {
      case 'DRAFT':
        return { color: Colors.admin.dark.status.warning, icon: 'document-outline' };
      case 'SCHEDULED':
        return { color: Colors.admin.dark.status.info, icon: 'time-outline' };
      case 'SENT':
        return { color: Colors.admin.dark.status.success, icon: 'checkmark-circle-outline' };
      case 'FAILED':
        return { color: Colors.admin.dark.status.error, icon: 'close-circle-outline' };
      default:
        return { color: Colors.admin.dark.text.secondary, icon: 'ellipse-outline' };
    }
  }

  // User statuses
  if (type === 'user') {
    switch (status) {
      case 'ACTIVE':
        return { color: Colors.admin.dark.status.success, icon: 'checkmark-circle-outline' };
      case 'SUSPENDED':
        return { color: Colors.admin.dark.status.error, icon: 'ban-outline' };
      case 'DELETED':
        return { color: Colors.admin.dark.text.secondary, icon: 'trash-outline' };
      default:
        return { color: Colors.admin.dark.text.secondary, icon: 'ellipse-outline' };
    }
  }

  // Custom/default
  return { color: Colors.admin.dark.text.secondary, icon: 'ellipse-outline' };
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type = 'custom',
  label,
  showIcon = true,
  style,
}) => {
  const config = getStatusConfig(status, type);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: config.color },
        style,
      ]}
    >
      {showIcon && (
        <Ionicons
          name={config.icon}
          size={12}
          color={Colors.white}
          style={styles.icon}
        />
      )}
      <Caption style={[styles.label, { color: Colors.white }]}>
        {label || status}
      </Caption>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },

  icon: {
    marginRight: Spacing.xs,
  },

  label: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
  },
});
