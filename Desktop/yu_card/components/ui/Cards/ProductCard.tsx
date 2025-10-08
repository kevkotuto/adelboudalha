import { BorderRadius, Colors, Shadows, Spacing, Typography } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Button, IconButton } from '../Buttons';
import { Caption, Paragraph, Title } from '../Typography';

interface ProductCardProps {
  id?: string; // ID pour les shared transitions
  name: string;
  brand?: string;
  price: number;
  originalPrice?: number; // Prix original si en promotion
  currency?: string;
  image: any; // Changed to any to support both require() and URI strings
  category?: string;
  inStock?: boolean;
  rating?: number;
  reviewCount?: number;
  onPress?: () => void;
  onFavoritePress?: () => void;
  isFavorite?: boolean;
  style?: ViewStyle;
  disabled?: boolean;
  badge?: string; // "NOUVEAU", "PROMO", etc.
}

export const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  brand,
  price,
  originalPrice,
  currency = 'CFA',
  image,
  category,
  inStock = true,
  rating,
  reviewCount,
  onPress,
  onFavoritePress,
  isFavorite = false,
  style,
  disabled = false,
  badge,
}) => {
  const formatPrice = (value: number) => {
    // Ensure value is a valid number
    const numValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return new Intl.NumberFormat('fr-FR').format(numValue);
  };

  const discountPercentage = originalPrice && originalPrice > price
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : null;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        !inStock && styles.outOfStock,
        disabled && styles.disabled,
        pressed && styles.pressed,
        Shadows.card,
        style,
      ]}
    >
      <View style={styles.card}>
        {/* Image Container */}
        <Animated.View
          style={styles.imageContainer}
          sharedTransitionTag={id ? `product-image-${id}` : undefined}
        >
          <Image
            source={typeof image === 'string' ? { uri: image } : image}
            style={styles.image}
            contentFit="contain"
            transition={300}
          />

          {/* Badges */}
          {badge ? (
            <View style={[styles.badge, styles.topLeftBadge]}>
              <Caption color="inverse" style={styles.badgeText}>
                {String(badge)}
              </Caption>
            </View>
          ) : null}

          {discountPercentage ? (
            <View style={[styles.badge, styles.discountBadge]}>
              <Caption color="inverse" style={styles.badgeText}>
                -{String(discountPercentage)}%
              </Caption>
            </View>
          ) : null}

          {!inStock ? (
            <View style={styles.outOfStockOverlay}>
              <Caption color="inverse" style={styles.outOfStockText}>
                RUPTURE DE STOCK
              </Caption>
            </View>
          ) : null}

          {/* Favorite Button */}
          {onFavoritePress ? (
            <View style={styles.favoriteButton}>
              <IconButton
                icon={isFavorite ? 'heart' : 'heart-outline'}
                variant="ghost"
                size="sm"
                onPress={onFavoritePress}
                iconColor={isFavorite ? Colors.error : Colors.white}
                style={styles.favoriteButtonStyle}
              />
            </View>
          ) : null}
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Category */}
          {category && typeof category === 'string' && category.trim() !== '' ? (
            <Caption color="secondary" style={styles.category}>
              {String(category).toUpperCase()}
            </Caption>
          ) : null}
          {/* Brand */}
          {brand && typeof brand === 'string' && brand.trim() !== '' ? (
            <Caption color="accent" style={styles.brand}>
              {String(brand)}
            </Caption>
          ) : null}
          {/* Product Name */}
          <Paragraph
            size="base"
            weight="medium"
            numberOfLines={2}
            style={styles.productName}
          >
            {String(name || 'Sans nom')}
          </Paragraph>

          {/* Rating */}
          {rating && rating > 0 ? (
            <View style={styles.ratingContainer}>
              <View style={styles.stars}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <Ionicons
                    key={star}
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={12}
                    color={star <= rating ? Colors.primary : Colors.gray[300]}
                  />
                ))}
              </View>
              {reviewCount !== undefined && reviewCount > 0 ? (
                <Caption color="tertiary" style={styles.reviewCount}>
                  ({String(reviewCount)})
                </Caption>
              ) : null}
            </View>
          ) : null}

          {/* Price */}
          <View style={styles.priceContainer}>
            <View style={styles.currentPrice}>
              <Title level={6} color="primary" numberOfLines={1}>
                {String(formatPrice(price))}
              </Title>
              {currency && typeof currency === 'string' && currency.trim() !== '' ? (
                <Caption color="secondary" style={styles.currency}>
                  {String(currency)}
                </Caption>
              ) : null}
            </View>

            {originalPrice && originalPrice > price ? (
              <Caption
                color="tertiary"
                style={styles.originalPrice}
              >
                {`${String(formatPrice(originalPrice))}${currency && typeof currency === 'string' && currency.trim() !== '' ? ` ${String(currency)}` : ''}`}
              </Caption>
            ) : null}
          </View>
          <Button
            onPress={(e) => {
              // Stop propagation to prevent card click when clicking button
              if (e?.stopPropagation) e.stopPropagation();
              if (onPress && !disabled && inStock) {
                onPress();
              }
            }}
            disabled={disabled || !inStock}
            size="sm"
            fullWidth>
              {!inStock ? 'Rupture' : 'Acheter'}
            </Button>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    margin: Spacing.xs,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },

  card: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    height: 300,
    margin: 5,
  },

  imageContainer: {
    position: 'relative',
    height: 150,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: '100%',
    height: 150,
    resizeMode: 'contain',
  },

  badge: {
    position: 'absolute',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },

  topLeftBadge: {
    top: Spacing.sm,
    left: Spacing.sm,
    backgroundColor: Colors.info,
  },

  discountBadge: {
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.error,
  },

  badgeText: {
    fontSize: 10,
    fontFamily: Typography.fonts.ubuntu.bold,
  },

  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  outOfStockText: {
    fontSize: 12,
    fontFamily: Typography.fonts.ubuntu.bold,
  },

  favoriteButton: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
  },

  favoriteButtonStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  content: {
    padding: Spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },

  category: {
    fontSize: 10,
  },

  brand: {
    fontSize: 12,
  },

  productName: {
    marginVertical: Spacing.xs,
  },

  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  stars: {
    flexDirection: 'row',
    marginRight: Spacing.xs,
  },

  reviewCount: {
    fontSize: 10,
  },

  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  currentPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  currency: {
    marginLeft: Spacing.xs,
  },

  originalPrice: {
    textDecorationLine: 'line-through',
    fontSize: 12,
  },

  outOfStock: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.5,
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});

export default ProductCard;