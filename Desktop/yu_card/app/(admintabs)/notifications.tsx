import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { FlatList, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationFiltersBar } from '@/components/admin/notifications/filters/NotificationFiltersBar';
import { NotificationHistoryCard } from '@/components/admin/notifications/history/NotificationHistoryCard';
import { CreateNotificationModal } from '@/components/admin/notifications/modals/CreateNotificationModal';
import { UserSelectorModal } from '@/components/admin/notifications/modals/UserSelectorModal';
import { NotificationStatsGrid } from '@/components/admin/notifications/stats/NotificationStatsGrid';
import { FloatingActionButton } from '@/components/ui/Buttons/FloatingActionButton';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { LoadingSpinner } from '@/components/ui/Layout/LoadingSpinner';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { useNotificationForm } from '@/hooks/admin/useNotificationForm';
import { useNotifications } from '@/hooks/admin/useNotifications';
import { useNotificationStats } from '@/hooks/admin/useNotificationStats';
import { useUserSelection } from '@/hooks/admin/useUserSelection';
import { NotificationChannel, NotificationTypeAdmin } from '@/types/adminNotifications';

export default function AdminNotificationsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.admin.dark : Colors.admin.light;

  // États des filtres
  const [selectedType, setSelectedType] = useState<NotificationTypeAdmin | 'all'>('all');
  const [selectedChannel, setSelectedChannel] = useState<NotificationChannel | 'all'>('all');

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUserSelectorModal, setShowUserSelectorModal] = useState(false);

  // Custom hooks
  const { stats } = useNotificationStats();
  const {
    loading,
    refreshing,
    history,
    hasMoreData,
    apiError,
    searchQuery,
    setSearchQuery,
    onRefresh,
    loadMoreHistory,
  } = useNotifications(selectedType, selectedChannel);

  const { formData, sendMode, creating, updateFormData, setSendMode, resetForm, handleSendNotification } =
    useNotificationForm(() => {
      setShowCreateModal(false);
      onRefresh();
    });

  const {
    availableUsers,
    selectedUserIds,
    userSearchQuery,
    setUserSearchQuery,
    loadAvailableUsers,
    toggleUserSelection,
    clearSelection,
    setSelectedUserIds,
  } = useUserSelection();

  // Gestion de l'ouverture du sélecteur d'utilisateurs
  const handleOpenUserSelector = () => {
    setSelectedUserIds(formData.userIds);
    setShowUserSelectorModal(true);
    loadAvailableUsers();
  };

  // Confirmation de la sélection d'utilisateurs
  const handleConfirmUserSelection = () => {
    updateFormData({ userIds: selectedUserIds });
    setShowUserSelectorModal(false);
  };

  // Annulation de la sélection
  const handleCancelUserSelection = () => {
    clearSelection();
    setShowUserSelectorModal(false);
  };

  // Ouverture de la modal de création
  const handleOpenCreateModal = () => {
    resetForm();
    setShowCreateModal(true);
  };

  // Render du header de la FlatList
  const renderHeader = () => (
    <>
      {/* Header moderne avec gradient */}
      <View style={[styles.header, { backgroundColor: theme.background.card }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={[styles.headerIconContainer, { backgroundColor: Colors.primary + '15' }]}>
              <Ionicons name="notifications" size={24} color={Colors.primary} />
            </View>
            <View>
              <Title level={2} style={[styles.headerTitle, { color: theme.text.primary }]}>
                Notifications
              </Title>
              <Caption style={[styles.headerSubtitle, { color: theme.text.secondary }]}>
                Gérez vos communications
              </Caption>
            </View>
          </View>
          <View style={[styles.countBadge, { backgroundColor: Colors.primary }]}>
            <Caption style={styles.countText}>{history.length}</Caption>
          </View>
        </View>
      </View>

      {/* Statistiques */}
      <View style={styles.contentContainer}>
        <NotificationStatsGrid stats={stats} />

        {/* Filtres */}
        <View style={styles.filtersSection}>
          <Caption style={[styles.sectionLabel, { color: theme.text.tertiary }]}>
            FILTRER PAR TYPE
          </Caption>
          <NotificationFiltersBar
            searchQuery={searchQuery}
            selectedType={selectedType}
            selectedChannel={selectedChannel}
            onSearchChange={setSearchQuery}
            onTypeChange={setSelectedType}
            onChannelChange={setSelectedChannel}
          />
        </View>
      </View>
    </>
  );

  // Render d'un item de la liste
  const renderItem = ({ item }: { item: any }) => (
    <View style={styles.contentContainer}>
      <NotificationHistoryCard item={item} />
    </View>
  );

  // Render de l'état vide
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.contentContainer}>
        <EmptyState
          title={apiError ? 'API non disponible' : 'Aucune notification'}
          description={
            apiError
              ? 'Les endpoints de notifications ne sont pas encore implémentés'
              : 'Aucune notification trouvée'
          }
          icon="notifications-outline"
        />
      </View>
    );
  };

  // Render du footer (loading more)
  const renderFooter = () => {
    if (!hasMoreData || loading) return <View style={styles.footerPadding} />;
    return (
      <View style={[styles.loadingMore, styles.contentContainer]}>
        <LoadingSpinner size="small" color={Colors.primary} />
      </View>
    );
  };

  // Loading state initial
  if (loading && history.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" color={Colors.primary} />
          <Paragraph style={[styles.loadingText, { color: theme.text.secondary }]}>
            Chargement...
          </Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshing={refreshing}
        onRefresh={onRefresh}
        onEndReached={loadMoreHistory}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />

      {/* Bouton flottant */}
      <View style={styles.fabContainer}>
        <FloatingActionButton icon="add" onPress={handleOpenCreateModal} />
      </View>

      {/* Modal de création */}
      <CreateNotificationModal
        visible={showCreateModal}
        formData={formData}
        sendMode={sendMode}
        creating={creating}
        onClose={() => setShowCreateModal(false)}
        onFormChange={updateFormData}
        onModeChange={setSendMode}
        onSend={handleSendNotification}
        onOpenUserSelector={handleOpenUserSelector}
      />

      {/* Modal de sélection des utilisateurs */}
      <UserSelectorModal
        visible={showUserSelectorModal}
        availableUsers={availableUsers}
        selectedUserIds={selectedUserIds}
        userSearchQuery={userSearchQuery}
        onSearchChange={setUserSearchQuery}
        onToggleUser={toggleUserSelection}
        onConfirm={handleConfirmUserSelection}
        onCancel={handleCancelUserSelection}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  loadingText: {
    marginTop: Spacing.lg,
  },
  listContent: {
    flexGrow: 1,
  },
  header: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  headerIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'Ubuntu_700Bold',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Ubuntu_400Regular',
  },
  countBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    minWidth: 44,
    alignItems: 'center',
  },
  countText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700',
    fontFamily: 'Ubuntu_700Bold',
  },
  contentContainer: {
    paddingHorizontal: Spacing.lg,
  },
  filtersSection: {
    marginBottom: Spacing.md,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
    marginBottom: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  footerPadding: {
    height: 100,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    zIndex: 1000,
  },
});
