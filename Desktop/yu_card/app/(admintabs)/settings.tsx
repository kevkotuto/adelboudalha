import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  RefreshControl,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { Title, Paragraph, Caption } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Layout/Container';
import { Card } from '@/components/ui/Layout/Card';
import { Divider } from '@/components/ui/Layout/Divider';
import { Button } from '@/components/ui/Buttons/Button';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { apiClient } from '@/services/apiClient';
import { API_ENDPOINTS } from '@/services/config';
import { router } from 'expo-router';

interface SettingSection {
  id: string;
  title: string;
  items: SettingItem[];
}

interface SettingItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: keyof typeof Ionicons.glyphMap;
  type: 'action' | 'toggle' | 'info' | 'danger';
  value?: boolean;
  onPress?: () => void;
  onToggle?: (value: boolean) => void;
}

interface SystemInfo {
  version: string;
  buildNumber: string;
  environment: string;
}

export default function AdminSettingsScreen() {
  const { t } = useTranslation();

  const [systemInfo] = useState<SystemInfo>({
    version: '1.0.0',
    buildNumber: '2025.10.07',
    environment: 'production',
  });

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    // Refresh logic here if needed
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const downloadAndShareFile = async (endpoint: string, filename: string) => {
    try {
      setSaving(true);

      // Récupérer le token d'authentification
      const token = await apiClient.getAuthToken();
      if (!token) {
        Alert.alert('Erreur', 'Vous devez être connecté pour exporter les données');
        return;
      }

      // Construire l'URL complète
      const url = `${API_ENDPOINTS.BASE_URL}${endpoint}`;

      // Chemin de destination du fichier
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      console.log('📥 Downloading file:', { url, fileUri });

      // Télécharger le fichier avec le token d'authentification
      const downloadResult = await FileSystem.downloadAsync(
        url,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('✅ File downloaded:', downloadResult);

      if (downloadResult.status === 200) {
        // Vérifier si le partage est disponible
        const isSharingAvailable = await Sharing.isAvailableAsync();

        if (isSharingAvailable) {
          // Partager le fichier
          await Sharing.shareAsync(downloadResult.uri, {
            mimeType: 'text/csv',
            dialogTitle: 'Exporter le fichier',
            UTI: 'public.comma-separated-values-text',
          });

          Alert.alert(
            'Succès',
            'Export réussi ! Le fichier a été téléchargé.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Succès',
            `Fichier enregistré dans : ${fileUri}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        throw new Error(`Échec du téléchargement: ${downloadResult.status}`);
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Erreur',
        `Impossible d'exporter le fichier. ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleExportOrders = useCallback(async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `commandes_${timestamp}.csv`;

    Alert.alert(
      'Export des commandes',
      'Télécharger l\'export des commandes au format CSV ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Télécharger',
          onPress: () => downloadAndShareFile('/api/admin/export/orders', filename),
        },
      ]
    );
  }, []);

  const handleExportUsers = useCallback(async () => {
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `utilisateurs_${timestamp}.csv`;

    Alert.alert(
      'Export des utilisateurs',
      'Télécharger l\'export des utilisateurs au format CSV ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Télécharger',
          onPress: () => downloadAndShareFile('/api/admin/export/users', filename),
        },
      ]
    );
  }, []);

  // Configuration des sections avec useMemo pour optimiser
  const settingSections = useMemo((): SettingSection[] => [
    {
      id: 'management',
      title: 'Gestion',
      items: [
        {
          id: 'users',
          title: 'Utilisateurs',
          subtitle: 'Gérer les comptes utilisateurs',
          icon: 'people-outline',
          type: 'action',
          onPress: () => router.push('/(admintabs)/users'),
        },
        {
          id: 'categories',
          title: 'Catégories',
          subtitle: 'Gérer les catégories de produits',
          icon: 'folder-outline',
          type: 'action',
          onPress: () => router.push('/(admintabs)/categories'),
        },
        {
          id: 'gift_codes',
          title: 'Codes cadeaux',
          subtitle: 'Gérer les codes de gift cards',
          icon: 'qr-code-outline',
          type: 'action',
          onPress: () => router.push('/(admintabs)/gift-codes'),
        },
        {
          id: 'notifications',
          title: 'Notifications',
          subtitle: 'Gérer les notifications push',
          icon: 'notifications-outline',
          type: 'action',
          onPress: () => router.push('/(admintabs)/notifications'),
        },
      ],
    },
    {
      id: 'system',
      title: 'Informations système',
      items: [
        {
          id: 'app_version',
          title: 'Version de l\'application',
          subtitle: `Yu Card v${systemInfo.version} (${systemInfo.buildNumber})`,
          icon: 'information-circle-outline',
          type: 'info',
        },
        {
          id: 'environment',
          title: 'Environnement',
          subtitle: systemInfo.environment,
          icon: 'cloud-outline',
          type: 'info',
        },
      ],
    },
    {
      id: 'reports',
      title: 'Rapports et exports',
      items: [
        {
          id: 'financial_report',
          title: 'Rapport financier',
          subtitle: 'Statistiques financières détaillées',
          icon: 'stats-chart-outline',
          type: 'action',
          onPress: () => router.push('/(admintabs)/financial-report'),
        },
        {
          id: 'export_orders',
          title: 'Exporter les commandes',
          subtitle: 'Télécharger CSV des commandes',
          icon: 'download-outline',
          type: 'action',
          onPress: handleExportOrders,
        },
        {
          id: 'export_users',
          title: 'Exporter les utilisateurs',
          subtitle: 'Télécharger CSV des utilisateurs',
          icon: 'people-circle-outline',
          type: 'action',
          onPress: handleExportUsers,
        },
        {
          id: 'audit_logs',
          title: 'Journal d\'audit',
          subtitle: 'Historique des actions admin',
          icon: 'shield-checkmark-outline',
          type: 'action',
          onPress: () => router.push('/(admintabs)/audit-logs'),
        },
      ],
    },
  ], [
    systemInfo,
    handleExportOrders,
    handleExportUsers,
  ]);

  // Composant de menu item optimisé avec React.memo
  const SettingMenuItem = React.memo(({ item }: { item: SettingItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={item.onPress}
      disabled={item.type === 'info' || saving}
    >
      <View style={styles.menuItemLeft}>
        <View style={[
          styles.menuIcon,
          item.type === 'danger' && styles.menuIconDanger
        ]}>
          <Ionicons
            name={item.icon}
            size={20}
            color={
              item.type === 'danger'
                ? Colors.error
                : Colors.text.secondary
            }
          />
        </View>
        <View style={styles.menuText}>
          <Paragraph style={[
            styles.menuTitle,
            item.type === 'danger' && styles.menuTitleDanger
          ]}>
            {item.title}
          </Paragraph>
          {item.subtitle && (
            <Caption style={styles.menuSubtitle}>
              {item.subtitle}
            </Caption>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {item.type === 'toggle' && item.onToggle && (
          <Switch
            value={item.value || false}
            onValueChange={item.onToggle}
            trackColor={{
              false: Colors.background.tertiary,
              true: Colors.primary
            }}
            thumbColor={item.value ? Colors.text.primary : Colors.text.secondary}
            disabled={saving}
          />
        )}
        {(item.type === 'action' || item.type === 'danger') && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.text.secondary}
          />
        )}
      </View>
    </Pressable>
  ));

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Container>
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" color={Colors.primary} />
            <Paragraph style={styles.loadingText}>Chargement des paramètres...</Paragraph>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Container>
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <Title level={2} style={styles.headerTitle}>Paramètres Admin</Title>
            <Paragraph style={styles.headerSubtitle}>
              Configuration et gestion du système Yu Card
            </Paragraph>
          </View>

          {/* Return to Client View */}
          <Card style={styles.clientViewCard}>
            <Pressable
              style={({ pressed }) => [
                styles.clientViewButton,
                pressed && styles.clientViewButtonPressed,
              ]}
              onPress={() => router.push('/(tabs)/')}
            >
              <View style={styles.clientViewContent}>
                <View style={styles.clientViewIcon}>
                  <Ionicons name="home-outline" size={20} color={Colors.primary} />
                </View>
                <View style={styles.clientViewText}>
                  <Paragraph style={styles.clientViewTitle}>Retour à l&apos;espace client</Paragraph>
                  <Caption style={styles.clientViewSubtitle}>Afficher la vue utilisateur</Caption>
                </View>
              </View>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={Colors.primary}
              />
            </Pressable>
          </Card>

          {/* Settings Sections */}
          {settingSections.map((section, sectionIndex) => (
            <View key={section.id} style={styles.section}>
              <Title level={5} style={styles.sectionTitle}>
                {section.title}
              </Title>
              <Card style={styles.sectionCard}>
                {section.items.map((item, itemIndex) => (
                  <React.Fragment key={item.id}>
                    <SettingMenuItem item={item} />
                    {itemIndex < section.items.length - 1 && (
                      <Divider style={styles.sectionDivider} />
                    )}
                  </React.Fragment>
                ))}
              </Card>
            </View>
          ))}

          {/* App Info */}
          <View style={styles.appInfo}>
            <Caption style={styles.appInfoText}>
              Yu Card - Admin Panel
            </Caption>
            <Caption style={styles.appInfoText}>
              Version {systemInfo.version} • Build {systemInfo.buildNumber}
            </Caption>
            <Caption style={styles.appInfoText}>
              Environnement: {systemInfo.environment}
            </Caption>
            <Caption style={styles.appInfoText}>
              © 2024 Yu Card. Tous droits réservés.
            </Caption>
          </View>

          {/* Bottom padding */}
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

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },

  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },

  header: {
    paddingVertical: Spacing.xl,
  },

  headerTitle: {
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  headerSubtitle: {
    color: Colors.text.secondary,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },

  sectionCard: {
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  sectionDivider: {
    backgroundColor: Colors.border.primary,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 60,
  },

  menuItemPressed: {
    backgroundColor: Colors.background.secondary,
  },

  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.tertiary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  menuIconDanger: {
    backgroundColor: Colors.error + '20',
  },

  menuText: {
    flex: 1,
  },

  menuTitle: {
    fontWeight: '600',
    marginBottom: 2,
    color: Colors.text.primary,
  },

  menuTitleDanger: {
    color: Colors.error,
  },

  menuSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },

  menuItemRight: {
    marginLeft: Spacing.md,
  },

  clientViewCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.background.card,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },

  clientViewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  clientViewButtonPressed: {
    opacity: 0.7,
  },

  clientViewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  clientViewIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  clientViewText: {
    flex: 1,
  },

  clientViewTitle: {
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 2,
  },

  clientViewSubtitle: {
    fontSize: 12,
    color: Colors.text.secondary,
  },

  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },

  appInfoText: {
    fontSize: 11,
    marginBottom: 2,
    textAlign: 'center',
    color: Colors.text.secondary,
  },

  bottomPadding: {
    height: 120,
  },
})