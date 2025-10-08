import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { ImageUploadButton } from '@/components/ui/Inputs/ImageUploadButton';
import { Card } from '@/components/ui/Layout/Card';
import { Container } from '@/components/ui/Layout/Container';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import userService from '@/services/userService';
import { buildImageUrl } from '@/services/config';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || '');
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    // Validate inputs
    if (!fullName.trim()) {
      Alert.alert('Erreur', 'Le nom complet est requis');
      return;
    }

    setIsLoading(true);
    setUploadingAvatar(false); // ✅ Reset upload state before saving

    try {
      // Update profile on backend (including avatar if changed)
      const updatedUser = await userService.updateProfile({
        fullName: fullName.trim(),
        email: email.trim() || undefined,
        avatarUrl: avatarUrl || undefined,
      });

      // Update auth store with new data
      updateUser(updatedUser);

      Alert.alert(
        'Succès',
        'Votre profil a été mis à jour avec succès.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      Alert.alert(
        'Erreur',
        error.message || 'Impossible de mettre à jour le profil. Veuillez réessayer.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUploadComplete = (url: string) => {
    setAvatarUrl(url);
    setUploadingAvatar(false); // ✅ Stop loading after successful upload
    console.log('✅ Avatar uploaded successfully:', url);
  };

  const handleAvatarUploadStart = () => {
    setUploadingAvatar(true);
    console.log('📤 Starting avatar upload...');
  };

  const handleAvatarUploadError = (error: string) => {
    setUploadingAvatar(false);
    console.error('❌ Avatar upload error:', error);
  };

  if (!user) {
    return null; // Will redirect to login via useEffect
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>Modifier le profil</Title>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Photo Profile */}
          <View style={styles.photoSection}>
            <View style={styles.photoContainer}>
              {avatarUrl ? (
                <View style={styles.avatarWithUpload}>
                  <Image
                    source={{ uri: buildImageUrl(avatarUrl) }}
                    style={styles.avatarImage}
                  />
                  <Pressable
                    style={styles.photoChangeBadge}
                    onPress={() => {
                      // Trigger ImageUploadButton indirectly
                    }}
                  >
                    <ImageUploadButton
                      type="avatar"
                      currentImageUrl={avatarUrl}
                      onUploadComplete={handleAvatarUploadComplete}
                      onUploadStart={handleAvatarUploadStart}
                      onUploadError={handleAvatarUploadError}
                      size="large"
                      disabled={uploadingAvatar}
                    />
                  </Pressable>
                </View>
              ) : (
                <ImageUploadButton
                  type="avatar"
                  currentImageUrl={avatarUrl}
                  onUploadComplete={handleAvatarUploadComplete}
                  onUploadStart={handleAvatarUploadStart}
                  onUploadError={handleAvatarUploadError}
                  size="large"
                  disabled={uploadingAvatar}
                />
              )}
            </View>
            <Caption color="secondary" style={styles.photoHint}>
              {uploadingAvatar ? 'Upload en cours...' : 'Appuyez pour changer votre photo'}
            </Caption>
          </View>

          {/* Form */}
          <Card style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Caption color="secondary" style={styles.label}>
                NOM COMPLET
              </Caption>
              <TextInput
                style={styles.input}
                value={fullName}
                onChangeText={setFullName}
                placeholder="Entrez votre nom complet"
                placeholderTextColor={Colors.text.tertiary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Caption color="secondary" style={styles.label}>
                EMAIL (OPTIONNEL)
              </Caption>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Entrez votre email"
                placeholderTextColor={Colors.text.tertiary}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputGroup}>
              <Caption color="secondary" style={styles.label}>
                TÉLÉPHONE
              </Caption>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={user.phone}
                editable={false}
                placeholderTextColor={Colors.text.tertiary}
              />
              <Caption color="secondary" style={styles.helpText}>
                Le numéro de téléphone ne peut pas être modifié
              </Caption>
            </View>
          </Card>

          {/* Save Button */}
          <Button
            onPress={handleSave}
            loading={isLoading || uploadingAvatar}
            disabled={isLoading || uploadingAvatar}
            style={styles.saveButton}
            size="lg"
          >
            {uploadingAvatar ? 'Upload de l\'avatar...' : 'Enregistrer les modifications'}
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

  photoSection: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },

  photoContainer: {
    marginBottom: Spacing.sm,
    alignItems: 'center',
  },

  avatarWithUpload: {
    position: 'relative',
    width: 120,
    height: 120,
  },

  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  photoChangeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  },

  photoHint: {
    fontSize: 12,
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

  input: {
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.white,
  },

  inputDisabled: {
    backgroundColor: Colors.gray[100],
    color: Colors.text.secondary,
  },

  helpText: {
    fontSize: 11,
    marginTop: Spacing.xs,
    fontStyle: 'italic',
  },

  saveButton: {
    marginHorizontal: Spacing.sm,
  },

  bottomPadding: {
    height: Spacing.xl,
  },
});