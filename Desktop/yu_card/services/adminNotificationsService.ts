import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  SendPushNotificationRequest,
  SendSMSNotificationRequest,
  BroadcastNotificationRequest,
  SendNotificationResponse,
  BroadcastNotificationResponse,
  NotificationHistoryParams,
  NotificationHistoryResponse,
  NotificationStatsResponse,
  TestNotificationRequest,
  TestNotificationResponse,
} from '@/types/adminNotifications';

// ==================================
// ADMIN NOTIFICATIONS SERVICE
// Service basé sur doc_notif_admin.md
// ==================================

class AdminNotificationsService {
  /**
   * Envoyer une notification PUSH
   * POST /api/admin/notifications/push
   *
   * @description Envoie une notification push Expo aux utilisateurs
   * @example
   * ```typescript
   * await adminNotificationsService.sendPushNotification({
   *   title: "🎉 Nouvelle promotion !",
   *   message: "Profitez de 20% de réduction",
   *   type: "PROMOTION",
   *   data: { promoCode: "PSN20" }
   * });
   * ```
   */
  async sendPushNotification(
    request: SendPushNotificationRequest
  ): Promise<SendNotificationResponse> {
    const response = await apiClient.post<SendNotificationResponse>(
      API_ENDPOINTS.ADMIN.NOTIFICATIONS.PUSH,
      request
    );
    return response;
  }

  /**
   * Envoyer un SMS
   * POST /api/admin/notifications/sms
   *
   * @description Envoie un SMS via Termii (attention : coûte des crédits SMS)
   * @example
   * ```typescript
   * await adminNotificationsService.sendSMS({
   *   message: "Promo flash 30% jusqu'à minuit !",
   *   phoneNumbers: ["+2250708123456"]
   * });
   * ```
   */
  async sendSMS(
    request: SendSMSNotificationRequest
  ): Promise<SendNotificationResponse> {
    const response = await apiClient.post<SendNotificationResponse>(
      API_ENDPOINTS.ADMIN.NOTIFICATIONS.SMS,
      request
    );
    return response;
  }

  /**
   * Broadcast multi-canal (PUSH + SMS + IN_APP)
   * POST /api/admin/notifications/broadcast
   *
   * @description Envoie une notification via plusieurs canaux simultanément
   * @example
   * ```typescript
   * await adminNotificationsService.broadcast({
   *   title: "🎉 Black Friday",
   *   message: "70% de réduction sur tout !",
   *   channels: ["PUSH", "SMS"],
   *   type: "PROMOTION"
   * });
   * ```
   */
  async broadcast(
    request: BroadcastNotificationRequest
  ): Promise<BroadcastNotificationResponse> {
    const response = await apiClient.post<BroadcastNotificationResponse>(
      API_ENDPOINTS.ADMIN.NOTIFICATIONS.BROADCAST,
      request
    );
    return response;
  }

  /**
   * Obtenir l'historique des notifications
   * GET /api/admin/notifications/history
   *
   * @description Récupère l'historique avec filtres et pagination
   * @example
   * ```typescript
   * const history = await adminNotificationsService.getHistory({
   *   page: 1,
   *   limit: 20,
   *   type: "PROMOTION",
   *   channel: "PUSH"
   * });
   * ```
   */
  async getHistory(
    params?: NotificationHistoryParams
  ): Promise<NotificationHistoryResponse> {
    const response = await apiClient.get<NotificationHistoryResponse>(
      API_ENDPOINTS.ADMIN.NOTIFICATIONS.HISTORY,
      { params }
    );
    return response;
  }

