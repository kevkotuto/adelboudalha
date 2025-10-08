/**
 * Admin Users - Gestion des utilisateurs
 * Interface moderne en light mode connectée au backend Yu Card
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { NumberInput } from '@/components/ui/Inputs/NumberInput';
import { SearchInput } from '@/components/ui/Inputs/SearchInput';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { adminUsersService } from '@/services/adminUsersService';
import type { AdminUser, UserRole, UserStatus } from '@/types/admin';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type UserStatusFilter = 'all' | UserStatus;

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<UserStatusFilter>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [walletAmount, setWalletAmount] = useState('');
  const [walletAction, setWalletAction] = useState<'credit' | 'debit'>('credit');
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const statusFilters: { key: UserStatusFilter; label: string; color: string }[] = [
    { key: 'all', label: 'Tous', color: Colors.text.secondary },
    { key: 'ACTIVE', label: 'Actifs', color: '#4CAF50' },
    { key: 'SUSPENDED', label: 'Suspendus', color: '#f44336' },
  ];

  const loadUsers = useCallback(async (page: number = 1, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      }

      const params: any = {
        page,
        limit: 20,
      };

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }

      const response = await adminUsersService.getAllUsers(params);
      const usersData = response.data || [];

      if (reset || page === 1) {
        setUsers(usersData);
      } else {
        setUsers(prev => [...prev, ...usersData]);
      }

      setHasMoreData(usersData.length === 20);
      setCurrentPage(page);
    } catch (error) {
      console.error('[Users] Error loading users:', error);
      Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedStatus, searchQuery]);

  useEffect(() => {
    loadUsers(1, true);
  }, [selectedStatus, searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCurrentPage(1);
    loadUsers(1, true);
  }, [loadUsers]);

  const loadMoreUsers = useCallback(() => {
    if (hasMoreData && !loading) {
      loadUsers(currentPage + 1);
    }
  }, [hasMoreData, loading, currentPage, loadUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      if (selectedStatus !== 'all' && user.status !== selectedStatus) {
        return false;
      }

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          user.fullName.toLowerCase().includes(query) ||
          user.email?.toLowerCase().includes(query) ||
          user.phone.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [users, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.status === 'ACTIVE').length;
    const suspendedUsers = users.filter(u => u.status === 'SUSPENDED').length;
    const clientUsers = users.filter(u => u.role === 'CLIENT').length;
    const adminUsers = users.filter(u => u.role === 'ADMIN').length;

    return {
      totalUsers,
      activeUsers,
      suspendedUsers,
      clientUsers,
      adminUsers,
    };
  }, [users]);

  const handleUpdateUserStatus = async (userId: string, newStatus: UserStatus) => {
    try {
      await adminUsersService.updateUserStatus(userId, { status: newStatus });

      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, status: newStatus } : user
        )
      );

      if (selectedUser?.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
      }

      Alert.alert('Succès', 'Statut utilisateur mis à jour');
    } catch (error) {
      console.error('[Users] Error updating status:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le statut');
    }
  };

  const handleWalletAdjustment = async () => {
    if (!selectedUser || !walletAmount || parseFloat(walletAmount) <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }

    try {
      const amount = parseFloat(walletAmount);

      await adminUsersService.adjustWalletBalance({
        userId: selectedUser.id,
        amount: walletAction === 'debit' ? -amount : amount,
        reason: walletAction === 'credit' ? 'Crédit manuel' : 'Débit manuel',
      });

      Alert.alert('Succès', 'Portefeuille mis à jour');
      setShowWalletModal(false);
      setWalletAmount('');
      loadUsers(1, true);
    } catch (error) {
      console.error('[Users] Error adjusting wallet:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour le portefeuille');
    }
  };

  const confirmStatusUpdate = (userId: string, userName: string, currentStatus: UserStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const action = newStatus === 'SUSPENDED' ? 'suspendre' : 'activer';

    Alert.alert(
      'Confirmer',
      `Voulez-vous ${action} l'utilisateur "${userName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          onPress: () => handleUpdateUserStatus(userId, newStatus),
        },
      ]
    );
  };

  const getStatusColor = (status: UserStatus): string => {
    return status === 'ACTIVE' ? '#4CAF50' : '#f44336';
  };

  const getRoleLabel = (role: UserRole): string => {
    switch (role) {
      case 'ADMIN': return 'Admin';
      case 'CLIENT': return 'Client';
      default: return role;
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number): string => {
    return `${amount.toLocaleString('fr-FR')} FCFA`;
  };

  const UserCard = ({ user }: { user: AdminUser }) => {
    return (
      <Pressable
        style={styles.userCard}
        onPress={() => {
          setSelectedUser(user);
          setShowDetailsModal(true);
        }}
      >
        <View style={styles.userHeader}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={24} color={Colors.white} />
          </View>
          <View style={styles.userInfo}>
            <Title level={6} style={styles.userName}>
              {user.fullName}
            </Title>
            <Caption style={styles.userPhone}>{user.phone}</Caption>
            {user.email && (
              <Caption style={styles.userEmail}>{user.email}</Caption>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(user.status) }]}>
            <Caption style={styles.statusText}>
              {user.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
            </Caption>
          </View>
        </View>

        <View style={styles.userMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="shield-checkmark" size={14} color={Colors.text.secondary} />
            <Caption style={styles.metaText}>{getRoleLabel(user.role)}</Caption>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar" size={14} color={Colors.text.secondary} />
            <Caption style={styles.metaText}>{formatDate(user.createdAt)}</Caption>
          </View>
        </View>

        <View style={styles.userActions}>
          <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Paragraph style={styles.loadingText}>Chargement des utilisateurs...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          if (isCloseToBottom && hasMoreData && !loading) {
            loadMoreUsers();
          }
        }}
        scrollEventThrottle={400}
      >
        {/* Header */}
        <View style={styles.header}>
          <Title level={2} style={styles.headerTitle}>Utilisateurs</Title>
          <Paragraph color="secondary" style={styles.headerSubtitle}>
            {filteredUsers.length} utilisateur{filteredUsers.length > 1 ? 's' : ''}
          </Paragraph>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="people" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{stats.totalUsers}</Title>
              <Caption style={styles.statLabel}>Total utilisateurs</Caption>
            </LinearGradient>
          </View>

          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{stats.activeUsers}</Title>
              <Caption style={styles.statLabel}>Actifs</Caption>
            </LinearGradient>
          </View>

          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#f44336', '#d32f2f']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="ban" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{stats.suspendedUsers}</Title>
              <Caption style={styles.statLabel}>Suspendus</Caption>
            </LinearGradient>
          </View>

          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#9C27B0', '#7B1FA2']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="person" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{stats.clientUsers}</Title>
              <Caption style={styles.statLabel}>Clients</Caption>
            </LinearGradient>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Status Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusFilters.map((filter) => (
              <Pressable
                key={filter.key}
                style={[
                  styles.filterButton,
                  selectedStatus === filter.key && {
                    backgroundColor: filter.color,
                  },
                ]}
                onPress={() => setSelectedStatus(filter.key)}
              >
                <Paragraph
                  size="small"
                  style={[
                    styles.filterText,
                    selectedStatus === filter.key && styles.filterTextActive,
                  ]}
                >
                  {filter.label}
                </Paragraph>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Users List */}
        <View style={styles.usersContainer}>
          {filteredUsers.length > 0 ? (
            <>
              {filteredUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
              {hasMoreData && (
                <View style={styles.loadingMore}>
                  <LoadingSpinner size="small" />
                </View>
              )}
            </>
          ) : (
            <EmptyState
              title="Aucun utilisateur"
              description="Aucun utilisateur ne correspond à vos critères"
              icon="people-outline"
            />
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* User Details Modal */}
      <Modal
        visible={showDetailsModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Title level={3}>Détails utilisateur</Title>
            <Pressable onPress={() => setShowDetailsModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          {selectedUser && (
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* User Info */}
              <View style={styles.modalSection}>
                <View style={styles.userAvatarLarge}>
                  <Ionicons name="person" size={48} color={Colors.white} />
                </View>

                <Title level={4} style={styles.modalUserName}>
                  {selectedUser.fullName}
                </Title>

                <View style={[styles.statusBadgeLarge, { backgroundColor: getStatusColor(selectedUser.status) }]}>
                  <Caption style={styles.statusTextLarge}>
                    {selectedUser.status === 'ACTIVE' ? 'Actif' : 'Suspendu'}
                  </Caption>
                </View>
              </View>

              {/* Contact Info */}
              <View style={styles.modalSection}>
                <Title level={5} style={styles.sectionTitle}>Informations</Title>
                <View style={styles.infoRow}>
                  <Caption style={styles.infoLabel}>Téléphone</Caption>
                  <Paragraph style={styles.infoValue}>{selectedUser.phone}</Paragraph>
                </View>
                {selectedUser.email && (
                  <View style={styles.infoRow}>
                    <Caption style={styles.infoLabel}>Email</Caption>
                    <Paragraph style={styles.infoValue}>{selectedUser.email}</Paragraph>
                  </View>
                )}
                <View style={styles.infoRow}>
                  <Caption style={styles.infoLabel}>Rôle</Caption>
                  <Paragraph style={styles.infoValue}>{getRoleLabel(selectedUser.role)}</Paragraph>
                </View>
                <View style={styles.infoRow}>
                  <Caption style={styles.infoLabel}>Inscription</Caption>
                  <Paragraph style={styles.infoValue}>{formatDate(selectedUser.createdAt)}</Paragraph>
                </View>
              </View>

              {/* Actions */}
              <View style={styles.modalActions}>
                <Button
                  variant="primary"
                  onPress={() => {
                    setShowDetailsModal(false);
                    setWalletAction('credit');
                    setShowWalletModal(true);
                  }}
                  icon="add-circle"
                >
                  Créditer le portefeuille
                </Button>

                <Button
                  variant="outline"
                  onPress={() => {
                    setShowDetailsModal(false);
                    setWalletAction('debit');
                    setShowWalletModal(true);
                  }}
                  icon="remove-circle"
                >
                  Débiter le portefeuille
                </Button>

                <Button
                  variant={selectedUser.status === 'ACTIVE' ? 'outline' : 'primary'}
                  onPress={() => {
                    confirmStatusUpdate(selectedUser.id, selectedUser.fullName, selectedUser.status);
                    setShowDetailsModal(false);
                  }}
                  icon={selectedUser.status === 'ACTIVE' ? 'ban' : 'checkmark-circle'}
                >
                  {selectedUser.status === 'ACTIVE' ? 'Suspendre' : 'Activer'}
                </Button>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* Wallet Modal */}
      <Modal
        visible={showWalletModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowWalletModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Title level={3}>
              {walletAction === 'credit' ? 'Créditer' : 'Débiter'} le portefeuille
            </Title>
            <Pressable onPress={() => setShowWalletModal(false)}>
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          <View style={styles.walletModalContent}>
            {selectedUser && (
              <View style={styles.walletUserInfo}>
                <Paragraph style={styles.walletUserName}>{selectedUser.fullName}</Paragraph>
                <Caption style={styles.walletUserPhone}>{selectedUser.phone}</Caption>
              </View>
            )}

            <NumberInput
              label="Montant (FCFA)"
              value={walletAmount}
              onChangeText={setWalletAmount}
              placeholder="0"
              autoFocus
            />

            <View style={styles.walletActions}>
              <Button
                variant="outline"
                onPress={() => {
                  setShowWalletModal(false);
                  setWalletAmount('');
                }}
                style={styles.walletButton}
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                onPress={handleWalletAdjustment}
                style={styles.walletButton}
              >
                Confirmer
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
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
    paddingVertical: Spacing['2xl'],
  },

  loadingText: {
    marginTop: Spacing.md,
    color: Colors.text.secondary,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },

  headerTitle: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  headerSubtitle: {
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 14,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  statCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },

  statGradient: {
    padding: Spacing.md,
    minHeight: 110,
  },

  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  statValue: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.white,
    fontSize: 18,
    marginBottom: 2,
  },

  statLabel: {
    fontFamily: 'Ubuntu_400Regular',
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 11,
  },

  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },

  filtersContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  filterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    marginRight: Spacing.sm,
  },

  filterText: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.secondary,
  },

  filterTextActive: {
    color: Colors.white,
  },

  usersContainer: {
    paddingHorizontal: Spacing.lg,
  },

  userCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },

  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  userInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },

  userName: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: 2,
  },

  userPhone: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  userEmail: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 11,
  },

  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },

  statusText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 10,
  },

  userMeta: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },

  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  metaText: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  userActions: {
    alignItems: 'flex-end',
  },

  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },

  bottomPadding: {
    height: 120,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  modalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },

  modalSection: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    alignItems: 'center',
  },

  userAvatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  modalUserName: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },

  statusBadgeLarge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.md,
  },

  statusTextLarge: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 12,
  },

  sectionTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
    width: '100%',
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
    width: '100%',
  },

  infoLabel: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  infoValue: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
  },

  modalActions: {
    gap: Spacing.md,
    marginVertical: Spacing.xl,
  },

  // Wallet Modal
  walletModalContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },

  walletUserInfo: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    alignItems: 'center',
  },

  walletUserName: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: 4,
  },

  walletUserPhone: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  walletActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.xl,
  },

  walletButton: {
    flex: 1,
  },
});
