// Admin Types for Yu Card Backend Integration

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    totalProducts: number;
    totalGiftCards: number;
    averageOrderValue: number;
  };
  recentActivity: {
    recentUsers: AdminUser[];
    pendingOrders: AdminOrder[];
    lowStockProducts: AdminProduct[];
  };
  analytics: {
    paymentStats: PaymentStat[];
    ordersByStatus: OrderStatusStat[];
    revenueByPeriod: RevenuePeriod[];
    userGrowth: GrowthStat[];
    orderGrowth: GrowthStat[];
  };
  topPerformers: {
    products: AdminProduct[];
    giftCards: AdminGiftCard[];
  };
}

export interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  role: 'CLIENT' | 'ADMIN';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  phoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
  _count?: {
    orders: number;
    reviews: number;
  };
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  user: {
    id: string;
    fullName: string;
    phone: string;
  };
  items: AdminOrderItem[];
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  wavePayments: WavePayment[];
  shippingAddress: ShippingAddress;
  createdAt: string;
  confirmedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  cancelledAt?: string;
}

export interface AdminOrderItem {
  id: string;
  productId: string;
  productName: string;
  productType: 'GIFT_CARD' | 'PHYSICAL_PRODUCT';
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  giftCardAmount?: number;
  giftCode?: GiftCode; // Deprecated: use giftCardCodes
  giftCardCodes?: GiftCardCode[]; // New: array of assigned codes
}

export interface GiftCode {
  code: string;
  status: GiftCodeStatus;
  generatedAt: string;
  distributedAt?: string;
  usedAt?: string;
  expiresAt?: string;
}

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED';

export type PaymentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'REFUNDED';

export type GiftCodeStatus =
  | 'PENDING'
  | 'DISTRIBUTED'
  | 'USED'
  | 'EXPIRED';

export interface AdminProduct {
  id: string;
  name: string;
  brand: string;
  slug: string;
  category: AdminCategory;
  price: number | string; // Backend peut retourner string (Decimal en JSON)
  originalPrice?: number | string; // Backend peut retourner string
  discountPercentage?: number | string; // Backend peut retourner string
  stockQuantity: number;
  sku: string;
  images: string[];
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  weightKg?: number | string;
  dimensionsCm?: {
    length: number;
    width: number;
    height: number;
  };
  deliveryTimeDays?: number;
  warrantyMonths?: number;
  _count?: {
    reviews: number;
    favorites: number;
  };
}

export interface AdminGiftCard {
  id: string;
  title: string;
  brand: string;
  slug: string;
  category: AdminCategory;
  minAmount: number | string; // Backend peut retourner string (Decimal en JSON)
  maxAmount: number | string; // Backend peut retourner string
  fixedAmounts?: (number | string)[]; // Backend peut retourner string[]
  discountPercentage: number | string; // Backend peut retourner string
  stockQuantity: number;
  validityDays: number;
  isPopular: boolean;
  isFeatured: boolean;
  isActive: boolean;
  imageUrl?: string;
  mainImageUrl?: string;
  termsConditions?: string;
  usageInstructions?: string;
  _count?: {
    reviews: number;
    favorites: number;
    giftCardCodes: number;
  };
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  type: 'GIFT_CARD' | 'PHYSICAL_PRODUCT' | 'BOTH';
  description?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder: number;
  isActive: boolean;
  parent?: AdminCategory;
  children?: AdminCategory[];
  _count?: {
    giftCards: number;
    physicalProducts: number;
  };
}

export interface WalletAdjustment {
  userId: string;
  amount: number;
  type: 'ADMIN_CREDIT' | 'ADMIN_DEBIT';
  description: string;
}

export interface WalletTransaction {
  id: string;
  type: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  adminUserId?: string;
  createdAt: string;
}

export interface UserWallet {
  id: string;
  balance: number;
  totalEarned: number;
  totalSpent: number;
}

export interface FinancialReport {
  summary: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalRefunds: number;
    refundCount: number;
    totalTax: number;
  };
  trends: {
    dailyRevenue: DailyRevenue[];
    averageOrderValue: number[];
  };
  breakdown: {
    ordersByStatus: OrderStatusBreakdown[];
    revenueByCategory: CategoryRevenue[];
    revenueByPaymentMethod: PaymentMethodRevenue[];
  };
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

export interface OrderStatusBreakdown {
  status: OrderStatus;
  count: number;
  revenue: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
  orders: number;
}

export interface PaymentMethodRevenue {
  method: string;
  revenue: number;
  count: number;
}

export interface PushNotificationRequest {
  title: string;
  message: string;
  userIds?: string[];
  data?: Record<string, any>;
}

export interface NotificationStats {
  sent: number;
  failed: number;
  total: number;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    fullName: string;
    phone: string;
    role: string;
  };
}

export interface PaymentStat {
  method: string;
  count: number;
  amount: number;
}

export interface OrderStatusStat {
  status: OrderStatus;
  count: number;
}

export interface RevenuePeriod {
  date: string;
  revenue: number;
  orders: number;
}

export interface GrowthStat {
  date: string;
  count: number;
  growth: number;
}

export interface WavePayment {
  id: string;
  amount: number;
  status: string;
  phone: string;
  transactionId?: string;
  createdAt: string;
}

export interface ShippingAddress {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  country: string;
  phone: string;
}

// Request types
export interface UpdateOrderStatusRequest {
  status: OrderStatus;
  notes?: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
  reason?: string;
}