  /**
   * Obtenir les statistiques des notifications
   * GET /api/admin/notifications/stats
   *
   * @description Récupère les stats détaillées (taux de lecture, par canal, etc.)
   * @example
   * ```typescript
   * const stats = await adminNotificationsService.getStats({
   *   startDate: "2025-02-01",
   *   endDate: "2025-02-28"
   * });
   * ```
   */
  async getStats(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<NotificationStatsResponse> {
    const response = await apiClient.get<NotificationStatsResponse>(
      API_ENDPOINTS.ADMIN.NOTIFICATIONS.STATS,
      { params }
    );
    return response;
  }

  /**
   * Tester une notification avec un utilisateur
   * POST /api/admin/notifications/test/:userId
   *
   * @description Envoie une notification de test à un utilisateur spécifique
   * @example
   * ```typescript
   * await adminNotificationsService.testNotification(
   *   "41b92f7b-10e2-43c4-8c3a-084532bc781f",
   *   { channel: "PUSH" }
   * );
   * ```
   */
  async testNotification(
    userId: string,
    request: TestNotificationRequest
  ): Promise<TestNotificationResponse> {
    const response = await apiClient.post<TestNotificationResponse>(
      API_ENDPOINTS.ADMIN.NOTIFICATIONS.TEST(userId),
      request
    );
    return response;
  }
}

// ==================================
// HELPER FUNCTIONS
// ==================================

export const notificationHelpers = {
  /**
   * Valider les limites de caractères
   */
  validateMessageLength(message: string, channel: 'PUSH' | 'SMS' | 'IN_APP'): {
    valid: boolean;
    error?: string;
    maxLength: number;
    currentLength: number;
  } {
    const maxLengths = {
      PUSH: 500,
      SMS: 160,
      IN_APP: 500,
    };

    const maxLength = maxLengths[channel];
    const currentLength = message.length;
    const valid = currentLength <= maxLength;

    return {
      valid,
      error: valid ? undefined : `Message trop long (${currentLength}/${maxLength})`,
      maxLength,
      currentLength,
    };
  },

  /**
   * Valider le titre
   */
  validateTitle(title: string): { valid: boolean; error?: string } {
    const maxLength = 100;
    if (title.length === 0) {
      return { valid: false, error: 'Le titre est requis' };
    }
    if (title.length > maxLength) {
      return { valid: false, error: `Titre trop long (${title.length}/${maxLength})` };
    }
    return { valid: true };
  },

  /**
   * Estimer le coût d'un envoi SMS
   */
  estimateSMSCost(recipients: number, pricePerSMS: number = 25): {
    count: number;
    estimatedCost: number;
    currency: string;
  } {
    return {
      count: recipients,
      estimatedCost: recipients * pricePerSMS,
      currency: 'XOF',
    };
  },

  /**
   * Formater les statistiques pour l'affichage
   */
  formatStats(stats: NotificationStatsResponse['data']): {
    totalSent: string;
    readRate: string;
    mostUsedChannel: string;
    mostUsedType: string;
  } {
    const mostUsedChannel = stats.byChannel.reduce((prev, current) =>
      current.count > prev.count ? current : prev
    , stats.byChannel[0]);

    const mostUsedType = stats.byType.reduce((prev, current) =>
      current.count > prev.count ? current : prev
    , stats.byType[0]);

    return {
      totalSent: stats.summary.totalNotifications.toLocaleString(),
      readRate: `${stats.summary.readRate}%`,
      mostUsedChannel: mostUsedChannel?.channel || 'N/A',
      mostUsedType: mostUsedType?.type || 'N/A',
    };
  },

  /**
   * Obtenir l'icône pour chaque type de notification
   */
  getTypeIcon(type: string): string {
    const icons: Record<string, string> = {
      PROMOTION: 'pricetag',
      SYSTEM: 'warning',
      ORDER: 'cart',
      PAYMENT: 'card',
      DELIVERY: 'car',
      GIFT_CARD: 'gift',
    };
    return icons[type] || 'notifications';
  },

  /**
   * Obtenir la couleur pour chaque type
   */
  getTypeColor(type: string): string {
    const colors: Record<string, string> = {
      PROMOTION: '#E91E63',
      SYSTEM: '#FF9800',
      ORDER: '#2196F3',
      PAYMENT: '#4CAF50',
      DELIVERY: '#9C27B0',
      GIFT_CARD: '#F44336',
    };
    return colors[type] || '#757575';
  },

  /**
   * Obtenir l'icône pour chaque canal
   */
  getChannelIcon(channel: string): string {
    const icons: Record<string, string> = {
      PUSH: 'notifications',
      SMS: 'chatbubbles',
      IN_APP: 'phone-portrait',
    };
    return icons[channel] || 'help-circle';
  },

  /**
   * Obtenir la couleur pour chaque canal
   */
  getChannelColor(channel: string): string {
    const colors: Record<string, string> = {
      PUSH: '#2196F3',
      SMS: '#4CAF50',
      IN_APP: '#9C27B0',
    };
    return colors[channel] || '#757575';
  },

  /**
   * Vérifier si un canal est gratuit
   */
  isChannelFree(channel: string): boolean {
    return channel === 'PUSH' || channel === 'IN_APP';
  },

  /**
   * Formater la date au format français
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const adminNotificationsService = new AdminNotificationsService();
export default adminNotificationsService;
