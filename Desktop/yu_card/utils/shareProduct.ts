import { Share, Platform, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

/**
 * Product share data
 */
export interface ProductShareData {
  id: string;
  name: string;
  price?: number;
  imageUrl?: string;
  description?: string;
}

/**
 * Share options
 */
export interface ShareOptions {
  showCopyOption?: boolean;
  customMessage?: string;
}

/**
 * Share a product with others
 * Generates a deep link and shares via native share sheet
 *
 * @param product - Product data to share
 * @param options - Optional configuration
 */
export const shareProduct = async (
  product: ProductShareData,
  options: ShareOptions = {}
): Promise<boolean> => {
  try {
    const { showCopyOption = true, customMessage } = options;

    // Generate deep link
    const deepLink = generateProductLink(product.id);

    // Build share message
    const shareMessage = customMessage || buildShareMessage(product, deepLink);

    // Attempt to share using native share sheet
    const result = await Share.share(
      {
        message: shareMessage,
        url: Platform.OS === 'ios' ? deepLink : undefined,
        title: `${product.name} - Yu Card`,
      },
      {
        dialogTitle: 'Partager ce produit',
        subject: `${product.name} - Yu Card`,
      }
    );

    if (result.action === Share.sharedAction) {
      console.log('✅ Product shared successfully');
      return true;
    } else if (result.action === Share.dismissedAction) {
      console.log('ℹ️ Share cancelled');
      return false;
    }

    return false;
  } catch (error) {
    console.error('❌ Error sharing product:', error);

    // Fallback: offer to copy link
    if (options.showCopyOption) {
      Alert.alert(
        'Erreur de partage',
        'Voulez-vous copier le lien à la place ?',
        [
          {
            text: 'Annuler',
            style: 'cancel',
          },
          {
            text: 'Copier',
            onPress: () => copyProductLink(product.id),
          },
        ]
      );
    }

    return false;
  }
};

/**
 * Copy product link to clipboard
 *
 * @param productId - Product ID
 */
export const copyProductLink = async (productId: string): Promise<boolean> => {
  try {
    const link = generateProductLink(productId);
    await Clipboard.setStringAsync(link);

    Alert.alert('Lien copié', 'Le lien du produit a été copié dans le presse-papier');
    console.log('✅ Product link copied to clipboard');

    return true;
  } catch (error) {
    console.error('❌ Error copying product link:', error);
    Alert.alert('Erreur', 'Impossible de copier le lien');
    return false;
  }
};

/**
 * Generate product deep link
 * Creates universal link that works on both web and app
 *
 * @param productId - Product ID
 * @returns Universal link URL
 */
export const generateProductLink = (productId: string): string => {
  // Use universal link that redirects to app if installed, otherwise opens web
  const baseUrl = 'https://app.yucard.generale-ci.com';
  return `${baseUrl}/product/${productId}`;
};

/**
 * Build share message with product details
 *
 * @param product - Product data
 * @param link - Product link
 * @returns Formatted share message
 */
const buildShareMessage = (product: ProductShareData, link: string): string => {
  let message = `🎁 Découvrez ${product.name} sur Yu Card\n\n`;

  if (product.description) {
    message += `${product.description}\n\n`;
  }

  if (product.price) {
    message += `💰 Prix : ${formatPrice(product.price)} XOF\n\n`;
  }

  message += `👉 ${link}`;

  return message;
};

/**
 * Format price with thousand separators
 *
 * @param price - Price in XOF
 * @returns Formatted price string
 */
const formatPrice = (price: number): string => {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

/**
 * Share multiple products (for bulk sharing)
 *
 * @param products - Array of product IDs
 */
export const shareProducts = async (products: string[]): Promise<boolean> => {
  try {
    const baseUrl = 'https://app.yucard.generale-ci.com';
    const links = products.map((id) => `${baseUrl}/product/${id}`).join('\n');

    const message = `🎁 Découvrez ces produits sur Yu Card :\n\n${links}`;

    const result = await Share.share({
      message,
      title: 'Produits Yu Card',
    });

    if (result.action === Share.sharedAction) {
      console.log('✅ Products shared successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error sharing products:', error);
    Alert.alert('Erreur', 'Impossible de partager les produits');
    return false;
  }
};

/**
 * Share order/transaction
 *
 * @param orderId - Order ID
 * @param orderDetails - Optional order details
 */
export const shareOrder = async (
  orderId: string,
  orderDetails?: {
    total?: number;
    items?: number;
    date?: string;
  }
): Promise<boolean> => {
  try {
    const baseUrl = 'https://app.yucard.generale-ci.com';
    const link = `${baseUrl}/orders/${orderId}`;

    let message = `📦 Ma commande Yu Card\n\n`;

    if (orderDetails) {
      if (orderDetails.items) {
        message += `📝 Articles : ${orderDetails.items}\n`;
      }
      if (orderDetails.total) {
        message += `💰 Total : ${formatPrice(orderDetails.total)} XOF\n`;
      }
      if (orderDetails.date) {
        message += `📅 Date : ${orderDetails.date}\n`;
      }
      message += `\n`;
    }

    message += `👉 ${link}`;

    const result = await Share.share({
      message,
      title: 'Commande Yu Card',
    });

    if (result.action === Share.sharedAction) {
      console.log('✅ Order shared successfully');
      return true;
    }

    return false;
  } catch (error) {
    console.error('❌ Error sharing order:', error);
    Alert.alert('Erreur', 'Impossible de partager la commande');
    return false;
  }
};
