import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState, useRef, useEffect } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View, TextInput as RNTextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SmsRetriever from 'expo-sms-retriever';

import {
  Button,
  Card,
  Paragraph,
  Title
} from '@/components/ui';
import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { NotificationUtils } from '@/utils/notifications';

const { height: screenHeight } = Dimensions.get('window');

export default function VerifyOTPScreen() {
  const { t } = useTranslation();
  const { verifyOTP, isLoading, resendOTP, pendingRegistration } = useAuthStore();
  const params = useLocalSearchParams<{ phone?: string; type?: string }>();

  // Get phone and type from params or pending registration
  const phone = params.phone || pendingRegistration?.phone || '';
  const otpType = (params.type as 'registration' | 'login' | 'password_reset' | 'phone_verification') || 'registration';

  const [otp, setOTP] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(0);
  const [appHash, setAppHash] = useState<string>('');

  const inputRefs = useRef<(RNTextInput | null)[]>([]);

  // Initialize SMS Retriever
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Get app hash for SMS verification
      SmsRetriever.getHash()
        .then((hash) => {
          setAppHash(hash);
          console.log('App Hash for SMS:', hash);
        })
        .catch((error) => {
          console.error('Error getting app hash:', error);
        });

      // Start SMS retrieval
      SmsRetriever.start()
        .then((started) => {
          if (started) {
            console.log('SMS Retriever started successfully');
          }
        })
        .catch((error) => {
          console.error('Error starting SMS Retriever:', error);
        });

      // Add listener for incoming SMS
      SmsRetriever.addListener((message) => {
        console.log('SMS received:', message);
        if (message.otp && message.otp.length === 6) {
          // Auto-fill OTP
          const otpArray = message.otp.split('');
          setOTP(otpArray);
          // Remove listener after receiving OTP
          SmsRetriever.removeListener();
        }
      });

      // Cleanup on unmount
      return () => {
        SmsRetriever.stop();
        SmsRetriever.removeListener();
      };
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOTPChange = (value: string, index: number) => {
    if (value.length > 1) return;

    const newOTP = [...otp];
    newOTP[index] = value;
    setOTP(newOTP);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (index: number) => {
    if (otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      Alert.alert(
        t('auth.errors.invalidOTP') || 'Code invalide',
        t('auth.errors.otpRequired') || 'Veuillez entrer le code à 6 chiffres'
      );
      return;
    }

    if (!phone) {
      Alert.alert(
        t('auth.errors.missingPhone') || 'Erreur',
        t('auth.errors.missingPhoneMessage') || 'Numéro de téléphone manquant. Veuillez recommencer.'
      );
      router.back();
      return;
    }

    try {
      const success = await verifyOTP(phone, otpCode, otpType);

      if (success) {
        // Handle different OTP types
        if (otpType === 'password_reset') {
          // Redirect to reset password screen with phone and otp
          router.push({
            pathname: '/auth/reset-password',
            params: {
              phone: phone,
              otp: otpCode
            }
          });
        } else {
          // For registration and login, register push notification token
          // Don't block navigation if this fails
          NotificationUtils.requestAndStorePushToken()
            .then(async (token) => {
              if (token) {
                console.log('✅ Push token obtained after OTP verification:', token.substring(0, 20) + '...');
                // Sync with backend API
                try {
                  await NotificationUtils.syncPushTokenWithAPI();
                  console.log('✅ Push token synced with backend');
                } catch (error) {
                  console.error('❌ Failed to sync push token with backend:', error);
                  // Don't block user flow
                }
              } else {
                console.log('⚠️ User denied push notification permission');
              }
            })
            .catch((error) => {
              console.error('❌ Failed to get push token:', error);
              // Don't block user flow
            });

          // Navigate to main app
          router.replace('/(tabs)');
        }
      } else {
        Alert.alert(
          t('auth.errors.invalidOTP') || 'Code invalide',
          t('auth.errors.otpVerificationFailed') || 'Le code saisi est incorrect. Veuillez réessayer.'
        );
        // Clear OTP inputs
        setOTP(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      Alert.alert(
        t('auth.errors.verificationFailed') || 'Vérification échouée',
        t('auth.errors.tryAgain') || 'Une erreur est survenue. Veuillez réessayer.'
      );
    }
  };

  const handleResendOTP = async () => {
    if (!canResend || !phone) return;

    try {
      const success = await resendOTP(phone, otpType);

      if (success) {
        setCountdown(60);
        setCanResend(false);
        setOTP(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();

        Alert.alert(
          t('auth.otp.resent') || 'Code renvoyé',
          t('auth.otp.resentMessage') || 'Un nouveau code de vérification a été envoyé.'
        );
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      Alert.alert(
        t('auth.errors.resendFailed') || 'Erreur',
        t('auth.errors.resendFailedMessage') || 'Impossible de renvoyer le code. Veuillez réessayer.'
      );
    }
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient
      colors={[Colors.background.primary, '#F8F9FA']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <View style={styles.backButton}>
                <Button
                  onPress={() => router.back()}
                  variant="ghost"
                  size="sm"
                >
                  ←
                </Button>
              </View>

              <View style={styles.titleContent}>
                <Title level={1} align="center" style={styles.title}>
                  {t('auth.otp.title') || 'Entrez le code de vérification à 6 chiffres'}
                </Title>
                <Paragraph align="center" color="secondary" style={styles.subtitle}>
                  {t('auth.otp.subtitle') || `Nous vous avons envoyé un code de vérification au`}
                  {'\n'}
                  <Paragraph color="primary" style={{ fontWeight: '600' }}>
                    {phone}
                  </Paragraph>
                </Paragraph>
                {Platform.OS === 'android' && (
                  <Paragraph align="center" color="secondary" style={styles.autoDetectHint}>
                    📱 Le code sera détecté automatiquement
                  </Paragraph>
                )}
              </View>
            </View>

            {/* OTP Input Section */}
            <View style={styles.otpSection}>
              <Card style={styles.otpCard}>
                <View style={styles.otpContainer}>
                  {otp.map((digit, index) => (
                    <RNTextInput
                      key={index}
                      ref={(ref) => (inputRefs.current[index] = ref)}
                      value={digit}
                      onChangeText={(value) => handleOTPChange(value, index)}
                      onKeyPress={({ nativeEvent }) => {
                        if (nativeEvent.key === 'Backspace') {
                          handleBackspace(index);
                        }
                      }}
                      onFocus={() => setFocusedIndex(index)}
                      onBlur={() => setFocusedIndex(null)}
                      maxLength={1}
                      keyboardType="numeric"
                      style={[
                        styles.otpInput,
                        focusedIndex === index && styles.otpInputFocused,
                        digit !== '' && styles.otpInputFilled,
                      ]}
                      autoFocus={index === 0}
                      placeholderTextColor={Colors.text.tertiary}
                    />
                  ))}
                </View>
              </Card>
            </View>

            {/* Action Section */}
            <View style={styles.actionSection}>
              <Button
                onPress={handleVerifyOTP}
                variant="primary"
                size="md"
                loading={isLoading}
                disabled={isLoading || otp.join('').length !== 6}
                style={styles.verifyButton}
              >
                {t('auth.otp.verify') || 'Continuer'}
              </Button>

              <View style={styles.resendContainer}>
                {canResend ? (
                  <Button
                    onPress={handleResendOTP}
                    variant="ghost"
                    size="sm"
                  >
                    {t('auth.otp.resend') || 'Renvoyer le code'}
                  </Button>
                ) : (
                  <Paragraph align="center" color="secondary" style={styles.countdownText}>
                    {t('auth.otp.resendIn') || 'Renvoyer le code'} ({formatCountdown(countdown)})
                  </Paragraph>
                )}
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
  },

  // Header Section
  headerSection: {
    flex: 1,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    minHeight: screenHeight * 0.3,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: Spacing.xl,
  },
  titleContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.lg,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },
  subtitle: {
    lineHeight: 22,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  autoDetectHint: {
    marginTop: Spacing.md,
    fontSize: 13,
    opacity: 0.8,
  },

  // OTP Section
  otpSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
  },
  otpCard: {
    padding: Spacing['2xl'],
    borderRadius: BorderRadius.xl,
    backgroundColor: Colors.background.primary,
    shadowColor: Colors.text.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.white,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.text.primary,
  },
  otpInputFocused: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  otpInputFilled: {
    backgroundColor: Colors.background.secondary,
    borderColor: Colors.primary,
  },

  // Action Section
  actionSection: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: Spacing['2xl'],
  },
  verifyButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.xl,
  },
  resendContainer: {
    alignItems: 'center',
  },
  countdownText: {
    fontSize: 14,
  },
});