import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  CartItem,
  AddToCartRequest,
  UpdateCartItemRequest,
  ProductType,
} from '@/types';
import { productHelpers } from './productService';

// ==================================
// CART SERVICE
// ==================================

export class CartService {
  // ==================================
  // CART ITEM MANAGEMENT
  // ==================================

  /**
   * Get user's cart with full details (items, totals, etc.)
   */
  async getCart(): Promise<{
    id: string;
    userId: string;
    items: CartItem[];
    itemsCount: number;
    subtotal: number;
    discount: number;
    total: number;
  }> {
    const response = await apiClient.get<{
      id: string;
      userId: string;
      items: CartItem[];
      itemsCount: number;
      subtotal: number;
      discount: number;
      total: number;
    }>(API_ENDPOINTS.CART.BASE);

    console.log('🔍 CartService.getCart() - Raw Response:', JSON.stringify(response, null, 2));

    return response;
  }

  /**
   * Get user's cart items only
   */
  async getCartItems(): Promise<CartItem[]> {
    const cart = await this.getCart();
    return cart.items || [];
  }

  /**
   * Add item to cart
   */
  async addToCart(
    productType: ProductType,
    productId: string,
    quantity = 1,
    giftCardAmount?: number
  ): Promise<CartItem> {
    const requestData: AddToCartRequest = {
      productType,
      quantity,
    };

    if (productType === 'GIFT_CARD') {
      requestData.giftCardId = productId;
      if (giftCardAmount) {
        requestData.giftCardAmount = giftCardAmount;
      }
    } else {
      requestData.physicalProductId = productId;
    }

    return await apiClient.post<CartItem>(API_ENDPOINTS.CART.ADD_ITEM, requestData);
  }

  /**
   * Update cart item (quantity)
   */
  async updateCartItem(
    cartItemId: string,
    updates: UpdateCartItemRequest
  ): Promise<CartItem> {
    return await apiClient.patch<CartItem>(
      API_ENDPOINTS.CART.UPDATE_ITEM(cartItemId),
      updates
    );
  }

  /**
   * Remove item from cart
   */
  async removeFromCart(cartItemId: string): Promise<{ success: boolean }> {
    return await apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.CART.REMOVE_ITEM(cartItemId)
    );
  }

  /**
   * Clear entire cart (delete all items)
   */
  async clearCart(): Promise<{ success: boolean; message?: string }> {
    return await apiClient.delete<{ success: boolean; message?: string }>(
      API_ENDPOINTS.CART.BASE
    );
  }

  /**
   * Get cart summary with totals
   */
  async getCartSummary(): Promise<{
    items: CartItem[];
    subtotal: number;
    shippingCost: number;
    taxAmount: number;
    discountAmount: number;
    totalAmount: number;
    itemCount: number;
    giftCardCount: number;
    physicalProductCount: number;
  }> {
    const cart = await this.getCart();

    const totals = cartHelpers.calculateCartTotals(cart.items);

    return {
      items: cart.items,
      subtotal: cart.subtotal || totals.subtotal,
      shippingCost: 0,
      taxAmount: 0,
      discountAmount: cart.discount || 0,
      totalAmount: cart.total || totals.subtotal,
      itemCount: cart.itemsCount || totals.itemCount,
      giftCardCount: totals.giftCardCount,
      physicalProductCount: totals.physicalProductCount,
    };
  }

  /**
   * Apply coupon to cart
   */
  async applyCoupon(couponCode: string): Promise<{
    success: boolean;
    discount: number;
    message: string;
  }> {
    return await apiClient.post<{
      success: boolean;
      discount: number;
      message: string;
    }>(API_ENDPOINTS.CART.APPLY_COUPON, { couponCode });
  }

  /**
   * Remove coupon from cart
   */
  async removeCoupon(): Promise<{ success: boolean }> {
    return await apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.CART.REMOVE_COUPON
    );
  }

  /**
   * Estimate shipping for cart
   */
  async estimateShipping(addressData: {
    city: string;
    stateProvince?: string;
    postalCode?: string;
  }): Promise<{
    cost: number;
    estimatedDays: number;
    carrier: string;
  }> {
    return await apiClient.post<{
      cost: number;
      estimatedDays: number;
      carrier: string;
    }>(API_ENDPOINTS.CART.ESTIMATE_SHIPPING, addressData);
  }

  // ==================================
  // CART VALIDATION
  // ==================================

  /**
   * Validate cart before checkout
   */
  async validateCart(): Promise<{
    valid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    return await apiClient.post<{
      valid: boolean;
      errors: string[];
      warnings: string[];
    }>('/cart/validate');
  }

  // ==================================
  // BULK OPERATIONS
  // ==================================

  /**
   * Update multiple cart items at once
   */
  async updateMultipleItems(
    updates: Array<{
      cartItemId: string;
      quantity?: number;
      giftCardAmount?: number;
    }>
  ): Promise<CartItem[]> {
    return await apiClient.put<CartItem[]>('/cart/bulk-update', { updates });
  }

  /**
   * Remove multiple items from cart
   */
  async removeMultipleItems(cartItemIds: string[]): Promise<{
    success: boolean;
    removedItems: number;
  }> {
    return await apiClient.post<{
      success: boolean;
      removedItems: number;
    }>('/cart/bulk-remove', { cartItemIds });
  }
}

