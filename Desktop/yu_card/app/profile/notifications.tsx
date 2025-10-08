import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Swipeable from 'react-native-gesture-handler/Swipeable';

import { Button } from '@/components/ui/Buttons/Button';
import { Card } from '@/components/ui/Layout/Card';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import userNotificationsService, { UserNotification } from '@/services/userNotificationsService';

export default function NotificationsScreen() {
  const { t } = useTranslation();

  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
        setPage(1);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const response = await userNotificationsService.getNotifications({
        page: refresh ? 1 : page,
        limit: 20,
      });

      // Verify response structure
      if (!response.data || !Array.isArray(response.data.items)) {
        console.error('Invalid response structure:', response);
        throw new Error('Format de réponse invalide');
      }

      if (refresh) {
        setNotifications(response.data.items || []);
      } else {
        setNotifications(response.data.items || []);
      }

      setHasMore(response.data.pagination?.hasNext || false);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setError(err.message || 'Impossible de charger les notifications');
      setNotifications([]); // Ensure notifications is always an array
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = page + 1;

      const response = await userNotificationsService.getNotifications({
        page: nextPage,
        limit: 20,
      });

      if (response.data && Array.isArray(response.data.items)) {
        setNotifications(prev => [...prev, ...response.data.items]);
        setPage(nextPage);
        setHasMore(response.data.pagination?.hasNext || false);
      }
    } catch (err: any) {
      console.error('Failed to load more notifications:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleNotificationPress = async (notification: UserNotification) => {
    try {
      // Mark as read if not already
      if (!notification.isRead) {
        await userNotificationsService.markAsRead(notification.id);
        // Update local state
        setNotifications(prev =>
          prev.map(n => (n.id === notification.id ? { ...n, isRead: true } : n))
        );
      }

      // Navigate to order if notification has orderId
      if (userNotificationsService.hasOrderLink(notification)) {
        const orderId = userNotificationsService.getOrderId(notification);
        if (orderId) {
          router.push(`/order/${orderId}`);
        }
      }
    } catch (err: any) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await userNotificationsService.markAllAsRead();
      // Update all notifications to read
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      Alert.alert(
        t('notifications.success') || 'Succès',
        t('notifications.all_marked_read') || 'Toutes les notifications ont été marquées comme lues'
      );
    } catch (err: any) {
      console.error('Failed to mark all as read:', err);
      Alert.alert(
        t('common.error') || 'Erreur',
        t('notifications.mark_all_error') || 'Impossible de marquer toutes les notifications comme lues'
      );
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      await userNotificationsService.deleteNotification(notificationId);
      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err: any) {
      console.error('Failed to delete notification:', err);
      Alert.alert(
        t('common.error') || 'Erreur',
        t('notifications.delete_error') || 'Impossible de supprimer la notification'
      );
    }
  };

  const renderRightActions = (notificationId: string) => {
    return (
      <Pressable
        style={styles.deleteButton}
        onPress={() => {
          Alert.alert(
            t('notifications.delete_title') || 'Supprimer',
            t('notifications.delete_message') || 'Voulez-vous supprimer cette notification ?',
            [
              { text: t('common.cancel') || 'Annuler', style: 'cancel' },
              {
                text: t('common.delete') || 'Supprimer',
                style: 'destructive',
                onPress: () => handleDelete(notificationId),
              },
            ]
          );
        }}
      >
        <Ionicons name="trash-outline" size={24} color={Colors.white} />
      </Pressable>
    );
  };

  const renderNotification = ({ item }: { item: UserNotification }) => {
    const icon = userNotificationsService.getNotificationTypeIcon(item.type);
    const color = userNotificationsService.getNotificationTypeColor(item.type);

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <Pressable
          onPress={() => handleNotificationPress(item)}
          style={({ pressed }) => [
            styles.notificationCard,
            !item.isRead && styles.unreadCard,
            pressed && styles.pressedCard,
          ]}
        >
          <View style={styles.notificationContent}>
            <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
              <Ionicons name={icon as any} size={24} color={color} />
            </View>

            <View style={styles.textContent}>
              <View style={styles.titleRow}>
                <Paragraph weight="medium" style={styles.title} numberOfLines={1}>
                  {item.title}
                </Paragraph>
                {!item.isRead && <View style={styles.unreadDot} />}
              </View>

              <Paragraph size="small" color="secondary" numberOfLines={2} style={styles.message}>
                {item.message}
              </Paragraph>

              <Caption color="secondary" style={styles.date}>
                {formatDate(item.createdAt)}
              </Caption>
            </View>

            {userNotificationsService.hasOrderLink(item) && (
              <Ionicons name="chevron-forward" size={20} color={Colors.text.secondary} />
            )}
          </View>
        </Pressable>
      </Swipeable>
    );
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('notifications.just_now') || 'À l\'instant';
    if (diffMins < 60) return `${diffMins} ${t('notifications.minutes_ago') || 'min'}`;
    if (diffHours < 24) return `${diffHours} ${t('notifications.hours_ago') || 'h'}`;
    if (diffDays < 7) return `${diffDays} ${t('notifications.days_ago') || 'j'}`;

    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="notifications-off-outline" size={64} color={Colors.gray[400]} />
        <Title level={4} style={styles.emptyTitle}>
          {t('notifications.empty_title') || 'Aucune notification'}
        </Title>
        <Paragraph color="secondary" style={styles.emptyText}>
          {t('notifications.empty_message') || 'Vous n\'avez aucune notification pour le moment'}
        </Paragraph>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  if (error && !isRefreshing && (!notifications || notifications.length === 0)) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>{t('notifications.title') || 'Notifications'}</Title>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color={Colors.error} />
          <Title level={4} style={styles.errorTitle}>
            {t('notifications.error_title') || 'Erreur de chargement'}
          </Title>
          <Paragraph color="secondary" style={styles.errorText}>
            {error}
          </Paragraph>
          <Button onPress={() => loadNotifications()} style={styles.retryButton}>
            {t('common.retry') || 'Réessayer'}
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Title level={4}>{t('notifications.title') || 'Notifications'}</Title>
        <Pressable
          onPress={handleMarkAllAsRead}
          disabled={notifications.filter(n => !n.isRead).length === 0}
        >
          <Caption
            color={notifications.filter(n => !n.isRead).length > 0 ? 'primary' : 'secondary'}
            weight="medium"
          >
            {t('notifications.mark_all_read') || 'Tout lire'}
          </Caption>
        </Pressable>
      </View>

      {/* Notification List */}
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => loadNotifications(true)}
            tintColor={Colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
      />
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
    paddingHorizontal: Spacing.container.horizontal,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  backButton: {
    padding: Spacing.sm,
    marginLeft: -Spacing.sm,
  },

  listContent: {
    paddingHorizontal: Spacing.container.horizontal,
    paddingTop: Spacing.md,
    paddingBottom: Spacing['2xl'],
  },

  notificationCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },

  unreadCard: {
    backgroundColor: Colors.primary + '08',
  },

  pressedCard: {
    opacity: 0.7,
  },

  notificationContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },

  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContent: {
    flex: 1,
    gap: Spacing.xs,
  },

  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  title: {
    flex: 1,
  },

  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },

  message: {
    lineHeight: 18,
  },

  date: {
    marginTop: 2,
  },

  deleteButton: {
    backgroundColor: Colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    marginBottom: Spacing.md,
    borderTopRightRadius: BorderRadius.md,
    borderBottomRightRadius: BorderRadius.md,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
  },

  emptyTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  emptyText: {
    textAlign: 'center',
    maxWidth: 300,
  },

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.lg,
  },

  errorTitle: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  errorText: {
    textAlign: 'center',
    maxWidth: 300,
    marginBottom: Spacing.lg,
  },

  retryButton: {
    minWidth: 120,
  },

  footerLoader: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
