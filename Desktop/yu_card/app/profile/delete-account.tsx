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
import { useAuthStore } from '@/stores/authStore';
import useTranslation from '@/hooks/useTranslation';

export default function DeleteAccountScreen() {
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const [confirmText, setConfirmText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleDeleteAccount = () => {
    if (confirmText !== 'SUPPRIMER') {
      Alert.alert(
        'Confirmation incorrecte',
        'Veuillez taper exactement "SUPPRIMER" pour confirmer la suppression de votre compte.'
      );
      return;
    }

    Alert.alert(
      'Dernière confirmation',
      'Cette action est IRRÉVERSIBLE. Votre compte et toutes vos données seront définitivement supprimés. Êtes-vous absolument certain ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'SUPPRIMER DÉFINITIVEMENT',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);

            // Simulation de suppression
            setTimeout(async () => {
              setIsLoading(false);
              await logout();
              Alert.alert(
                'Compte supprimé',
                'Votre compte a été supprimé avec succès. Nous espérons vous revoir bientôt.',
                [
                  {
                    text: 'OK',
                    onPress: () => router.replace('/auth/login'),
                  },
                ]
              );
            }, 2000);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>Supprimer le compte</Title>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Warning Card */}
          <Card style={styles.warningCard}>
            <View style={styles.warningHeader}>
              <View style={styles.warningIcon}>
                <Ionicons name="warning" size={24} color={Colors.error} />
              </View>
              <Title level={5} style={styles.warningTitle}>
                Action irréversible
              </Title>
            </View>
            <Paragraph style={styles.warningText}>
              La suppression de votre compte est définitive et ne peut pas être annulée.
              Toutes vos données seront perdues.
            </Paragraph>
          </Card>

          {/* User Info */}
          <Card style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={32} color={Colors.white} />
              </View>
              <View style={styles.userDetails}>
                <Title level={6}>{user?.fullName || 'Utilisateur'}</Title>
                <Caption color="secondary">{user?.phone}</Caption>
              </View>
            </View>
          </Card>

          {/* What will be deleted */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Données qui seront supprimées
            </Title>
            <Card style={styles.dataCard}>
              <View style={styles.dataItem}>
                <Ionicons name="person-outline" size={20} color={Colors.text.secondary} />
                <Paragraph style={styles.dataText}>Informations personnelles</Paragraph>
              </View>
              <View style={styles.dataItem}>
                <Ionicons name="bag-outline" size={20} color={Colors.text.secondary} />
                <Paragraph style={styles.dataText}>Historique des commandes</Paragraph>
              </View>
              <View style={styles.dataItem}>
                <Ionicons name="card-outline" size={20} color={Colors.text.secondary} />
                <Paragraph style={styles.dataText}>Codes de cartes cadeaux</Paragraph>
              </View>
              <View style={styles.dataItem}>
                <Ionicons name="settings-outline" size={20} color={Colors.text.secondary} />
                <Paragraph style={styles.dataText}>Préférences et paramètres</Paragraph>
              </View>
              <View style={styles.dataItem}>
                <Ionicons name="location-outline" size={20} color={Colors.text.secondary} />
                <Paragraph style={styles.dataText}>Adresses de livraison</Paragraph>
              </View>
            </Card>
          </View>

          {/* Alternatives */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Alternatives à la suppression
            </Title>
            <Card style={styles.alternativeCard}>
              <Paragraph style={styles.alternativeText}>
                Si vous souhaitez simplement faire une pause, vous pouvez :
              </Paragraph>
              <View style={styles.alternativeList}>
                <View style={styles.alternativeItem}>
                  <Ionicons name="notifications-off-outline" size={16} color={Colors.primary} />
                  <Paragraph style={styles.alternativeItemText}>
                    Désactiver les notifications
                  </Paragraph>
                </View>
                <View style={styles.alternativeItem}>
                  <Ionicons name="log-out-outline" size={16} color={Colors.primary} />
                  <Paragraph style={styles.alternativeItemText}>
                    Vous déconnecter temporairement
                  </Paragraph>
                </View>
                <View style={styles.alternativeItem}>
                  <Ionicons name="mail-outline" size={16} color={Colors.primary} />
                  <Paragraph style={styles.alternativeItemText}>
                    Nous contacter pour résoudre un problème
                  </Paragraph>
                </View>
              </View>
            </Card>
          </View>

          {/* Confirmation */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Confirmation de suppression
            </Title>
            <Card style={styles.confirmCard}>
              <Paragraph style={styles.confirmText}>
                Pour confirmer la suppression, tapez exactement{' '}
                <Paragraph weight="bold" style={styles.confirmKeyword}>
                  SUPPRIMER
                </Paragraph>
                {' '}dans le champ ci-dessous :
              </Paragraph>
              <TextInput
                style={styles.confirmInput}
                value={confirmText}
                onChangeText={setConfirmText}
                placeholder="Tapez SUPPRIMER"
                placeholderTextColor={Colors.text.tertiary}
                autoCapitalize="characters"
              />
            </Card>
          </View>

          {/* Delete Button */}
          <Button
            variant="danger"
            size="lg"
            onPress={handleDeleteAccount}
            loading={isLoading}
            disabled={confirmText !== 'SUPPRIMER' || isLoading}
            style={styles.deleteButton}
          >
            {isLoading ? 'Suppression en cours...' : 'SUPPRIMER DÉFINITIVEMENT MON COMPTE'}
          </Button>

          {/* Contact Support */}
          <Card style={styles.supportCard}>
            <View style={styles.supportHeader}>
              <Ionicons name="help-circle" size={20} color={Colors.primary} />
              <Title level={6} style={styles.supportTitle}>
                Besoin d'aide ?
              </Title>
            </View>
            <Paragraph style={styles.supportText}>
              Si vous rencontrez un problème, notre équipe support est là pour vous aider.
            </Paragraph>
            <Button
              variant="outline"
              size="sm"
              onPress={() => router.push('/profile/help')}
              style={styles.supportButton}
            >
              Contacter le support
            </Button>
          </Card>

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

  warningCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.error + '10',
    borderColor: Colors.error + '30',
    borderWidth: 1,
  },

  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  warningIcon: {
    marginRight: Spacing.sm,
  },

  warningTitle: {
    color: Colors.error,
  },

  warningText: {
    color: Colors.error,
    lineHeight: 20,
  },

  userCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  userDetails: {
    flex: 1,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    marginBottom: Spacing.sm,
    color: Colors.text.primary,
  },

  dataCard: {
    padding: Spacing.lg,
  },

  dataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  dataText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },

  alternativeCard: {
    padding: Spacing.lg,
  },

  alternativeText: {
    marginBottom: Spacing.md,
  },

  alternativeList: {
    marginLeft: Spacing.sm,
  },

  alternativeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  alternativeItemText: {
    marginLeft: Spacing.sm,
    fontSize: 14,
  },

  confirmCard: {
    padding: Spacing.lg,
  },

  confirmText: {
    marginBottom: Spacing.md,
    lineHeight: 20,
  },

  confirmKeyword: {
    color: Colors.error,
    fontFamily: 'Ubuntu_700Bold',
  },

  confirmInput: {
    borderWidth: 1,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.input,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 16,
    color: Colors.text.primary,
    backgroundColor: Colors.white,
    fontFamily: 'Ubuntu_500Medium',
  },

  deleteButton: {
    marginBottom: Spacing.lg,
  },

  supportCard: {
    padding: Spacing.lg,
  },

  supportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  supportTitle: {
    marginLeft: Spacing.sm,
  },

  supportText: {
    marginBottom: Spacing.md,
    lineHeight: 20,
  },

  supportButton: {
    alignSelf: 'flex-start',
  },

  bottomPadding: {
    height: Spacing.xl,
  },
});