export interface CreateProductRequest {
  name: string;
  brand: string;
  categoryId: string;
  description: string;
  price: number;
  originalPrice?: number;
  stockQuantity: number;
  sku: string;
  weightKg?: number;
  dimensionsCm?: {
    length: number;
    width: number;
    height: number;
  };
  specifications?: Record<string, any>;
  images: string[];
  isPopular?: boolean;
  isFeatured?: boolean;
  deliveryTimeDays?: number;
  warrantyMonths?: number;
  metaKeywords?: string[];
}

export interface UpdateProductRequest {
  name?: string;
  price?: number;
  stockQuantity?: number;
  isActive?: boolean;
  [key: string]: any;
}

export interface CreateGiftCardRequest {
  title: string;
  brand: string;
  categoryId: string;
  description: string;
  termsConditions: string;
  usageInstructions: string;
  imageUrl: string;
  minAmount: number;
  maxAmount: number;
  fixedAmounts?: number[];
  discountPercentage?: number;
  isPopular?: boolean;
  isFeatured?: boolean;
  stockQuantity?: number;
  validityDays: number;
  metaKeywords?: string[];
}

export interface UpdateGiftCardRequest {
  discountPercentage?: number;
  isPopular?: boolean;
  isActive?: boolean;
  [key: string]: any;
}

export interface CreateCategoryRequest {
  name: string;
  type: 'GIFT_CARD' | 'PHYSICAL_PRODUCT' | 'BOTH';
  description?: string;
  iconUrl?: string;
  parentId?: string;
  displayOrder?: number;
}

export interface UpdateCategoryRequest {
  name?: string;
  description?: string;
  displayOrder?: number;
  isActive?: boolean;
}

// Query params
export interface AdminQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface OrderQueryParams extends AdminQueryParams {
  status?: OrderStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  startDate?: string;
  endDate?: string;
}

export interface ProductQueryParams extends AdminQueryParams {
  categoryId?: string;
  isActive?: boolean;
}

export interface UserQueryParams extends AdminQueryParams {
  role?: 'ALL' | 'CLIENT' | 'ADMIN';
  status?: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
}

export interface AuditQueryParams extends AdminQueryParams {
  action?: string;
  entityType?: string;
  userId?: string;
}

export interface DashboardQueryParams {
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
  timezone?: string;
}

export interface ReportQueryParams {
  period?: 'day' | 'week' | 'month' | 'year';
  startDate?: string;
  endDate?: string;
}

// Response types
export interface AdminListResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ============================================
// Gift Card Inventory & Code Assignment Types
// ============================================

export type InventoryCodeStatus =
  | 'AVAILABLE'
  | 'RESERVED'
  | 'ASSIGNED'
  | 'USED'
  | 'EXPIRED'
  | 'CANCELLED';

export type GiftCardCodeStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'USED'
  | 'EXPIRED'
  | 'CANCELLED';

// Gift Card Inventory (Stock managed by admin)
export interface GiftCardInventoryCode {
  id: string;
  giftCardId: string;
  code: string;
  status: InventoryCodeStatus;
  orderItemId?: string;
  reservedAt?: string;
  assignedAt?: string;
  assignedBy?: string; // Admin user ID
  notes?: string; // e.g., "Manually entered by admin"
  createdAt: string;
  updatedAt: string;
  // Relations
  giftCard?: AdminGiftCard;
  orderItem?: {
    id: string;
    orderId: string;
    order: {
      orderNumber: string;
      user: {
        fullName: string;
        phone: string;
      };
    };
  };
  admin?: {
    id: string;
    fullName: string;
  };
}

// Gift Card Code (Client's assigned code)
export interface GiftCardCode {
  id: string;
  code: string;
  orderItemId?: string;
  giftCardId: string;
  userId?: string;
  inventoryCodeId?: string;
  amount: number;
  currency?: string;
  status: GiftCardCodeStatus;
  activationDate?: string;
  expiryDate?: string;
  usedDate?: string;
  usedByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

// Inventory Summary (for dashboard)
export interface InventorySummary {
  giftCardId: string;
  title: string;
  brand: string;
  imageUrl?: string;
  availableCount: number;
  assignedCount: number;
  usedCount: number;
  totalCount: number;
}

// Import codes result
export interface ImportCodesResult {
  imported: number;
  duplicates: number;
  total: number;
}

// Assign codes result (Option A - Automatic batch)
export interface AssignCodesResult {
  results: Array<{
    orderItemId: string;
    giftCard: string;
    status: 'assigned' | 'error';
    codesCount?: number;
  }>;
  errors: Array<{
    orderItemId: string;
    giftCard: string;
    needed: number;
    available: number;
    error: string;
  }>;
}

// Manual code assignment result (Option B - One by one)
export interface ManualAssignResult {
  code: string;
  status: GiftCardCodeStatus;
  itemComplete: boolean; // true if all codes for this item are assigned
  remaining: number; // how many codes still needed
  totalRequired: number; // total quantity
  totalAssigned: number; // how many assigned so far
}

// Order codes details (for viewing assigned codes)
export interface OrderCodesDetails {
  orderId: string;
  orderNumber: string;
  paymentStatus: PaymentStatus;
  items: Array<{
    orderItemId: string;
    giftCard: {
      id: string;
      title: string;
      brand: string;
      imageUrl?: string;
    };
    quantity: number;
    assignedCodes: number; // Count of assigned codes
    codes: GiftCardCode[]; // List of assigned codes
    inventoryDetails?: GiftCardInventoryCode[]; // Inventory links
  }>;
}

// Query params for inventory
export interface InventoryQueryParams extends AdminQueryParams {
  giftCardId?: string;
  status?: InventoryCodeStatus | 'ALL';
}

// Request to assign manual code
export interface AssignManualCodeRequest {
  code: string;
}
