/**
 * ProductListItem Component
 * Displays a product or gift card with action buttons
 */

import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { buildImageUrl } from '@/services/config';
import type { AdminGiftCard, AdminProduct } from '@/types/admin';

type ProductListItemProps = {
  item: (AdminProduct | AdminGiftCard) & { type: 'product' | 'gift_card' };
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive?: () => void;
};

export const ProductListItem: React.FC<ProductListItemProps> = ({
  item,
  onEdit,
  onDelete,
  onToggleActive,
}) => {
  const isProduct = item.type === 'product';
  const rawImage = item.images?.[0] || (item as any).mainImageUrl;
  const mainImage = rawImage ? buildImageUrl(rawImage) : null;

  const rawPrice = isProduct ? (item as AdminProduct).price : (item as AdminGiftCard).fixedAmounts?.[0] || 0;
  const price = rawPrice;

  const stock = isProduct ? (item as AdminProduct).stockQuantity : (item as AdminGiftCard)._count?.giftCardCodes || 0;

  const isLowStock = stock < 5 && stock > 0;
  const isOutOfStock = stock === 0;

  return (
    <View style={styles.container}>
      {/* Image */}
      <View style={styles.imageContainer}>
        {mainImage ? (
          <ExpoImage
            source={{ uri: mainImage }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name={isProduct ? 'phone-portrait-outline' : 'gift-outline'}
              size={32}
              color={Colors.text.secondary}
            />
          </View>
        )}

        {/* Type Badge */}
        <View style={[styles.typeBadge, { backgroundColor: isProduct ? '#2196F3' : Colors.primary }]}>
          <Ionicons
            name={isProduct ? 'phone-portrait' : 'gift'}
            size={10}
            color={Colors.white}
          />
        </View>

        {/* Stock Badge */}
        {isOutOfStock && (
          <View style={[styles.stockBadge, styles.stockBadgeOut]}>
            <Caption style={styles.stockBadgeText}>ÉPUISÉ</Caption>
          </View>
        )}
        {isLowStock && (
          <View style={[styles.stockBadge, styles.stockBadgeLow]}>
            <Caption style={styles.stockBadgeText}>FAIBLE</Caption>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Title level={6} style={styles.name} numberOfLines={1}>
              {item.name || (item as any).title}
            </Title>
            <Caption style={styles.brand}>
              {(item as any).brand || (item as AdminGiftCard).merchantName}
            </Caption>
          </View>

          {/* Active Status */}
          <Pressable onPress={onToggleActive} style={styles.activeToggle}>
            <View style={[styles.activeIndicator, { backgroundColor: item.isActive ? '#4CAF50' : '#9E9E9E' }]} />
            <Caption style={styles.activeText}>
              {item.isActive ? 'Actif' : 'Inactif'}
            </Caption>
          </Pressable>
        </View>

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cash-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.infoText}>
              {typeof price === 'number' ? `${price.toLocaleString('fr-FR')} FCFA` : price}
            </Caption>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.infoText}>
              Stock: {stock}
            </Caption>
          </View>
        </View>

        {/* SKU */}
        {isProduct && (
          <Caption style={styles.sku}>
            SKU: {(item as AdminProduct).sku}
          </Caption>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Pressable style={[styles.actionButton, styles.editButton]} onPress={onEdit}>
            <Ionicons name="create-outline" size={18} color={Colors.primary} />
            <Caption style={styles.editButtonText}>Modifier</Caption>
          </Pressable>

          <Pressable style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
            <Ionicons name="trash-outline" size={18} color="#f44336" />
            <Caption style={styles.deleteButtonText}>Supprimer</Caption>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  imageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginRight: Spacing.md,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  typeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stockBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },

  stockBadgeOut: {
    backgroundColor: '#f44336',
  },

  stockBadgeLow: {
    backgroundColor: '#FF9800',
  },

  stockBadgeText: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.white,
    fontSize: 8,
  },

  content: {
    flex: 1,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xs,
  },

  headerLeft: {
    flex: 1,
    marginRight: Spacing.sm,
  },

  name: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: 2,
  },

  brand: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 11,
  },

  activeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  activeIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  activeText: {
    fontFamily: 'Ubuntu_600SemiBold',
    fontSize: 10,
    color: Colors.text.secondary,
  },

  infoRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },

  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },

  infoText: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.secondary,
    fontSize: 11,
  },

  sku: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 10,
    marginBottom: Spacing.sm,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
  },

  editButton: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },

  editButtonText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.primary,
    fontSize: 11,
  },

  deleteButton: {
    borderColor: '#f44336',
    backgroundColor: '#f4433610',
  },

  deleteButtonText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: '#f44336',
    fontSize: 11,
  },
});
