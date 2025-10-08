import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { Card } from '@/components/ui/Layout/Card';
import { Divider } from '@/components/ui/Layout/Divider';
import { WaveBottomSheet } from '@/components/ui/Payment/WaveBottomSheet';
import { Caption } from '@/components/ui/Typography/Caption';
import { Paragraph } from '@/components/ui/Typography/Paragraph';
import { Title } from '@/components/ui/Typography/Title';
import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { useWavePayment } from '@/hooks/useWavePayment';
import { useOrderStore } from '@/stores/useOrderStore';
import { Order } from '@/types';

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wave payment bottom sheet ref
  const waveBottomSheetRef = useRef<BottomSheetModal>(null);

  // Order store
  const fetchOrderById = useOrderStore((state) => state.fetchOrderById);
  const cancelOrder = useOrderStore((state) => state.cancelOrder);
  const isCancelling = useOrderStore((state) => state.isCancelling);

  // Wave payment for retry
  const { initiatePayment, pollPaymentStatus, checkPaymentStatus, isInitiating, isPolling, isChecking } = useWavePayment();

  // Load order
  useEffect(() => {
    loadOrder();
  }, [id]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await fetchOrderById(id);

      // Get the order from the store after fetching
      const currentOrder = useOrderStore.getState().currentOrder;
      setOrder(currentOrder);
    } catch (err: any) {
      console.error('Failed to load order:', err);
      setError(err.message || 'Impossible de charger la commande');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  // Get valid contact phone from multiple sources
  const getContactPhone = (): string | null => {
    if (!order) return null;

    // Check contactPhone (must be valid, not just country code)
    if (order.contactPhone && order.contactPhone.length > 4) {
      return order.contactPhone;
    }

    // Fallback to shipping address phone
    if (order.shippingAddress?.phone && order.shippingAddress.phone.length > 4) {
      return order.shippingAddress.phone;
    }

    // Fallback to billing address phone
    if (order.billingAddress?.phone && order.billingAddress.phone.length > 4) {
      return order.billingAddress.phone;
    }

    return null;
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      PENDING: Colors.warning,
      CONFIRMED: Colors.info,
      PROCESSING: Colors.primary,
      SHIPPED: Colors.primary,
      DELIVERED: Colors.success,
      CANCELLED: Colors.error,
      REFUNDED: Colors.gray[500],
    };
    return statusColors[status] || Colors.gray[500];
  };

  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    const iconMap: Record<string, keyof typeof Ionicons.glyphMap> = {
      PENDING: 'time-outline',
      CONFIRMED: 'checkmark-circle-outline',
      PROCESSING: 'refresh-outline',
      SHIPPED: 'car-outline',
      DELIVERED: 'checkmark-done-circle',
      CANCELLED: 'close-circle-outline',
      REFUNDED: 'cash-outline',
    };
    return iconMap[status] || 'ellipse-outline';
  };

  const getStatusLabel = (status: string): string => {
    const labelMap: Record<string, string> = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmée',
      PROCESSING: 'En traitement',
      SHIPPED: 'Expédiée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
      REFUNDED: 'Remboursée',
    };
    return labelMap[status] || status;
  };

  const getPaymentStatusLabel = (status: string): string => {
    const labelMap: Record<string, string> = {
      PENDING: '⏳ En attente',
      PROCESSING: '⚙️ En cours',
      COMPLETED: '✅ Payé',
      FAILED: '❌ Échoué',
      REFUNDED: '💰 Remboursé',
    };
    return labelMap[status] || status;
  };

  const handleCancelOrder = async () => {
    if (!order) return;

    // Interdit l'annulation si la commande est en cours d'expédition, expédiée ou livrée
    const nonCancellableStatuses = ['PROCESSING', 'SHIPPED', 'DELIVERED'];
    if (nonCancellableStatuses.includes(order.status)) {
      Alert.alert(
        'Annulation impossible',
        'Cette commande ne peut plus être annulée car elle est déjà en cours de traitement ou expédiée.'
      );
      return;
    }

    Alert.alert(
      'Annuler la commande',
      'Êtes-vous sûr de vouloir annuler cette commande ?',
      [
        { text: 'Non', style: 'cancel' },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedOrder = await cancelOrder(order.id, 'Annulé par le client');
              // Update local state with the returned order (no need to reload)
              setOrder(updatedOrder);
              Alert.alert('Succès', 'Commande annulée');
            } catch (error: any) {
              Alert.alert('Erreur', error.message || 'Impossible d\'annuler la commande');
            }
          },
        },
      ]
    );
  };

  const handlePayWithWave = () => {
    if (!order) return;

    console.log('💳 Opening Wave payment for order:', order.id);
    waveBottomSheetRef.current?.present();
  };

  const handlePaymentSuccess = async (orderId: string) => {
    console.log('🎉 Payment successful for order:', orderId);

    try {
      // Close the Wave payment bottom sheet
      waveBottomSheetRef.current?.close();

      // Reload order to get updated payment status
      console.log('🔄 Reloading order to get updated status...');
      await loadOrder();

      // Show success message
      Alert.alert(
        '🎉 Paiement réussi !',
        'Votre commande a été payée avec succès.\n\nVos codes de cartes cadeaux sont maintenant disponibles ci-dessous.',
        [{ text: 'OK', style: 'default' }],
        { cancelable: false }
      );
    } catch (error: any) {
      console.error('❌ Failed to reload order after payment:', error);
      // Still show success but with warning
      Alert.alert(
        '⚠️ Paiement réussi',
        'Le paiement a réussi mais il y a eu une erreur lors de la mise à jour.\n\nActualisez la page pour voir vos codes.',
        [
          {
            text: 'Actualiser',
            onPress: () => loadOrder(),
          },
        ]
      );
    }
  };

  const handlePaymentError = (error: string) => {
    waveBottomSheetRef.current?.close();
    Alert.alert(
      '❌ Erreur de paiement',
      error || 'Une erreur est survenue lors du paiement',
      [
        {
          text: 'Réessayer',
          onPress: () => waveBottomSheetRef.current?.present(),
        },
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ]
    );
  };

  const handleCheckPaymentStatus = async () => {
    if (!order?.wavePayments?.[0]?.id) {
      Alert.alert('Erreur', 'Aucun paiement trouvé pour cette commande');
      return;
    }

    try {
      console.log('🔍 Checking payment status...');
      const paymentId = order.wavePayments[0].id;
      const updatedPayment = await checkPaymentStatus(paymentId);

      // Reload order to get updated data
      await loadOrder();

      if (updatedPayment.status === 'SUCCESS') {
        Alert.alert(
          '✅ Paiement confirmé !',
          'Votre paiement a été confirmé avec succès. Vos codes sont maintenant disponibles.',
          [{ text: 'OK' }]
        );
      } else if (updatedPayment.status === 'FAILED') {
        Alert.alert(
          '❌ Paiement échoué',
          updatedPayment.errorMessage || 'Le paiement a échoué. Veuillez réessayer.',
          [
            {
              text: 'Réessayer',
              onPress: handlePayWithWave,
            },
            {
              text: 'Annuler',
              style: 'cancel',
            },
          ]
        );
      } else if (updatedPayment.status === 'PROCESSING' || updatedPayment.status === 'PENDING') {
        Alert.alert(
          '⏳ Paiement en cours',
          'Le paiement est toujours en cours de traitement. Veuillez patienter quelques instants et réessayer.',
          [{ text: 'OK' }]
        );
      }
    } catch (error: any) {
      console.error('❌ Failed to check payment status:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de vérifier le statut du paiement',
        [{ text: 'OK' }]
      );
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setStringAsync(text);
      Alert.alert('✅ Copié', `${label} copié dans le presse-papiers`);
    } catch (error) {
      console.error('Failed to copy:', error);
      Alert.alert('❌ Erreur', 'Impossible de copier le code');
    }
  };

  const hasGiftCards = order?.items.some(
    item => item.productType === 'GIFT_CARD' && item.giftCardCodes && item.giftCardCodes.length > 0
  );

  // Vérifie si la commande contient des gift cards
  const hasGiftCardItems = order?.items.some(item => item.productType === 'GIFT_CARD');

  const isPaid = order?.paymentStatus === 'COMPLETED';

  // Vérifie si le paiement est confirmé mais les codes ne sont pas encore disponibles
  const isWaitingForCodes = isPaid && hasGiftCardItems && !hasGiftCards &&
    ['CONFIRMED', 'PROCESSING'].includes(order?.status || '');

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.screenContent}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Paragraph style={styles.loadingText}>Chargement...</Paragraph>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.screenContent}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
            <Title level={3} style={styles.errorTitle}>Commande introuvable</Title>
            <Paragraph color="secondary">{error || 'Cette commande n\'existe pas'}</Paragraph>
            <Button
              variant="outline"
              onPress={() => router.push('/(tabs)/orders')}
              style={styles.backToOrdersButton}
            >
              Retour aux commandes
            </Button>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const canCancel = ['PENDING', 'CONFIRMED'].includes(order.status);
  const isCancelled = order.status === 'CANCELLED';
  const canPayNow = !isCancelled && ['PENDING', 'FAILED', 'PROCESSING'].includes(order.paymentStatus);
  const isPaymentProcessing = !isCancelled && order.paymentStatus === 'PROCESSING';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>Commande #{order.orderNumber}</Title>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Payment Alert - Show if payment is pending or failed */}
        {canPayNow && (
          <Pressable onPress={handlePayWithWave} style={styles.paymentAlert}>
            <View style={styles.paymentAlertContent}>
              <Ionicons
                name={order.paymentStatus === 'FAILED' ? 'alert-circle' : 'information-circle'}
                size={24}
                color={order.paymentStatus === 'FAILED' ? Colors.error : Colors.warning}
              />
              <View style={styles.paymentAlertText}>
                <Paragraph weight="medium" style={{ color: order.paymentStatus === 'FAILED' ? Colors.error : Colors.warning }}>
                  {order.paymentStatus === 'FAILED' ? '❌ Paiement échoué' : '⏳ Paiement en attente'}
                </Paragraph>
                <Caption color="secondary">
                  {order.paymentStatus === 'FAILED'
                    ? 'Réessayez le paiement pour finaliser votre commande'
                    : 'Finalisez le paiement pour recevoir vos codes'}
                </Caption>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
            </View>
          </Pressable>
        )}

        {/* Payment Processing Alert */}
        {isPaymentProcessing && (
          <Pressable onPress={handleCheckPaymentStatus} style={[styles.paymentAlert, styles.processingAlert]}>
            <View style={styles.paymentAlertContent}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <View style={styles.paymentAlertText}>
                <Paragraph weight="medium" color="primary">
                  ⏳ Paiement en cours de traitement
                </Paragraph>
                <Caption color="secondary">
                  Appuyez pour vérifier si le paiement est passé
                </Caption>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.gray[400]} />
            </View>
          </Pressable>
        )}

        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
              <Ionicons name={getStatusIcon(order.status)} size={20} color={Colors.white} />
              <Paragraph color="inverse" weight="medium" style={styles.statusText}>
                {getStatusLabel(order.status)}
              </Paragraph>
            </View>
          </View>

          <View style={styles.statusInfo}>
            <View style={styles.infoRow}>
              <Caption color="secondary">Date de commande</Caption>
              <Caption>{formatDate(order.createdAt)}</Caption>
            </View>

            <View style={styles.infoRow}>
              <Caption color="secondary">Paiement</Caption>
              <Paragraph size="small">{getPaymentStatusLabel(order.paymentStatus)}</Paragraph>
            </View>

            {getContactPhone() && (
              <View style={styles.infoRow}>
                <Caption color="secondary">{t('auth.fields.phoneNumber')}</Caption>
                <Caption>{getContactPhone()}</Caption>
              </View>
            )}
          </View>
        </Card>

        {/* Items */}
        <Card style={styles.itemsCard}>
          <Title level={5} style={styles.sectionTitle}>Articles commandés</Title>

          {order.items.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <Divider style={styles.itemDivider} />}
              <View style={styles.item}>
                <View style={styles.itemImageContainer}>
                  {item.productImage ? (
                    <Image
                      source={{ uri: item.productImage }}
                      style={styles.itemImage}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.itemImage, styles.placeholderImage]}>
                      <Ionicons name="gift-outline" size={24} color={Colors.gray[400]} />
                    </View>
                  )}
                </View>

                <View style={styles.itemInfo}>
                  <Paragraph numberOfLines={2} weight="medium">
                    {item.productName}
                  </Paragraph>
                  {item.productBrand && (
                    <Caption color="secondary" style={styles.itemBrand}>{item.productBrand}</Caption>
                  )}
                  {item.giftCardAmount && (
                    <View style={styles.giftCardAmountBadge}>
                      <Caption color="primary" weight="medium">
                        {formatAmount(item.giftCardAmount)} CFA
                      </Caption>
                    </View>
                  )}
                  <View style={styles.itemFooter}>
                    <Caption color="secondary">Quantité: {item.quantity}</Caption>
                    <Paragraph weight="medium" color="primary">
                      {formatAmount(item.totalPrice)} CFA
                    </Paragraph>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </Card>

        {/* Message: Codes en cours de livraison */}
        {isWaitingForCodes && (
          <Card style={styles.waitingCodesCard}>
            <View style={styles.waitingCodesHeader}>
              <Ionicons name="hourglass-outline" size={32} color={Colors.warning} />
              <Title level={5} style={styles.waitingCodesTitle}>
                Codes en cours de livraison
              </Title>
            </View>
            <Paragraph color="secondary" style={styles.waitingCodesText}>
              Votre paiement a été confirmé avec succès. Vos codes de cartes cadeaux sont en cours de génération et seront disponibles dans quelques instants.
            </Paragraph>
            <Paragraph color="secondary" style={styles.waitingCodesText}>
              ⏳ Veuillez patienter, vous recevrez une notification dès que vos codes seront prêts.
            </Paragraph>
          </Card>
        )}

        {/* GIFT CARD CODES - Critical Feature */}
        {isPaid && hasGiftCards && (
          <Card style={styles.giftCardCodesCard}>
            <View style={styles.giftCardCodesHeader}>
              <Ionicons name="gift" size={24} color={Colors.primary} />
              <Title level={5} style={styles.giftCardCodesTitle}>
                Codes de cartes cadeaux
              </Title>
            </View>
            <Caption color="secondary" style={styles.giftCardCodesSubtitle}>
              Vos codes sont prêts à être utilisés
            </Caption>

            <Divider style={styles.divider} />

            {order.items.map((item) => {
              if (item.productType !== 'GIFT_CARD' || !item.giftCardCodes || item.giftCardCodes.length === 0) {
                return null;
              }

              return (
                <View key={item.id} style={styles.giftCardCodeSection}>
                  <View style={styles.giftCardCodeHeader}>
                    <Paragraph weight="medium">{item.productName}</Paragraph>
                    <Caption color="secondary">
                      {item.giftCardCodes.length} code{item.giftCardCodes.length > 1 ? 's' : ''}
                    </Caption>
                  </View>

                  {item.giftCardCodes.map((code, index) => (
                    <View key={code.id} style={styles.giftCardCodeItem}>
                      <View style={styles.codeContent}>
                        <View style={styles.codeRow}>
                          <Caption color="secondary">Code:</Caption>
                          <TouchableOpacity
                            onPress={() => copyToClipboard(code.code, 'Code')}
                            style={styles.copyButton}
                          >
                            <Paragraph weight="medium" style={styles.codeText}>
                              {code.code}
                            </Paragraph>
                            <Ionicons name="copy-outline" size={16} color={Colors.primary} />
                          </TouchableOpacity>
                        </View>


                        <View style={styles.codeRow}>
                          <Caption color="secondary">Montant:</Caption>
                          <Paragraph size="small" color="primary" weight="medium">
                            {formatAmount(code.amount)} CFA
                          </Paragraph>
                        </View>

                        {code.expiryDate && (
                          <View style={styles.codeRow}>
                            <Caption color="secondary">Expire le:</Caption>
                            <Caption>{formatDate(code.expiryDate)}</Caption>
                          </View>
                        )}

                        <View style={styles.codeStatusBadge}>
                          <View
                            style={[
                              styles.statusDot,
                              { backgroundColor: code.status === 'USED' ? Colors.error : Colors.success }
                            ]}
                          />
                          <Caption style={{ color: code.status === 'USED' ? Colors.error : Colors.success }} weight="medium">
                            {code.status === 'USED' ? 'Utilisé' : 'Disponible'}
                          </Caption>
                        </View>
                      </View>
                      {index < item.giftCardCodes!.length - 1 && (
                        <Divider style={styles.codeDivider} />
                      )}
                    </View>
                  ))}
                </View>
              );
            })}

            <View style={styles.giftCardNotice}>
              <Ionicons name="information-circle-outline" size={16} color={Colors.info} />
              <Caption color="secondary" style={styles.giftCardNoticeText}>
                Conservez ces codes en lieu sûr. Ils sont utilisables une seule fois.
              </Caption>
            </View>
          </Card>
        )}

        {/* Order Summary */}
        <Card style={styles.summaryCard}>
          <Title level={5} style={styles.sectionTitle}>Récapitulatif de la commande</Title>

          <View style={styles.summaryRow}>
            <Caption color="secondary">Sous-total</Caption>
            <Paragraph>{formatAmount(order.subtotal)} CFA</Paragraph>
          </View>

          {order.shippingCost > 0 && (
            <View style={styles.summaryRow}>
              <Caption color="secondary">Livraison</Caption>
              <Paragraph>{formatAmount(order.shippingCost)} CFA</Paragraph>
            </View>
          )}

          {order.taxAmount > 0 && (
            <View style={styles.summaryRow}>
              <Caption color="secondary">Taxes</Caption>
              <Paragraph>{formatAmount(order.taxAmount)} CFA</Paragraph>
            </View>
          )}

          {order.discountAmount > 0 && (
            <View style={styles.summaryRow}>
              <Caption style={{ color: Colors.success }}>Réduction</Caption>
              <Paragraph style={{ color: Colors.success }}>-{formatAmount(order.discountAmount)} CFA</Paragraph>
            </View>
          )}

          <Divider style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <Title level={5}>Total payé</Title>
            <Title level={4} color="primary">
              {formatAmount(order.totalAmount)} {order.currency}
            </Title>
          </View>
        </Card>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <Card style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Ionicons name="location" size={20} color={Colors.primary} />
              <Title level={6} style={styles.addressTitle}>Adresse de livraison</Title>
            </View>
            <Paragraph>{order.shippingAddress.fullName}</Paragraph>
            <Caption color="secondary">{order.shippingAddress.phone}</Caption>
            <Caption color="secondary" style={styles.addressText}>
              {order.shippingAddress.addressLine1}
              {order.shippingAddress.addressLine2 && `, ${order.shippingAddress.addressLine2}`}
              {'\n'}
              {order.shippingAddress.city}
              {order.shippingAddress.postalCode && `, ${order.shippingAddress.postalCode}`}
              {'\n'}
              {order.shippingAddress.country}
            </Caption>
          </Card>
        )}

        {/* Tracking */}
        {order.tracking && (
          <Card style={styles.trackingCard}>
            <View style={styles.trackingHeader}>
              <Ionicons name="car" size={20} color={Colors.primary} />
              <Title level={6} style={styles.trackingTitle}>Suivi de livraison</Title>
            </View>

            {order.tracking.trackingNumber && (
              <View style={styles.infoRow}>
                <Caption color="secondary">Numéro de suivi</Caption>
                <Paragraph weight="medium">{order.tracking.trackingNumber}</Paragraph>
              </View>
            )}

            {order.tracking.carrier && (
              <View style={styles.infoRow}>
                <Caption color="secondary">Transporteur</Caption>
                <Paragraph>{order.tracking.carrier}</Paragraph>
              </View>
            )}

            {order.tracking.estimatedDelivery && (
              <View style={styles.infoRow}>
                <Caption color="secondary">Livraison estimée</Caption>
                <Caption>{formatDate(order.tracking.estimatedDelivery)}</Caption>
              </View>
            )}
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {canPayNow && (
            <Button
              variant="primary"
              onPress={handlePayWithWave}
              disabled={isInitiating || isPolling}
              loading={isInitiating || isPolling}
              fullWidth
              style={styles.actionButton}
              leftIcon="card"
            >
              {['FAILED', 'PROCESSING'].includes(order.paymentStatus) ? 'Réessayer le paiement' : 'Payer maintenant'}
            </Button>
          )}

          {isPaymentProcessing && (
            <Button
              variant="secondary"
              onPress={handleCheckPaymentStatus}
              disabled={isChecking}
              loading={isChecking}
              fullWidth
              style={styles.actionButton}
              leftIcon="checkmark-circle"
            >
              Vérifier le paiement
            </Button>
          )}

          {canCancel && (
            <Button
              variant="outline"
              onPress={handleCancelOrder}
              disabled={isCancelling}
              loading={isCancelling}
              fullWidth
              style={styles.actionButton}
            >
              Annuler la commande
            </Button>
          )}

          <Button
            variant="ghost"
            onPress={() => router.back()}
            style={styles.actionButton}
            fullWidth
          >
            Retour aux commandes
          </Button>
        </View>
      </ScrollView>

      {/* Wave Payment Bottom Sheet */}
      {order && (
        <WaveBottomSheet
          ref={waveBottomSheetRef}
          orderId={order.id}
          amount={order.totalAmount}
          currency={order.currency}
          description={`Commande #${order.orderNumber}`}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          onClose={() => waveBottomSheetRef.current?.close()}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  screenContent: {
    flex: 1,
    paddingHorizontal: Spacing.container.horizontal,
  },

  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    paddingHorizontal: Spacing.container.horizontal,
    paddingVertical: Spacing.md,
    marginBottom: Spacing.md,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    paddingHorizontal: Spacing.container.horizontal,
    paddingBottom: Spacing['2xl'],
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: Spacing.md,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing['4xl'],
  },

  errorTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  backToOrdersButton: {
    marginTop: Spacing.xl,
  },

  // Payment Alert
  paymentAlert: {
    backgroundColor: Colors.warning + '10',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },

  paymentAlertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },

  paymentAlertText: {
    flex: 1,
    gap: Spacing.xs,
  },

  processingAlert: {
    backgroundColor: Colors.primary + '10',
    borderColor: Colors.primary + '30',
  },

  // Status Card
  statusCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },

  statusHeader: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },

  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },

  statusText: {
    marginLeft: Spacing.sm,
  },

  statusInfo: {
    gap: Spacing.md,
  },

  divider: {
    marginVertical: Spacing.md,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Items Card
  itemsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    marginBottom: Spacing.lg,
  },

  item: {
    flexDirection: 'row',
    paddingVertical: Spacing.md,
  },

  itemDivider: {
    marginVertical: Spacing.md,
  },

  itemImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.gray[100],
    borderRadius: BorderRadius.md,
    marginRight: Spacing.md,
    overflow: 'hidden',
  },

  itemImage: {
    width: '100%',
    height: '100%',
  },

  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  itemInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },

  itemBrand: {
    marginTop: Spacing.xs,
  },

  giftCardAmountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
    marginTop: Spacing.xs,
  },

  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },

  // Waiting for Codes Card
  waitingCodesCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.warning + '05',
    borderWidth: 1,
    borderColor: Colors.warning + '30',
  },

  waitingCodesHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  waitingCodesTitle: {
    textAlign: 'center',
    marginTop: Spacing.sm,
  },

  waitingCodesText: {
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },

  // Gift Card Codes Card (CRITICAL SECTION)
  giftCardCodesCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    backgroundColor: Colors.primary + '05',
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },

  giftCardCodesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  giftCardCodesTitle: {
    flex: 1,
  },

  giftCardCodesSubtitle: {
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },

  giftCardCodeSection: {
    marginBottom: Spacing.lg,
  },

  giftCardCodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  giftCardCodeItem: {
    marginBottom: Spacing.md,
  },

  codeContent: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },

  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 28,
  },

  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.xs,
    marginRight: -Spacing.xs,
  },

  codeText: {
    fontFamily: 'monospace',
  },

  codeStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },

  codeDivider: {
    marginTop: Spacing.md,
  },

  giftCardNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.info + '10',
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.md,
  },

  giftCardNoticeText: {
    flex: 1,
    lineHeight: 18,
  },

  // Summary Card
  summaryCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  totalDivider: {
    marginVertical: Spacing.md,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Address Card
  addressCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  addressTitle: {
    flex: 1,
  },

  addressText: {
    marginTop: Spacing.sm,
    lineHeight: 18,
  },

  // Tracking Card
  trackingCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  trackingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  trackingTitle: {
    flex: 1,
  },

  // Actions
  actions: {
    marginTop: Spacing.lg,
    gap: Spacing.md,
  },

  actionButton: {
    marginBottom: Spacing.sm,
  },
});
