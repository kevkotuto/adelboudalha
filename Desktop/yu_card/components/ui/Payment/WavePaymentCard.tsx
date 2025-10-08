import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';
import { Title, Paragraph, Caption } from '../Typography';
import { Button } from '../Buttons';
import { useAuthStore } from '@/stores/authStore';
import useTranslation from '@/hooks/useTranslation';

interface WavePaymentCardProps {
  amount: number;
  currency?: string;
  description?: string;
  phoneNumber?: string;
  onPayPress?: (phoneNumber: string) => void;
  onPhoneNumberChange?: (phone: string) => void;
  style?: ViewStyle;
  loading?: boolean;
  disabled?: boolean;
}

export const WavePaymentCard: React.FC<WavePaymentCardProps> = ({
  amount,
  currency = 'CFA',
  description = 'Paiement Yu Card',
  phoneNumber = '',
  onPayPress,
  onPhoneNumberChange,
  style,
  loading = false,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [phone, setPhone] = useState(phoneNumber);

  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const handlePhoneChange = (text: string) => {
    // Format phone number for Côte d'Ivoire (+225) - 10 digits
    const digits = text.replace(/\D/g, '');
    let formatted = digits;

    // Format as: XX XX XX XX XX (10 digits)
    if (digits.length >= 2) {
      const parts = [];
      for (let i = 0; i < digits.length; i += 2) {
        parts.push(digits.slice(i, i + 2));
      }
      formatted = parts.join(' ');
    }

    setPhone(formatted);
    if (onPhoneNumberChange) {
      onPhoneNumberChange(formatted);
    }
  };

  const handleUseMyNumber = () => {
    if (user?.phone) {
      // Remove +225 prefix if present and format
      const cleanPhone = user.phone.replace(/^\+225\s*/, '').replace(/\D/g, '');
      handlePhoneChange(cleanPhone);
    }
  };

  const handlePayment = () => {
    // Validate 10 digits for Côte d'Ivoire
    if (onPayPress && phone.replace(/\D/g, '').length >= 10) {
      // Send phone with +225 prefix
      const cleanPhone = phone.replace(/\D/g, '');
      onPayPress(`+225${cleanPhone}`);
    }
  };

  const isValidPhone = phone.replace(/\D/g, '').length >= 10;

  return (
    <View style={[styles.container, style]}>
      {/* Wave Header */}
      <View style={styles.header}>
        <View style={styles.waveLogoContainer}>
          <Image
            source={{
              uri: 'https://wave.com/assets/img/wave-logo.png' // URL exemple
            }}
            style={styles.waveLogo}
            resizeMode="contain"
          />
          <View style={styles.headerText}>
            <Title level={5} color="primary">
              Wave
            </Title>
            <Caption color="secondary">
              Paiement mobile
            </Caption>
          </View>
        </View>

        <View style={styles.secureIcon}>
          <Ionicons
            name="shield-checkmark"
            size={24}
            color={Colors.success}
          />
        </View>
      </View>

      {/* Payment Details */}
      <View style={styles.paymentDetails}>
        <View style={styles.amountContainer}>
          <Caption color="secondary" style={styles.amountLabel}>
            MONTANT À PAYER
          </Caption>
          <View style={styles.amount}>
            <Title level={3} color="primary">
              {formatAmount(amount)}
            </Title>
            <Paragraph color="secondary" style={styles.currency}>
              {currency}
            </Paragraph>
          </View>
        </View>

        {description && (
          <View style={styles.descriptionContainer}>
            <Caption color="secondary" style={styles.descriptionLabel}>
              DESCRIPTION
            </Caption>
            <Paragraph color="primary" size="small">
              {description}
            </Paragraph>
          </View>
        )}
      </View>

      {/* Phone Number Input */}
      <View style={styles.phoneSection}>
        <View style={styles.phoneLabelRow}>
          <Caption color="secondary" style={styles.phoneLabel}>
            NUMÉRO WAVE
          </Caption>
          {user?.phone && (
            <Pressable onPress={handleUseMyNumber} style={styles.useMyNumberButton}>
              <Ionicons name="person-outline" size={14} color={Colors.primary} />
              <Caption color="primary" weight="medium" style={styles.useMyNumberText}>
                {t('payment.use_my_number')}
              </Caption>
            </Pressable>
          )}
        </View>

        <View style={styles.phoneInputContainer}>
          <View style={styles.countryCode}>
            <Paragraph color="secondary">🇨🇮 +225</Paragraph>
          </View>

          <TextInput
            style={[
              styles.phoneInput,
              styles.phoneText,
              !phone && styles.placeholder
            ]}
            value={phone}
            onChangeText={handlePhoneChange}
            placeholder="01 23 45 67 89"
            placeholderTextColor={Colors.text.tertiary}
            keyboardType="phone-pad"
            maxLength={14} // 10 digits + 4 spaces
            editable={!loading}
          />
        </View>
      </View>

      {/* Payment Button */}
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onPress={handlePayment}
        disabled={disabled || !isValidPhone}
        loading={loading}
        leftIcon="card-outline"
        style={styles.payButton}
      >
        {loading ? 'Traitement...' : `Payer ${formatAmount(amount)} ${currency}`}
      </Button>

      {/* Security Notice */}
      <View style={styles.securityNotice}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={Colors.info}
          style={styles.infoIcon}
        />
        <Paragraph size="small" color="secondary" style={styles.securityText}>
          Paiement sécurisé via Wave. Vous recevrez un SMS de confirmation.
        </Paragraph>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.xl,
    ...Shadows.card,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    paddingBottom: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  waveLogoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  waveLogo: {
    width: 40,
    height: 40,
    marginRight: Spacing.md,
  },

  headerText: {
    // Text styling handled by components
  },

  secureIcon: {
    // Icon styling handled by Ionicons
  },

  paymentDetails: {
    marginBottom: Spacing.xl,
  },

  amountContainer: {
    marginBottom: Spacing.lg,
  },

  amountLabel: {
    fontSize: 12,
    fontFamily: Typography.fonts.ubuntu.medium,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },

  amount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  currency: {
    marginLeft: Spacing.sm,
  },

  descriptionContainer: {
    marginBottom: Spacing.lg,
  },

  descriptionLabel: {
    fontSize: 12,
    fontFamily: Typography.fonts.ubuntu.medium,
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },

  phoneSection: {
    marginBottom: Spacing.xl,
  },

  phoneLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  phoneLabel: {
    fontSize: 12,
    fontFamily: Typography.fonts.ubuntu.medium,
    letterSpacing: 0.5,
  },

  useMyNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    backgroundColor: Colors.primary + '10',
    borderRadius: BorderRadius.xs,
  },

  useMyNumberText: {
    fontSize: 12,
  },

  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.input,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  countryCode: {
    marginRight: Spacing.md,
    paddingRight: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border.primary,
  },

  phoneInput: {
    flex: 1,
    color: Colors.text.primary,
  },

  phoneText: {
    fontFamily: Typography.fonts.ubuntu.medium,
    fontSize: Typography.sizes.base,
  },

  placeholder: {
    color: Colors.text.tertiary,
  },

  payButton: {
    marginBottom: Spacing.lg,
  },

  securityNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.background.tertiary,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },

  infoIcon: {
    marginRight: Spacing.sm,
    marginTop: 2,
  },

  securityText: {
    flex: 1,
    lineHeight: 18,
  },
});

export default WavePaymentCard;