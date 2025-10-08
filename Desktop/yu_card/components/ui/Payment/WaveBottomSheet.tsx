import React, { forwardRef, useCallback, useMemo, useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator, Linking } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius } from '@/constants';
import { Title, Paragraph, Caption } from '../Typography';
import { IconButton } from '../Buttons';
import { WavePaymentCard } from './WavePaymentCard';
import { useWavePayment } from '@/hooks/useWavePayment';

interface WaveBottomSheetProps {
  orderId: string;
  amount: number;
  currency?: string;
  description?: string;
  onPaymentSuccess?: (orderId: string) => void;
  onPaymentError?: (error: string) => void;
  onClose?: () => void;
}

export const WaveBottomSheet = forwardRef<BottomSheetModal, WaveBottomSheetProps>(
  function WaveBottomSheet({ orderId, amount, currency = 'CFA', description, onPaymentSuccess, onPaymentError, onClose }, ref) {
    const snapPoints = useMemo(() => ['60%', '85%'], []);
    const [paymentStep, setPaymentStep] = useState<'input' | 'processing' | 'completed' | 'failed'>('input');

    const {
      isInitiating,
      isPolling,
      payment,
      paymentId,
      waveUrl,
      error,
      initiatePayment,
      pollPaymentStatus,
      reset,
    } = useWavePayment();

    // Reset on orderId change
    useEffect(() => {
      setPaymentStep('input');
      reset();
    }, [orderId]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          opacity={0.5}
          enableTouchThrough={false}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          pressBehavior="none"
          style={[{ backgroundColor: 'rgba(0, 0, 0, 1)' }, StyleSheet.absoluteFillObject]}
        />
      ),
      []
    );

    const handlePayment = async (phoneNumber: string) => {
      try {
        setPaymentStep('processing');

        // Step 1: Initiate payment
        console.log(`🚀 Initiating Wave payment for order: ${orderId}`);
        const { paymentId: newPaymentId, waveUrl } = await initiatePayment(orderId);

        console.log('✅ Payment initiated:', { paymentId: newPaymentId, waveUrl });

        // Step 2: Ask user how they want to open Wave payment
        if (waveUrl) {
          Alert.alert(
            '💳 Paiement Wave',
            'Comment souhaitez-vous effectuer le paiement ?',
            [
              {
                text: '📱 Ouvrir l\'app Wave',
                onPress: async () => {
                  try {
                    // Try to open Wave app with custom scheme
                    const waveAppUrl = 'wave://'; // Adjust if Wave has a custom URL scheme
                    const canOpenApp = await Linking.canOpenURL(waveAppUrl);

                    if (canOpenApp) {
                      await Linking.openURL(waveAppUrl);
                    } else {
                      // Fallback to web URL
                      await Linking.openURL(waveUrl);
                    }

                    // Start polling after opening
                    await handlePaymentPolling(newPaymentId);
                  } catch (err: any) {
                    console.error('Failed to open Wave app:', err);
                    setPaymentStep('failed');
                    onPaymentError?.('Impossible d\'ouvrir l\'application Wave');
                  }
                },
              },
              {
                text: '🌐 Ouvrir dans le navigateur',
                onPress: async () => {
                  try {
                    const canOpen = await Linking.canOpenURL(waveUrl);
                    if (canOpen) {
                      console.log('🌐 Opening Wave payment URL in browser:', waveUrl);
                      await Linking.openURL(waveUrl);

                      // Start polling after opening
                      await handlePaymentPolling(newPaymentId);
                    } else {
                      throw new Error('Impossible d\'ouvrir l\'URL de paiement');
                    }
                  } catch (err: any) {
                    console.error('Failed to open browser:', err);
                    setPaymentStep('failed');
                    onPaymentError?.('Impossible d\'ouvrir le navigateur');
                  }
                },
              },
              {
                text: 'Annuler',
                style: 'cancel',
                onPress: () => {
                  setPaymentStep('input');
                  onPaymentError?.('Paiement annulé');
                },
              },
            ],
            { cancelable: false }
          );
        } else {
          // Fallback: USSD code method
          Alert.alert(
            'Paiement Wave',
            `Vous allez recevoir un SMS sur ${phoneNumber}.\n\nComposez le code USSD indiqué pour confirmer le paiement.`,
            [
              {
                text: 'OK, j\'ai confirmé',
                onPress: async () => {
                  await handlePaymentPolling(newPaymentId);
                },
              },
              {
                text: 'Annuler',
                style: 'cancel',
                onPress: () => {
                  setPaymentStep('input');
                  onPaymentError?.('Paiement annulé');
                },
              },
            ]
          );
        }

      } catch (error: any) {
        console.error('❌ Payment initiation failed:', error);
        setPaymentStep('failed');
        onPaymentError?.(error.message || 'Erreur de paiement');
      }
    };

    // Helper function to handle payment polling with user prompt
    const handlePaymentPolling = async (paymentId: string) => {
      Alert.alert(
        '⏳ Paiement en cours',
        'Veuillez effectuer le paiement dans Wave.\n\nUne fois terminé, appuyez sur "Vérifier le paiement".',
        [
          {
            text: '✅ Vérifier le paiement',
            onPress: async () => {
              try {
                console.log('🔄 Polling payment status...');
                const completedPayment = await pollPaymentStatus(paymentId);

                if (completedPayment.status === 'SUCCESS') {
                  console.log('✅ Payment successful!');
                  setPaymentStep('completed');
                  onPaymentSuccess?.(orderId);
                } else if (completedPayment.status === 'PENDING' || completedPayment.status === 'PROCESSING') {
                  // Still pending, ask user to wait and retry
                  Alert.alert(
                    '⏳ Paiement en attente',
                    'Le paiement est toujours en cours de traitement.\n\nVeuillez patienter quelques instants.',
                    [
                      {
                        text: 'Réessayer',
                        onPress: () => handlePaymentPolling(paymentId),
                      },
                      {
                        text: 'Annuler',
                        style: 'cancel',
                        onPress: () => {
                          setPaymentStep('input');
                          onPaymentError?.('Vérification annulée');
                        },
                      },
                    ]
                  );
                } else {
                  throw new Error('Le paiement a échoué');
                }
              } catch (pollError: any) {
                console.error('❌ Payment polling failed:', pollError);
                Alert.alert(
                  '❌ Erreur de vérification',
                  pollError.message || 'Impossible de vérifier le statut du paiement',
                  [
                    {
                      text: 'Réessayer',
                      onPress: () => handlePaymentPolling(paymentId),
                    },
                    {
                      text: 'Annuler',
                      style: 'cancel',
                      onPress: () => {
                        setPaymentStep('failed');
                        onPaymentError?.(pollError.message || 'Échec de la vérification du paiement');
                      },
                    },
                  ]
                );
              }
            },
          },
          {
            text: 'Annuler',
            style: 'cancel',
            onPress: () => {
              setPaymentStep('input');
              onPaymentError?.('Paiement annulé');
            },
          },
        ],
        { cancelable: false }
      );
    };

    const formatAmount = (value: number) => {
      return new Intl.NumberFormat('fr-FR').format(value);
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        enablePanDownToClose={false}
        enableContentPanningGesture={false}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        android_keyboardInputMode="adjustResize"
      >
        <BottomSheetScrollView style={styles.contentContainer} contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Title level={4} color="primary">
                Paiement Wave
              </Title>
              <Caption color="secondary">
                Paiement sécurisé
              </Caption>
            </View>

            <IconButton
              icon="close"
              variant="ghost"
              size="sm"
              onPress={onClose}
            />
          </View>

          {/* Payment Summary */}
          <View style={styles.paymentSummary}>
            <View style={styles.summaryRow}>
              <Paragraph color="secondary">Montant:</Paragraph>
              <Paragraph weight="medium" color="primary">
                {formatAmount(amount)} {currency}
              </Paragraph>
            </View>

            {description && (
              <View style={styles.summaryRow}>
                <Paragraph color="secondary">Description:</Paragraph>
                <Paragraph color="primary" style={styles.descriptionText}>
                  {description}
                </Paragraph>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Paragraph color="secondary">Mode de paiement:</Paragraph>
              <View style={styles.paymentMethod}>
                <Ionicons
                  name="phone-portrait-outline"
                  size={16}
                  color={Colors.wave.primary}
                />
                <Paragraph color="primary" style={styles.waveText}>
                  Wave Mobile Money
                </Paragraph>
              </View>
            </View>
          </View>

          {/* Payment Status Indicator */}
          {(isInitiating || isPolling) && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Paragraph style={styles.loadingText}>
                {isInitiating ? 'Initiation du paiement...' : 'Vérification du paiement...'}
              </Paragraph>
            </View>
          )}

          {/* Wave Payment Card */}
          <WavePaymentCard
            amount={amount}
            currency={currency}
            description={description}
            onPayPress={handlePayment}
            style={styles.paymentCard}
            disabled={isInitiating || isPolling}
          />

          {/* Benefits */}
          <View style={styles.benefits}>
            <Caption color="secondary" style={styles.benefitsTitle}>
              POURQUOI CHOISIR WAVE ?
            </Caption>

            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.success}
                />
                <Paragraph size="small" color="secondary" style={styles.benefitText}>
                  Paiement instantané et sécurisé
                </Paragraph>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.success}
                />
                <Paragraph size="small" color="secondary" style={styles.benefitText}>
                  Aucuns frais cachés
                </Paragraph>
              </View>

              <View style={styles.benefitItem}>
                <Ionicons
                  name="checkmark-circle"
                  size={16}
                  color={Colors.success}
                />
                <Paragraph size="small" color="secondary" style={styles.benefitText}>
                  Confirmation SMS immédiate
                </Paragraph>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Paragraph size="small" color="tertiary" align="center">
              En procédant au paiement, vous acceptez les conditions de Wave
            </Paragraph>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },

  handleIndicator: {
    backgroundColor: Colors.gray[300],
    width: 40,
  },

  contentContainer: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  headerLeft: {
    flex: 1,
  },

  paymentSummary: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  descriptionText: {
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.md,
  },

  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  waveText: {
    marginLeft: Spacing.xs,
    color: Colors.wave.primary,
  },

  paymentCard: {
    marginBottom: Spacing.xl,
  },

  benefits: {
    marginBottom: Spacing.xl,
  },

  benefitsTitle: {
    fontSize: 10,
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },

  benefitsList: {
    gap: Spacing.sm,
  },

  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  benefitText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },

  footer: {
    paddingTop: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl,
    marginBottom: Spacing.lg,
  },

  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },
});

export default WaveBottomSheet;