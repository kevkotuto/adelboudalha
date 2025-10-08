import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';

// ==================================
// USER NOTIFICATIONS SERVICE
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
  | 'PROMOTION'; // Backend peut envoyer PROMOTION au lieu de PROMO_ALERT

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

/**
 * Paramètres de requête pour liste de notifications
 */
export interface UserNotificationListParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

/**
 * Réponse paginée de notifications
 */
export interface UserNotificationListResponse {
  success: boolean;
  data: {
    items: UserNotification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
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
 * Service de gestion des notifications utilisateur (non-admin)
 */
export class UserNotificationsService {
  /**
   * Récupérer toutes les notifications de l'utilisateur connecté
   */
  async getNotifications(
    params: UserNotificationListParams = {}
  ): Promise<UserNotificationListResponse> {
    const queryParams = new URLSearchParams();

    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.unreadOnly !== undefined) {
      queryParams.append('unreadOnly', params.unreadOnly.toString());
    }

    const url = `${API_ENDPOINTS.NOTIFICATIONS.USER_BASE}${
      queryParams.toString() ? `?${queryParams.toString()}` : ''
    }`;

    const response = await apiClient.get<any>(url);

    console.log('📬 Raw notifications response:', JSON.stringify(response, null, 2));

    // Backend returns: {data: [...], pagination: {...}, unreadCount: number}
    // We need to transform it to: {items: [...], pagination: {...}}
    const items = Array.isArray(response.data) ? response.data : [];
    const pagination = response.pagination || {
      page: 1,
      limit: 20,
      total: 0,
      totalPages: 0,
      hasNext: false,
      hasPrev: false
    };

    return {
      success: true,
      data: {
        items,
        pagination
      }
    };
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiClient.get<any>(
      API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    // Backend returns {success: true, data: {count: number}}
    return response.data?.count || response.count || 0;
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId: string): Promise<NotificationActionResponse> {
    return await apiClient.patch<NotificationActionResponse>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_READ(notificationId)
    );
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(): Promise<NotificationActionResponse> {
    return await apiClient.patch<NotificationActionResponse>(
      API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
    );
  }

  /**
   * Supprimer une notification spécifique
   */
  async deleteNotification(notificationId: string): Promise<NotificationActionResponse> {
    return await apiClient.delete<NotificationActionResponse>(
      API_ENDPOINTS.NOTIFICATIONS.DELETE(notificationId)
    );
  }

  /**
   * Enregistrer le token Expo Push pour recevoir les notifications push
   */
  async registerExpoPushToken(expoPushToken: string): Promise<NotificationActionResponse> {
    return await apiClient.post<NotificationActionResponse>(
      API_ENDPOINTS.NOTIFICATIONS.EXPO_TOKEN,
      { expoPushToken }
    );
  }

  /**
   * Obtenir le label d'un type de notification
   */
  getNotificationTypeLabel(type: UserNotificationType): string {
    const labels: Partial<Record<UserNotificationType, string>> = {
      ORDER_CONFIRMED: 'Commande confirmée',
      ORDER_SHIPPED: 'Commande expédiée',
      ORDER_DELIVERED: 'Commande livrée',
      PAYMENT_SUCCESS: 'Paiement réussi',
      PAYMENT_FAILED: 'Paiement échoué',
      GIFT_CARD_ACTIVATED: 'Carte cadeau activée',
      WALLET_CREDITED: 'Portefeuille crédité',
      PROMO_ALERT: 'Alerte promotion',
      PROMOTION: 'Promotion',
    };
    return labels[type] || type;
  }

  /**
   * Obtenir l'icône d'un type de notification
   */
  getNotificationTypeIcon(type: UserNotificationType): string {
    const icons: Partial<Record<UserNotificationType, string>> = {
      ORDER_CONFIRMED: 'checkmark-circle',
      ORDER_SHIPPED: 'car',
      ORDER_DELIVERED: 'home',
      PAYMENT_SUCCESS: 'card',
      PAYMENT_FAILED: 'alert-circle',
      GIFT_CARD_ACTIVATED: 'gift',
      WALLET_CREDITED: 'wallet',
      PROMO_ALERT: 'megaphone',
      PROMOTION: 'megaphone',
    };
    return icons[type] || 'notifications';
  }

  /**
   * Obtenir la couleur d'un type de notification
   */
  getNotificationTypeColor(type: UserNotificationType): string {
    const colors: Partial<Record<UserNotificationType, string>> = {
      ORDER_CONFIRMED: '#10B981', // success green
      ORDER_SHIPPED: '#3B82F6', // info blue
      ORDER_DELIVERED: '#10B981', // success green
      PAYMENT_SUCCESS: '#10B981', // success green
      PAYMENT_FAILED: '#EF4444', // error red
      GIFT_CARD_ACTIVATED: '#8B5CF6', // purple
      WALLET_CREDITED: '#F59E0B', // warning yellow
      PROMO_ALERT: '#F4D03F', // chick yellow
      PROMOTION: '#F4D03F', // chick yellow
    };
    return colors[type] || '#6B7280';
  }

  /**
   * Vérifier si une notification contient un lien vers une commande
   */
  hasOrderLink(notification: UserNotification): boolean {
    return !!(
      notification.data?.orderId &&
      (notification.type === 'ORDER_CONFIRMED' ||
        notification.type === 'ORDER_SHIPPED' ||
        notification.type === 'ORDER_DELIVERED' ||
        notification.type === 'PAYMENT_SUCCESS' ||
        notification.type === 'PAYMENT_FAILED')
    );
  }

  /**
   * Obtenir l'ID de commande d'une notification
   */
  getOrderId(notification: UserNotification): string | null {
    return notification.data?.orderId || null;
  }
}

// ==================================
// SINGLETON INSTANCE
// ==================================

export const userNotificationsService = new UserNotificationsService();
export default userNotificationsService;
