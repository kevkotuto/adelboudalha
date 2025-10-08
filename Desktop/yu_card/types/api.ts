// ==================================
// API RESPONSE WRAPPER TYPES
// ==================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface HealthCheckResponse {
  status: string;
  timestamp: string;
  services: {
    database: string;
    redis: string;
    elasticsearch: string;
  };
}

// ==================================
// ENUM TYPES FROM BACKEND SCHEMA
// ==================================

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN'
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  DELETED = 'DELETED'
}

export enum Language {
  FR = 'FR',
  EN = 'EN',
  AR = 'AR',
  ES = 'ES',
  BM = 'BM'
}

export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM'
}

export enum AddressType {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
  BOTH = 'BOTH'
}

export enum ProductType {
  GIFT_CARD = 'GIFT_CARD',
  PHYSICAL_PRODUCT = 'PHYSICAL_PRODUCT',
  BOTH = 'BOTH'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentMethod {
  WAVE = 'WAVE'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export enum GiftCardStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  USED = 'USED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum WavePaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  TIMEOUT = 'TIMEOUT',
  CANCELLED = 'CANCELLED'
}

export enum TrackingStatus {
  PREPARING = 'PREPARING',
  SHIPPED = 'SHIPPED',
  IN_TRANSIT = 'IN_TRANSIT',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  RETURNED = 'RETURNED'
}

export enum NotificationType {
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  DELIVERY = 'DELIVERY',
  PROMOTION = 'PROMOTION',
  SYSTEM = 'SYSTEM',
  GIFT_CARD = 'GIFT_CARD'
}

export enum NotificationChannel {
  PUSH = 'PUSH',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  IN_APP = 'IN_APP'
}

export enum OtpType {
  REGISTRATION = 'REGISTRATION',
  LOGIN = 'LOGIN',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PHONE_VERIFICATION = 'PHONE_VERIFICATION'
}

export enum PromotionType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_SHIPPING = 'FREE_SHIPPING',
  GIFT = 'GIFT'
}

export enum PromotionScope {
  ALL = 'ALL',
  GIFT_CARDS = 'GIFT_CARDS',
  PHYSICAL_PRODUCTS = 'PHYSICAL_PRODUCTS',
  SPECIFIC_PRODUCTS = 'SPECIFIC_PRODUCTS'
}

export enum ReferralStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum BonusType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT'
}

export enum RewardType {
  REFERRER_BONUS = 'REFERRER_BONUS',
  REFERRED_DISCOUNT = 'REFERRED_DISCOUNT',
  LOYALTY_POINTS = 'LOYALTY_POINTS',
  CASH_BACK = 'CASH_BACK'
}

export enum RewardStatus {
  PENDING = 'PENDING',
  AVAILABLE = 'AVAILABLE',
  CLAIMED = 'CLAIMED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  REFUND = 'REFUND',
  BONUS = 'BONUS',
  CASHBACK = 'CASHBACK',
  ADMIN_CREDIT = 'ADMIN_CREDIT',
  ADMIN_DEBIT = 'ADMIN_DEBIT',
  ORDER_PAYMENT = 'ORDER_PAYMENT',
  REFERRAL_REWARD = 'REFERRAL_REWARD'
}