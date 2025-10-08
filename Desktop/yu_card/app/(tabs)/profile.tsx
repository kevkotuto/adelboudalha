import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Pressable,
  FlatList,
  StyleSheet,
  Switch,
  View,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';

import { Button } from '@/components/ui/Buttons/Button';
import { Card } from '@/components/ui/Layout/Card';
import { Container } from '@/components/ui/Layout/Container';
import { Divider } from '@/components/ui/Layout/Divider';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { ImageUploadButton } from '@/components/ui/Inputs/ImageUploadButton';
import { Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { useAuthStore } from '@/stores/authStore';
import { router } from 'expo-router';
import userService from '@/services/userService';
import { buildImageUrl } from '@/services/config';
import { UserAddress } from '@/types';
import { NotificationUtils } from '@/utils/notifications';
import { UpdateService, UpdateInfo } from '@/services/updateService';
import { UpdateModal } from '@/components/UpdateModal';
import userNotificationsService from '@/services/userNotificationsService';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { user, logout, isLoading, updateUser } = useAuthStore();

  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notificationsEnabled || false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(user?.preferences?.pushNotifications || false);
  const [newsletterEnabled, setNewsletterEnabled] = useState(user?.preferences?.newsletterEnabled || false);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [userAddresses, setUserAddresses] = useState<UserAddress[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Check if user is authenticated, redirect if not
  useEffect(() => {
    if (!user && !isLoading) {
      router.replace('/auth/login');
    }
  }, [user, isLoading]);

  // Load user data when screen becomes focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        loadUserData();
        loadUnreadNotificationsCount();
      }
    }, [user?.id])
  );

  // Update local states when user changes
  useEffect(() => {
    if (user?.preferences) {
      setNotificationsEnabled(user.preferences.notificationsEnabled);
      setPushNotificationsEnabled(user.preferences.pushNotifications);
      setNewsletterEnabled(user.preferences.newsletterEnabled);
    }
  }, [user?.preferences]);

  const loadUserData = async () => {
    if (!user) return;

    try {
      setIsLoadingProfile(true);
      setProfileError(null);

      // Load profile and addresses in parallel
      const [profile, addresses] = await Promise.all([
        userService.getProfile(),
        userService.getAddresses().catch(() => [] as UserAddress[]), // Fallback to empty array if addresses fail
      ]);

      // Update auth store with fresh data
      updateUser(profile);
      setUserAddresses(addresses);
    } catch (error: any) {
      console.error('Failed to load user data:', error);
      setProfileError(error.message || 'Impossible de charger le profil');
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const loadUnreadNotificationsCount = async () => {
    try {
      const count = await userNotificationsService.getUnreadCount();
      setUnreadNotificationsCount(count);
    } catch (error) {
      console.error('Failed to load unread notifications count:', error);
      // Silently fail - not critical
    }
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout.title') || 'Déconnexion',
      t('profile.logout.message') || 'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: t('common.cancel') || 'Annuler',
          style: 'cancel',
        },
        {
          text: t('profile.logout.confirm') || 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  // Handle pull-to-refresh (reload user data)
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  };

  // Handle notification preference toggle
  const handleNotificationToggle = async (value: boolean) => {
    const previousValue = notificationsEnabled;
    setNotificationsEnabled(value);

    try {
      await userService.updatePreferences({ notificationsEnabled: value });
      console.log('Notifications preference updated:', value);
    } catch (error) {
      console.error('Failed to update notification preference:', error);
      // Rollback on error
      setNotificationsEnabled(previousValue);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour vos préférences. Veuillez réessayer.'
      );
    }
  };

  // Handle push notification preference toggle
  const handlePushNotificationToggle = async (value: boolean) => {
    const previousValue = pushNotificationsEnabled;
    setPushNotificationsEnabled(value);

    try {
      if (value) {
        // Request permission and get token
        const granted = await NotificationUtils.requestPermissions();

        if (!granted) {
          // User denied permission, revert toggle
          setPushNotificationsEnabled(false);
          Alert.alert(
            t('profile.notifications.permission_denied_title') || 'Permission refusée',
            t('profile.notifications.permission_denied_message') || 'Vous devez autoriser les notifications dans les paramètres de votre appareil.'
          );
          return;
        }

        // Get and register token
        const token = await NotificationUtils.requestAndStorePushToken();
        if (token) {
          // Sync with backend
          await NotificationUtils.syncPushTokenWithAPI();
          console.log('✅ Push notifications enabled and token registered');
        }
      } else {
        // Clear stored token locally (backend keeps it for re-activation)
        await NotificationUtils.clearStoredPushToken();
        console.log('⚠️ Push notifications disabled locally');
      }

      // Update preference on backend
      await userService.updatePreferences({ pushNotifications: value });
      console.log('Push notification preference updated:', value);
    } catch (error) {
      console.error('Failed to update push notification preference:', error);
      // Rollback on error
      setPushNotificationsEnabled(previousValue);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour vos préférences de notifications. Veuillez réessayer.'
      );
    }
  };

  // Handle newsletter preference toggle
  const handleNewsletterToggle = async (value: boolean) => {
    const previousValue = newsletterEnabled;
    setNewsletterEnabled(value);

    try {
      await userService.updatePreferences({ newsletterEnabled: value });
      console.log('Newsletter preference updated:', value);
    } catch (error) {
      console.error('Failed to update newsletter preference:', error);
      // Rollback on error
      setNewsletterEnabled(previousValue);
      Alert.alert(
        'Erreur',
        'Impossible de mettre à jour vos préférences. Veuillez réessayer.'
      );
    }
  };

  // Handle avatar upload
  const handleAvatarUploadComplete = async (url: string) => {
    setUploadingAvatar(false);
    console.log('✅ Avatar uploaded successfully:', url);

    // Note: /users/avatar met déjà à jour le profil côté backend
    // On met juste à jour le store local pour synchronisation
    updateUser({ avatarUrl: url });
    Alert.alert('Succès', 'Photo de profil mise à jour avec succès');

    // Optional: Refresh profile pour garantir synchronisation totale
    try {
      const freshProfile = await userService.getProfile();
      updateUser(freshProfile);
    } catch (error) {
      console.warn('Could not refresh profile after avatar upload:', error);
      // Non critique, l'avatar est déjà enregistré
    }
  };

  const handleAvatarUploadStart = () => {
    setUploadingAvatar(true);
    console.log('📤 Starting avatar upload...');
  };

  const handleAvatarUploadError = (error: string) => {
    setUploadingAvatar(false);
    console.error('❌ Avatar upload error:', error);
  };

  // Handle manual update check
  const handleCheckForUpdates = async () => {
    setCheckingUpdate(true);

    try {
      const info = await UpdateService.checkForUpdate();

      if (info.isUpdateAvailable) {
        console.log('✅ Update available:', info.updateId);
        setUpdateInfo(info);
        setIsUpdateModalVisible(true);
      } else {
        console.log('✅ App is up to date');
        Alert.alert(
          t('update.no_update_available') || 'Aucune mise à jour',
          t('update.app_up_to_date') || 'Votre application est à jour'
        );
      }
    } catch (error) {
      console.error('❌ Error checking for updates:', error);
      Alert.alert(
        t('common.error') || 'Erreur',
        'Impossible de vérifier les mises à jour. Veuillez réessayer.'
      );
    } finally {
      setCheckingUpdate(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await UpdateService.downloadAndInstallUpdate();
    } catch (error) {
      console.error('❌ Error downloading update:', error);
      setIsUpdateModalVisible(false);
      Alert.alert(
        t('common.error') || 'Erreur',
        'Impossible de télécharger la mise à jour. Veuillez réessayer.'
      );
    }
  };

  const handleUpdateLater = () => {
    setIsUpdateModalVisible(false);
  };

  interface MenuItemProps {
    onPress: () => void;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    showArrow?: boolean;
    showSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (value: boolean) => void;
    danger?: boolean;
    badge?: number;
  }

  const MenuItem = ({
    onPress,
    icon,
    title,
    subtitle,
    showArrow = true,
    showSwitch = false,
    switchValue = false,
    onSwitchChange,
    danger = false,
    badge
  }: MenuItemProps) => (
    <Pressable
      style={({ pressed }) => [
        styles.menuItem,
        pressed && styles.menuItemPressed,
      ]}
      onPress={onPress}
      disabled={showSwitch}
    >
      <View style={styles.menuItemLeft}>
        <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
          <Ionicons
            name={icon}
            size={20}
            color={danger ? Colors.error : Colors.text.secondary}
          />
        </View>
        <View style={styles.menuText}>
          <View style={styles.titleRow}>
            <Paragraph
              style={danger ? [styles.menuTitle, styles.menuTitleDanger] : styles.menuTitle}
            >
              {title}
            </Paragraph>
            {badge !== undefined && badge > 0 && (
              <View style={styles.badge}>
                <Caption style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Caption>
              </View>
            )}
          </View>
          {subtitle && (
            <Caption color="secondary" style={styles.menuSubtitle}>
              {subtitle}
            </Caption>
          )}
        </View>
      </View>
      <View style={styles.menuItemRight}>
        {showSwitch && onSwitchChange && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: Colors.gray[300], true: Colors.primary }}
            thumbColor={switchValue ? Colors.white : Colors.gray[500]}
          />
        )}
        {showArrow && !showSwitch && (
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.text.secondary}
          />
        )}
      </View>
    </Pressable>
  );


  // Show loading spinner on initial load
  if (isLoadingProfile && !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Container>
          <View style={styles.loadingContainer}>
            <LoadingSpinner size="large" color={Colors.primary} />
            <Paragraph style={styles.loadingText}>
              Chargement du profil...
            </Paragraph>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  // Show error state if profile failed to load and no user data
  if (profileError && !user) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Container>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
            <Title level={4} style={styles.errorTitle}>
              Erreur de chargement
            </Title>
            <Paragraph style={styles.errorText}>{profileError}</Paragraph>
            <Button onPress={loadUserData} style={styles.retryButton}>
              Réessayer
            </Button>
          </View>
        </Container>
      </SafeAreaView>
    );
  }

  // Don't render if no user (will redirect to login)
  if (!user) {
    return null;
  }

  // Get default address or first address
  const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Container>
        <FlatList
          data={[]}
          renderItem={() => null}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          ListHeaderComponent={
            <>
              {/* Header */}
              <View style={styles.header}>
                <Title level={2}>{t('profile.title') || 'Profil'}</Title>
              </View>

          {/* User Info Card */}
          <Card style={styles.userCard}>
            <View style={styles.userInfo}>
              <Pressable
                style={styles.avatarContainer}
                onPress={() => router.push('/profile/edit')}
              >
                {user.avatarUrl ? (
                  <View style={styles.avatarWithUpload}>
                    <Image
                      source={{ uri: buildImageUrl(user.avatarUrl) }}
                      style={styles.avatarImage}
                    />
                    <View style={styles.photoBadge}>
                      <Ionicons name="camera" size={16} color={Colors.white} />
                    </View>
                  </View>
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <View style={styles.avatar}>
                      <Ionicons name="person" size={40} color={Colors.white} />
                    </View>
                    <View style={styles.photoBadge}>
                      <Ionicons name="camera" size={16} color={Colors.white} />
                    </View>
                  </View>
                )}
              </Pressable>
              <View style={styles.userDetails}>
                <Title level={5}>{user.fullName}</Title>
                <Caption color="secondary">{user.phone}</Caption>
                {user.email && (
                  <Caption color="secondary" style={{ marginTop: 2 }}>
                    {user.email}
                  </Caption>
                )}
                {uploadingAvatar && (
                  <Caption color="secondary" style={{ marginTop: 4, fontStyle: 'italic' }}>
                    Upload en cours...
                  </Caption>
                )}
              </View>
            </View>
            <Button
              variant="outline"
              size="sm"
              onPress={() => {
                router.push('/profile/edit');
              }}
            >
              {t('profile.edit_profile') || 'Modifier le profil'}
            </Button>
          </Card>

          {/* Personal Information */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              {t('profile.personal_info')}
            </Title>
            <Card>
              <MenuItem
                icon="person-outline"
                title={t('profile.name') || 'Nom'}
                subtitle={user.fullName}
                onPress={() => {
                  router.push('/profile/edit');
                }}
              />
              <Divider />
              <MenuItem
                icon="mail-outline"
                title={t('profile.email') || 'Email'}
                subtitle={user.email || 'Non renseigné'}
                onPress={() => {
                  router.push('/profile/edit');
                }}
              />
              <Divider />
              <MenuItem
                icon="call-outline"
                title={t('profile.phone') || 'Téléphone'}
                subtitle={user.phone}
                onPress={() => {
                  router.push('/profile/edit');
                }}
              />
              <Divider />
              <MenuItem
                icon="location-outline"
                title={t('profile.address') || 'Adresse'}
                subtitle={
                  defaultAddress
                    ? `${defaultAddress.city}, ${defaultAddress.addressLine1}`
                    : 'Non renseignée'
                }
                onPress={() => {
                  router.push('/profile/addresses');
                }}
              />
            </Card>
          </View>

          {/* Preferences */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              {t('profile.preferences')}
            </Title>
            <Card>
              <MenuItem
                icon="language-outline"
                title={t('profile.language') || 'Langue'}
                subtitle="Français"
                onPress={() => {
                  router.push('/profile/language');
                }}
              />
              <Divider />
              <MenuItem
                icon="notifications-outline"
                title={t('profile.notifications_label') || 'Notifications'}
                showSwitch={true}
                switchValue={notificationsEnabled}
                onSwitchChange={handleNotificationToggle}
                showArrow={false}
                onPress={() => {}}
              />
              <Divider />
              <MenuItem
                icon="phone-portrait-outline"
                title={t('profile.push_notifications') || 'Notifications push'}
                subtitle={t('profile.push_notifications_subtitle') || 'Recevoir des alertes sur votre appareil'}
                showSwitch={true}
                switchValue={pushNotificationsEnabled}
                onSwitchChange={handlePushNotificationToggle}
                showArrow={false}
                onPress={() => {}}
              />
              <Divider />
              <MenuItem
                icon="mail-outline"
                title={t('profile.newsletter') || 'Newsletter'}
                showSwitch={true}
                switchValue={newsletterEnabled}
                onSwitchChange={handleNewsletterToggle}
                showArrow={false}
                onPress={() => {}}
              />
            </Card>
          </View>

          {/* Account */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              {t('profile.account')}
            </Title>
            <Card>
              <MenuItem
                icon="notifications-outline"
                title={t('notifications.title') || 'Notifications'}
                subtitle={
                  unreadNotificationsCount > 0
                    ? `${unreadNotificationsCount} ${t('notifications.unread') || 'non lue(s)'}`
                    : undefined
                }
                badge={unreadNotificationsCount}
                onPress={() => {
                  router.push('/profile/notifications');
                }}
              />
              <Divider />
              <MenuItem
                icon="key-outline"
                title={t('profile.change_password') || 'Changer le mot de passe'}
                onPress={() => {
                  router.push('/profile/change-password');
                }}
              />
              <Divider />
              <MenuItem
                icon="cloud-download-outline"
                title={t('update.check_updates') || 'Vérifier les mises à jour'}
                subtitle={checkingUpdate ? 'Vérification en cours...' : undefined}
                onPress={handleCheckForUpdates}
              />
              {/* Admin Access - Only show for admin users */}
              {user.role === 'ADMIN' && (
                <>
                  <Divider />
                  <MenuItem
                    icon="shield-outline"
                    title="Accéder à l'admin"
                    subtitle="Panneau d'administration"
                    onPress={() => {
                      router.push('/(admintabs)/');
                    }}
                  />
                </>
              )}
              <Divider />
              <MenuItem
                icon="help-circle-outline"
                title="Aide et support"
                onPress={() => {
                  router.push('/profile/help');
                }}
              />
              <Divider />
              <MenuItem
                icon="document-text-outline"
                title="Conditions d'utilisation"
                onPress={() => {
                  router.push('/profile/terms');
                }}
              />
              <Divider />
              <MenuItem
                icon="shield-checkmark-outline"
                title="Politique de confidentialité"
                onPress={() => {
                  router.push('/profile/privacy');
                }}
              />
            </Card>
          </View>

          {/* Logout */}
          <View style={styles.section}>
            <Card>
              <MenuItem
                icon="log-out-outline"
                title={t('auth.logout')}
                onPress={handleLogout}
                showArrow={false}
                danger={true}
              />
            </Card>
            <Card>
              <MenuItem
                icon="trash-outline"
                title="Supprimer le compte"
                onPress={() => {
                  router.push('/profile/delete-account');
                }}
                showArrow={false}
                danger={true}
              />
            </Card>
          </View>

          {/* App Info */}
          <View style={styles.appInfo}>
            <Caption color="secondary" style={styles.appVersion}>
              Yu Card v1.0.0
            </Caption>
          </View>

              {/* Bottom padding */}
              <View style={styles.bottomPadding} />
            </>
          }
        />

        {/* Update Modal */}
        {updateInfo && (
          <UpdateModal
            visible={isUpdateModalVisible}
            updateInfo={updateInfo}
            onUpdate={handleUpdate}
            onClose={handleUpdateLater}
          />
        )}
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
    paddingVertical: Spacing.md,
  },

  userCard: {
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  avatarContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },

  avatarPlaceholder: {
    position: 'relative',
    width: 80,
    height: 80,
  },

  avatarWithUpload: {
    position: 'relative',
    width: 80,
    height: 80,
  },

  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },

  photoBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  userDetails: {
    flex: 1,
  },

  section: {
    marginBottom: Spacing.md,
  },

  sectionTitle: {
    marginBottom: Spacing.sm,
    color: Colors.text.primary,
  },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },

  menuIconDanger: {
    backgroundColor: Colors.error + '20',
  },

  menuText: {
    flex: 1,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  menuTitle: {
    fontWeight: '600',
    marginBottom: 2,
  },

  menuTitleDanger: {
    color: Colors.error,
  },

  badge: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },

  badgeText: {
    color: Colors.white,
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 20,
  },

  menuSubtitle: {
    fontSize: 12,
  },

  menuItemRight: {
    marginLeft: Spacing.md,
  },

  appInfo: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },

  appVersion: {
    fontSize: 12,
  },

  bottomPadding: {
    height: Spacing.xl,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
  },

  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl * 2,
    paddingHorizontal: Spacing.lg,
  },

  errorTitle: {
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    color: Colors.text.primary,
    textAlign: 'center',
  },

  errorText: {
    marginBottom: Spacing.lg,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  retryButton: {
    minWidth: 120,
  },
});