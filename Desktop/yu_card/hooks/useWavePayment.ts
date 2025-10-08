import { useState, useCallback } from 'react';
import { waveService } from '@/services/waveService';
import { WavePayment, WavePaymentStatus } from '@/types';

// ==================================
// HOOK USE WAVE PAYMENT
// ==================================

interface UseWavePaymentReturn {
  // State
  isInitiating: boolean;
  isConfirming: boolean;
  isPolling: boolean;
  isRetrying: boolean;
  isChecking: boolean;
  payment: WavePayment | null;
  waveUrl: string | null;
  paymentId: string | null;
  error: string | null;

  // Actions
  initiatePayment: (orderId: string) => Promise<{
    paymentId: string;
    waveUrl: string;
  }>;
  confirmPayment: (paymentId: string) => Promise<void>;
  checkPaymentStatus: (paymentId: string) => Promise<WavePayment>;
  pollPaymentStatus: (paymentId: string, maxAttempts?: number) => Promise<WavePayment>;
  retryPayment: (paymentId: string) => Promise<{
    paymentId: string;
    waveUrl: string;
  }>;
  cancelPayment: (paymentId: string) => Promise<void>;
  reset: () => void;
}

export function useWavePayment(): UseWavePaymentReturn {
  // State
  const [isInitiating, setIsInitiating] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [payment, setPayment] = useState<WavePayment | null>(null);
  const [waveUrl, setWaveUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ==================================
  // INITIATE PAYMENT
  // ==================================
  const initiatePayment = useCallback(async (orderId: string) => {
    setIsInitiating(true);
    setError(null);

    try {
      const response = await waveService.initiatePayment(orderId);

      setPaymentId(response.paymentId);
      setWaveUrl(response.waveUrl);

      return {
        paymentId: response.paymentId,
        waveUrl: response.waveUrl,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de l\'initiation du paiement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsInitiating(false);
    }
  }, []);

  // ==================================
  // CONFIRM PAYMENT
  // ==================================
  const confirmPayment = useCallback(async (paymentId: string) => {
    setIsConfirming(true);
    setError(null);

    try {
      const response = await waveService.confirmPayment(paymentId);
      setPayment(response.payment);

      // Check if payment was successful
      if (response.payment.status !== 'SUCCESS') {
        throw new Error('Le paiement n\'a pas été confirmé');
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la confirmation du paiement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  }, []);

  // ==================================
  // CHECK PAYMENT STATUS (Single check, no polling)
  // ==================================
  const checkPaymentStatus = useCallback(async (paymentId: string): Promise<WavePayment> => {
    setIsChecking(true);
    setError(null);

    try {
      console.log('🔍 Checking payment status for:', paymentId);
      const payment = await waveService.getPaymentById(paymentId);
      setPayment(payment);
      console.log('✅ Payment status:', payment.status);

      return payment;
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la vérification du statut';
      setError(errorMessage);
      console.error('❌ Payment status check failed:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsChecking(false);
    }
  }, []);

  // ==================================
  // POLL PAYMENT STATUS
  // ==================================
  const pollPaymentStatus = useCallback(async (
    paymentId: string,
    maxAttempts = 30
  ): Promise<WavePayment> => {
    setIsPolling(true);
    setError(null);

    try {
      const payment = await waveService.pollPaymentStatus(
        paymentId,
        maxAttempts,
        2000 // 2 seconds interval
      );

      setPayment(payment);

      // Check final status
      if (payment.status === 'FAILED' || payment.status === 'TIMEOUT' || payment.status === 'CANCELLED') {
        const errorMessage = payment.errorMessage || 'Le paiement a échoué';
        setError(errorMessage);
        throw new Error(errorMessage);
      }

      return payment;
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la vérification du paiement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsPolling(false);
    }
  }, []);

  // ==================================
  // RETRY PAYMENT
  // ==================================
  const retryPayment = useCallback(async (paymentId: string) => {
    setIsRetrying(true);
    setError(null);

    try {
      const response = await waveService.retryPayment(paymentId);

      setPaymentId(response.paymentId);
      setWaveUrl(response.waveUrl);

      return {
        paymentId: response.paymentId,
        waveUrl: response.waveUrl,
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de la relance du paiement';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsRetrying(false);
    }
  }, []);

  // ==================================
  // CANCEL PAYMENT
  // ==================================
  const cancelPayment = useCallback(async (paymentId: string) => {
    setError(null);

    try {
      await waveService.cancelPayment(paymentId);
      setPayment(null);
      setPaymentId(null);
      setWaveUrl(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Échec de l\'annulation du paiement';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // ==================================
  // RESET
  // ==================================
  const reset = useCallback(() => {
    setIsInitiating(false);
    setIsConfirming(false);
    setIsPolling(false);
    setIsRetrying(false);
    setIsChecking(false);
    setPayment(null);
    setWaveUrl(null);
    setPaymentId(null);
    setError(null);
  }, []);

  return {
    // State
    isInitiating,
    isConfirming,
    isPolling,
    isRetrying,
    isChecking,
    payment,
    waveUrl,
    paymentId,
    error,

    // Actions
    initiatePayment,
    confirmPayment,
    checkPaymentStatus,
    pollPaymentStatus,
    retryPayment,
    cancelPayment,
    reset,
  };
}

export default useWavePayment;
