/**
 * Types pour les notifications utilisateur (non-admin)
 * Basé sur les routes API /api/notifications
 */

// ==================================
// NOTIFICATION TYPES
// ==================================

/**
 * Types de notifications utilisateur
 */
export type UserNotificationType =
  | 'ORDER_CONFIRMED'
  | 'ORDER_SHIPPED'
  | 'ORDER_DELIVERED'
  | 'PAYMENT_SUCCESS'
  | 'PAYMENT_FAILED'
  | 'GIFT_CARD_ACTIVATED'
  | 'WALLET_CREDITED'
  | 'PROMO_ALERT'
  | 'PROMOTION'; // Backend utilise PROMOTION

/**
 * Notification utilisateur
 */
export interface UserNotification {
  id: string;
  userId: string;
  type: UserNotificationType;
  title: string;
  message: string;
  data: {
    orderId?: string;
    [key: string]: any;
  };
  isRead: boolean;
  createdAt: string;
}

// ==================================
// API REQUEST/RESPONSE TYPES
// ==================================

/**
 * Paramètres de requête pour liste de notifications
 */
export interface UserNotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * Pagination
 */
export interface NotificationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/**
 * Réponse paginée de notifications
 */
export interface UserNotificationListResponse {
  success: boolean;
  data: {
    items: UserNotification[];
    pagination: NotificationPagination;
  };
}

/**
 * Réponse du compteur de notifications non lues
 */
export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

/**
 * Réponse standard de succès
 */
export interface NotificationActionResponse {
  success: boolean;
  message: string;
  data?: {
    count?: number;
  };
}

/**
 * Requête d'enregistrement du token Expo Push
 */
export interface RegisterExpoPushTokenRequest {
  expoPushToken: string;
}

// ==================================
// UI HELPER TYPES
// ==================================

/**
 * Métadonnées de style pour une notification
 */
export interface NotificationStyle {
  icon: string;
  color: string;
  label: string;
}

/**
 * État de chargement pour la liste de notifications
 */
export interface NotificationListState {
  notifications: UserNotification[];
  unreadCount: number;
  isLoading: boolean;
  isRefreshing: boolean;
  isLoadingMore: boolean;
  error: string | null;
  pagination: NotificationPagination | null;
}
