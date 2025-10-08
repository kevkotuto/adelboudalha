// ==================================
// ADMIN NOTIFICATIONS TYPES
// Types basés sur doc_notif_admin.md
// ==================================

/**
 * Type de notification
 */
export type NotificationTypeAdmin =
  | 'PROMOTION'      // Promotions, offres spéciales, réductions
  | 'SYSTEM'         // Alertes système, maintenance, updates
  | 'ORDER'          // Statut commande, livraison, confirmation
  | 'PAYMENT'        // Paiement réussi, échec, remboursement
  | 'DELIVERY'       // Tracking colis, livraison en cours
  | 'GIFT_CARD';     // Codes disponibles, activation

/**
 * Canal de notification
 */
export type NotificationChannel = 'PUSH' | 'SMS' | 'IN_APP';

/**
 * Requête pour envoyer une notification PUSH
 * POST /api/admin/notifications/push
 */
export interface SendPushNotificationRequest {
  title: string;              // Titre (max 100 caractères)
  message: string;            // Message (max 500 caractères)
  userIds?: string[];         // IDs utilisateurs (optionnel, vide = tous)
  type?: NotificationTypeAdmin; // Type de notification (défaut: PROMOTION)
  data?: Record<string, any>; // Données additionnelles (optionnel)
}

/**
 * Requête pour envoyer un SMS
 * POST /api/admin/notifications/sms
 */
export interface SendSMSNotificationRequest {
  message: string;            // Message SMS (max 160 caractères)
  userIds?: string[];         // IDs utilisateurs (optionnel)
  phoneNumbers?: string[];    // Numéros directs (optionnel, override userIds)
}

/**
 * Requête pour broadcast multi-canal
 * POST /api/admin/notifications/broadcast
 */
export interface BroadcastNotificationRequest {
  title: string;              // Titre (max 100 caractères)
  message: string;            // Message (max 500 caractères)
  userIds?: string[];         // IDs utilisateurs (optionnel, vide = tous)
  channels?: NotificationChannel[]; // Canaux à utiliser (défaut: tous les 3)
  type?: NotificationTypeAdmin; // Type de notification (défaut: PROMOTION)
  data?: Record<string, any>; // Données additionnelles (optionnel)
}

/**
 * Réponse après envoi de notification
 */
export interface SendNotificationResponse {
  success: boolean;
  message: string;
  data: {
    total: number;     // Nombre total d'utilisateurs ciblés
    sent: number;      // Notifications envoyées avec succès
    failed: number;    // Échecs (token invalide, etc.)
  };
}

/**
 * Réponse après broadcast
 */
export interface BroadcastNotificationResponse {
  success: boolean;
  message: string;
  data: {
    totalUsers: number;
    channels: NotificationChannel[];
    stats: {
      pushSent: number;
      pushFailed: number;
      smsSent: number;
      smsFailed: number;
      inAppCreated: number;
    };
  };
}

/**
 * Notification dans l'historique
 */
export interface NotificationHistoryItem {
  id: string;
  title: string;
  message: string;
  type: NotificationTypeAdmin;
  channel: NotificationChannel;
  sentAt?: string;      // Date d'envoi (ISO format)
  createdAt: string;    // Date de création (ISO format)
  isRead: boolean;
  user: {
    id: string;
    fullName: string;
    phone: string;
  };
}

/**
 * Paramètres de requête pour l'historique
 * GET /api/admin/notifications/history
 */
export interface NotificationHistoryParams {
  page?: number;            // Numéro de page (défaut: 1)
  limit?: number;           // Résultats par page (défaut: 20, max: 100)
  type?: NotificationTypeAdmin; // Filtrer par type
  channel?: NotificationChannel; // Filtrer par canal
  startDate?: string;       // Date de début (ISO format)
  endDate?: string;         // Date de fin (ISO format)
}

/**
 * Réponse de l'historique
 */
export interface NotificationHistoryResponse {
  success: boolean;
  data: {
    notifications: NotificationHistoryItem[];
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
 * Statistiques des notifications
 * GET /api/admin/notifications/stats
 */
export interface NotificationStats {
  summary: {
    totalNotifications: number;
    totalRead: number;
    totalUnread: number;
    readRate: string;        // Taux de lecture en %
  };
  byType: {
    type: NotificationTypeAdmin;
    count: number;
  }[];
  byChannel: {
    channel: NotificationChannel;
    count: number;
  }[];
  recentActivity: {
    id: string;
    title: string;
    type: NotificationTypeAdmin;
    channel: NotificationChannel;
    createdAt: string;
    sentAt: string;
  }[];
}

/**
 * Réponse des statistiques
 */
export interface NotificationStatsResponse {
  success: boolean;
  data: NotificationStats;
}

/**
 * Requête de test de notification
 * POST /api/admin/notifications/test/:userId
 */
export interface TestNotificationRequest {
  channel: NotificationChannel; // Canal : PUSH, SMS ou IN_APP (défaut: PUSH)
}

/**
 * Réponse du test de notification
 */
export interface TestNotificationResponse {
  success: boolean;
  message: string;
  data: {
    userId: string;
    userName: string;
    channel: NotificationChannel;
  };
}

/**
 * Formulaire de création de notification dans l'UI
 */
export interface NotificationFormData {
  title: string;
  message: string;
  type: NotificationTypeAdmin;
  channels: NotificationChannel[];
  targetType: 'all' | 'specific';
  userIds: string[];
  data?: Record<string, any>;
}

/**
 * Options de filtre pour l'UI
 */
export interface NotificationFilterOptions {
  type?: NotificationTypeAdmin | 'all';
  channel?: NotificationChannel | 'all';
  dateFrom?: Date;
  dateTo?: Date;
  searchQuery?: string;
}
