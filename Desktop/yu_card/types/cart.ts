import { GiftCardData, PhysicalProductData } from '@/data/mockData';

// DEPRECATED: Use CartItem from types/order.ts instead
// This is kept for backward compatibility with old mock data
export interface LegacyCartItem {
  id: string;
  type: 'gift_card' | 'physical_product';
  productId: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  quantity: number;
  image: any;
  maxQuantity?: number; // Stock disponible

  // Spécifique aux gift cards
  giftCardAmount?: number;

  // Spécifique aux produits physiques
  specifications?: { [key: string]: string };
  deliveryTime?: string;
}

export interface CartState {
  items: LegacyCartItem[];
  total: number;
  itemCount: number;
  currency: string;
}

export interface CartActions {
  addItem: (product: GiftCardData | PhysicalProductData, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getItemCount: () => number;
}

export interface OrderDetails {
  id: string;
  userId: string;
  type: 'gift_card' | 'physical_product';
  itemId: string;
  itemName: string;
  itemImage?: any;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'wave';
  paymentStatus: 'pending' | 'completed' | 'failed';
  orderDate: string;

  // Pour les gift cards
  giftCardCode?: string;
  giftCardActivated?: boolean;
  giftCardExpiryDate?: string;

  // Pour les produits physiques
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  tracking?: {
    trackingNumber: string;
    carrier: string;
    estimatedDelivery: string;
    status: 'preparing' | 'shipped' | 'in_transit' | 'delivered';
    updates: Array<{
      date: string;
      status: string;
      description: string;
      location?: string;
    }>;
  };

  // Informations de facturation
  billing?: {
    subtotal: number;
    shipping: number;
    taxes: number;
    discount?: number;
    total: number;
  };
}

export interface GiftCardCode {
  code: string;
  brand: string;
  amount: number;
  currency: string;
  expiryDate: string;
  activated: boolean;
  usageInstructions: string;
  termsAndConditions: string;
}

export interface CheckoutData {
  items: LegacyCartItem[];
  total: number;
  paymentMethod: 'wave';
  shippingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    postalCode: string;
  };
  contactPhone: string;
}