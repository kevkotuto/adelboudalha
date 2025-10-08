import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { Card } from '@/components/ui/Layout/Card';
import { Container } from '@/components/ui/Layout/Container';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

export default function ChangePasswordScreen() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Tous les champs sont obligatoires.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les nouveaux mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setIsLoading(true);

    // Simulation du changement
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Succès',
        'Votre mot de passe a été modifié avec succès.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 2000);
  };

  const PasswordInput = ({
    label,
    value,
    onChangeText,
    placeholder,
    showPassword,
    toggleShowPassword,
  }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    showPassword: boolean;
    toggleShowPassword: () => void;
  }) => (
    <View style={styles.inputGroup}>
      <Caption color="secondary" style={styles.label}>
        {label}
      </Caption>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.text.tertiary}
          secureTextEntry={!showPassword}
          autoCapitalize="none"
        />
        <Pressable onPress={toggleShowPassword} style={styles.eyeButton}>
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color={Colors.text.secondary}
          />
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>Changer le mot de passe</Title>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <Card style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
              <View style={styles.infoText}>
                <Paragraph weight="medium">Sécurité de votre compte</Paragraph>
                <Caption color="secondary">
                  Utilisez un mot de passe fort et unique pour protéger votre compte.
                </Caption>
              </View>
            </View>
          </Card>

          {/* Form */}
          <Card style={styles.formCard}>
            <PasswordInput
              label="MOT DE PASSE ACTUEL"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Entrez votre mot de passe actuel"
              showPassword={showCurrentPassword}
              toggleShowPassword={() => setShowCurrentPassword(!showCurrentPassword)}
            />

            <PasswordInput
              label="NOUVEAU MOT DE PASSE"
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="Entrez votre nouveau mot de passe"
              showPassword={showNewPassword}
              toggleShowPassword={() => setShowNewPassword(!showNewPassword)}
            />

            <PasswordInput
              label="CONFIRMER LE NOUVEAU MOT DE PASSE"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirmez votre nouveau mot de passe"
              showPassword={showConfirmPassword}
              toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
            />

            {/* Password Requirements */}
            <View style={styles.requirements}>
              <Caption color="secondary" style={styles.requirementsTitle}>
                Exigences du mot de passe :
              </Caption>
              <View style={styles.requirement}>
                <Ionicons
                  name={newPassword.length >= 6 ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={newPassword.length >= 6 ? Colors.success : Colors.text.tertiary}
                />
                <Caption color="secondary" style={styles.requirementText}>
                  Au moins 6 caractères
                </Caption>
              </View>
            </View>
          </Card>

          {/* Change Password Button */}
          <Button
            onPress={handleChangePassword}
            loading={isLoading}
            style={styles.changeButton}
            size="lg"
          >
            Modifier le mot de passe
          </Button>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  infoCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },

  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  infoText: {
    flex: 1,
    marginLeft: Spacing.md,
  },

  formCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  inputGroup: {
    marginBottom: Spacing.lg,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: Spacing.xs,
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.input,
    backgroundColor: Colors.white,
  },

  passwordInput: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text.primary,
  },

  eyeButton: {
    padding: Spacing.sm,
    marginRight: Spacing.xs,
  },

  requirements: {
    marginTop: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.sm,
  },

  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: Spacing.xs,
  },

  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  requirementText: {
    fontSize: 12,
    marginLeft: Spacing.xs,
  },

  changeButton: {
    marginHorizontal: Spacing.sm,
  },

  bottomPadding: {
    height: Spacing.xl,
  },
});