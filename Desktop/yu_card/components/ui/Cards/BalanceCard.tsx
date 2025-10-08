import React from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '@/constants';
import { Title, Paragraph, Caption } from '../Typography';
import { IconButton } from '../Buttons';

interface BalanceCardProps {
  balance: number;
  currency?: string;
  accountName?: string;
  accountNumber?: string;
  onPress?: () => void;
  onTopUpPress?: () => void;
  onTransferPress?: () => void;
  style?: ViewStyle;
  hideBalance?: boolean;
  onToggleVisibility?: () => void;
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  balance,
  currency = 'CFA',
  accountName = 'Mon Compte Yu Card',
  accountNumber,
  onPress,
  onTopUpPress,
  onTransferPress,
  style,
  hideBalance = false,
  onToggleVisibility,
}) => {
  const formatBalance = (value: number) => {
    if (hideBalance) return '••••••';
    return new Intl.NumberFormat('fr-FR').format(value);
  };

  const formatAccountNumber = (number: string) => {
    if (!number) return '';
    if (hideBalance) return '•••• •••• ••••';
    return number.replace(/(.{4})/g, '$1 ').trim();
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        Shadows.card,
        style,
      ]}
    >
      <LinearGradient
        colors={[Colors.black, Colors.gray[800]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.accountInfo}>
            <Caption color="inverse" style={styles.accountName}>
              {accountName}
            </Caption>
            {accountNumber && (
              <Caption color="inverse" style={styles.accountNumber}>
                {formatAccountNumber(accountNumber)}
              </Caption>
            )}
          </View>

          <IconButton
            icon={hideBalance ? 'eye-off' : 'eye'}
            variant="ghost"
            size="sm"
            onPress={onToggleVisibility}
            iconColor={Colors.white}
          />
        </View>

        {/* Balance */}
        <View style={styles.balanceContainer}>
          <Caption color="inverse" style={styles.balanceLabel}>
            SOLDE DISPONIBLE
          </Caption>
          <View style={styles.balanceAmount}>
            <Title level={2} color="inverse">
              {formatBalance(balance)}
            </Title>
            <Paragraph color="inverse" style={styles.currency}>
              {currency}
            </Paragraph>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {onTopUpPress && (
            <Pressable
              onPress={onTopUpPress}
              style={styles.actionButton}
            >
              <View style={styles.actionIcon}>
                <Ionicons
                  name="add-circle-outline"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <Caption color="inverse" style={styles.actionLabel}>
                Recharger
              </Caption>
            </Pressable>
          )}

          {onTransferPress && (
            <Pressable
              onPress={onTransferPress}
              style={styles.actionButton}
            >
              <View style={styles.actionIcon}>
                <Ionicons
                  name="swap-horizontal-outline"
                  size={24}
                  color={Colors.primary}
                />
              </View>
              <Caption color="inverse" style={styles.actionLabel}>
                Transférer
              </Caption>
            </Pressable>
          )}

          <Pressable
            onPress={() => {/* Historique */}}
            style={styles.actionButton}
          >
            <View style={styles.actionIcon}>
              <Ionicons
                name="time-outline"
                size={24}
                color={Colors.primary}
              />
            </View>
            <Caption color="inverse" style={styles.actionLabel}>
              Historique
            </Caption>
          </Pressable>
        </View>

        {/* Decorative elements */}
        <View style={styles.decoration1} />
        <View style={styles.decoration2} />
        <View style={styles.decoration3} />
      </LinearGradient>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },

  card: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.card,
    minHeight: 200,
    position: 'relative',
    overflow: 'hidden',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },

  accountInfo: {
    flex: 1,
  },

  accountName: {
    fontSize: 14,
    fontFamily: Typography.fonts.ubuntu.medium,
    opacity: 0.9,
  },

  accountNumber: {
    fontSize: 12,
    marginTop: 2,
    opacity: 0.7,
    fontFamily: Typography.fonts.ubuntu.regular,
  },

  balanceContainer: {
    flex: 1,
    justifyContent: 'center',
  },

  balanceLabel: {
    fontSize: 10,
    fontFamily: Typography.fonts.ubuntu.medium,
    letterSpacing: 1,
    opacity: 0.7,
    marginBottom: Spacing.xs,
  },

  balanceAmount: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  currency: {
    marginLeft: Spacing.sm,
    opacity: 0.9,
    fontSize: 18,
  },

  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.xl,
  },

  actionButton: {
    alignItems: 'center',
  },

  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(244, 208, 63, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  actionLabel: {
    fontSize: 12,
    opacity: 0.9,
  },

  // Éléments décoratifs
  decoration1: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(244, 208, 63, 0.1)',
  },

  decoration2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(244, 208, 63, 0.05)',
  },

  decoration3: {
    position: 'absolute',
    top: '50%',
    right: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },

  pressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
});

export default BalanceCard;