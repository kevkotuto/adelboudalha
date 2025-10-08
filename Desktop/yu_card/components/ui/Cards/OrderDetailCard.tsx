import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import { Colors, Spacing, BorderRadius } from '@/constants';
import { Title, Paragraph, Caption } from '../Typography';
import { Button, IconButton } from '../Buttons';
import { Card } from '../Layout';
import { OrderDetails } from '@/types/cart';
import useTranslation from '@/hooks/useTranslation';

interface OrderDetailCardProps {
  order: OrderDetails;
  onViewCode?: () => void;
  onTrackOrder?: () => void;
  onContactSupport?: () => void;
  style?: any;
}

export const OrderDetailCard: React.FC<OrderDetailCardProps> = ({
  order,
  onViewCode,
  onTrackOrder,
  onContactSupport,
  style,
}) => {
  const { t } = useTranslation();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return Colors.warning;
      case 'confirmed': return Colors.info;
      case 'processing': return Colors.primary;
      case 'shipped': return Colors.primary;
      case 'delivered': return Colors.success;
      case 'cancelled': return Colors.error;
      default: return Colors.gray[500];
    }
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'confirmed': return 'checkmark-circle-outline';
      case 'processing': return 'refresh-outline';
      case 'shipped': return 'car-outline';
      case 'delivered': return 'checkmark-done-circle';
      case 'cancelled': return 'close-circle-outline';
      default: return 'ellipse-outline';
    }
  };

  return (
    <Card style={[styles.container, style]}>
      {/* Header avec image et infos principales */}
      <View style={styles.header}>
        {order.itemImage && (
          <View style={styles.imageContainer}>
            <Image
              source={order.itemImage}
              style={styles.itemImage}
              contentFit="contain"
            />
          </View>
        )}

        <View style={styles.headerInfo}>
          <Title level={5} numberOfLines={2}>
            {order.itemName}
          </Title>
          <Caption color="secondary">
            {t('orders.order_number')}{order.id}
          </Caption>

          <View style={styles.statusContainer}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons
                name={getStatusIcon(order.status)}
                size={14}
                color={Colors.white}
              />
              <Caption color="inverse" style={styles.statusText}>
                {t(`orders.status.${order.status}`)}
              </Caption>
            </View>
          </View>
        </View>
      </View>

      {/* Détails de la commande */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Caption color="secondary">{t('orders.order_date')}</Caption>
          <Caption>{formatDate(order.orderDate)}</Caption>
        </View>

        <View style={styles.detailRow}>
          <Caption color="secondary">{t('common.quantity')}</Caption>
          <Caption>{order.quantity}</Caption>
        </View>

        <View style={styles.detailRow}>
          <Caption color="secondary">{t('orders.order_total')}</Caption>
          <Paragraph weight="medium" color="primary">
            {formatAmount(order.totalAmount)} {order.currency}
          </Paragraph>
        </View>

        {/* Informations spécifiques selon le type */}
        {order.type === 'gift_card' && order.giftCardCode && (
          <View style={styles.giftCardSection}>
            <View style={styles.detailRow}>
              <Caption color="secondary">{t('orders.gift_card_code')}</Caption>
              <Caption style={styles.codeText}>
                {order.giftCardCode.replace(/(.{4})/g, '$1 ')}
              </Caption>
            </View>

            {order.giftCardActivated && (
              <View style={styles.activatedBadge}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                <Caption style={[styles.activatedText, { color: Colors.success }]}>
                  {t('orders.gift_card_activated')}
                </Caption>
              </View>
            )}
          </View>
        )}

        {order.type === 'physical_product' && order.tracking && (
          <View style={styles.trackingSection}>
            <View style={styles.detailRow}>
              <Caption color="secondary">{t('orders.tracking.number')}</Caption>
              <Caption style={styles.trackingNumber}>{order.tracking.trackingNumber}</Caption>
            </View>

            <View style={styles.detailRow}>
              <Caption color="secondary">{t('orders.tracking.carrier')}</Caption>
              <Caption>{order.tracking.carrier}</Caption>
            </View>

            <View style={styles.detailRow}>
              <Caption color="secondary">{t('orders.tracking.estimated_delivery')}</Caption>
              <Caption>{new Date(order.tracking.estimatedDelivery).toLocaleDateString('fr-FR')}</Caption>
            </View>
          </View>
        )}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {order.type === 'gift_card' && order.giftCardCode && (
          <Button
            variant="primary"
            size="sm"
            onPress={onViewCode}
            style={styles.actionButton}
          >
            <Ionicons name="eye-outline" size={16} color={Colors.white} />
            {t('orders.view_code')}
          </Button>
        )}

        {order.type === 'physical_product' && order.tracking && (
          <Button
            variant="outline"
            size="sm"
            onPress={onTrackOrder}
            style={styles.actionButton}
          >
            <Ionicons name="location-outline" size={16} color={Colors.primary} />
            {t('orders.track_order')}
          </Button>
        )}

        <Button
          variant="ghost"
          size="sm"
          onPress={onContactSupport}
          style={styles.actionButton}
        >
          <Ionicons name="chatbubble-outline" size={16} color={Colors.gray[600]} />
          {t('orders.contact_support')}
        </Button>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  header: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },

  imageContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemImage: {
    width: '100%',
    height: '100%',
  },

  headerInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  statusContainer: {
    marginTop: Spacing.sm,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },

  statusText: {
    marginLeft: Spacing.xs,
    fontSize: 12,
    fontWeight: '600',
  },

  details: {
    marginBottom: Spacing.lg,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  giftCardSection: {
    backgroundColor: Colors.background.tertiary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },

  codeText: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
  },

  activatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },

  activatedText: {
    marginLeft: Spacing.xs,
    fontWeight: '600',
  },

  trackingSection: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },

  trackingNumber: {
    fontFamily: 'monospace',
    fontSize: 14,
    fontWeight: '600',
  },

  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    paddingTop: Spacing.md,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
});

export default OrderDetailCard;