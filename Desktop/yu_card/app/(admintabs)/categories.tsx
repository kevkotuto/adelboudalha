/**
 * Admin Categories - Gestion des catégories
 * Interface moderne en light mode connectée au backend Yu Card
 */

import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { FloatingActionButton } from '@/components/ui/Buttons/FloatingActionButton';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { SearchInput } from '@/components/ui/Inputs/SearchInput';
import { TextInput } from '@/components/ui/Inputs/TextInput';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { adminCategoriesService } from '@/services/adminCategoriesService';
import { apiClient } from '@/services/apiClient';
import { buildImageUrl } from '@/services/config';
import type { AdminCategory } from '@/types/admin';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

interface CategoryFormData {
  name: string;
  description: string;
  iconUrl: string | null;
  type: 'GIFT_CARD' | 'PHYSICAL_PRODUCT' | 'BOTH';
}

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<AdminCategory | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    iconUrl: null,
    type: 'BOTH',
  });

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminCategoriesService.getAllCategories();
      setCategories(response || []);
    } catch (error) {
      console.error('[Categories] Error loading categories:', error);
      Alert.alert('Erreur', 'Impossible de charger les catégories');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadCategories();
  }, [loadCategories]);

  const filteredCategories = categories.filter(cat => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      return cat.name.toLowerCase().includes(query);
    }
    return true;
  });

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission requise', 'L\'accès à la galerie est nécessaire pour sélectionner une image');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadCategoryIcon(result.assets[0].uri);
      }
    } catch (error) {
      console.error('[Categories] Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const uploadCategoryIcon = async (uri: string) => {
    try {
      setUploadingImage(true);

      const uploadFormData = new FormData();

      const filename = uri.split('/').pop() || 'icon.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : 'image/jpeg';

      uploadFormData.append('icon', {
        uri,
        name: filename,
        type,
      } as any);

      const response = await apiClient.post<{
        success: boolean;
        data: { icon: { url: string } };
      }>('/upload/category-icon', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('📤 Upload response:', JSON.stringify(response, null, 2));

      // Le backend retourne { icon: { url, downloadUrl, ... } }
      const iconUrl = response.icon?.url || response.icon?.downloadUrl;

      if (iconUrl) {
        setFormData(prev => ({
          ...prev,
          iconUrl: iconUrl,
        }));
        console.log('✅ Icon URL set:', iconUrl);
      } else {
        console.error('[Categories] No icon URL in response:', response);
        Alert.alert('Erreur', 'URL de l\'icône non reçue du serveur');
      }
    } catch (error) {
      console.error('[Categories] Error uploading icon:', error);
      Alert.alert('Erreur', 'Impossible d\'uploader l\'icône');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie est requis');
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        iconUrl: formData.iconUrl,
        type: formData.type,
      };

      const newCategory = await adminCategoriesService.createCategory(categoryData);
      setCategories(prev => [newCategory, ...prev]);

      Alert.alert('Succès', 'Catégorie créée avec succès');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('[Categories] Error creating category:', error);
      Alert.alert('Erreur', 'Impossible de créer la catégorie');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !formData.name.trim()) {
      return;
    }

    try {
      setSaving(true);

      const categoryData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        iconUrl: formData.iconUrl,
        type: formData.type,
      };

      const updatedCategory = await adminCategoriesService.updateCategory(
        editingCategory.id,
        categoryData
      );

      setCategories(prev =>
        prev.map(cat => (cat.id === editingCategory.id ? updatedCategory : cat))
      );

      Alert.alert('Succès', 'Catégorie mise à jour');
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
    } catch (error) {
      console.error('[Categories] Error updating category:', error);
      Alert.alert('Erreur', 'Impossible de mettre à jour la catégorie');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string, categoryName: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Supprimer la catégorie "${categoryName}" ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await adminCategoriesService.deleteCategory(categoryId);
              setCategories(prev => prev.filter(cat => cat.id !== categoryId));
              Alert.alert('Succès', 'Catégorie supprimée');
            } catch (error) {
              console.error('[Categories] Error deleting category:', error);
              Alert.alert('Erreur', 'Impossible de supprimer la catégorie');
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      iconUrl: null,
      type: 'BOTH',
    });
  };

  const openEditModal = (category: AdminCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      iconUrl: category.iconUrl || null,
      type: category.type || 'BOTH',
    });
    setShowModal(true);
  };

  const CategoryCard = ({ category }: { category: AdminCategory }) => {
    const imageUrl = category.iconUrl ? buildImageUrl(category.iconUrl) : null;

    return (
      <Pressable
        style={styles.categoryCard}
        onPress={() => openEditModal(category)}
      >
        <View style={styles.categoryIcon}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.categoryImage}
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="folder" size={32} color={Colors.text.tertiary} />
          )}
        </View>

        <View style={styles.categoryInfo}>
          <Title level={6} style={styles.categoryName} numberOfLines={2}>
            {category.name}
          </Title>
          {category.description && (
            <Caption style={styles.categoryDescription} numberOfLines={2}>
              {category.description}
            </Caption>
          )}
        </View>

        <Pressable
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            handleDeleteCategory(category.id, category.name);
          }}
        >
          <Ionicons name="trash-outline" size={18} color="#f44336" />
        </Pressable>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <LoadingSpinner size="large" />
          <Paragraph style={styles.loadingText}>Chargement des catégories...</Paragraph>
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
      >
        {/* Header */}
        <View style={styles.header}>
          <Title level={2} style={styles.headerTitle}>Catégories</Title>
          <Paragraph color="secondary" style={styles.headerSubtitle}>
            {filteredCategories.length} catégorie{filteredCategories.length > 1 ? 's' : ''}
          </Paragraph>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#2196F3', '#1976D2']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="folder" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{categories.length}</Title>
              <Caption style={styles.statLabel}>Total catégories</Caption>
            </LinearGradient>
          </View>

          <View style={[styles.statCard, { width: CARD_WIDTH }]}>
            <LinearGradient colors={['#4CAF50', '#45a049']} style={styles.statGradient}>
              <View style={styles.statIconContainer}>
                <Ionicons name="checkmark-circle" size={20} color={Colors.white} />
              </View>
              <Title level={5} style={styles.statValue}>{categories.filter(c => c.isActive).length}</Title>
              <Caption style={styles.statLabel}>Actives</Caption>
            </LinearGradient>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <SearchInput
            placeholder="Rechercher une catégorie..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Categories Grid */}
        <View style={styles.categoriesContainer}>
          {filteredCategories.length > 0 ? (
            <View style={styles.categoriesGrid}>
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </View>
          ) : (
            <EmptyState
              title="Aucune catégorie"
              description="Aucune catégorie ne correspond à vos critères"
              icon="folder-outline"
            />
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* FAB */}
      <FloatingActionButton
        icon="add"
        onPress={() => {
          resetForm();
          setEditingCategory(null);
          setShowModal(true);
        }}
        style={styles.fab}
      />

      {/* Create/Edit Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer} edges={['top']}>
          <View style={styles.modalHeader}>
            <Title level={3}>
              {editingCategory ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </Title>
            <Pressable
              onPress={() => {
                setShowModal(false);
                setEditingCategory(null);
                resetForm();
              }}
            >
              <Ionicons name="close" size={24} color={Colors.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <TextInput
              label="Nom de la catégorie *"
              value={formData.name}
              onChangeText={(text) => setFormData({ ...formData, name: text })}
              placeholder="Ex: Électronique"
            />

            <TextInput
              label="Description"
              value={formData.description}
              onChangeText={(text) => setFormData({ ...formData, description: text })}
              placeholder="Description de la catégorie..."
              multiline
              numberOfLines={3}
            />

            <View style={styles.fieldContainer}>
              <Caption style={styles.fieldLabel}>Type de catégorie *</Caption>
              <View style={styles.typeSelector}>
                <Pressable
                  style={[
                    styles.typeButton,
                    formData.type === 'GIFT_CARD' && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: 'GIFT_CARD' })}
                >
                  <Ionicons
                    name="gift"
                    size={20}
                    color={formData.type === 'GIFT_CARD' ? Colors.white : Colors.text.secondary}
                  />
                  <Paragraph
                    style={[
                      styles.typeButtonText,
                      formData.type === 'GIFT_CARD' && styles.typeButtonTextActive,
                    ]}
                  >
                    Carte cadeau
                  </Paragraph>
                </Pressable>

                <Pressable
                  style={[
                    styles.typeButton,
                    formData.type === 'PHYSICAL_PRODUCT' && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: 'PHYSICAL_PRODUCT' })}
                >
                  <Ionicons
                    name="cube"
                    size={20}
                    color={formData.type === 'PHYSICAL_PRODUCT' ? Colors.white : Colors.text.secondary}
                  />
                  <Paragraph
                    style={[
                      styles.typeButtonText,
                      formData.type === 'PHYSICAL_PRODUCT' && styles.typeButtonTextActive,
                    ]}
                  >
                    Produit physique
                  </Paragraph>
                </Pressable>

                <Pressable
                  style={[
                    styles.typeButton,
                    formData.type === 'BOTH' && styles.typeButtonActive,
                  ]}
                  onPress={() => setFormData({ ...formData, type: 'BOTH' })}
                >
                  <Ionicons
                    name="apps"
                    size={20}
                    color={formData.type === 'BOTH' ? Colors.white : Colors.text.secondary}
                  />
                  <Paragraph
                    style={[
                      styles.typeButtonText,
                      formData.type === 'BOTH' && styles.typeButtonTextActive,
                    ]}
                  >
                    Les deux
                  </Paragraph>
                </Pressable>
              </View>
            </View>

            <View style={styles.fieldContainer}>
              <Caption style={styles.fieldLabel}>Icône de la catégorie</Caption>

              {formData.iconUrl ? (
                <View style={styles.imagePreviewContainer}>
                  <Image
                    source={{ uri: buildImageUrl(formData.iconUrl) || undefined }}
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                  <Pressable
                    style={styles.removeImageButton}
                    onPress={() => setFormData({ ...formData, iconUrl: null })}
                  >
                    <Ionicons name="close-circle" size={24} color="#f44336" />
                  </Pressable>
                </View>
              ) : (
                <Pressable
                  style={styles.uploadButton}
                  onPress={handlePickImage}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="small" color={Colors.primary} />
                  ) : (
                    <>
                      <Ionicons name="cloud-upload-outline" size={32} color={Colors.text.secondary} />
                      <Paragraph style={styles.uploadButtonText}>
                        Cliquer pour sélectionner une image
                      </Paragraph>
                      <Caption style={styles.uploadButtonCaption}>
                        PNG, JPEG, WebP, GIF, SVG (max 10 MB)
                      </Caption>
                    </>
                  )}
                </Pressable>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <Button
              variant="outline"
              onPress={() => {
                setShowModal(false);
                setEditingCategory(null);
                resetForm();
              }}
              style={styles.modalButton}
              disabled={saving}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={editingCategory ? handleUpdateCategory : handleCreateCategory}
              style={styles.modalButton}
              loading={saving}
              disabled={saving}
            >
              {editingCategory ? 'Mettre à jour' : 'Créer'}
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
    marginBottom: Spacing.lg,
  },

  categoriesContainer: {
    paddingHorizontal: Spacing.lg,
  },

  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },

  categoryCard: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    position: 'relative',
  },

  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },

  categoryImage: {
    width: '100%',
    height: '100%',
  },

  categoryInfo: {
    flex: 1,
  },

  categoryName: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: Spacing.xs,
    minHeight: 36,
  },

  categoryDescription: {
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.secondary,
    fontSize: 11,
  },

  deleteButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  bottomPadding: {
    height: 120,
  },

  fab: {
    bottom: 100, // Monté au-dessus de la tab bar
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
    paddingVertical: Spacing.lg,
  },

  fieldContainer: {
    marginBottom: Spacing.lg,
  },

  fieldLabel: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
    marginBottom: Spacing.sm,
    fontSize: 12,
    textTransform: 'uppercase',
  },

  uploadButton: {
    borderWidth: 2,
    borderColor: Colors.border.primary,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.secondary,
  },

  uploadButtonText: {
    marginTop: Spacing.sm,
    color: Colors.text.secondary,
    textAlign: 'center',
  },

  uploadButtonCaption: {
    marginTop: Spacing.xs,
    color: Colors.text.tertiary,
    textAlign: 'center',
    fontSize: 11,
  },

  imagePreviewContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
  },

  imagePreview: {
    width: '100%',
    height: '100%',
  },

  removeImageButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 12,
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

  typeSelector: {
    gap: Spacing.sm,
  },

  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    backgroundColor: Colors.white,
    gap: Spacing.sm,
  },

  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  typeButtonText: {
    fontFamily: 'Ubuntu_500Medium',
    fontSize: 14,
    color: Colors.text.secondary,
  },

  typeButtonTextActive: {
    color: Colors.white,
  },
});
