import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FloatingActionButton } from '@/components/ui/Buttons/FloatingActionButton';
import { Card } from '@/components/ui/Layout/Card';
import { Container } from '@/components/ui/Layout/Container';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { LoadingSpinner } from '@/components/ui/Layout/LoadingSpinner';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import userService, { userHelpers } from '@/services/userService';
import { UserAddress } from '@/types';

export default function AddressesScreen() {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.replace('/auth/login');
    }
  }, [user]);

  const loadAddresses = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);

    try {
      const data = await userService.getAddresses();
      setAddresses(data);
    } catch (error: any) {
      console.error('Failed to load addresses:', error);
      Alert.alert('Erreur', 'Impossible de charger les adresses. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadAddresses(true);
  }, []);

  const handleDeleteAddress = (addressId: string) => {
    Alert.alert(
      'Supprimer l\'adresse',
      'Êtes-vous sûr de vouloir supprimer cette adresse ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAddress(addressId);
              setAddresses(prev => prev.filter(addr => addr.id !== addressId));
              Alert.alert('Succès', 'Adresse supprimée avec succès');
            } catch (error: any) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'adresse');
            }
          },
        },
      ]
    );
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      const updatedAddress = await userService.setDefaultAddress(addressId);

      // Update local state
      setAddresses(prev =>
        prev.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId,
        }))
      );

      Alert.alert('Succès', 'Adresse par défaut mise à jour');
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de définir l\'adresse par défaut');
    }
  };

  const renderAddressCard = ({ item }: { item: UserAddress }) => (
    <Card style={styles.addressCard}>
      {/* Header avec nom et badge par défaut */}
      <View style={styles.addressHeader}>
        <View style={styles.nameContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="location" size={20} color={Colors.primary} />
          </View>
          <View style={styles.nameWrapper}>
            <Title level={5} style={styles.addressName}>
              {item.fullName}
            </Title>
            {item.type && (
              <Caption color="secondary" style={styles.addressType}>
                {item.type === 'SHIPPING' ? '📦 Livraison' : item.type === 'BILLING' ? '💳 Facturation' : '📦💳 Les deux'}
              </Caption>
            )}
          </View>
        </View>
        {item.isDefault && (
          <View style={styles.defaultBadge}>
            <Ionicons name="star" size={12} color={Colors.white} />
            <Caption style={styles.defaultBadgeText}>DÉFAUT</Caption>
          </View>
        )}
      </View>

      {/* Content avec informations */}
      <View style={styles.addressContent}>
        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="call" size={14} color={Colors.primary} />
          </View>
          <Paragraph style={styles.infoText}>
            {userHelpers.formatPhoneForDisplay(item.phone)}
          </Paragraph>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoIconWrapper}>
            <Ionicons name="home" size={14} color={Colors.primary} />
          </View>
          <Paragraph style={styles.infoText}>
            {userHelpers.formatAddressForDisplay(item)}
          </Paragraph>
        </View>
      </View>

      {/* Actions en bas */}
      <View style={styles.addressActions}>
        <Pressable
          style={[styles.actionButton, styles.actionButtonPrimary]}
          onPress={() => router.push(`/profile/addresses/form?id=${item.id}`)}
        >
          <Ionicons name="create-outline" size={18} color={Colors.white} />
          <Paragraph style={styles.actionButtonTextPrimary}>Modifier</Paragraph>
        </Pressable>

        {!item.isDefault ? (
          <Pressable
            style={[styles.actionButton, styles.actionButtonOutline]}
            onPress={() => handleSetDefault(item.id)}
          >
            <Ionicons name="star-outline" size={18} color={Colors.primary} />
            <Paragraph style={styles.actionButtonTextOutline}>Défaut</Paragraph>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.actionButton, styles.actionButtonOutline]}
            onPress={() => handleDeleteAddress(item.id)}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.error} />
            <Paragraph style={styles.actionButtonTextDanger}>Supprimer</Paragraph>
          </Pressable>
        )}
      </View>
    </Card>
  );

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>Mes adresses</Title>
          <View style={styles.headerSpacer} />
        </View>

        {/* Address List */}
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          renderItem={renderAddressCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="location-outline"
              title="Aucune adresse"
              message="Vous n'avez pas encore ajouté d'adresse. Ajoutez-en une pour faciliter vos commandes."
            />
          }
        />

        {/* Add Address Button */}
        <FloatingActionButton
          icon="add"
          onPress={() => router.push('/profile/addresses/form')}
          label="Ajouter une adresse"
        />
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

  listContent: {
    paddingBottom: 100, // Space for FAB
  },

  addressCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  addressHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  nameContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: Spacing.sm,
  },

  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },

  nameWrapper: {
    flex: 1,
  },

  addressName: {
    marginBottom: 4,
    fontSize: 16,
  },

  addressType: {
    fontSize: 12,
  },

  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    gap: 4,
  },

  defaultBadgeText: {
    color: Colors.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  addressContent: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingLeft: 52, // Aligner avec le texte du nom
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
  },

  infoIconWrapper: {
    width: 20,
    alignItems: 'center',
    paddingTop: 2,
  },

  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: Colors.text.secondary,
  },

  addressActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },

  actionButtonPrimary: {
    backgroundColor: Colors.primary,
  },

  actionButtonOutline: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  actionButtonTextPrimary: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },

  actionButtonTextOutline: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },

  actionButtonTextDanger: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error,
  },
});
