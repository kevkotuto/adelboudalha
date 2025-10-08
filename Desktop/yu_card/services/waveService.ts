import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  WavePayment,
  PaymentHistory,
  InitiateWavePaymentRequest,
  ConfirmWavePaymentRequest,
  RetryWavePaymentRequest,
  PaymentFilters,
  WavePaymentStatus,
  PaginatedResponse,
} from '@/types';

// ==================================
// WAVE PAYMENT SERVICE
// ==================================

export class WaveService {
  // ==================================
  // PAYMENT INITIATION
  // ==================================

  /**
   * Initiate Wave payment for an order
   */
  async initiatePayment(orderId: string): Promise<{
    paymentId: string;
    waveUrl: string;
    amount: number;
    currency: string;
    expiresAt: string;
  }> {
    return await apiClient.post<{
      paymentId: string;
      waveUrl: string;
      amount: number;
      currency: string;
      expiresAt: string;
    }>(
      API_ENDPOINTS.PAYMENTS.INITIATE,
      { orderId }
    );
  }

  /**
   * Confirm Wave payment
   */
  async confirmPayment(paymentId: string): Promise<{
    payment: WavePayment;
    order: {
      id: string;
      orderNumber: string;
      totalAmount: number;
      status: string;
      paymentStatus: string;
    };
  }> {
    return await apiClient.post<{
      payment: WavePayment;
      order: {
        id: string;
        orderNumber: string;
        totalAmount: number;
        status: string;
        paymentStatus: string;
      };
    }>(
      API_ENDPOINTS.PAYMENTS.CONFIRM(paymentId)
    );
  }

  /**
   * Check payment status by transaction ID
   */
  async getPaymentStatus(transactionId: string): Promise<{
    payment: WavePayment;
    order: {
      id: string;
      orderNumber: string;
      userId: string;
      totalAmount: number;
      status: string;
      paymentStatus: string;
    };
  }> {
    return await apiClient.get<{
      payment: WavePayment;
      order: {
        id: string;
        orderNumber: string;
        userId: string;
        totalAmount: number;
        status: string;
        paymentStatus: string;
      };
    }>(
      API_ENDPOINTS.PAYMENTS.STATUS(transactionId)
    );
  }

  /**
   * Retry failed payment
   */
  async retryPayment(paymentId: string): Promise<{
    paymentId: string;
    waveUrl: string;
    retryCount: number;
  }> {
    return await apiClient.post<{
      paymentId: string;
      waveUrl: string;
      retryCount: number;
    }>(
      API_ENDPOINTS.PAYMENTS.RETRY(paymentId)
    );
  }

  /**
   * Cancel pending payment
   */
  async cancelPayment(paymentId: string): Promise<{
    payment: {
      id: string;
      status: string;
    };
  }> {
    return await apiClient.post<{
      payment: {
        id: string;
        status: string;
      };
    }>(
      API_ENDPOINTS.PAYMENTS.CANCEL(paymentId)
    );
  }

  // ==================================
  // PAYMENT HISTORY
  // ==================================

