import Constants from 'expo-constants';

// ==================================
// APP CONFIGURATION
// ==================================

export interface AppConfig {
  apiUrl: string;
  environment: 'development' | 'production';
  version: string;
  buildNumber: string;
}

// Get configuration from app.json extra field or fallback to defaults
const getConfig = (): AppConfig => {
  const extra = Constants.expoConfig?.extra || {};

  return {
    apiUrl: extra.apiUrl || (__DEV__ ? 'http://localhost:30010' : 'https://yucard.generale-ci.com'),
    environment: __DEV__ ? 'development' : 'production',
    version: Constants.expoConfig?.version || '1.0.0',
    buildNumber: Constants.expoConfig?.ios?.buildNumber || '1',
  };
};

export const config = getConfig();

// API endpoints configuration
export const API_ENDPOINTS = {
  // Base
  BASE_URL: config.apiUrl,
  API_BASE: `${config.apiUrl}/api`,

  // Health
  HEALTH: `${config.apiUrl}/health`,

  // Documentation
  API_DOCS: `${config.apiUrl}/api-docs`,

  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    VERIFY_OTP: '/auth/verify-otp',
    RESEND_OTP: '/auth/resend-otp',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    AVATAR: '/users/avatar',
    DELETE_ACCOUNT: '/users/account',
    ADDRESSES: '/users/addresses',
    ADDRESS_BY_ID: (id: string) => `/users/addresses/${id}`,
    PREFERENCES: '/users/preferences',
    STATS: '/users/stats',
    STATS_BY_ID: (userId: string) => `/users/stats/${userId}`,
    PUSH_TOKEN: '/users/push-token',
  },

  // Categories
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: string) => `/categories/${id}`,
    BY_SLUG: (slug: string) => `/categories/slug/${slug}`,
  },

  // Products
  PRODUCTS: {
    BASE: '/products',
    FEATURED: '/products/featured',
    POPULAR: '/products/popular',
    BY_ID: (id: string) => `/products/${id}`,
    IMAGES: (id: string) => `/products/${id}/images`,
    RELATED: (id: string) => `/products/${id}/related`,
    STOCK: (id: string) => `/products/${id}/stock`,
  },

  // Gift Cards
  GIFT_CARDS: {
    BASE: '/gift-cards',
    BY_ID: (id: string) => `/gift-cards/${id}`,
    BY_CATEGORY: (categoryId: string) => `/gift-cards/category/${categoryId}`,
    FEATURED: '/gift-cards/featured',
    POPULAR: '/gift-cards/popular',
    SEARCH: '/gift-cards/search',
    VARIANTS: (id: string) => `/gift-cards/${id}/variants`,
    PURCHASE: '/gift-cards/purchase',
    MY_CARDS: '/gift-cards/my-cards',
    REDEEM: '/gift-cards/redeem',
    TRANSFER: '/gift-cards/transfer',
    RELATED: (id: string) => `/gift-cards/${id}/related`,
  },

  // Payments - Wave Integration
  PAYMENTS: {
    BASE: '/payments',
    INITIATE: '/payments/initiate',
    CONFIRM: (paymentId: string) => `/payments/confirm/${paymentId}`,
    STATUS: (transactionId: string) => `/payments/status/${transactionId}`,
    RETRY: (paymentId: string) => `/payments/retry/${paymentId}`,
    CANCEL: (paymentId: string) => `/payments/cancel/${paymentId}`,
    HISTORY: '/payments/history',

    // Wave Balance & Transactions
    BALANCE: '/payments/balance',
    TRANSACTIONS: '/payments/transactions',
    TRANSACTION_REFUND: (transactionId: string) => `/payments/transactions/${transactionId}/refund`,

    // Wave Payouts
    PAYOUT: '/payments/payout',
    PAYOUT_STATUS: (payoutId: string) => `/payments/payout/${payoutId}`,
    PAYOUT_REVERSE: (payoutId: string) => `/payments/payout/${payoutId}/reverse`,

    // Webhook & Pages
    WEBHOOK: '/payments/webhook',
    SUCCESS_PAGE: '/payments/success',
    ERROR_PAGE: '/payments/error',
    SESSION_DETAILS: (sessionId: string) => `/payments/session/${sessionId}`,

    // Test endpoints
    TEST: '/payments/test',
    CREATE_TEST_PAYMENT: '/payments/create-test-payment',
  },

  // Orders
  ORDERS: {
    BASE: '/orders',
    BY_ID: (id: string) => `/orders/${id}`,
    CREATE: '/orders',
    UPDATE_STATUS: (id: string) => `/orders/${id}/status`,
    CANCEL: (id: string) => `/orders/${id}/cancel`,
    TRACK: (id: string) => `/orders/${id}/track`,
    HISTORY: '/orders', // Fixed: backend route is /orders not /orders/history
    INVOICE: (id: string) => `/orders/${id}/invoice`,
  },

  // Cart
  CART: {
    BASE: '/cart', // GET: get cart, DELETE: clear cart
    ADD_ITEM: '/cart/items', // POST: add item to cart
    UPDATE_ITEM: (itemId: string) => `/cart/items/${itemId}`, // PATCH: update quantity
    REMOVE_ITEM: (itemId: string) => `/cart/items/${itemId}`, // DELETE: remove item
    APPLY_COUPON: '/cart/coupon',
    REMOVE_COUPON: '/cart/coupon',
    ESTIMATE_SHIPPING: '/cart/shipping-estimate',
  },

  // Search
  SEARCH: {
    BASE: '/search',
    AUTOCOMPLETE: '/search/autocomplete',
    CATEGORY: (categoryId: string) => `/search/category/${categoryId}`,
    TRENDING: '/search/trending',
    HISTORY: '/search/history',
    ANALYTICS: '/search/analytics',
    ADMIN: {
      INIT_INDICES: '/search/admin/init-indices',
      REINDEX: '/search/admin/reindex',
    },
    HEALTH: '/search/health',
  },

  // Upload
  UPLOAD: {
    BASE: '/upload',
    IMAGE: '/upload/image',
    IMAGES: '/upload/images',
    PRODUCT_IMAGES: '/upload/product-images',
    GIFT_CARD_IMAGES: '/upload/gift-card-images',
    AVATAR: '/users/avatar', // Route utilisateur pour l'avatar (intégré au profil)
    DOCUMENT: '/upload/document',
    VALIDATE: '/upload/validate',
    FILE: (filename: string) => `/upload/file/${filename}`,
    CONFIG: '/upload/config',
    STORAGE_INFO: '/upload/storage-info',
    CLEANUP_TEMP: '/upload/cleanup-temp',
    HEALTH: '/upload/health',
  },

  // Deliveries
  DELIVERIES: {
    BASE: '/deliveries',
    DRIVERS: '/drivers',
    ZONES: '/delivery/zones',
  },

  // User Notifications (Non-Admin)
  NOTIFICATIONS: {
    USER_BASE: '/notifications',
    UNREAD_COUNT: '/notifications/unread-count',
    MARK_READ: (id: string) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    DELETE: (id: string) => `/notifications/${id}`,
    EXPO_TOKEN: '/notifications/expo-token',
  },

  // Admin
  ADMIN: {
    BASE: '/admin',
    DASHBOARD: '/admin/dashboard',
    REPORTS: {
      FINANCIAL: '/admin/reports/financial',
    },
    USERS: '/admin/users',
    USER_STATUS: (userId: string) => `/admin/users/${userId}/status`,
    ORDERS: '/admin/orders',
    ORDER_STATUS: (orderId: string) => `/admin/orders/${orderId}/status`,

    // Notifications Admin (basé sur doc_notif_admin.md)
    NOTIFICATIONS: {
      PUSH: '/admin/notifications/push',
      SMS: '/admin/notifications/sms',
      BROADCAST: '/admin/notifications/broadcast',
      HISTORY: '/admin/notifications/history',
      STATS: '/admin/notifications/stats',
      TEST: (userId: string) => `/admin/notifications/test/${userId}`,
    },
  },
} as const;

