import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
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

export default function ResetPasswordScreen() {
  const { t } = useTranslation();
  const { resetPassword, isLoading } = useAuthStore();
  const params = useLocalSearchParams<{ phone?: string; otp?: string }>();

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.newPassword) {
      newErrors.newPassword = t('auth.errors.passwordRequired') || 'Mot de passe requis';
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = t('auth.errors.passwordTooShort') || 'Le mot de passe doit contenir au moins 8 caractères';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.confirmPasswordRequired') || 'Confirmation du mot de passe requise';
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = t('auth.errors.passwordMismatch') || 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleResetPassword = async () => {
    if (!validateForm()) {
      return;
    }

    if (!params.phone || !params.otp) {
      Alert.alert(
        t('auth.errors.missingData') || 'Erreur',
        t('auth.errors.missingDataMessage') || 'Données manquantes. Veuillez recommencer le processus.'
      );
      router.push('/auth/forgot-password');
      return;
    }

    try {
      const success = await resetPassword(
        params.phone,
        params.otp,
        formData.newPassword
      );

      if (success) {
        Alert.alert(
          t('auth.resetPassword.success') || 'Succès',
          t('auth.resetPassword.successMessage') || 'Votre mot de passe a été réinitialisé avec succès.',
          [
            {
              text: t('common.continue') || 'Continuer',
              onPress: () => router.push('/auth/login')
            }
          ]
        );
      } else {
        Alert.alert(
          t('auth.errors.resetPasswordFailed') || 'Erreur',
          t('auth.errors.resetPasswordFailedMessage') || 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.'
        );
      }
    } catch (error) {
      console.error('Reset password error:', error);
      Alert.alert(
        t('auth.errors.resetPasswordFailed') || 'Erreur',
        t('auth.errors.resetPasswordFailedMessage') || 'Impossible de réinitialiser le mot de passe. Veuillez réessayer.'
      );
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
                  {t('auth.resetPassword.title') || 'Nouveau mot de passe'}
                </Title>
                <Paragraph align="center" color="secondary" style={styles.subtitle}>
                  {t('auth.resetPassword.subtitle') || 'Créez un nouveau mot de passe sécurisé pour votre compte'}
                </Paragraph>
              </View>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <Card style={styles.formCard}>
                <View style={styles.formContent}>
                  <TextInput
                    label={t('auth.fields.newPassword') || 'Nouveau mot de passe'}
                    value={formData.newPassword}
                    onChangeText={(value) => updateField('newPassword', value)}
                    placeholder={t('auth.placeholders.newPassword') || 'Entrez votre nouveau mot de passe'}
                    error={errors.newPassword}
                    secureTextEntry
                    autoComplete="new-password"
                    autoFocus
                  />

                  <TextInput
                    label={t('auth.fields.confirmNewPassword') || 'Confirmer le nouveau mot de passe'}
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateField('confirmPassword', value)}
                    placeholder={t('auth.placeholders.confirmNewPassword') || 'Confirmez votre nouveau mot de passe'}
                    error={errors.confirmPassword}
                    secureTextEntry
                    autoComplete="new-password"
                  />

                  <Button
                    onPress={handleResetPassword}
                    variant="primary"
                    size="md"
                    loading={isLoading}
                    disabled={isLoading || !formData.newPassword || !formData.confirmPassword}
                    style={styles.resetButton}
                  >
                    {t('auth.resetPassword.button') || 'Réinitialiser le mot de passe'}
                  </Button>
                </View>
              </Card>
            </View>

            {/* Footer Section */}
            <View style={styles.footerSection}>
              <View style={styles.loginContainer}>
                <Paragraph align="center" color="secondary" style={styles.loginText}>
                  {t('auth.resetPassword.backToLogin') || 'Retour à la connexion'}
                </Paragraph>
                <Button
                  onPress={() => router.push('/auth/login')}
                  variant="outline"
                  size="md"
                  style={styles.loginButton}
                >
                  {t('auth.login.title') || 'Se connecter'}
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
    minHeight: screenHeight * 0.25,
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
  resetButton: {
    marginTop: Spacing.lg,
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