  /**
   * Get user payment history
   */
  async getPaymentHistory(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<{
    payments: WavePayment[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    return await apiClient.getPaginated<WavePayment>(
      API_ENDPOINTS.PAYMENTS.HISTORY,
      params
    );
  }

  /**
   * Get payment by ID using confirm endpoint (which returns status)
   */
  async getPaymentById(paymentId: string): Promise<WavePayment> {
    try {
      // Use confirm endpoint which checks the payment status
      const response = await apiClient.post<{
        payment: WavePayment;
        order: any;
      }>(API_ENDPOINTS.PAYMENTS.CONFIRM(paymentId));

      return response.payment;
    } catch (error: any) {
      // If confirm fails, the payment might not be ready yet
      // Return a PENDING status payment object
      console.warn('⚠️ Payment status check failed, assuming PENDING:', error.message);
      throw error;
    }
  }

  // ==================================
  // WAVE BALANCE & TRANSACTIONS
  // ==================================

  /**
   * Get Wave wallet balance
   */
  async getBalance(includeSubaccounts?: boolean): Promise<{
    amount: string;
    currency: string;
  }> {
    return await apiClient.get<{
      amount: string;
      currency: string;
    }>(
      API_ENDPOINTS.PAYMENTS.BALANCE,
      { params: { include_subaccounts: includeSubaccounts } }
    );
  }

  /**
   * Get Wave transactions
   */
  async getTransactions(params?: {
    date?: string;
    after?: string;
    include_subaccounts?: boolean;
  }): Promise<{
    page_info: {
      start_cursor: string | null;
      end_cursor: string;
      has_next_page: boolean;
    };
    date: string;
    items: Array<{
      timestamp: string;
      transaction_id: string;
      transaction_type: string;
      amount: string;
      fee: string;
      balance: string;
      currency: string;
      is_reversal: boolean;
      counterparty_name?: string;
      counterparty_mobile?: string;
      client_reference?: string;
      checkout_api_session_id?: string;
    }>;
  }> {
    return await apiClient.get<{
      page_info: {
        start_cursor: string | null;
        end_cursor: string;
        has_next_page: boolean;
      };
      date: string;
      items: Array<{
        timestamp: string;
        transaction_id: string;
        transaction_type: string;
        amount: string;
        fee: string;
        balance: string;
        currency: string;
        is_reversal: boolean;
        counterparty_name?: string;
        counterparty_mobile?: string;
        client_reference?: string;
        checkout_api_session_id?: string;
      }>;
    }>(
      API_ENDPOINTS.PAYMENTS.TRANSACTIONS,
      { params }
    );
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionId: string): Promise<{
    transaction_id: string;
    refunded_at: string;
  }> {
    return await apiClient.post<{
      transaction_id: string;
      refunded_at: string;
    }>(
      API_ENDPOINTS.PAYMENTS.TRANSACTION_REFUND(transactionId)
    );
  }

  // ==================================
  // WAVE PAYOUTS
  // ==================================

  /**
   * Create a payout (send money)
   */
  async createPayout(payoutData: {
    currency: string;
    receive_amount: string;
    mobile: string;
    name?: string;
    national_id?: string;
    client_reference?: string;
    payment_reason?: string;
  }): Promise<{
    id: string;
    currency: string;
    receive_amount: string;
    fee: string;
    mobile: string;
    name?: string;
    status: string;
    timestamp: string;
    payout_error: string | null;
  }> {
    return await apiClient.post<{
      id: string;
      currency: string;
      receive_amount: string;
      fee: string;
      mobile: string;
      name?: string;
      status: string;
      timestamp: string;
      payout_error: string | null;
    }>(
      API_ENDPOINTS.PAYMENTS.PAYOUT,
      payoutData
    );
  }

  /**
   * Get payout status
   */
  async getPayoutStatus(payoutId: string): Promise<{
    id: string;
    currency: string;
    receive_amount: string;
    fee: string;
    mobile: string;
    name?: string;
    status: string;
    timestamp: string;
    payout_error: string | null;
  }> {
    return await apiClient.get<{
      id: string;
      currency: string;
      receive_amount: string;
      fee: string;
      mobile: string;
      name?: string;
      status: string;
      timestamp: string;
      payout_error: string | null;
    }>(
      API_ENDPOINTS.PAYMENTS.PAYOUT_STATUS(payoutId)
    );
  }

  /**
   * Reverse a payout
   */
  async reversePayout(payoutId: string): Promise<{
    payout_id: string;
    reversed_at: string;
  }> {
    return await apiClient.post<{
      payout_id: string;
      reversed_at: string;
    }>(
      API_ENDPOINTS.PAYMENTS.PAYOUT_REVERSE(payoutId)
    );
  }

  // ==================================
  // SESSION & PAGES
  // ==================================

  /**
   * Get session details (for success/error pages)
   */
  async getSessionDetails(sessionId: string): Promise<{
    sessionId: string;
    amount: number;
    currency: string;
    paymentStatus: string;
    checkoutStatus: string;
    completedAt?: string;
    expiredAt?: string;
    lastError?: any;
    order: any;
    payment: any;
  }> {
    return await apiClient.get<{
      sessionId: string;
      amount: number;
      currency: string;
      paymentStatus: string;
      checkoutStatus: string;
      completedAt?: string;
      expiredAt?: string;
      lastError?: any;
      order: any;
      payment: any;
    }>(
      API_ENDPOINTS.PAYMENTS.SESSION_DETAILS(sessionId)
    );
  }

  // ==================================
  // TEST ENDPOINTS
  // ==================================

  /**
   * Test Wave routes
   */
  async testWaveRoutes(): Promise<{ success: boolean; message: string }> {
    return await apiClient.get<{ success: boolean; message: string }>(
      API_ENDPOINTS.PAYMENTS.TEST
    );
  }

  /**
   * Create test payment
   */
  async createTestPayment(): Promise<{
    session_id: string;
    wave_launch_url: string;
    amount: number;
    currency: string;
    restrict_payer_mobile: string;
    expires_at: string;
    checkout_status: string;
    payment_status: string;
    instructions: string;
  }> {
    return await apiClient.post<{
      session_id: string;
      wave_launch_url: string;
      amount: number;
      currency: string;
      restrict_payer_mobile: string;
      expires_at: string;
      checkout_status: string;
      payment_status: string;
      instructions: string;
    }>(
      API_ENDPOINTS.PAYMENTS.CREATE_TEST_PAYMENT
    );
  }

  // ==================================
  // PAYMENT MONITORING
  // ==================================

  /**
   * Poll payment status until completion or timeout
   */
  async pollPaymentStatus(
    paymentId: string,
    maxAttempts = 30,
    intervalMs = 2000
  ): Promise<WavePayment> {
    let attempts = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          attempts++;
          const payment = await this.getPaymentById(paymentId);

          // Payment completed (success or failure)
          if (['SUCCESS', 'FAILED', 'CANCELLED', 'TIMEOUT'].includes(payment.status)) {
            resolve(payment);
            return;
          }

          // Max attempts reached
          if (attempts >= maxAttempts) {
            reject(new Error('Payment status polling timeout'));
            return;
          }

          // Continue polling
          setTimeout(poll, intervalMs);
        } catch (error) {
          reject(error);
        }
      };

      poll();
    });
  }

  // ==================================
  // WEBHOOK HANDLING
  // ==================================

  /**
   * Handle Wave webhook (typically called by backend)
   */
  async handleWebhook(webhookData: any): Promise<{ success: boolean; message: string }> {
    return await apiClient.post<{ success: boolean; message: string }>(
      API_ENDPOINTS.PAYMENTS.WAVE.WEBHOOK,
      webhookData
    );
  }
}

