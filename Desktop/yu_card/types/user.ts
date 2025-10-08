import {
  UserRole,
  UserStatus,
  Language,
  Theme,
  AddressType,
  NotificationType,
  NotificationChannel,
  TransactionType
} from './api';

// ==================================
// USER TYPES
// ==================================

export interface User {
  id: string;
  phone: string;
  phoneVerified: boolean;
  fullName: string;
  email?: string;
  avatarUrl?: string;
  role: UserRole;
  status: UserStatus;
  hasCompletedOnboarding: boolean;
  lastLoginAt?: string;
  failedLoginAttempts: number;
  lockedUntil?: string;
  createdAt: string;
  updatedAt: string;
  preferences?: UserPreference;
  addresses?: UserAddress[];
  wallet?: UserWallet;
}

export interface UserPreference {
  id: string;
  userId: string;
  language: Language;
  notificationsEnabled: boolean;
  newsletterEnabled: boolean;
  smsNotifications: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  theme: Theme;
  createdAt: string;
  updatedAt: string;
}

export interface UserAddress {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  country: string;
  isDefault: boolean;
  type: AddressType;
  createdAt: string;
  updatedAt: string;
}

export interface UserWallet {
  id: string;
  userId: string;
  balance: number;
  pendingBalance: number;
  totalEarned: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  description: string;
  reference?: string;
  orderId?: string;
  referralId?: string;
  promotionId?: string;
  adminUserId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  readAt?: string;
  channel: NotificationChannel;
  sentAt?: string;
  createdAt: string;
}

// ==================================
// AUTH REQUEST/RESPONSE TYPES
// ==================================

export interface LoginRequest {
  phone: string;
  password: string;
}

export interface RegisterRequest {
  phone: string;
  password: string;
  fullName: string;
  email?: string;
  language?: 'fr' | 'en' | 'ar' | 'es' | 'bm';
  referralCode?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  code?: string; // Backward compatibility
  type: 'registration' | 'login' | 'password_reset' | 'phone_verification';
}

export interface ResendOtpRequest {
  phone: string;
  type: 'registration' | 'login' | 'password_reset' | 'phone_verification';
}

export interface ForgotPasswordRequest {
  phone: string;
}

export interface ResetPasswordRequest {
  phone: string;
  otp: string;
  code?: string; // Backward compatibility
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ==================================
// USER MANAGEMENT REQUEST TYPES
// ==================================

export interface UpdateProfileRequest {
  fullName?: string;
  email?: string;
  phone?: string;
}

export interface CreateAddressRequest {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince?: string;
  postalCode?: string;
  country?: string;
  type: AddressType;
  isDefault?: boolean;
}

export interface UpdateAddressRequest extends Partial<CreateAddressRequest> {}

export interface UpdatePreferencesRequest {
  language?: Language;
  notificationsEnabled?: boolean;
  newsletterEnabled?: boolean;
  smsNotifications?: boolean;
  emailNotifications?: boolean;
  pushNotifications?: boolean;
  theme?: Theme;
}

export interface UserStatsResponse {
  totalOrders: number;
  totalSpent: number;
  totalGiftCards: number;
  activeGiftCards: number;
  walletBalance: number;
  totalRewards: number;
  memberSince: string;
}