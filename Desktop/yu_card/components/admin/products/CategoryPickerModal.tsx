/**
 * CategoryPickerModal Component
 * Modal for selecting product/gift card category
 */

import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  TextInput as RNTextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

interface CategoryPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (categoryId: string) => void;
  categories: Category[];
  selectedCategoryId?: string;
}

export const CategoryPickerModal: React.FC<CategoryPickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  categories,
  selectedCategoryId,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedId, setTempSelectedId] = useState(selectedCategoryId);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConfirm = () => {
    if (tempSelectedId) {
      onSelect(tempSelectedId);
      onClose();
    }
  };

  const handleCategoryPress = (categoryId: string) => {
    setTempSelectedId(categoryId);
  };

  const selectedCategory = categories.find(c => c.id === tempSelectedId);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Ionicons name="grid-outline" size={24} color={Colors.primary} />
            <View style={styles.headerText}>
              <Title level={4}>Choisir une catégorie</Title>
              <Caption style={styles.headerSubtitle}>
                {categories.length} catégories disponibles
              </Caption>
            </View>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.primary} />
          </Pressable>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons
              name="search"
              size={20}
              color={Colors.text.secondary}
              style={styles.searchIcon}
            />
            <RNTextInput
              style={styles.searchInput}
              placeholder="Rechercher une catégorie..."
              placeholderTextColor={Colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <Pressable
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <Ionicons name="close-circle" size={20} color={Colors.text.secondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Selected Preview */}
        {selectedCategory && (
          <View style={styles.selectedPreview}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.primary} />
            <Caption style={styles.selectedText}>
              Sélectionné : <Caption style={styles.selectedName}>{selectedCategory.name}</Caption>
            </Caption>
          </View>
        )}

        {/* Categories List */}
        <FlatList
          data={filteredCategories}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.id === tempSelectedId;
            return (
              <Pressable
                style={[styles.categoryItem, isSelected && styles.categoryItemSelected]}
                onPress={() => handleCategoryPress(item.id)}
              >
                <View style={styles.categoryContent}>
                  <View style={styles.categoryInfo}>
                    <Paragraph style={[styles.categoryName, isSelected && styles.categoryNameSelected]}>
                      {item.name}
                    </Paragraph>
                    {item.description && (
                      <Caption style={styles.categoryDescription}>
                        {item.description}
                      </Caption>
                    )}
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={Colors.primary}
                    />
                  )}
                </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={
            <EmptyState
              icon="folder-open-outline"
              title="Aucune catégorie trouvée"
              message={
                searchQuery
                  ? "Aucune catégorie ne correspond à votre recherche"
                  : "Aucune catégorie disponible"
              }
            />
          }
        />

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            variant="outline"
            onPress={onClose}
            style={styles.footerButton}
          >
            Annuler
          </Button>
          <Button
            variant="primary"
            onPress={handleConfirm}
            disabled={!tempSelectedId}
            style={styles.footerButton}
          >
            Confirmer
          </Button>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },

  headerText: {
    flex: 1,
  },

  headerSubtitle: {
    marginTop: 2,
    color: Colors.text.secondary,
  },

  closeButton: {
    padding: Spacing.xs,
  },

  searchContainer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.lg,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  searchIcon: {
    marginRight: Spacing.sm,
  },

  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 15,
    fontFamily: 'Ubuntu_400Regular',
    color: Colors.text.primary,
  },

  clearButton: {
    padding: Spacing.xs,
  },

  selectedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary + '10',
    borderBottomWidth: 1,
    borderBottomColor: Colors.primary + '20',
  },

  selectedText: {
    color: Colors.text.secondary,
  },

  selectedName: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.primary,
  },

  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },

  categoryItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    overflow: 'hidden',
  },

  categoryItemSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '05',
  },

  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },

  categoryInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },

  categoryName: {
    fontFamily: 'Ubuntu_500Medium',
    fontSize: 16,
    color: Colors.text.primary,
  },

  categoryNameSelected: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.primary,
  },

  categoryDescription: {
    marginTop: 4,
    color: Colors.text.secondary,
    fontSize: 12,
  },

  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    backgroundColor: Colors.white,
  },

  footerButton: {
    flex: 1,
  },
});
