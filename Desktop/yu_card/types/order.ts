import {
  ProductType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  WavePaymentStatus,
  TrackingStatus
} from './api';
import { User, UserAddress } from './user';
import { GiftCard, PhysicalProduct, GiftCardCode } from './product';

// ==================================
// CART TYPES
// ==================================

export interface CartItem {
  id: string;
  userId: string;
  productType: ProductType;
  giftCardId?: string;
  physicalProductId?: string;
  quantity: number;
  giftCardAmount?: number;
  addedAt: string;
  updatedAt: string;
  giftCard?: GiftCard;
  physicalProduct?: PhysicalProduct;
}

// ==================================
// ORDER TYPES
// ==================================

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  status: OrderStatus;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  shippingAddressId?: string;
  billingAddressId?: string;
  contactPhone?: string;
  notes?: string;
  cancelledReason?: string;
  cancelledAt?: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  shippingAddress?: UserAddress;
  billingAddress?: UserAddress;
  items: OrderItem[];
  wavePayments?: WavePayment[];
  tracking?: OrderTracking;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productType: ProductType;
  giftCardId?: string;
  physicalProductId?: string;
  productName: string;
  productBrand?: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  giftCardAmount?: number;
  discountAmount: number;
  totalPrice: number;
  currency: string;
  createdAt: string;
  giftCard?: GiftCard;
  physicalProduct?: PhysicalProduct;
  giftCardCodes?: GiftCardCode[];
}

// ==================================
// PAYMENT TYPES
// ==================================

export interface WavePayment {
  id: string;
  orderId: string;
  transactionId?: string;
  phoneNumber: string;
  amount: number;
  currency: string;
  status: WavePaymentStatus;
  waveReference?: string;
  waveTransactionId?: string;
  errorMessage?: string;
  errorCode?: string;
  initiatedAt: string;
  completedAt?: string;
  webhookData?: Record<string, any>;
  retryCount: number;
  lastRetryAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ==================================
// TRACKING TYPES
// ==================================

export interface OrderTracking {
  id: string;
  orderId: string;
  trackingNumber?: string;
  carrier?: string;
  status: TrackingStatus;
  currentLocation?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  signatureUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  events: TrackingEvent[];
}

export interface TrackingEvent {
  id: string;
  orderTrackingId: string;
  eventDate: string;
  status: string;
  description: string;
  location?: string;
  createdAt: string;
}

// ==================================
// REQUEST TYPES
// ==================================

export interface AddToCartRequest {
  productType: ProductType;
  giftCardId?: string;
  physicalProductId?: string;
  quantity: number;
  giftCardAmount?: number;
}

export interface UpdateCartItemRequest {
  quantity?: number;
  giftCardAmount?: number;
}

export interface CreateOrderRequest {
  items: Array<{
    cartItemId: string;
    quantity?: number;
    giftCardAmount?: number;
  }>;
  shippingAddressId?: string;
  billingAddressId?: string;
  contactPhone?: string;
  notes?: string;
  promotionCode?: string;
}

export interface InitiateWavePaymentRequest {
  orderId: string;
  phoneNumber: string;
  amount: number;
}

export interface ConfirmWavePaymentRequest {
  paymentId: string;
  waveTransactionId?: string;
}

export interface RetryWavePaymentRequest {
  paymentId: string;
  phoneNumber?: string;
}

export interface CancelOrderRequest {
  reason: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface CreateTrackingRequest {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  estimatedDelivery?: string;
}

export interface AddTrackingEventRequest {
  status: string;
  description: string;
  location?: string;
  eventDate?: string;
}

// ==================================
// RESPONSE TYPES
// ==================================

export interface CartSummary {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  itemCount: number;
  giftCardCount: number;
  physicalProductCount: number;
}

export interface OrderSummary {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalSpent: number;
  averageOrderValue: number;
}

export interface PaymentHistory {
  payments: WavePayment[];
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  totalAmount: number;
}

// ==================================
// FILTERS & QUERY TYPES
// ==================================

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  orderNumber?: string;
}

export interface PaymentFilters {
  page?: number;
  limit?: number;
  status?: WavePaymentStatus;
  dateFrom?: string;
  dateTo?: string;
  phoneNumber?: string;
}