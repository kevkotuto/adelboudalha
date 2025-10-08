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

const { height: screenHeight } = Dimensions.get('window');

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = t('auth.errors.fullNameRequired') || 'Nom complet requis';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t('auth.errors.phoneRequired') || 'Numéro de téléphone requis';
    } else if (!/^[+]?[\d\s-()]{9,}$/.test(formData.phoneNumber.trim())) {
      newErrors.phoneNumber = t('auth.errors.phoneInvalid') || 'Numéro de téléphone invalide';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t('auth.errors.passwordRequired') || 'Mot de passe requis';
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.errors.passwordTooShort') || 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.confirmPasswordRequired') || 'Confirmation du mot de passe requise';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch') || 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const result = await register(
        formData.phoneNumber.trim(),
        formData.password,
        formData.fullName.trim()
      );

      if (result.success && result.needsOTP) {
        // Redirect to OTP verification with registration type
        router.push({
          pathname: '/auth/verify-otp',
          params: {
            phone: formData.phoneNumber.trim(),
            type: 'registration'
          }
        });
      } else if (!result.success) {
        Alert.alert(
          t('auth.errors.registerFailed') || 'Inscription échouée',
          result.error || t('auth.errors.registerFailedMessage') || 'Impossible de créer votre compte. Veuillez réessayer.'
        );
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        t('auth.errors.registerFailed') || 'Inscription échouée',
        t('auth.errors.registerFailedMessage') || 'Impossible de créer votre compte. Veuillez réessayer.'
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
                  {t('auth.register.title') || 'Créer un compte'}
                </Title>
                <Paragraph align="center" color="secondary" style={styles.welcomeSubtitle}>
                  {t('auth.register.subtitle') || 'Rejoignez Yu Card et découvrez nos offres exclusives'}
                </Paragraph>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Card style={styles.formCard}>
                <View style={styles.formContent}>
                  <TextInput
                    label={t('auth.fields.fullName') || 'Nom complet'}
                    value={formData.fullName}
                    onChangeText={(value) => updateField('fullName', value)}
                    placeholder={t('auth.placeholders.fullName') || 'Entrez votre nom complet'}
                    error={errors.fullName}
                    autoCapitalize="words"
                  />

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
                    autoComplete="new-password"
                  />

                  <TextInput
                    label={t('auth.fields.confirmPassword') || 'Confirmer le mot de passe'}
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    placeholder={t('auth.placeholders.confirmPassword') || 'Confirmez votre mot de passe'}
                    error={errors.confirmPassword}
                    secureTextEntry
                    autoComplete="new-password"
                  />

                  <Button
                    onPress={handleRegister}
                    variant="primary"
                    size="md"
                    loading={isLoading}
                    disabled={isLoading}
                    style={styles.registerButton}
                  >
                    {t('auth.register.button') || 'Créer mon compte'}
                  </Button>
                </View>
              </Card>
            </View>

            {/* Footer Section */}
            <View style={styles.footerSection}>
              <View style={styles.dividerContainer}>
                <View style={styles.divider} />
                <Paragraph color="secondary" style={styles.dividerText}>
                  {t('auth.register.or') || 'ou'}
                </Paragraph>
                <View style={styles.divider} />
              </View>

              <View style={styles.loginContainer}>
                <Paragraph align="center" color="secondary" style={styles.loginText}>
                  {t('auth.register.hasAccount') || 'Vous avez déjà un compte ?'}
                </Paragraph>
                <Button
                  onPress={() => router.push('/auth/login')}
                  variant="outline"
                  size="md"
                  style={styles.loginButton}
                >
                  {t('auth.register.loginLink') || 'Se connecter'}
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
    paddingTop: Spacing['2xl'],
    paddingBottom: Spacing.lg,
    minHeight: screenHeight * 0.22,
  },
  logoContainer: {
    marginBottom: Spacing.md,
  },
  logo: {
    width: 70,
    height: 70,
    borderRadius: 35,
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
    fontSize: 28,
    fontWeight: '700',
    color: Colors.background.primary,
  },
  welcomeContent: {
    alignItems: 'center',
  },
  welcomeTitle: {
    marginBottom: Spacing.sm,
    fontSize: 26,
    fontWeight: '600',
  },
  welcomeSubtitle: {
    lineHeight: 22,
    fontSize: 15,
    textAlign: 'center',
    paddingHorizontal: Spacing.md,
  },

  // Form Section
  formSection: {
    flex: 2,
    justifyContent: 'flex-start',
    paddingBottom: Spacing.md,
  },
  formCard: {
    padding: Spacing.xl,
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
    gap: Spacing.md,
  },
  registerButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },

  // Footer Section
  footerSection: {
    paddingBottom: Spacing.md,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.secondary,
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: 14,
    fontWeight: '500',
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