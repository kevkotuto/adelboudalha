// Export all API types
export * from './api';
export * from './user';
export * from './product';
export * from './order';
export * from './delivery';
export * from './notification';
export * from './search';
export * from './upload';
export * from './adminNotifications';

// Additional utility types
export type ID = string;
export type Timestamp = string;
export type Currency = 'XOF';
export type PhoneNumber = string;
export type Email = string;
export type Url = string;

// Generic utility types
export interface ListResponse<T> {
  items: T[];
  total: number;
}

export interface PaginatedListResponse<T> extends ListResponse<T> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ErrorResponse {
  success: false;
  message: string;
  error?: string;
  errors?: string[];
  code?: string;
  details?: Record<string, any>;
}

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse;

// Query parameter types
export interface BaseQueryParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchQueryParams extends BaseQueryParams {
  q?: string;
  filter?: Record<string, any>;
}

// Common field types
export interface TimestampFields {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeleteFields extends TimestampFields {
  deletedAt?: string;
}

export interface UserTrackingFields extends TimestampFields {
  createdBy?: string;
  updatedBy?: string;
}

// File types
export interface FileUpload {
  uri: string;
  type: string;
  name: string;
  size?: number;
}

// Form validation types
export interface FormFieldError {
  field: string;
  message: string;
  code?: string;
}

export interface FormValidationResult {
  valid: boolean;
  errors: FormFieldError[];
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  lastUpdated?: string;
}

// Cache types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt?: number;
}

export interface CacheConfig {
  ttl?: number; // Time to live in milliseconds
  maxAge?: number; // Maximum age in milliseconds
  staleWhileRevalidate?: boolean;
}

// Notification types for mobile app
export interface PushNotificationPayload {
  title: string;
  body: string;
  data?: Record<string, any>;
  badge?: number;
  sound?: string;
  category?: string;
}

// Deep linking types
export interface DeepLinkParams {
  screen: string;
  params?: Record<string, any>;
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

// Feature flag types
export interface FeatureFlag {
  key: string;
  enabled: boolean;
  value?: any;
  conditions?: Record<string, any>;
}

// App configuration types
export interface AppConfig {
  apiUrl: string;
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  features: Record<string, boolean>;
  thirdParty: {
    analytics?: {
      enabled: boolean;
      trackingId?: string;
    };
    crashlytics?: {
      enabled: boolean;
    };
  };
}