// Request timeout configuration
export const TIMEOUTS = {
  DEFAULT: 10000, // 10 seconds
  UPLOAD: 60000, // 1 minute
  DOWNLOAD: 30000, // 30 seconds
  AUTH: 15000, // 15 seconds
} as const;

// Retry configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_STATUS_CODES: [408, 429, 500, 502, 503, 504],
} as const;

// Cache configuration
export const CACHE_CONFIG = {
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  LONG_TTL: 60 * 60 * 1000, // 1 hour
  SHORT_TTL: 1 * 60 * 1000, // 1 minute
} as const;

// ==================================
// HELPER FUNCTIONS
// ==================================

/**
 * Build full URL for images and assets
 * Handles both relative and absolute URLs
 */
export const buildImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;

  // If already a full URL, ensure it uses HTTPS
  if (url.startsWith('http://') || url.startsWith('https://')) {
    // Convert http:// to https:// for security (avoid mixed content issues)
    return url.replace(/^http:\/\//i, 'https://');
  }

  // If relative URL, prepend the base URL
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${config.apiUrl}${cleanUrl}`;
};

/**
 * Build full URLs for an array of image paths
 * Useful for products with multiple images
 */
export const buildImageUrls = (urls: string[] | null | undefined): string[] => {
  if (!urls || !Array.isArray(urls)) return [];

  return urls
    .map(url => buildImageUrl(url))
    .filter((url): url is string => url !== null);
};

/**
 * Get the first image URL from an array of images
 * Commonly used for product thumbnails
 */
export const getFirstImageUrl = (images: string[] | null | undefined): string | null => {
  const urls = buildImageUrls(images);
  return urls.length > 0 ? urls[0] : null;
};

export default config;