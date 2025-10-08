import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated from 'react-native-reanimated';
import { Image } from 'expo-image';

import { Button } from '@/components/ui/Buttons/Button';
import { Container } from '@/components/ui/Layout/Container';
import { DetailSkeleton } from '@/components/ui/Layout/SkeletonLoader';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { ImageGallery } from '@/components/ui/Gallery/ImageGallery';
import { SpecificationsList } from '@/components/ui/Product/SpecificationsList';
import { DimensionsCard } from '@/components/ui/Product/DimensionsCard';
import { AmountSlider } from '@/components/ui/Inputs/AmountSlider';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { giftCardsService } from '@/services/giftCardsService';
import { productsService } from '@/services/productsService';
import { buildImageUrl, getFirstImageUrl } from '@/services/config';
import type { GiftCard, PhysicalProduct } from '@/types/models';
import useTranslation from '@/hooks/useTranslation';
import { useCartStore } from '@/stores/useCartStore';

const { width, height } = Dimensions.get('window');

function ProductDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [giftCard, setGiftCard] = useState<GiftCard | null>(null);
  const [product, setProduct] = useState<PhysicalProduct | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cart store
  const addToCart = useCartStore((state) => state.addToCart);
  const isAdding = useCartStore((state) => state.isAdding);

  const item = giftCard || product;
  const isGiftCard = !!giftCard;

  // Charger les données depuis l'API
  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    console.log('🔍 Loading product data for ID:', id);

    // Ignore invalid or system routes
    if (!id || typeof id !== 'string' || id.includes('(') || id.includes(')')) {
      console.log('⚠️ Invalid or system route ID, skipping:', id);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Essayer de charger comme gift card
      try {
        console.log('📦 Fetching gift card with ID:', id);
        const giftCardData = await giftCardsService.getGiftCardById(id as string);
        console.log('✅ Gift card data received:', JSON.stringify(giftCardData, null, 2));
        setGiftCard(giftCardData);

        // Auto-select first fixed amount if available, or use minAmount for variable amounts
        if (giftCardData.fixedAmounts && giftCardData.fixedAmounts.length > 0) {
          const firstAmount = Number(giftCardData.fixedAmounts[0]);
          console.log('💰 Auto-selecting first fixed amount:', firstAmount);
          setSelectedAmount(firstAmount);
        } else if (giftCardData.minAmount) {
          // For variable amount cards, select minAmount as default
          const minAmount = Number(giftCardData.minAmount);
          console.log('💰 Auto-selecting minimum amount for variable card:', minAmount);
          setSelectedAmount(minAmount);
        }

        setIsLoading(false);
        return;
      } catch (giftCardError: any) {
        console.log('❌ Not a gift card:', giftCardError?.message || giftCardError);
      }

      // Si pas une gift card, essayer comme produit
      try {
        console.log('📱 Fetching product with ID:', id);
        const productData = await productsService.getProductById(id as string);
        console.log('✅ Product data received:', JSON.stringify(productData, null, 2));
        setProduct(productData);
        setIsLoading(false);
        return;
      } catch (productError: any) {
        console.log('❌ Not a product either:', productError?.message || productError);
      }

      // Si ni gift card ni produit trouvé
      console.error('⚠️ No data found for ID:', id);
      setError('Produit non trouvé');
      setIsLoading(false);
    } catch (err: any) {
      console.error('💥 Failed to load product:', err?.message || err);
      setError('Erreur lors du chargement');
      setIsLoading(false);
    }
  };

  if (!isLoading && (!item || error)) {
    return (
      <SafeAreaView style={styles.container}>
        <Container>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>
          <View style={styles.errorContainer}>
            <Title level={3}>Produit non trouvé</Title>
            <Paragraph color="secondary">
              {error || 'Le produit demandé n\'existe pas.'}
            </Paragraph>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  // Configuration spécifique selon le type - Les montants sont utilisés directement depuis la DB
  const amounts = isGiftCard && giftCard?.fixedAmounts
    ? giftCard.fixedAmounts.map(amount => Number(amount))
    : [];

  // Déterminer le type d'affichage pour les gift cards
  const getGiftCardDisplayType = (): 'fixed' | 'list' | 'variable' | null => {
    if (!isGiftCard || !giftCard) return null;

    if (amounts.length === 1) {
      return 'fixed'; // Prix fixe unique
    } else if (amounts.length > 1) {
      return 'list'; // Liste de prix au choix
    } else if (giftCard.minAmount && giftCard.maxAmount) {
      return 'variable'; // Montant variable avec slider
    }

    return null;
  };

  const displayType = getGiftCardDisplayType();

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const getCurrentPrice = () => {
    if (isGiftCard && giftCard) {
      const amount = selectedAmount
        ? selectedAmount
        : (giftCard.fixedAmounts?.[0] ? Number(giftCard.fixedAmounts[0]) : (giftCard.minAmount ? Number(giftCard.minAmount) : 0));
      return `${formatPrice(Number(amount))} ${giftCard.currency}`;
    } else if (product) {
      const price = Number(product.price);
      return `${formatPrice(price)} ${product.currency}`;
    }
    return '';
  };

  const getOriginalPrice = () => {
    if (!isGiftCard && product && product.originalPrice) {
      const originalPrice = Number(product.originalPrice);
      return `${formatPrice(originalPrice)} ${product.currency}`;
    }
    return null;
  };

  const getSavingsAmount = () => {
    if (!isGiftCard && product && product.originalPrice) {
      const price = Number(product.price);
      const originalPrice = Number(product.originalPrice);
      const savings = originalPrice - price;
      return savings > 0 ? `${formatPrice(savings)} ${product.currency}` : null;
    }
    return null;
  };

  const getDiscountPercentage = () => {
    if (isGiftCard && giftCard) {
      const discount = Number(giftCard.discountPercentage);
      return discount > 0 ? discount : null;
    } else if (product) {
      const discount = Number(product.discountPercentage);
      return discount > 0 ? discount : null;
    }
    return null;
  };

  const price = getCurrentPrice();
  const originalPrice = getOriginalPrice();
  const savings = getSavingsAmount();
  const discountPercent = getDiscountPercentage();

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
  };

  const handleAddToCart = async () => {
    if (!item) return;

    // Check stock for physical products
    if (!isGiftCard && product && product.stockQuantity <= 0) {
      console.warn('Product out of stock');
      return;
    }

    // Validate gift card amount selection
    if (isGiftCard && !selectedAmount) {
      console.warn('Please select an amount for the gift card');
      return;
    }

    // Validate amount range for variable amount gift cards
    if (isGiftCard && giftCard && giftCard.minAmount && giftCard.maxAmount) {
      const min = Number(giftCard.minAmount);
      const max = Number(giftCard.maxAmount);

      if (selectedAmount! < min || selectedAmount! > max) {
        console.warn(`Amount must be between ${min} and ${max} FCFA`);
        return;
      }
    }

    try {
      await addToCart(
        isGiftCard ? 'GIFT_CARD' : 'PHYSICAL_PRODUCT',
        item.id,
        1, // quantity
        isGiftCard ? selectedAmount! : undefined // giftCardAmount for gift cards only
      );
      // Toast is now shown automatically by the store
    } catch (error: any) {
      console.error('Failed to add to cart:', error);
      // Toast error is now shown automatically by the store
    }
  };

  const handleBuyNow = async () => {
    if (!item) return;

    // Check stock for physical products
    if (!isGiftCard && product && product.stockQuantity <= 0) {
      console.warn('Product out of stock');
      return;
    }

    // Validate gift card amount selection
    if (isGiftCard && !selectedAmount) {
      console.warn('Please select an amount for the gift card');
      return;
    }

    // Validate amount range for variable amount gift cards
    if (isGiftCard && giftCard && giftCard.minAmount && giftCard.maxAmount) {
      const min = Number(giftCard.minAmount);
      const max = Number(giftCard.maxAmount);

      if (selectedAmount! < min || selectedAmount! > max) {
        console.warn(`Amount must be between ${min} and ${max} FCFA`);
        return;
      }
    }

    try {
      // Add to cart first
      await addToCart(
        isGiftCard ? 'GIFT_CARD' : 'PHYSICAL_PRODUCT',
        item.id,
        1,
        isGiftCard ? selectedAmount! : undefined
      );

      // Navigate directly to cart for checkout
      router.push('/(tabs)/cart');
    } catch (error: any) {
      console.error('Failed to buy now:', error);
      // Toast error is now shown automatically by the store
    }
  };

  // Get image URL
  const getImageUrl = () => {
    if (isGiftCard && giftCard) {
      return buildImageUrl(giftCard.imageUrl);
    } else if (product) {
      return getFirstImageUrl(product.images);
    }
    return null;
  };

  const imageUrl = getImageUrl();

  // Get brand icon based on brand name
  const getBrandIcon = (): string => {
    const brand = (giftCard?.brand || product?.brand || '').toLowerCase();

    // Brand icon mapping
    const iconMap: { [key: string]: string } = {
      'apple': 'logo-apple',
      'google': 'logo-google',
      'playstation': 'logo-playstation',
      'xbox': 'logo-xbox',
      'microsoft': 'logo-windows',
      'amazon': 'logo-amazon',
      'netflix': 'logo-netflix',
      'spotify': 'logo-spotify',
      'steam': 'logo-steam',
      'nintendo': 'game-controller',
      'samsung': 'phone-portrait',
      'sandisk': 'disc',
      'sony': 'tv',
      'hp': 'desktop',
      'dell': 'laptop',
      'lenovo': 'laptop',
      'asus': 'desktop',
      'razer': 'game-controller',
      'logitech': 'game-controller',
      'seagate': 'disc',
      'western digital': 'disc',
      'wd': 'disc',
      'kingston': 'disc',
      'huawei': 'phone-portrait',
      'xiaomi': 'phone-portrait',
      'oppo': 'phone-portrait',
      'vivo': 'phone-portrait',
      'oneplus': 'phone-portrait',
      'lg': 'tv',
    };

    // Check for partial matches
    for (const [key, icon] of Object.entries(iconMap)) {
      if (brand.includes(key)) {
        return icon;
      }
    }

    // Default icons
    return isGiftCard ? 'card' : 'hardware-chip';
  };

  const brandIcon = getBrandIcon();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Container>
          <DetailSkeleton isLoading={isLoading}>
            {/* Image Gallery - Now supports multiple images */}
            {!isGiftCard && product ? (
              <ImageGallery
                images={product.images || []}
                fallbackImage={imageUrl || undefined}
              />
            ) : (
              <Animated.View
                style={styles.imageContainer}
                sharedTransitionTag={`gift-card-image-${id}`}
              >
                {imageUrl && (
                  <Image
                    source={{ uri: imageUrl }}
                    style={styles.productImage}
                    contentFit="contain"
                  />
                )}
                {isGiftCard && giftCard && selectedAmount && (
                  <View style={styles.amountBadge}>
                    <Caption style={styles.amountText}>
                      {formatPrice(selectedAmount)} {giftCard.currency}
                    </Caption>
                  </View>
                )}
              </Animated.View>
            )}

            {/* Informations produit */}
            <View style={styles.productInfo}>
            <Title level={4} style={styles.productTitle}>
              {isGiftCard && giftCard ? giftCard.title : product?.name}
            </Title>

            <View style={styles.priceContainer}>
              <View style={styles.priceRow}>
                <Title level={5} style={styles.price}>
                  {price}
                </Title>
                {discountPercent && discountPercent > 0 && (
                  <View style={styles.discountBadge}>
                    <Caption style={styles.discountText}>
                      -{Math.abs(discountPercent)}%
                    </Caption>
                  </View>
                )}
              </View>

              {originalPrice && (
                <View style={styles.priceDetails}>
                  <Caption color="secondary" style={styles.originalPrice}>
                    {originalPrice}
                  </Caption>
                  {savings && (
                    <Caption color="success" style={styles.savings}>
                      Économisez {savings}
                    </Caption>
                  )}
                </View>
              )}

              {isGiftCard && giftCard && selectedAmount && displayType !== 'fixed' && (
                <Caption color="secondary" style={styles.originalAmount}>
                  Montant sélectionné: {formatPrice(selectedAmount)} {giftCard.currency}
                </Caption>
              )}
              {!isGiftCard && product && product.stockQuantity !== undefined && (
                <Caption color={product.stockQuantity > 0 ? "success" : "error"}>
                  {product.stockQuantity > 0 ? `${product.stockQuantity} en stock` : 'Rupture de stock'}
                </Caption>
              )}
            </View>

            {/* Type 1: Prix fixe unique - Pas de sélection nécessaire */}
            {isGiftCard && displayType === 'fixed' && (
              <View style={styles.amountSection}>
                <View style={styles.fixedAmountBadge}>
                  <Ionicons name="pricetag" size={20} color={Colors.primary} />
                  <Paragraph style={styles.fixedAmountText}>
                    Prix fixe
                  </Paragraph>
                </View>
              </View>
            )}

            {/* Type 2: Liste de prix au choix - Boutons de sélection */}
            {isGiftCard && displayType === 'list' && (
              <View style={styles.amountSection}>
                <Paragraph style={styles.sectionTitle}>
                  Sélectionner le montant
                </Paragraph>
                <View style={styles.amountGrid}>
                  {amounts.map((amount) => (
                    <Pressable
                      key={amount}
                      style={[
                        styles.amountOption,
                        selectedAmount === amount && styles.amountOptionSelected,
                      ]}
                      onPress={() => handleAmountSelect(amount)}
                    >
                      <Caption
                        style={[
                          styles.amountOptionText,
                          selectedAmount === amount && styles.amountOptionTextSelected,
                        ]}
                      >
                        {formatPrice(amount)} FCFA
                      </Caption>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Type 3: Montant variable - Slider interactif */}
            {isGiftCard && displayType === 'variable' && giftCard && giftCard.minAmount && giftCard.maxAmount && (
              <View style={styles.amountSection}>
                <Paragraph style={styles.sectionTitle}>
                  Sélectionnez votre montant
                </Paragraph>
                <AmountSlider
                  min={Number(giftCard.minAmount)}
                  max={Number(giftCard.maxAmount)}
                  value={selectedAmount || Number(giftCard.minAmount)}
                  onChange={(value) => setSelectedAmount(Math.round(value))}
                  currency={giftCard.currency}
                  step={1000}
                />
              </View>
            )}

            {/* Informations détaillées */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name={brandIcon as any}
                      size={24}
                      color={Colors.text.primary}
                    />
                  </View>
                  <View>
                    <Caption color="secondary">Marque</Caption>
                    <Paragraph style={styles.detailValue}>
                      {giftCard?.brand || product?.brand || 'N/A'}
                    </Paragraph>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name={isGiftCard ? "globe" : "location"}
                      size={24}
                      color={Colors.text.primary}
                    />
                  </View>
                  <View>
                    <Caption color="secondary">Région</Caption>
                    <Paragraph style={styles.detailValue}>
                      {isGiftCard && giftCard ? giftCard.region : 'Global'}
                    </Paragraph>
                  </View>
                </View>

                <View style={styles.detailItem}>
                  <View style={styles.detailIcon}>
                    <Ionicons
                      name={isGiftCard ? "card" : "cube"}
                      size={24}
                      color={Colors.text.primary}
                    />
                  </View>
                  <View>
                    <Caption color="secondary">Type</Caption>
                    <Paragraph style={styles.detailValue}>
                      {isGiftCard ? "Digital" : "Physique"}
                    </Paragraph>
                  </View>
                </View>
              </View>
            </View>

            {/* Product Specifications - Physical Products Only */}
            {!isGiftCard && product && product.specifications && (
              <SpecificationsList
                specifications={product.specifications}
                title="Spécifications techniques"
                collapsible={false}
              />
            )}

            {/* Dimensions & Weight - Physical Products Only */}
            {!isGiftCard && product && (product.dimensionsCm || product.weightKg) && (
              <DimensionsCard
                dimensions={product.dimensionsCm}
                weight={product.weightKg}
              />
            )}

            {/* Additional Product Metadata - Physical Products Only */}
            {!isGiftCard && product && (
              <View style={styles.metadataSection}>
                <Title level={6} style={styles.metadataTitle}>
                  Informations complémentaires
                </Title>
                <View style={styles.metadataGrid}>
                  {product.warrantyMonths > 0 && (
                    <View style={styles.metadataItem}>
                      <Ionicons name="shield-checkmark" size={20} color={Colors.primary} />
                      <Caption color="secondary" style={styles.metadataLabel}>
                        Garantie
                      </Caption>
                      <Paragraph style={styles.metadataValue}>
                        {product.warrantyMonths} mois
                      </Paragraph>
                    </View>
                  )}
                  {product.deliveryTimeDays > 0 && (
                    <View style={styles.metadataItem}>
                      <Ionicons name="time" size={20} color={Colors.primary} />
                      <Caption color="secondary" style={styles.metadataLabel}>
                        Livraison
                      </Caption>
                      <Paragraph style={styles.metadataValue}>
                        {product.deliveryTimeDays} jours
                      </Paragraph>
                    </View>
                  )}
                  {product.rating && Number(product.rating) > 0 && (
                    <View style={styles.metadataItem}>
                      <Ionicons name="star" size={20} color={Colors.primary} />
                      <Caption color="secondary" style={styles.metadataLabel}>
                        Note
                      </Caption>
                      <Paragraph style={styles.metadataValue}>
                        {Number(product.rating).toFixed(1)}/5
                      </Paragraph>
                    </View>
                  )}
                  {product.sku && (
                    <View style={styles.metadataItem}>
                      <Ionicons name="barcode" size={20} color={Colors.primary} />
                      <Caption color="secondary" style={styles.metadataLabel}>
                        SKU
                      </Caption>
                      <Paragraph style={styles.metadataValue}>
                        {product.sku}
                      </Paragraph>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Description */}
            <View style={styles.descriptionSection}>
              <Pressable style={styles.descriptionHeader}>
                <Title level={6}>Description du produit</Title>
                <Ionicons name="chevron-down" size={20} color={Colors.text.primary} />
              </Pressable>
              <View style={styles.descriptionContent}>
                <Paragraph color="secondary" style={styles.descriptionText}>
                  {isGiftCard && giftCard
                    ? giftCard.description
                    : product?.description || 'Aucune description disponible'
                  }
                </Paragraph>
              </View>
            </View>

            {/* Instructions d'utilisation pour gift cards */}
            {isGiftCard && giftCard?.usageInstructions && (
              <View style={styles.descriptionSection}>
                <Pressable style={styles.descriptionHeader}>
                  <Title level={6}>Instructions d'utilisation</Title>
                  <Ionicons name="information-circle" size={20} color={Colors.text.primary} />
                </Pressable>
                <View style={styles.descriptionContent}>
                  <Paragraph color="secondary" style={styles.descriptionText}>
                    {giftCard.usageInstructions}
                  </Paragraph>
                </View>
              </View>
            )}

            {/* Conditions pour gift cards */}
            {isGiftCard && giftCard?.termsConditions && (
              <View style={styles.descriptionSection}>
                <Pressable style={styles.descriptionHeader}>
                  <Title level={6}>Conditions d'utilisation</Title>
                  <Ionicons name="document-text" size={20} color={Colors.text.primary} />
                </Pressable>
                <View style={styles.descriptionContent}>
                  <Paragraph color="secondary" style={styles.descriptionText}>
                    {giftCard.termsConditions}
                  </Paragraph>
                </View>
              </View>
            )}
          </View>
          </DetailSkeleton>
        </Container>
      </ScrollView>

      {/* Actions en bas */}
      <View style={styles.actionsContainer}>
        <Container>
          <View style={styles.actions}>
            <Button
              variant="outline"
              style={styles.addToCartButton}
              onPress={handleAddToCart}
              size='sm'
              disabled={isAdding || isLoading || (!isGiftCard && product && product.stockQuantity <= 0)}
              loading={isAdding}
            >
              {isAdding ? 'Ajout...' : (!isGiftCard && product && product.stockQuantity <= 0) ? 'Rupture de stock' : 'Ajouter au panier'}
            </Button>
            <Button
              style={styles.buyNowButton}
              onPress={handleBuyNow}
              size='sm'
              disabled={isAdding || isLoading || (!isGiftCard && product && product.stockQuantity <= 0)}
              loading={isAdding}
            >
              {isAdding ? 'Ajout...' : (!isGiftCard && product && product.stockQuantity <= 0) ? 'Rupture de stock' : 'Acheter directement'}
            </Button>
          </View>
        </Container>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomColor: Colors.border.primary,
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    zIndex: 10,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollView: {
    flex: 1,
  },

  imageContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    position: 'relative',
  },

  productImage: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 300,
    maxHeight: 300,
  },

  amountBadge: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },

  amountText: {
    fontWeight: '600',
    color: Colors.black,
  },

  productInfo: {
    paddingTop: Spacing.lg,
  },

  productTitle: {
    marginBottom: Spacing.sm,
  },

  priceContainer: {
    marginBottom: Spacing.xl,
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },

  price: {
    color: Colors.text.primary,
  },

  discountBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },

  discountText: {
    color: Colors.black,
    fontWeight: '700',
    fontSize: 12,
  },

  priceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },

  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
  },

  savings: {
    fontSize: 13,
    fontWeight: '600',
  },

  originalAmount: {
    fontSize: 14,
  },

  amountSection: {
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.md,
  },

  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  amountOption: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    minWidth: 60,
    alignItems: 'center',
  },

  amountOptionSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  amountOptionText: {
    fontWeight: '500',
    color: Colors.text.secondary,
  },

  amountOptionTextSelected: {
    color: Colors.black,
    fontWeight: '600',
  },

  detailsSection: {
    marginBottom: Spacing.xl,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  detailItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },

  detailIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },

  detailValue: {
    fontWeight: '500',
    textAlign: 'center',
  },

  metadataSection: {
    marginBottom: Spacing.xl,
  },

  metadataTitle: {
    marginBottom: Spacing.md,
  },

  metadataGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  metadataItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },

  metadataLabel: {
    fontSize: 12,
    textAlign: 'center',
  },

  metadataValue: {
    fontWeight: '600',
    fontSize: 14,
    textAlign: 'center',
  },

  descriptionSection: {
    marginBottom: Spacing.xl,
  },

  descriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },

  descriptionContent: {
    paddingTop: Spacing.sm,
  },

  descriptionText: {
    lineHeight: 20,
  },

  actionsContainer: {
    backgroundColor: Colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    paddingVertical: Spacing.lg,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },

  addToCartButton: {
    flex: 1,
  },

  buyNowButton: {
    flex: 1,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },

  fixedAmountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.gray[50],
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },

  fixedAmountText: {
    fontWeight: '600',
    color: Colors.text.primary,
  },
});

export default ProductDetailScreen;