// ==================================
// CART HELPER FUNCTIONS
// ==================================

export const cartHelpers = {
  /**
   * Calculate cart totals locally
   */
  calculateCartTotals(cartItems: CartItem[]): {
    subtotal: number;
    itemCount: number;
    giftCardCount: number;
    physicalProductCount: number;
  } {
    let subtotal = 0;
    let itemCount = 0;
    let giftCardCount = 0;
    let physicalProductCount = 0;

    cartItems.forEach(item => {
      itemCount += item.quantity;

      if (item.productType === 'GIFT_CARD') {
        giftCardCount += item.quantity;
        if (item.giftCardAmount) {
          subtotal += item.giftCardAmount * item.quantity;
        }
      } else {
        physicalProductCount += item.quantity;
        if (item.physicalProduct) {
          subtotal += item.physicalProduct.price * item.quantity;
        }
      }
    });

    return {
      subtotal,
      itemCount,
      giftCardCount,
      physicalProductCount,
    };
  },

  /**
   * Calculate shipping cost
   */
  calculateShippingCost(
    cartItems: CartItem[],
    shippingAddress?: { city: string; stateProvince?: string }
  ): number {
    // Only physical products require shipping
    const physicalItems = cartItems.filter(
      item => item.productType === 'PHYSICAL_PRODUCT'
    );

    if (physicalItems.length === 0) {
      return 0;
    }

    // Base shipping cost
    let shippingCost = 2000; // 2,000 XOF base cost

    // Add extra cost for items beyond the first one
    if (physicalItems.length > 1) {
      shippingCost += (physicalItems.length - 1) * 500;
    }

    // Location-based shipping adjustment
    if (shippingAddress) {
      const city = shippingAddress.city.toLowerCase();

      // Abidjan has reduced shipping
      if (city.includes('abidjan')) {
        shippingCost *= 0.8;
      }
      // Remote areas have increased shipping
      else if (shippingAddress.stateProvince &&
               !['abidjan', 'bouaké', 'san-pédro'].includes(city)) {
        shippingCost *= 1.5;
      }
    }

    return Math.round(shippingCost);
  },

  /**
   * Calculate tax amount
   */
  calculateTaxAmount(subtotal: number): number {
    // VAT is 18% in Côte d'Ivoire
    const VAT_RATE = 0.18;
    return Math.round(subtotal * VAT_RATE);
  },

  /**
   * Get cart item display price
   */
  getCartItemPrice(cartItem: CartItem): number {
    if (cartItem.productType === 'GIFT_CARD' && cartItem.giftCardAmount) {
      return cartItem.giftCardAmount;
    }

    if (cartItem.physicalProduct) {
      return cartItem.physicalProduct.price;
    }

    return 0;
  },

  /**
   * Get cart item total price
   */
  getCartItemTotal(cartItem: CartItem): number {
    const unitPrice = cartHelpers.getCartItemPrice(cartItem);
    return unitPrice * cartItem.quantity;
  },

  /**
   * Format cart item for display
   */
  formatCartItemForDisplay(cartItem: CartItem): {
    name: string;
    brand?: string;
    image?: string;
    price: number;
    total: number;
    details?: string;
  } {
    const baseInfo = {
      price: cartHelpers.getCartItemPrice(cartItem),
      total: cartHelpers.getCartItemTotal(cartItem),
    };

    if (cartItem.productType === 'GIFT_CARD' && cartItem.giftCard) {
      const { giftCard } = cartItem;
      return {
        ...baseInfo,
        name: giftCard.title,
        brand: giftCard.brand,
        image: giftCard.imageUrl,
        details: cartItem.giftCardAmount
          ? `Montant: ${productHelpers.formatPrice(cartItem.giftCardAmount)}`
          : undefined,
      };
    }

    if (cartItem.productType === 'PHYSICAL_PRODUCT' && cartItem.physicalProduct) {
      const { physicalProduct } = cartItem;
      return {
        ...baseInfo,
        name: physicalProduct.name,
        brand: physicalProduct.brand,
        image: physicalProduct.images[0],
        details: physicalProduct.sku ? `SKU: ${physicalProduct.sku}` : undefined,
      };
    }

    return {
      ...baseInfo,
      name: 'Produit inconnu',
    };
  },

  /**
   * Check if cart item is valid
   */
  isCartItemValid(cartItem: CartItem): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Check quantity
    if (cartItem.quantity <= 0) {
      errors.push('La quantité doit être supérieure à 0');
    }

    // Check gift card amount
    if (cartItem.productType === 'GIFT_CARD') {
      if (cartItem.giftCard && cartItem.giftCardAmount) {
        if (!productHelpers.validateGiftCardAmount(
          cartItem.giftCardAmount,
          cartItem.giftCard
        )) {
          errors.push('Le montant de la carte cadeau n\'est pas valide');
        }
      } else if (!cartItem.giftCardAmount) {
        errors.push('Le montant de la carte cadeau est requis');
      }
    }

    // Check stock availability
    if (cartItem.physicalProduct) {
      if (!productHelpers.isInStock(cartItem.physicalProduct)) {
        errors.push('Ce produit n\'est plus en stock');
      } else if (
        cartItem.physicalProduct.stockQuantity > 0 &&
        cartItem.quantity > cartItem.physicalProduct.stockQuantity
      ) {
        errors.push(
          `Seulement ${cartItem.physicalProduct.stockQuantity} exemplaires disponibles`
        );
      }
    }

    if (cartItem.giftCard) {
      if (!productHelpers.isInStock(cartItem.giftCard)) {
        errors.push('Cette carte cadeau n\'est plus disponible');
      } else if (
        cartItem.giftCard.stockQuantity > 0 &&
        cartItem.quantity > cartItem.giftCard.stockQuantity
      ) {
        errors.push(
          `Seulement ${cartItem.giftCard.stockQuantity} cartes disponibles`
        );
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Validate entire cart
   */
  validateCart(cartItems: CartItem[]): {
    valid: boolean;
    errors: string[];
    itemErrors: Array<{ itemId: string; errors: string[] }>;
  } {
    const errors: string[] = [];
    const itemErrors: Array<{ itemId: string; errors: string[] }> = [];

    if (cartItems.length === 0) {
      errors.push('Votre panier est vide');
    }

    // Validate individual items
    cartItems.forEach(item => {
      const itemValidation = cartHelpers.isCartItemValid(item);
      if (!itemValidation.valid) {
        itemErrors.push({
          itemId: item.id,
          errors: itemValidation.errors,
        });
      }
    });

    return {
      valid: errors.length === 0 && itemErrors.length === 0,
      errors,
      itemErrors,
    };
  },

  /**
   * Get cart statistics
   */
  getCartStatistics(cartItems: CartItem[]): {
    totalItems: number;
    totalValue: number;
    averageItemValue: number;
    giftCardValue: number;
    physicalProductValue: number;
    mostExpensiveItem: CartItem | null;
    leastExpensiveItem: CartItem | null;
  } {
    if (cartItems.length === 0) {
      return {
        totalItems: 0,
        totalValue: 0,
        averageItemValue: 0,
        giftCardValue: 0,
        physicalProductValue: 0,
        mostExpensiveItem: null,
        leastExpensiveItem: null,
      };
    }

    let totalValue = 0;
    let giftCardValue = 0;
    let physicalProductValue = 0;
    let mostExpensive = cartItems[0];
    let leastExpensive = cartItems[0];

    cartItems.forEach(item => {
      const itemTotal = cartHelpers.getCartItemTotal(item);
      totalValue += itemTotal;

      if (item.productType === 'GIFT_CARD') {
        giftCardValue += itemTotal;
      } else {
        physicalProductValue += itemTotal;
      }

      const mostExpensivePrice = cartHelpers.getCartItemPrice(mostExpensive);
      const leastExpensivePrice = cartHelpers.getCartItemPrice(leastExpensive);
      const currentPrice = cartHelpers.getCartItemPrice(item);

      if (currentPrice > mostExpensivePrice) {
        mostExpensive = item;
      }

      if (currentPrice < leastExpensivePrice) {
        leastExpensive = item;
      }
    });

    const { itemCount } = cartHelpers.calculateCartTotals(cartItems);

    return {
      totalItems: itemCount,
      totalValue,
      averageItemValue: totalValue / itemCount,
      giftCardValue,
      physicalProductValue,
      mostExpensiveItem: mostExpensive,
      leastExpensiveItem: leastExpensive,
    };
  },

  /**
   * Group cart items by type
   */
  groupCartItemsByType(cartItems: CartItem[]): {
    giftCards: CartItem[];
    physicalProducts: CartItem[];
  } {
    return {
      giftCards: cartItems.filter(item => item.productType === 'GIFT_CARD'),
      physicalProducts: cartItems.filter(item => item.productType === 'PHYSICAL_PRODUCT'),
    };
  },

  /**
   * Find cart item by product
   */
  findCartItemByProduct(
    cartItems: CartItem[],
    productType: ProductType,
    productId: string,
    giftCardAmount?: number
  ): CartItem | undefined {
    return cartItems.find(item => {
      if (item.productType !== productType) return false;

      if (productType === 'GIFT_CARD') {
        return item.giftCardId === productId &&
               (!giftCardAmount || item.giftCardAmount === giftCardAmount);
      }

      return item.physicalProductId === productId;
    });
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const cartService = new CartService();
export default cartService;