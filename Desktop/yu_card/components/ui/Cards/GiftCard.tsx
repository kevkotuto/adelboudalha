import { BorderRadius, Colors, Shadows, Spacing } from '@/constants';
import { GiftCardData } from '@/data/mockData';
import { useCartStore } from '@/stores/useCartStore';
import { Image } from 'expo-image';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';
import Animated from 'react-native-reanimated';
import { Button } from '../Buttons';
import { Caption, Paragraph, Title } from '../Typography';

interface GiftCardProps {
  id?: string; // ID pour les shared transitions
  title: string;
  amount?: number; // Montant unique ou premier montant fixe
  minAmount?: number; // Montant minimum pour plage variable
  maxAmount?: number; // Montant maximum pour plage variable
  fixedAmounts?: number[]; // Liste de montants fixes prédéfinis
  currency?: string;
  brand: string;
  image: any; // Changed to any to support both require() and URI strings
  backgroundImage?: any;
  backgroundColor?: string;
  gradientColors?: [string, string];
  onPress?: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  popular?: boolean;
  discount?: number; // Pourcentage de réduction
  giftCardData?: GiftCardData; // Données complètes pour l'ajout au panier
}

export const GiftCard: React.FC<GiftCardProps> = ({
  id,
  title,
  amount,
  minAmount,
  maxAmount,
  fixedAmounts,
  currency = 'CFA',
  brand,
  image,
  backgroundImage,
  backgroundColor = Colors.primary,
  gradientColors = [Colors.primary, Colors.primaryDark],
  onPress,
  style,
  disabled = false,
  popular = false,
  discount,
  giftCardData,
}) => {
  const addToCart = useCartStore((state) => state.addToCart);

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  // Déterminer l'affichage du prix
  const getPriceDisplay = () => {
    // Si plusieurs montants fixes, afficher "À partir de X"
    if (fixedAmounts && fixedAmounts.length > 0) {
      const minFixed = Math.min(...fixedAmounts);
      return `À partir de ${formatAmount(minFixed)} ${currency}`;
    }

    // Si plage min/max, afficher "De X à Y"
    if (minAmount && maxAmount) {
      return `De ${formatAmount(minAmount)} à ${formatAmount(maxAmount)} ${currency}`;
    }

    // Si montant unique
    if (amount) {
      return `${formatAmount(amount)} ${currency}`;
    }

    // Fallback
    return 'Prix sur demande';
  };

  const handleAddToCart = async () => {
    if (id && amount) {
      try {
        await addToCart('GIFT_CARD', id, 1, amount);
        // Toast is now shown automatically by the store
      } catch (error) {
        console.error('Failed to add gift card to cart:', error);
        // Toast error is now shown automatically by the store
      }
    }
  };



  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.container,
        disabled && styles.disabled,
        pressed && styles.pressed,
        !disabled && Shadows.card,
        style,
      ]}
    >
      <View style={styles.card}>
            <Animated.View
              style={styles.images}
              sharedTransitionTag={id ? `gift-card-image-${id}` : undefined}
            >
              <Image
                source={typeof image === 'string' ? { uri: image } : image}
                style={styles.cardImage}
                contentFit="contain"
                transition={300}
              />
            </Animated.View>
            <View>
              <Paragraph size='small'  numberOfLines={2}>
                {title}
              </Paragraph>
              {/* Indicateur de type de tarification */}
              {(fixedAmounts && fixedAmounts.length > 1) || (minAmount && maxAmount) ? (
                <Caption color="secondary" style={styles.priceType}>
                  {fixedAmounts && fixedAmounts.length > 1 ? 'Montants au choix' : 'Montant variable'}
                </Caption>
              ) : null}
              <Title level={6}  numberOfLines={2} style={styles.priceText}>
                {getPriceDisplay()}
              </Title>
            </View>

            <View>
                <Button
                  onPress={giftCardData ? handleAddToCart : onPress}
                  disabled={disabled}
                  size='sm'
                >
                  {giftCardData ? 'Acheter' : 'Acheter'}
                </Button>
            </View>
           
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    backgroundColor: Colors.white,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.md,
    justifyContent: 'space-between',
    height: 230,
    gap : Spacing.xs
  },
  cardImage: {
    width: '100%',
    height: 90,
    resizeMode: 'contain',
  },
  images: {
    flexDirection: 'row',
    justifyContent: 'center', // Centrer l'image
    alignItems: 'center',
    height: 100,
    backgroundColor : Colors.gray[200],
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },
  price: {

  },
  priceType: {
    fontSize: 10,
    marginTop: 2,
  },
  priceText: {
    marginTop: 2,
  },
  disabled: {
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.75,
  },
  popularBadge: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    zIndex: 1
  }
});

export default GiftCard;