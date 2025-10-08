import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
  Share,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';

import { Colors, Spacing, BorderRadius } from '@/constants';
import { Title, Paragraph, Caption } from '../Typography';
import { Button, IconButton } from '../Buttons';
import { GiftCardCode } from '@/types/cart';
import useTranslation from '@/hooks/useTranslation';

interface GiftCardCodeModalProps {
  visible: boolean;
  giftCardCode: GiftCardCode;
  onClose: () => void;
}

export const GiftCardCodeModal: React.FC<GiftCardCodeModalProps> = ({
  visible,
  giftCardCode,
  onClose,
}) => {
  const { t } = useTranslation();
  const [codeRevealed, setCodeRevealed] = useState(false);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const formatCode = (code: string) => {
    return code.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(giftCardCode.code);
    Alert.alert(
      t('orders.code_copied'),
      t('orders.code_copied_message'),
      [{ text: t('common.ok') }]
    );
  };

  const handleShareCode = async () => {
    try {
      const message = `${t('orders.gift_card_share_message')}:\n\n` +
        `${giftCardCode.brand} - ${formatAmount(giftCardCode.amount)} ${giftCardCode.currency}\n` +
        `${t('orders.gift_card_code')}: ${giftCardCode.code}\n\n` +
        `${t('orders.expires_on')}: ${new Date(giftCardCode.expiryDate).toLocaleDateString('fr-FR')}`;

      await Share.share({
        message,
        title: t('orders.gift_card_title'),
      });
    } catch (error) {
      console.error('Erreur partage:', error);
    }
  };

  const maskCode = (code: string) => {
    if (code.length <= 8) return '****-****';
    const visibleStart = code.substring(0, 4);
    const visibleEnd = code.substring(code.length - 4);
    const masked = '*'.repeat(code.length - 8);
    return `${visibleStart}${masked}${visibleEnd}`;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Title level={4} color="primary">
              {t('orders.gift_card_title')}
            </Title>
            <IconButton
              icon="close"
              variant="ghost"
              size="sm"
              onPress={onClose}
            />
          </View>

          {/* Gift Card Visual */}
          <LinearGradient
            colors={[Colors.primary, Colors.primaryDark]}
            style={styles.giftCardVisual}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.cardHeader}>
              <Title level={3} color="inverse">
                {giftCardCode.brand}
              </Title>
              <Paragraph color="inverse" size="large" weight="bold">
                {formatAmount(giftCardCode.amount)} {giftCardCode.currency}
              </Paragraph>
            </View>

            <View style={styles.cardCode}>
              <Caption color="inverse" style={styles.codeLabel}>
                {t('orders.gift_card_code')}
              </Caption>
              <TouchableOpacity
                onPress={() => setCodeRevealed(!codeRevealed)}
                style={styles.codeContainer}
              >
                <Title level={4} color="inverse" style={styles.codeText}>
                  {codeRevealed ? formatCode(giftCardCode.code) : formatCode(maskCode(giftCardCode.code))}
                </Title>
                <Ionicons
                  name={codeRevealed ? 'eye-off' : 'eye'}
                  size={20}
                  color={Colors.white}
                  style={styles.eyeIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.cardFooter}>
              <Caption color="inverse">
                {t('orders.expires_on')}: {new Date(giftCardCode.expiryDate).toLocaleDateString('fr-FR')}
              </Caption>
              {giftCardCode.activated && (
                <View style={styles.activatedBadge}>
                  <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
                  <Caption style={[styles.activatedText, { color: Colors.success }]}>
                    {t('orders.activated')}
                  </Caption>
                </View>
              )}
            </View>
          </LinearGradient>

          {/* Actions */}
          <View style={styles.actions}>
            <Button
              variant="primary"
              size="md"
              onPress={handleCopyCode}
              style={styles.actionButton}
              disabled={!codeRevealed}
            >
              <Ionicons name="copy-outline" size={16} color={Colors.white} />
              {t('orders.copy_code')}
            </Button>

            <Button
              variant="outline"
              size="md"
              onPress={handleShareCode}
              style={styles.actionButton}
              disabled={!codeRevealed}
            >
              <Ionicons name="share-outline" size={16} color={Colors.primary} />
              {t('orders.share_code')}
            </Button>
          </View>

          {/* Instructions */}
          <View style={styles.instructions}>
            <Caption color="secondary" style={styles.instructionsTitle}>
              {t('orders.usage_instructions')}
            </Caption>
            <Paragraph size="small" color="secondary" style={styles.instructionsText}>
              {giftCardCode.usageInstructions}
            </Paragraph>

            <Caption color="tertiary" style={styles.termsText}>
              {giftCardCode.termsAndConditions}
            </Caption>
          </View>

          {/* Security Notice */}
          {!codeRevealed && (
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark-outline" size={16} color={Colors.info} />
              <Caption color="secondary" style={styles.securityText}>
                {t('orders.security_notice')}
              </Caption>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },

  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    width: '100%',
    maxWidth: 400,
    maxHeight: '90%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  giftCardVisual: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    minHeight: 200,
    justifyContent: 'space-between',
  },

  cardHeader: {
    alignItems: 'center',
  },

  cardCode: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },

  codeLabel: {
    marginBottom: Spacing.sm,
    opacity: 0.8,
  },

  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },

  codeText: {
    fontFamily: 'monospace',
    letterSpacing: 2,
  },

  eyeIcon: {
    marginLeft: Spacing.sm,
  },

  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  activatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },

  activatedText: {
    marginLeft: Spacing.xs,
    fontSize: 12,
  },

  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  instructions: {
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  instructionsTitle: {
    fontWeight: '600',
    marginBottom: Spacing.sm,
  },

  instructionsText: {
    lineHeight: 20,
    marginBottom: Spacing.sm,
  },

  termsText: {
    fontSize: 11,
    lineHeight: 16,
  },

  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.tertiary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },

  securityText: {
    marginLeft: Spacing.sm,
    fontSize: 12,
    flex: 1,
  },
});

export default GiftCardCodeModal;