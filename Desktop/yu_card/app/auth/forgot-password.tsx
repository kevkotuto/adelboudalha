import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  Button,
  Card,
  Paragraph,
  TextInput,
  Title
} from '@/components/ui';
import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { authHelpers } from '@/services/authService';

const { height: screenHeight } = Dimensions.get('window');

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const { forgotPassword, isLoading } = useAuthStore();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');

  const validateForm = () => {
    if (!phoneNumber.trim()) {
      setError(t('auth.errors.phoneRequired') || 'Numéro de téléphone requis');
      return false;
    }

    if (!authHelpers.isValidPhoneNumber(phoneNumber)) {
      setError(t('auth.errors.phoneInvalid') || 'Numéro de téléphone invalide');
      return false;
    }

    setError('');
    return true;
  };

  const handleForgotPassword = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const success = await forgotPassword(phoneNumber.trim());

      if (success) {
        // Redirect to OTP verification with password_reset type
        router.push({
          pathname: '/auth/verify-otp',
          params: {
            phone: phoneNumber.trim(),
            type: 'password_reset'
          }
        });
      } else {
        Alert.alert(
          t('auth.errors.forgotPasswordFailed') || 'Erreur',
          t('auth.errors.forgotPasswordFailedMessage') || 'Impossible d\'envoyer le code. Veuillez réessayer.'
        );
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      Alert.alert(
        t('auth.errors.forgotPasswordFailed') || 'Erreur',
        t('auth.errors.forgotPasswordFailedMessage') || 'Impossible d\'envoyer le code. Veuillez réessayer.'
      );
    }
  };

  const updatePhoneNumber = (value: string) => {
    setPhoneNumber(value);
    if (error) {
      setError('');
    }
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
                  {t('auth.forgotPassword.title') || 'Mot de passe oublié ?'}
                </Title>
                <Paragraph align="center" color="secondary" style={styles.subtitle}>
                  {t('auth.forgotPassword.subtitle') || 'Entrez votre numéro de téléphone pour recevoir un code de réinitialisation'}
                </Paragraph>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Card style={styles.formCard}>
                <View style={styles.formContent}>
                  <TextInput
                    label={t('auth.fields.phoneNumber') || 'Numéro de téléphone'}
                    value={phoneNumber}
                    onChangeText={updatePhoneNumber}
                    placeholder={t('auth.placeholders.phoneNumber') || '+221 XX XXX XX XX'}
                    error={error}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    autoFocus
                  />

                  <Button
                    onPress={handleForgotPassword}
                    variant="primary"
                    size="md"
                    loading={isLoading}
                    disabled={isLoading || !phoneNumber.trim()}
                    style={styles.sendButton}
                  >
                    {t('auth.forgotPassword.sendCode') || 'Envoyer le code'}
                  </Button>
                </View>
              </Card>
            </View>

            {/* Footer Section */}
            <View style={styles.footerSection}>
              <View style={styles.loginContainer}>
                <Paragraph align="center" color="secondary" style={styles.loginText}>
                  {t('auth.forgotPassword.rememberPassword') || 'Vous vous souvenez de votre mot de passe ?'}
                </Paragraph>
                <Button
                  onPress={() => router.push('/auth/login')}
                  variant="outline"
                  size="md"
                  style={styles.loginButton}
                >
                  {t('auth.forgotPassword.backToLogin') || 'Retour à la connexion'}
                </Button>
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

  // Form Section
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: Spacing.xl,
  },
  formCard: {
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
  formContent: {
    gap: Spacing.xl,
  },
  sendButton: {
    borderRadius: BorderRadius.lg,
  },

  // Footer Section
  footerSection: {
    paddingBottom: Spacing['2xl'],
  },
  loginContainer: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  loginText: {
    fontSize: 15,
  },
  loginButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
});