// ==================================
// WAVE HELPER FUNCTIONS
// ==================================

export const waveHelpers = {
  /**
   * Format Ivorian phone number for Wave
   */
  formatPhoneForWave(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');

    // Handle different formats
    if (digits.startsWith('225')) {
      // Already has country code
      return `+${digits}`;
    }

    if (digits.startsWith('0') && digits.length === 10) {
      // Local format with leading zero (e.g., 0123456789)
      return `+225 ${digits}`;
    }

    if (digits.length === 10 && !digits.startsWith('0')) {
      // 10 digits without leading zero
      return `+225 0${digits}`;
    }

    // Return as-is if format is unclear
    return phone.startsWith('+') ? phone : `+${digits}`;
  },

  /**
   * Validate phone number for Wave payments in Côte d'Ivoire
   */
  isValidWavePhoneNumber(phone: string): boolean {
    const formatted = waveHelpers.formatPhoneForWave(phone);
    // Ivorian mobile numbers that work with Wave
    return /^\+225\s?0[1235789]\d{8}$/.test(formatted.replace(/\s/g, ''));
  },

  /**
   * Get payment status info for display
   */
  getPaymentStatusInfo(status: WavePaymentStatus): {
    label: string;
    color: string;
    icon: string;
    description: string;
    canRetry: boolean;
  } {
    const statusMap = {
      PENDING: {
        label: 'En attente',
        color: '#FFA500',
        icon: '⏳',
        description: 'Paiement en cours de traitement',
        canRetry: false,
      },
      PROCESSING: {
        label: 'En cours',
        color: '#2196F3',
        icon: '⚙️',
        description: 'Traitement du paiement en cours',
        canRetry: false,
      },
      SUCCESS: {
        label: 'Réussi',
        color: '#4CAF50',
        icon: '✅',
        description: 'Paiement effectué avec succès',
        canRetry: false,
      },
      FAILED: {
        label: 'Échoué',
        color: '#F44336',
        icon: '❌',
        description: 'Le paiement a échoué',
        canRetry: true,
      },
      TIMEOUT: {
        label: 'Expiré',
        color: '#FF9800',
        icon: '⏰',
        description: 'Le paiement a expiré',
        canRetry: true,
      },
      CANCELLED: {
        label: 'Annulé',
        color: '#757575',
        icon: '🚫',
        description: 'Le paiement a été annulé',
        canRetry: true,
      },
    };

    return statusMap[status] || {
      label: status,
      color: '#757575',
      icon: '❓',
      description: 'Statut inconnu',
      canRetry: false,
    };
  },

  /**
   * Get estimated payment time
   */
  getEstimatedPaymentTime(): string {
    return '1-2 minutes';
  },

  /**
   * Generate payment reference
   */
  generatePaymentReference(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2, 8);
    return `YC${timestamp}${random}`.toUpperCase();
  },

  /**
   * Format payment amount for display
   */
  formatPaymentAmount(amount: number, currency = 'XOF'): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  },

  /**
   * Calculate Wave fees (approximate)
   */
  calculateWaveFees(amount: number): {
    fees: number;
    totalAmount: number;
  } {
    // Wave typically charges around 1-2% + fixed fee
    // This is approximate - actual fees depend on Wave's current pricing
    const percentageFee = Math.max(amount * 0.015, 100); // 1.5% with minimum 100 XOF
    const fixedFee = 50; // Small fixed fee

    const fees = Math.round(percentageFee + fixedFee);
    const totalAmount = amount + fees;

    return { fees, totalAmount };
  },

  /**
   * Check if payment can be retried
   */
  canRetryPayment(payment: WavePayment): boolean {
    const retryableStatuses: WavePaymentStatus[] = ['FAILED', 'TIMEOUT', 'CANCELLED'];
    const maxRetries = 3;

    return (
      retryableStatuses.includes(payment.status) &&
      payment.retryCount < maxRetries
    );
  },

  /**
   * Get payment retry delay
   */
  getRetryDelay(retryCount: number): number {
    // Exponential backoff: 1min, 2min, 4min
    return Math.pow(2, retryCount) * 60 * 1000;
  },

  /**
   * Format payment error message
   */
  formatPaymentErrorMessage(payment: WavePayment): string {
    if (payment.errorMessage) {
      return payment.errorMessage;
    }

    switch (payment.status) {
      case 'FAILED':
        return 'Le paiement a échoué. Veuillez vérifier votre solde et réessayer.';
      case 'TIMEOUT':
        return 'Le paiement a expiré. Veuillez réessayer.';
      case 'CANCELLED':
        return 'Le paiement a été annulé.';
      default:
        return 'Une erreur est survenue lors du paiement.';
    }
  },

  /**
   * Get payment instructions for user
   */
  getPaymentInstructions(phoneNumber: string): string[] {
    const formattedPhone = waveHelpers.formatPhoneForWave(phoneNumber);

    return [
      '1. Vous allez recevoir un SMS de Wave sur votre téléphone',
      '2. Composez le code USSD indiqué dans le SMS',
      '3. Saisissez votre PIN Wave pour confirmer',
      '4. Attendez la confirmation de paiement',
      '',
      `Numéro utilisé: ${formattedPhone}`,
      'Assurez-vous d\'avoir suffisamment de crédit Wave.',
    ];
  },

  /**
   * Validate payment amount (based on Yu Card API limits)
   */
  validatePaymentAmount(amount: number): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (amount <= 0) {
      errors.push('Le montant doit être supérieur à 0');
    }

    if (amount < 100) {
      errors.push('Le montant minimum est de 100 XOF');
    }

    if (amount > 5000000) {
      errors.push('Le montant maximum est de 5,000,000 XOF');
    }

    // Check if amount is whole number
    if (amount % 1 !== 0) {
      errors.push('Le montant doit être un nombre entier');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Get payment summary for confirmation
   */
  getPaymentSummary(
    amount: number,
    phoneNumber: string,
    orderId?: string
  ): {
    amount: string;
    phoneNumber: string;
    fees: string;
    total: string;
    orderId?: string;
    reference: string;
  } {
    const { fees, totalAmount } = waveHelpers.calculateWaveFees(amount);

    return {
      amount: waveHelpers.formatPaymentAmount(amount),
      phoneNumber: waveHelpers.formatPhoneForWave(phoneNumber),
      fees: waveHelpers.formatPaymentAmount(fees),
      total: waveHelpers.formatPaymentAmount(totalAmount),
      orderId,
      reference: waveHelpers.generatePaymentReference(),
    };
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const waveService = new WaveService();
export default waveService;