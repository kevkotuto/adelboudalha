import {
  Button,
  Card,
  Paragraph,
  TextInput,
  Title
} from '@/components/ui';
import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { authHelpers } from '@/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('auth.errors.phoneRequired') || 'Numéro de téléphone requis';
    } else if (!authHelpers.isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = t('auth.errors.phoneInvalid') || 'Numéro de téléphone invalide';
    }

    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired') || 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordTooShort') || 'Le mot de passe doit contenir au moins 6 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const formattedPhone = authHelpers.formatPhoneNumber(formData.phoneNumber.trim());
      const success = await login(formattedPhone, formData.password);

      if (success) {
        router.replace('/(tabs)');
      } else {
        Alert.alert(
          t('auth.errors.loginFailed') || 'Connexion échouée',
          t('auth.errors.loginFailedMessage') || 'Vérifiez vos identifiants et réessayez.'
        );
      }
    } catch (error: any) {
      console.error('🔴 Login screen caught error:', error);
      console.log('🔍 Error code:', error.code);
      console.log('🔍 Error data:', error.data);

      // Handle phone verification required
      if (error.code === 'PHONE_VERIFICATION_REQUIRED') {
        console.log('✅ Detected PHONE_VERIFICATION_REQUIRED, showing alert...');

        Alert.alert(
          t('auth.otp.verificationRequired') || 'Vérification requise',
          t('auth.otp.verificationRequiredMessage') || 'Votre téléphone n\'est pas encore vérifié. Un code de vérification vous a été envoyé.',
          [
            {
              text: t('common.ok') || 'OK',
              onPress: () => {
                console.log('🚀 Navigating to OTP verification...');
                // Navigate to OTP verification screen
                router.push({
                  pathname: '/auth/verify-otp',
                  params: {
                    phone: error.data?.phone || formData.phoneNumber,
                    type: 'login'
                  }
                });
              }
            }
          ]
        );
        return;
      }

      // Handle other errors
      console.log('⚠️ Showing generic error alert');
      const errorMessage = error instanceof Error ? error.message : 'Vérifiez vos identifiants et réessayez.';
      Alert.alert(
        t('auth.errors.loginFailed') || 'Connexion échouée',
        errorMessage
      );
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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
              <View style={styles.logoContainer}>
                <View style={styles.logo}>
                  <Title level={1} color="primary" style={styles.logoText}>
                    Yu
                  </Title>
                </View>
              </View>

              <View style={styles.welcomeContent}>
                <Title level={1} align="center" style={styles.welcomeTitle}>
                  {t('auth.login.title') || 'Bon retour !'}
                </Title>
                <Paragraph align="center" color="secondary" style={styles.welcomeSubtitle}>
                  {t('auth.login.subtitle') || 'Connectez-vous pour accéder à vos cartes cadeaux'}
                </Paragraph>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Card style={styles.formCard}>
                <View style={styles.formContent}>
                  <TextInput
                    label={t('auth.fields.phoneNumber') || 'Numéro de téléphone'}
                    value={formData.phoneNumber}
                    onChangeText={(value) => updateField('phoneNumber', value)}
                    placeholder={t('auth.placeholders.phoneNumber') || '+221 XX XXX XX XX'}
                    error={errors.phoneNumber}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                  />

                  <TextInput
                    label={t('auth.fields.password') || 'Mot de passe'}
                    value={formData.password}
                    onChangeText={(value) => updateField('password', value)}
                    placeholder={t('auth.placeholders.password') || 'Entrez votre mot de passe'}
                    error={errors.password}
                    secureTextEntry
                    autoComplete="password"
                  />

                  <Button
                    onPress={() => router.push('/auth/forgot-password')}
                    variant="ghost"
                    size="sm"
                    style={styles.forgotButton}
                  >
                    {t('auth.login.forgotPassword') || 'Mot de passe oublié ?'}
                  </Button>

                  <Button
                    onPress={handleLogin}
                    variant="primary"
                    size="md"
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.loginButton}
                  >
                    {t('auth.login.button') || 'Se connecter'}
                  </Button>
                </View>
              </Card>
            </View>

            {/* Footer Section */}
            <View style={styles.footerSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Paragraph color="secondary" style={styles.dividerText}>
                  {t('auth.login.or') || 'ou'}
                </Paragraph>
                <View style={styles.divider} />
              </View>

              <View style={styles.registerContainer}>
                <Paragraph align="center" color="secondary" style={styles.registerText}>
                  {t('auth.login.noAccount') || 'Pas encore de compte ?'}
                </Paragraph>
                <Button
                  onPress={() => router.push('/auth/register')}
                  variant="outline"
                  size="md"
                  style={styles.registerButton}
                >
                  {t('auth.login.registerLink') || 'Créer un compte'}
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: Spacing['3xl'],
    paddingBottom: Spacing.xl,
    minHeight: screenHeight * 0.25,
  },
  logoContainer: {
    marginBottom: Spacing['2xl'],
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.background.primary,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    marginBottom: Spacing.md,
    fontSize: 28,
    fontWeight: '600',
  },
  welcomeSubtitle: {
    lineHeight: 24,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },

  // Form Section
  formSection: {
    flex: 2,
    justifyContent: 'flex-start',
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
    gap: Spacing.lg,
  },
  input: {
    marginBottom: Spacing.sm,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
  },
  loginButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },

  // Footer Section
  footerSection: {
    paddingBottom: Spacing['2xl'],
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing['2xl'],
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.secondary,
  },
  dividerText: {
    marginHorizontal: Spacing.lg,
    fontSize: 14,
    fontWeight: '500',
  },
  registerContainer: {
    alignItems: 'center',
    gap: Spacing.lg,
  },
  registerText: {
    fontSize: 16,
  },
  registerButton: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
  },
});