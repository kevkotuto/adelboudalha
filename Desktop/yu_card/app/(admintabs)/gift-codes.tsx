/**
 * Admin Gift Card Inventory - Inventory Management
 * Gestion complète de l'inventory de codes gift cards
 */

import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
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
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { FloatingActionButton } from '@/components/ui/Buttons/FloatingActionButton';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { SearchInput } from '@/components/ui/Inputs/SearchInput';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { adminGiftCardsService } from '@/services/adminGiftCardsService';
import type {
  AdminGiftCard,
  GiftCardInventoryCode,
  InventorySummary,
  InventoryCodeStatus,
} from '@/types/admin';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

type InventoryStatusFilter = 'ALL' | InventoryCodeStatus;

export default function AdminGiftInventoryScreen() {
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary[]>([]);
  const [selectedGiftCard, setSelectedGiftCard] = useState<AdminGiftCard | null>(null);
  const [inventoryCodes, setInventoryCodes] = useState<GiftCardInventoryCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InventoryStatusFilter>('ALL');
  const [showImportModal, setShowImportModal] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2>(1);
  const [giftCards, setGiftCards] = useState<AdminGiftCard[]>([]);
  const [selectedGiftCardForImport, setSelectedGiftCardForImport] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [giftCardSearchQuery, setGiftCardSearchQuery] = useState('');
  const [pastedCodes, setPastedCodes] = useState('');
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [selectedBrandFilter, setSelectedBrandFilter] = useState<string>('all');

  const statusFilters: { key: InventoryStatusFilter; label: string; color: string }[] = [
    { key: 'ALL', label: 'Tous', color: Colors.text.secondary },
    { key: 'AVAILABLE', label: 'Disponibles', color: '#4CAF50' },
    { key: 'ASSIGNED', label: 'Assignés', color: '#2196F3' },
    { key: 'USED', label: 'Utilisés', color: '#9C27B0' },
    { key: 'EXPIRED', label: 'Expirés', color: '#f44336' },
    { key: 'CANCELLED', label: 'Annulés', color: '#9E9E9E' },
  ];

  // Load inventory summary
  const loadInventorySummary = useCallback(async () => {
    try {
      setLoading(true);
      const summary = await adminGiftCardsService.getInventorySummary();
      setInventorySummary(summary.giftCards);
    } catch (error) {
      console.error('[GiftInventory] Error loading inventory summary:', error);
      Alert.alert('Erreur', 'Impossible de charger le résumé de l\'inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load gift cards for import
  const loadGiftCards = useCallback(async () => {
    try {
      const response = await adminGiftCardsService.getAllGiftCards({ page: 1, limit: 100 });
      setGiftCards(response.data);
    } catch (error) {
      console.error('[GiftInventory] Error loading gift cards:', error);
    }
  }, []);

  // Load inventory codes for a specific gift card
  const loadInventoryCodes = useCallback(
    async (giftCardId: string, page: number = 1) => {
      try {
        console.log('[GiftInventory] Loading codes for gift card:', giftCardId, 'page:', page);
        const params: any = {
          page,
          limit: 20,
        };

        if (selectedStatus !== 'ALL') {
          params.status = selectedStatus;
        }

        if (searchQuery.trim()) {
          params.search = searchQuery.trim();
        }

        console.log('[GiftInventory] Request params:', params);
        const response = await adminGiftCardsService.getInventory(giftCardId, params);
        console.log('[GiftInventory] Received response:', response);
        const codes = response.data || [];
        console.log('[GiftInventory] Codes count:', codes.length);

        if (page === 1) {
          setInventoryCodes(codes);
        } else {
          setInventoryCodes((prev) => [...prev, ...codes]);
        }

        setHasMoreData(codes.length === 20);
        setCurrentPage(page);
      } catch (error) {
        console.error('[GiftInventory] Error loading inventory codes:', error);
        Alert.alert('Erreur', 'Impossible de charger les codes');
      }
    },
    [selectedStatus, searchQuery]
  );

  useEffect(() => {
    loadInventorySummary();
    loadGiftCards();
  }, [loadInventorySummary, loadGiftCards]);

  useEffect(() => {
    if (selectedGiftCard) {
      loadInventoryCodes(selectedGiftCard.id, 1);
    }
  }, [selectedGiftCard, selectedStatus, searchQuery, loadInventoryCodes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadInventorySummary();
    if (selectedGiftCard) {
      loadInventoryCodes(selectedGiftCard.id, 1);
    }
  }, [loadInventorySummary, selectedGiftCard, loadInventoryCodes]);

  const loadMoreCodes = useCallback(() => {
    if (selectedGiftCard && hasMoreData && !loading) {
      loadInventoryCodes(selectedGiftCard.id, currentPage + 1);
    }
  }, [selectedGiftCard, hasMoreData, loading, currentPage, loadInventoryCodes]);

  // Handle file selection
  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'text/csv',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (error) {
      console.error('[GiftInventory] Error selecting file:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner le fichier');
    }
  };

  // Get unique brands for filters
  const brandFilters = useMemo(() => {
    const brands = Array.from(new Set(giftCards.map((gc) => gc.brand)));
    return [
      { id: 'all', label: 'Toutes les marques' },
      ...brands.map((brand) => ({ id: brand, label: brand })),
    ];
  }, [giftCards]);

  // Filter gift cards by search query and brand
  const filteredGiftCards = useMemo(() => {
    let filtered = giftCards;

    // Filter by brand
    if (selectedBrandFilter !== 'all') {
      filtered = filtered.filter((gc) => gc.brand === selectedBrandFilter);
    }

    // Filter by search query
    if (giftCardSearchQuery.trim()) {
      const query = giftCardSearchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        (gc) =>
          gc.title.toLowerCase().includes(query) ||
          gc.brand.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [giftCards, giftCardSearchQuery, selectedBrandFilter]);

  // Handle import codes from file
  const handleImportCodes = async () => {
    if (!selectedGiftCardForImport) {
      Alert.alert('Erreur', 'Veuillez sélectionner une gift card');
      return;
    }

    if (!selectedFile) {
      Alert.alert('Erreur', 'Veuillez sélectionner un fichier CSV');
      return;
    }

    try {
      setImporting(true);

      const file = {
        uri: selectedFile.uri,
        type: 'text/csv',
        name: selectedFile.name,
      } as any;

      const result = await adminGiftCardsService.importCodes(
        selectedGiftCardForImport,
        file
      );

      Alert.alert(
        'Succès',
        `${result.imported} code(s) importé(s) avec succès${
          result.duplicates > 0 ? `\n${result.duplicates} doublon(s) ignoré(s)` : ''
        }`
      );

      setShowImportModal(false);
      setImportStep(1);
      setSelectedGiftCardForImport('');
      setSelectedFile(null);
      loadInventorySummary();
    } catch (error: any) {
      console.error('[GiftInventory] Error importing codes:', error);
      Alert.alert('Erreur', error?.message || 'Impossible d\'importer les codes');
    } finally {
      setImporting(false);
    }
  };

  // Handle import codes from pasted text
  const handleImportPastedCodes = async () => {
    if (!selectedGiftCardForImport) {
      Alert.alert('Erreur', 'Veuillez sélectionner une gift card');
      return;
    }

    if (!pastedCodes.trim()) {
      Alert.alert('Erreur', 'Veuillez coller des codes');
      return;
    }

    try {
      setImporting(true);

      // Convert pasted text to CSV format
      const codes = pastedCodes
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.length > 0);

      if (codes.length === 0) {
        Alert.alert('Erreur', 'Aucun code valide trouvé');
        setImporting(false);
        return;
      }

      // Create CSV content
      const csvContent = codes.join('\n');

      // Create a temporary file using the new FileSystem API
      const tempFile = new File(Paths.cache, `pasted-codes-${Date.now()}.csv`);
      tempFile.create({ overwrite: true });
      // @ts-ignore - Type mismatch between TS definition and native implementation
      tempFile.write(csvContent);

      // Create file object for upload
      const file = {
        uri: tempFile.uri,
        type: 'text/csv',
        name: 'pasted-codes.csv',
      } as any;

      const result = await adminGiftCardsService.importCodes(
        selectedGiftCardForImport,
        file
      );

      // Clean up temporary file
      try {
        await tempFile.delete();
      } catch (cleanupError) {
        console.warn('[GiftInventory] Could not delete temp file:', cleanupError);
      }

      Alert.alert(
        'Succès',
        `${result.imported} code(s) importé(s) avec succès${
          result.duplicates > 0 ? `\n${result.duplicates} doublon(s) ignoré(s)` : ''
        }`
      );

      setShowPasteModal(false);
      setShowImportModal(false);
      setImportStep(1);
      setSelectedGiftCardForImport('');
      setSelectedFile(null);
      setPastedCodes('');
      loadInventorySummary();
    } catch (error: any) {
      console.error('[GiftInventory] Error importing pasted codes:', error);
      Alert.alert('Erreur', error?.message || 'Impossible d\'importer les codes');
    } finally {
      setImporting(false);
    }
  };

  // Handle delete code
  const handleDeleteCode = useCallback((code: GiftCardInventoryCode) => {
    if (code.status !== 'AVAILABLE') {
      Alert.alert(
        'Impossible',
        'Seuls les codes AVAILABLE peuvent être supprimés'
      );
      return;
    }

    Alert.alert(
      'Confirmer la suppression',
      `Supprimer le code ${code.code} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminGiftCardsService.deleteInventoryCode(code.id);
              Alert.alert('Succès', 'Code supprimé');
              if (selectedGiftCard) {
                loadInventoryCodes(selectedGiftCard.id, 1);
              }
              loadInventorySummary();
            } catch (error) {
              console.error('[GiftInventory] Error deleting code:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le code');
            }
          },
        },
      ]
    );
  }, [selectedGiftCard, loadInventoryCodes, loadInventorySummary]);

  const getStatusColor = (status: InventoryCodeStatus): string => {
    const filter = statusFilters.find((f) => f.key === status);
    return filter?.color || Colors.text.secondary;
  };

  const getStatusLabel = (status: InventoryCodeStatus): string => {
    const filter = statusFilters.find((f) => f.key === status);
    return filter?.label || status;
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Summary Card Component
  const SummaryCard = ({ summary }: { summary: InventorySummary }) => {
    const isLowStock = summary.availableCount < 10 && summary.availableCount > 0;
    const isOutOfStock = summary.availableCount === 0;

    return (
      <Pressable
        style={({ pressed }) => [
          styles.summaryCard,
          { width: CARD_WIDTH },
          isOutOfStock && styles.summaryCardOutOfStock,
          isLowStock && styles.summaryCardLowStock,
          pressed && styles.summaryCardPressed,
        ]}
        onPress={() => {
          const giftCard = giftCards.find((gc) => gc.id === summary.giftCardId);
          if (giftCard) {
            setSelectedGiftCard(giftCard);
          }
        }}
      >
        <View style={styles.summaryHeader}>
          <View style={styles.summaryIconContainer}>
            <Ionicons name="gift" size={28} color={Colors.primary} />
          </View>
          {isOutOfStock && (
            <View style={[styles.alertBadge, styles.alertBadgeOutOfStock]}>
              <Caption style={styles.alertText}>ÉPUISÉ</Caption>
            </View>
          )}
          {isLowStock && !isOutOfStock && (
            <View style={[styles.alertBadge, styles.alertBadgeLowStock]}>
              <Caption style={styles.alertText}>FAIBLE</Caption>
            </View>
          )}
        </View>

        <Title level={6} style={styles.summaryTitle} numberOfLines={2}>
          {summary.title}
        </Title>
        <Caption style={styles.summaryBrand}>{summary.brand}</Caption>

        <View style={styles.summaryStats}>
          <View style={styles.summaryStatRow}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
            </View>
            <Caption style={styles.summaryStatText}>
              {summary.availableCount} dispo{summary.availableCount > 1 ? 's' : ''}
            </Caption>
          </View>
          <View style={styles.summaryStatRow}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E3F2FD' }]}>
              <Ionicons name="link" size={16} color="#2196F3" />
            </View>
            <Caption style={styles.summaryStatText}>
              {summary.assignedCount} assigné{summary.assignedCount > 1 ? 's' : ''}
            </Caption>
          </View>
          <View style={styles.summaryStatRow}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F3E5F5' }]}>
              <Ionicons name="checkmark-done" size={16} color="#9C27B0" />
            </View>
            <Caption style={styles.summaryStatText}>
              {summary.usedCount} utilisé{summary.usedCount > 1 ? 's' : ''}
            </Caption>
          </View>
          <View style={styles.summaryStatRow}>
            <View style={[styles.statIconContainer, { backgroundColor: '#F5F5F5' }]}>
              <Ionicons name="cube" size={16} color={Colors.text.secondary} />
            </View>
            <Caption style={styles.summaryStatText}>{summary.totalCount} total</Caption>
          </View>
        </View>

        <View style={styles.summaryFooter}>
          <Caption style={styles.summaryFooterText}>Voir les détails</Caption>
          <Ionicons name="chevron-forward" size={18} color={Colors.text.secondary} />
        </View>
      </Pressable>
    );
  };

  // Inventory Code Card Component
  const InventoryCodeCard = ({ code }: { code: GiftCardInventoryCode }) => {
    return (
      <View style={styles.codeCard}>
        <View style={styles.codeHeader}>
          <View style={styles.codeInfo}>
            <Title level={6} style={styles.codeText}>
              {code.code}
            </Title>
            <View
              style={[styles.statusBadge, { backgroundColor: getStatusColor(code.status) }]}
            >
              <Caption style={styles.statusText}>{getStatusLabel(code.status)}</Caption>
            </View>
          </View>
        </View>

        <View style={styles.codeMeta}>
          <View style={styles.metaRow}>
            <Ionicons name="calendar-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.metaText}>Créé: {formatDate(code.createdAt)}</Caption>
          </View>

          {code.assignedAt && (
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color={Colors.text.secondary} />
              <Caption style={styles.metaText}>Assigné: {formatDate(code.assignedAt)}</Caption>
            </View>
          )}

          {code.orderItem && (
            <>
              <View style={styles.metaRow}>
                <Ionicons name="receipt-outline" size={14} color={Colors.text.secondary} />
                <Caption style={styles.metaText}>
                  Commande: {code.orderItem.order.orderNumber}
                </Caption>
              </View>
              <View style={styles.metaRow}>
                <Ionicons name="person-outline" size={14} color={Colors.text.secondary} />
                <Caption style={styles.metaText}>
                  Client: {code.orderItem.order.user.fullName}
                </Caption>
              </View>
            </>
          )}

          {code.admin && (
            <View style={styles.metaRow}>
              <Ionicons name="shield-outline" size={14} color={Colors.text.secondary} />
              <Caption style={styles.metaText}>Par: {code.admin.fullName}</Caption>
            </View>
          )}

          {code.notes && (
            <View style={styles.metaRow}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.text.secondary} />
              <Caption style={styles.metaText}>{code.notes}</Caption>
            </View>
          )}
        </View>

        {code.status === 'AVAILABLE' && (
          <View style={styles.codeActions}>
            <Pressable style={styles.actionButton} onPress={() => handleDeleteCode(code)}>
              <Ionicons name="trash-outline" size={18} color="#f44336" />
              <Caption style={{ ...styles.actionText, color: '#f44336' }}>Supprimer</Caption>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Paragraph style={styles.loadingText}>Chargement de l'inventory...</Paragraph>
        </View>
      </SafeAreaView>
    );
  }

  // Detail view for a specific gift card
  if (selectedGiftCard) {
    console.log('[GiftInventory] Rendering detail view for:', selectedGiftCard.title);
    console.log('[GiftInventory] Current inventoryCodes:', inventoryCodes.length, 'codes');
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.detailHeader}>
          <Pressable
            style={styles.backButton}
            onPress={() => {
              setSelectedGiftCard(null);
              setInventoryCodes([]);
            }}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <View style={styles.detailTitleContainer}>
            <Title level={4} style={styles.detailTitle} numberOfLines={1}>
              {selectedGiftCard.title}
            </Title>
            <Caption style={styles.detailSubtitle}>{selectedGiftCard.brand}</Caption>
          </View>
        </View>

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
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
            if (isCloseToBottom && hasMoreData && !loading) {
              loadMoreCodes();
            }
          }}
          scrollEventThrottle={400}
        >
          {/* Search */}
          <View style={styles.searchContainer}>
            <SearchInput
              placeholder="Rechercher un code..."
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
                    style={
                      selectedStatus === filter.key
                        ? { ...styles.filterText, ...styles.filterTextActive }
                        : styles.filterText
                    }
                  >
                    {filter.label}
                  </Paragraph>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Codes List */}
          <View style={styles.codesContainer}>
            {inventoryCodes.length > 0 ? (
              <>
                {inventoryCodes.map((code) => (
                  <InventoryCodeCard key={code.id} code={code} />
                ))}
                {hasMoreData && (
                  <View style={styles.loadingMore}>
                    <LoadingSpinner size="small" />
                  </View>
                )}
              </>
            ) : (
              <EmptyState
                title="Aucun code"
                description="Aucun code ne correspond à vos critères"
                icon="cube-outline"
              />
            )}
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Main summary view
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Title level={2} style={styles.headerTitle}>
            Codes Gift Cards
          </Title>
          <Paragraph color="secondary" style={styles.headerSubtitle}>
            Importez et gérez vos codes gift cards achetés
          </Paragraph>
        </View>

        {/* Summary Cards Grid */}
        <View style={styles.summaryGrid}>
          {inventorySummary.length > 0 ? (
            inventorySummary.map((summary) => (
              <SummaryCard key={summary.giftCardId} summary={summary} />
            ))
          ) : (
            <EmptyState
              title="Aucun inventory"
              description="Commencez par importer des codes"
              icon="cube-outline"
            />
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* FAB */}
      <FloatingActionButton
        icon="cloud-upload-outline"
        onPress={() => setShowImportModal(true)}
        style={styles.fab}
      />

      {/* Import Modal - 2 Step Wizard */}
      <Modal
        visible={showImportModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowImportModal(false);
          setImportStep(1);
          setSelectedGiftCardForImport('');
          setSelectedFile(null);
        }}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Title level={3}>
              {importStep === 1 ? 'Étape 1/2 : Sélection' : 'Étape 2/2 : Fichier'}
            </Title>
            <Pressable
              onPress={() => {
                setShowImportModal(false);
                setImportStep(1);
                setSelectedGiftCardForImport('');
                setSelectedFile(null);
              }}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          {/* Step Indicator */}
          <View style={styles.stepIndicator}>
            <View style={[styles.stepDot, importStep >= 1 && styles.stepDotActive]} />
            <View style={[styles.stepLine, importStep === 2 && styles.stepLineActive]} />
            <View style={[styles.stepDot, importStep === 2 && styles.stepDotActive]} />
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {importStep === 1 ? (
              // Step 1: Select Gift Card
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <Ionicons name="gift-outline" size={32} color={Colors.primary} />
                  </View>
                  <Title level={4} style={styles.stepTitle}>
                    Sélectionnez la gift card
                  </Title>
                  <Caption color="secondary" style={styles.stepDescription}>
                    Choisissez la gift card pour laquelle vous souhaitez importer des codes
                  </Caption>
                </View>

                {/* Search Bar */}
                <View style={styles.searchBarContainer}>
                  <SearchInput
                    placeholder="Rechercher une gift card..."
                    value={giftCardSearchQuery}
                    onChangeText={setGiftCardSearchQuery}
                  />
                </View>

                {/* Brand Filters */}
                {brandFilters.length > 2 && (
                  <View style={styles.brandFiltersContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {brandFilters.map((filter) => (
                        <Pressable
                          key={filter.id}
                          style={[
                            styles.brandFilterChip,
                            selectedBrandFilter === filter.id && styles.brandFilterChipActive,
                          ]}
                          onPress={() => setSelectedBrandFilter(filter.id)}
                        >
                          <Caption
                            style={
                              selectedBrandFilter === filter.id
                                ? styles.brandFilterTextActive
                                : styles.brandFilterText
                            }
                          >
                            {filter.label}
                          </Caption>
                        </Pressable>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Gift Cards Grid */}
                <View style={styles.giftCardsGrid}>
                  {filteredGiftCards.length > 0 ? (
                    filteredGiftCards.map((gc) => {
                      const isSelected = selectedGiftCardForImport === gc.id;
                      return (
                        <Pressable
                          key={gc.id}
                          style={({ pressed }) => [
                            styles.giftCardCard,
                            isSelected && styles.giftCardCardSelected,
                            pressed && styles.giftCardCardPressed,
                          ]}
                          onPress={() => setSelectedGiftCardForImport(gc.id)}
                        >
                          {isSelected && (
                            <View style={styles.selectedBadge}>
                              <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
                            </View>
                          )}
                          <View style={styles.giftCardCardIcon}>
                            <Ionicons name="gift" size={32} color={isSelected ? Colors.primary : Colors.text.secondary} />
                          </View>
                          <Title level={6} style={styles.giftCardCardTitle} numberOfLines={2}>
                            {gc.title}
                          </Title>
                          <Caption style={styles.giftCardCardBrand} numberOfLines={1}>
                            {gc.brand}
                          </Caption>
                        </Pressable>
                      );
                    })
                  ) : (
                    <View style={styles.noResults}>
                      <Ionicons name="search-outline" size={48} color={Colors.text.secondary} />
                      <Paragraph color="secondary" style={styles.noResultsText}>
                        Aucune gift card trouvée
                      </Paragraph>
                    </View>
                  )}
                </View>
              </View>
            ) : (
              // Step 2: Select File
              <View style={styles.stepContainer}>
                <View style={styles.stepHeader}>
                  <View style={styles.stepIconContainer}>
                    <Ionicons name="cloud-upload-outline" size={32} color={Colors.primary} />
                  </View>
                  <Title level={4} style={styles.stepTitle}>
                    Importez le fichier CSV
                  </Title>
                  <Caption color="secondary" style={styles.stepDescription}>
                    {giftCards.find(gc => gc.id === selectedGiftCardForImport)?.title}
                  </Caption>
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.fileUploadArea,
                    selectedFile && styles.fileUploadAreaWithFile,
                    pressed && styles.fileUploadAreaPressed,
                  ]}
                  onPress={handleSelectFile}
                >
                  <View style={styles.fileUploadIcon}>
                    <Ionicons
                      name={selectedFile ? "document-text" : "cloud-upload"}
                      size={48}
                      color={selectedFile ? Colors.primary : Colors.text.secondary}
                    />
                  </View>
                  {selectedFile ? (
                    <>
                      <Paragraph style={styles.fileUploadTitle}>{selectedFile.name}</Paragraph>
                      <Caption color="secondary" style={styles.fileUploadHint}>
                        Appuyez pour changer le fichier
                      </Caption>
                    </>
                  ) : (
                    <>
                      <Paragraph style={styles.fileUploadTitle}>Choisir un fichier CSV</Paragraph>
                      <Caption color="secondary" style={styles.fileUploadHint}>
                        Appuyez pour sélectionner
                      </Caption>
                    </>
                  )}
                </Pressable>

                {/* OR Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Paragraph style={styles.dividerText}>OU</Paragraph>
                  <View style={styles.dividerLine} />
                </View>

                {/* Paste Codes Button */}
                <Pressable
                  style={styles.pasteCodesPressable}
                  onPress={() => {
                    console.log('[GiftInventory] Opening paste modal...');
                    // Close the import modal first, then open paste modal
                    setShowImportModal(false);
                    setTimeout(() => {
                      setShowPasteModal(true);
                    }, 400);
                  }}
                >
                  <Ionicons name="clipboard-outline" size={20} color={Colors.primary} />
                  <Paragraph style={styles.pasteCodesText}>Coller des codes directement</Paragraph>
                </Pressable>

                <View style={styles.formatGuide}>
                  <View style={styles.formatGuideHeader}>
                    <Ionicons name="information-circle" size={20} color="#2196F3" />
                    <Paragraph style={styles.formatGuideTitle}>Format du fichier</Paragraph>
                  </View>
                  <View style={styles.formatGuideContent}>
                    <Caption color="secondary" style={styles.formatGuideText}>
                      Un code par ligne, sans en-tête
                    </Caption>
                    <View style={styles.formatExample}>
                      <Caption style={styles.formatExampleText}>PSN1-XXXX-YYYY-ZZZZ</Caption>
                      <Caption style={styles.formatExampleText}>PSN2-AAAA-BBBB-CCCC</Caption>
                      <Caption style={styles.formatExampleText}>PSN3-1111-2222-3333</Caption>
                    </View>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.modalActions}>
            {importStep === 1 ? (
              <>
                <Button
                  variant="outline"
                  onPress={() => {
                    setShowImportModal(false);
                    setImportStep(1);
                    setSelectedGiftCardForImport('');
                    setSelectedFile(null);
                  }}
                  style={styles.modalButton}
                >
                  Annuler
                </Button>
                <Button
                  variant="primary"
                  onPress={() => setImportStep(2)}
                  style={styles.modalButton}
                  disabled={!selectedGiftCardForImport}
                >
                  Suivant
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onPress={() => setImportStep(1)}
                  style={styles.modalButton}
                  disabled={importing}
                >
                  Retour
                </Button>
                <Button
                  variant="primary"
                  onPress={handleImportCodes}
                  style={styles.modalButton}
                  loading={importing}
                  disabled={!selectedFile || importing}
                >
                  Importer
                </Button>
              </>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Paste Codes Modal */}
      <Modal
        visible={showPasteModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setShowPasteModal(false);
          setPastedCodes('');
          setTimeout(() => {
            setShowImportModal(true);
          }, 400);
        }}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Title level={3}>Coller des codes</Title>
            <Pressable
              onPress={() => {
                setShowPasteModal(false);
                setPastedCodes('');
                setTimeout(() => {
                  setShowImportModal(true);
                }, 400);
              }}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.stepContainer}>
              <View style={styles.stepHeader}>
                <View style={styles.stepIconContainer}>
                  <Ionicons name="clipboard-outline" size={32} color={Colors.primary} />
                </View>
                <Title level={4} style={styles.stepTitle}>
                  Collez vos codes
                </Title>
                <Caption color="secondary" style={styles.stepDescription}>
                  {giftCards.find(gc => gc.id === selectedGiftCardForImport)?.title}
                </Caption>
              </View>

              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  multiline
                  numberOfLines={15}
                  placeholder="Collez vos codes ici, un code par ligne&#10;&#10;Exemple:&#10;PSN1-XXXX-YYYY-ZZZZ&#10;PSN2-AAAA-BBBB-CCCC&#10;PSN3-1111-2222-3333"
                  placeholderTextColor={Colors.text.secondary}
                  value={pastedCodes}
                  onChangeText={setPastedCodes}
                  textAlignVertical="top"
                />
                {pastedCodes.trim().length > 0 && (
                  <View style={styles.codeCounter}>
                    <Caption style={styles.codeCounterText}>
                      {pastedCodes.split('\n').filter(line => line.trim().length > 0).length} code(s) détecté(s)
                    </Caption>
                  </View>
                )}
              </View>

              <View style={styles.formatGuide}>
                <View style={styles.formatGuideHeader}>
                  <Ionicons name="information-circle" size={20} color="#2196F3" />
                  <Paragraph style={styles.formatGuideTitle}>Format attendu</Paragraph>
                </View>
                <View style={styles.formatGuideContent}>
                  <Caption color="secondary" style={styles.formatGuideText}>
                    Un code par ligne, sans en-tête
                  </Caption>
                  <View style={styles.formatExample}>
                    <Caption style={styles.formatExampleText}>PSN1-XXXX-YYYY-ZZZZ</Caption>
                    <Caption style={styles.formatExampleText}>PSN2-AAAA-BBBB-CCCC</Caption>
                    <Caption style={styles.formatExampleText}>PSN3-1111-2222-3333</Caption>
                  </View>
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              variant="outline"
              onPress={() => {
                setShowPasteModal(false);
                setPastedCodes('');
                setTimeout(() => {
                  setShowImportModal(true);
                }, 400);
              }}
              style={styles.modalButton}
              disabled={importing}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={handleImportPastedCodes}
              style={styles.modalButton}
              loading={importing}
              disabled={!pastedCodes.trim() || importing}
            >
              Importer
            </Button>
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

  // Detail header
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  backButton: {
    marginRight: Spacing.md,
  },

  detailTitleContainer: {
    flex: 1,
  },

  detailTitle: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
  },

  detailSubtitle: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
  },

  // Summary cards
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },

  summaryCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  summaryCardOutOfStock: {
    borderColor: '#f44336',
    borderWidth: 2,
  },

  summaryCardLowStock: {
    borderColor: '#FF9800',
    borderWidth: 2,
  },

  summaryCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  summaryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },

  alertBadge: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },

  alertBadgeOutOfStock: {
    backgroundColor: '#f44336',
  },

  alertBadgeLowStock: {
    backgroundColor: '#FF9800',
  },

  alertText: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.white,
    fontSize: 10,
  },

  summaryTitle: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    marginBottom: 4,
    minHeight: 36,
  },

  summaryBrand: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    marginBottom: Spacing.md,
    fontSize: 12,
  },

  summaryStats: {
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },

  summaryStatRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  statIconContainer: {
    width: 24,
    height: 24,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },

  summaryStatText: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 11,
    flex: 1,
  },

  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  summaryFooterText: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  // Search & Filters
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    marginTop: Spacing.md,
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

  // Codes
  codesContainer: {
    paddingHorizontal: Spacing.lg,
  },

  codeCard: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  codeHeader: {
    marginBottom: Spacing.md,
  },

  codeInfo: {
    flex: 1,
  },

  codeText: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
  },

  statusBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },

  statusText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 10,
  },

  codeMeta: {
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },

  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  metaText: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 12,
    flex: 1,
  },

  codeActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
  },

  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  actionText: {
    fontFamily: 'Ubuntu_500Medium',
    fontSize: 12,
  },

  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },

  bottomPadding: {
    height: 120,
  },

  fab: {
    bottom: 100, // Positionné au-dessus de la tab bar
  },

  // Modal
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
  },

  // Step Container
  stepContainer: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },

  stepHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },

  stepIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.xl,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },

  stepTitle: {
    fontFamily: 'Ubuntu_700Bold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },

  stepDescription: {
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: Spacing.lg,
  },

  // Gift Cards Grid
  giftCardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },

  giftCardCard: {
    width: (width - 64) / 2,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    alignItems: 'center',
    position: 'relative',
  },

  giftCardCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
  },

  giftCardCardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },

  selectedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },

  giftCardCardIcon: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  giftCardCardTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: 4,
    minHeight: 36,
  },

  giftCardCardBrand: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    textAlign: 'center',
    fontSize: 11,
  },

  // File Upload Area
  fileUploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    marginBottom: Spacing.xl,
  },

  fileUploadAreaWithFile: {
    borderColor: Colors.primary,
    backgroundColor: `${Colors.primary}08`,
    borderStyle: 'solid',
  },

  fileUploadAreaPressed: {
    opacity: 0.7,
  },

  fileUploadIcon: {
    marginBottom: Spacing.md,
  },

  fileUploadTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },

  fileUploadHint: {
    textAlign: 'center',
    fontSize: 12,
  },

  // Format Guide
  formatGuide: {
    backgroundColor: '#EBF5FF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: '#D1E8FF',
    marginBottom: Spacing.xl,
  },

  formatGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },

  formatGuideTitle: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: '#2196F3',
    fontSize: 14,
  },

  formatGuideContent: {
    gap: Spacing.sm,
  },

  formatGuideText: {
    fontSize: 12,
    lineHeight: 18,
  },

  formatExample: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    marginTop: Spacing.xs,
  },

  formatExampleText: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 11,
    lineHeight: 16,
  },

  // Search Bar
  searchBarContainer: {
    marginBottom: Spacing.md,
  },

  // Brand Filters
  brandFiltersContainer: {
    marginBottom: Spacing.md,
  },

  brandFilterChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    marginRight: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  brandFilterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  brandFilterText: {
    fontFamily: 'Ubuntu_500Medium',
    color: Colors.text.secondary,
    fontSize: 12,
  },

  brandFilterTextActive: {
    color: Colors.white,
  },

  // No Results
  noResults: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: Spacing['2xl'],
  },

  noResultsText: {
    marginTop: Spacing.md,
    textAlign: 'center',
  },

  // Divider
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border.primary,
  },

  dividerText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.secondary,
    paddingHorizontal: Spacing.md,
    fontSize: 12,
  },

  // Paste Button
  pasteCodesPressable: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
    marginBottom: Spacing.xl,
  },

  pasteCodesText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.primary,
    fontSize: 14,
  },

  // Text Area
  textAreaContainer: {
    marginBottom: Spacing.xl,
    position: 'relative',
  },

  textArea: {
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    fontFamily: 'Ubuntu_400Regular',
    fontSize: 14,
    color: Colors.text.primary,
    minHeight: 300,
  },

  codeCounter: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },

  codeCounterText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 11,
  },

  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    gap: Spacing.md,
  },

  modalButton: {
    flex: 1,
  },

  // Wizard Step Indicator
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
  },

  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.border.primary,
  },

  stepDotActive: {
    backgroundColor: Colors.primary,
  },

  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: Colors.border.primary,
    marginHorizontal: Spacing.sm,
  },

  stepLineActive: {
    backgroundColor: Colors.primary,
  },

});
