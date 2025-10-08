import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  TextInput,
} from 'react-native';

import { BorderRadius, Colors, Spacing } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { Button } from '../Buttons';
import { Caption, Title } from '../Typography';

const { height } = Dimensions.get('window');

interface FilterOption {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

interface SortOption {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface FilterValues {
  type?: 'all' | 'gift_cards' | 'products';
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  featured?: boolean;
  sortBy: string;
}

interface AdvancedFiltersModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterValues) => void;
  currentFilters: Omit<FilterValues, 'sortBy'>;
  currentSort: string;
  availableCategories?: Array<{ id: string; name: string }>;
}

const TYPE_FILTERS: FilterOption[] = [
  { id: 'all', label: 'Tout afficher' },
  { id: 'gift_cards', label: 'Cartes cadeaux', icon: 'card' },
  { id: 'products', label: 'Produits physiques', icon: 'phone-portrait' },
];

const OTHER_FILTERS: FilterOption[] = [
  { id: 'featured', label: 'Mis en avant', icon: 'star' },
  { id: 'onSale', label: 'En promotion', icon: 'pricetag' },
  { id: 'inStock', label: 'En stock', icon: 'checkmark-circle' },
];

const SORT_OPTIONS: SortOption[] = [
  { id: 'relevance', label: 'Pertinence', icon: 'search' },
  { id: 'popularity', label: 'Popularité', icon: 'trending-up' },
  { id: 'price_asc', label: 'Prix croissant', icon: 'arrow-up' },
  { id: 'price_desc', label: 'Prix décroissant', icon: 'arrow-down' },
  { id: 'newest', label: 'Plus récents', icon: 'time' },
  { id: 'rating', label: 'Mieux notés', icon: 'star' },
];

const RATING_OPTIONS = [
  { id: 5, label: '5 étoiles', icon: 'star' },
  { id: 4, label: '4 étoiles et plus', icon: 'star' },
  { id: 3, label: '3 étoiles et plus', icon: 'star' },
];

export const AdvancedFiltersModal: React.FC<AdvancedFiltersModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  currentSort,
  availableCategories = [],
}) => {
  const { t } = useTranslation();
  const [type, setType] = useState<'all' | 'gift_cards' | 'products'>(currentFilters.type || 'all');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(currentFilters.categories || []);
  const [minPrice, setMinPrice] = useState<string>(currentFilters.minPrice ? String(currentFilters.minPrice) : '');
  const [maxPrice, setMaxPrice] = useState<string>(currentFilters.maxPrice ? String(currentFilters.maxPrice) : '');
  const [minRating, setMinRating] = useState<number | undefined>(currentFilters.minRating);
  const [inStock, setInStock] = useState<boolean>(currentFilters.inStock || false);
  const [onSale, setOnSale] = useState<boolean>(currentFilters.onSale || false);
  const [featured, setFeatured] = useState<boolean>(currentFilters.featured || false);
  const [selectedSort, setSelectedSort] = useState<string>(currentSort);

  // Reset state when modal opens with new filters
  useEffect(() => {
    if (visible) {
      setType(currentFilters.type || 'all');
      setSelectedCategories(currentFilters.categories || []);
      setMinPrice(currentFilters.minPrice ? String(currentFilters.minPrice) : '');
      setMaxPrice(currentFilters.maxPrice ? String(currentFilters.maxPrice) : '');
      setMinRating(currentFilters.minRating);
      setInStock(currentFilters.inStock || false);
      setOnSale(currentFilters.onSale || false);
      setFeatured(currentFilters.featured || false);
      setSelectedSort(currentSort);
    }
  }, [visible, currentFilters, currentSort]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleApply = () => {
    const filters: FilterValues = {
      type: type !== 'all' ? type : undefined,
      categories: selectedCategories.length > 0 ? selectedCategories : undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating,
      inStock: inStock || undefined,
      onSale: onSale || undefined,
      featured: featured || undefined,
      sortBy: selectedSort,
    };
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setType('all');
    setSelectedCategories([]);
    setMinPrice('');
    setMaxPrice('');
    setMinRating(undefined);
    setInStock(false);
    setOnSale(false);
    setFeatured(false);
    setSelectedSort('relevance');
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Title level={4}>Filtres et tri</Title>
            <Pressable onPress={handleReset} style={styles.resetButton}>
              <Caption color="accent">Réinitialiser</Caption>
            </Pressable>
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.secondary} />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Type Filter */}
          <View style={styles.section}>
            <Title level={6} style={styles.sectionTitle}>
              Type de produit
            </Title>
            <View style={styles.optionsGrid}>
              {TYPE_FILTERS.map((option) => {
                const isSelected = type === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.filterOption,
                      isSelected && styles.selectedFilterOption,
                    ]}
                    onPress={() => setType(option.id as any)}
                  >
                    <View style={styles.optionContent}>
                      {option.icon && (
                        <View style={[
                          styles.optionIcon,
                          isSelected && styles.selectedOptionIcon,
                        ]}>
                          <Ionicons
                            name={option.icon}
                            size={18}
                            color={isSelected ? Colors.black : Colors.text.secondary}
                          />
                        </View>
                      )}
                      <Caption
                        style={[
                          styles.optionLabel,
                          isSelected && styles.selectedOptionLabel,
                        ]}
                      >
                        {option.label}
                      </Caption>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Categories */}
          {availableCategories.length > 0 && (
            <View style={styles.section}>
              <Title level={6} style={styles.sectionTitle}>
                Catégories
              </Title>
              <View style={styles.optionsGrid}>
                {availableCategories.map((category) => {
                  const isSelected = selectedCategories.includes(category.id);
                  return (
                    <Pressable
                      key={category.id}
                      style={[
                        styles.filterOption,
                        isSelected && styles.selectedFilterOption,
                      ]}
                      onPress={() => handleCategoryToggle(category.id)}
                    >
                      <Caption
                        style={[
                          styles.optionLabel,
                          isSelected && styles.selectedOptionLabel,
                        ]}
                      >
                        {category.name}
                      </Caption>
                      {isSelected && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={Colors.primary}
                        />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {/* Price Range */}
          <View style={styles.section}>
            <Title level={6} style={styles.sectionTitle}>
              Fourchette de prix (XOF)
            </Title>
            <View style={styles.priceInputs}>
              <View style={styles.priceInputContainer}>
                <Caption style={styles.priceLabel}>Min</Caption>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  keyboardType="numeric"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
              <Caption style={styles.priceSeparator}>-</Caption>
              <View style={styles.priceInputContainer}>
                <Caption style={styles.priceLabel}>Max</Caption>
                <TextInput
                  style={styles.priceInput}
                  placeholder="∞"
                  keyboardType="numeric"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  placeholderTextColor={Colors.text.tertiary}
                />
              </View>
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Title level={6} style={styles.sectionTitle}>
              Note minimum
            </Title>
            <View style={styles.optionsGrid}>
              {RATING_OPTIONS.map((option) => {
                const isSelected = minRating === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.filterOption,
                      isSelected && styles.selectedFilterOption,
                    ]}
                    onPress={() => setMinRating(isSelected ? undefined : option.id)}
                  >
                    <View style={styles.optionContent}>
                      <Ionicons
                        name={option.icon as any}
                        size={18}
                        color={isSelected ? Colors.primary : Colors.text.secondary}
                      />
                      <Caption
                        style={[
                          styles.optionLabel,
                          isSelected && styles.selectedOptionLabel,
                          { marginLeft: Spacing.xs }
                        ]}
                      >
                        {option.label}
                      </Caption>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Other Filters */}
          <View style={styles.section}>
            <Title level={6} style={styles.sectionTitle}>
              Autres filtres
            </Title>
            <View style={styles.optionsGrid}>
              <Pressable
                style={[
                  styles.filterOption,
                  featured && styles.selectedFilterOption,
                ]}
                onPress={() => setFeatured(!featured)}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name="star"
                    size={18}
                    color={featured ? Colors.primary : Colors.text.secondary}
                  />
                  <Caption
                    style={[
                      styles.optionLabel,
                      featured && styles.selectedOptionLabel,
                      { marginLeft: Spacing.xs }
                    ]}
                  >
                    Mis en avant
                  </Caption>
                </View>
                {featured && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.filterOption,
                  onSale && styles.selectedFilterOption,
                ]}
                onPress={() => setOnSale(!onSale)}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name="pricetag"
                    size={18}
                    color={onSale ? Colors.primary : Colors.text.secondary}
                  />
                  <Caption
                    style={[
                      styles.optionLabel,
                      onSale && styles.selectedOptionLabel,
                      { marginLeft: Spacing.xs }
                    ]}
                  >
                    En promotion
                  </Caption>
                </View>
                {onSale && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </Pressable>

              <Pressable
                style={[
                  styles.filterOption,
                  inStock && styles.selectedFilterOption,
                ]}
                onPress={() => setInStock(!inStock)}
              >
                <View style={styles.optionContent}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={inStock ? Colors.primary : Colors.text.secondary}
                  />
                  <Caption
                    style={[
                      styles.optionLabel,
                      inStock && styles.selectedOptionLabel,
                      { marginLeft: Spacing.xs }
                    ]}
                  >
                    En stock
                  </Caption>
                </View>
                {inStock && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.primary}
                  />
                )}
              </Pressable>
            </View>
          </View>

          {/* Sort Options */}
          <View style={styles.section}>
            <Title level={6} style={styles.sectionTitle}>
              Trier par
            </Title>
            <View style={styles.sortOptions}>
              {SORT_OPTIONS.map((option) => {
                const isSelected = selectedSort === option.id;
                return (
                  <Pressable
                    key={option.id}
                    style={[
                      styles.sortOption,
                      isSelected && styles.selectedSortOption,
                    ]}
                    onPress={() => setSelectedSort(option.id)}
                  >
                    <View style={styles.sortContent}>
                      <View style={[
                        styles.sortIcon,
                        isSelected && styles.selectedSortIcon,
                      ]}>
                        <Ionicons
                          name={option.icon}
                          size={18}
                          color={isSelected ? Colors.black : Colors.text.secondary}
                        />
                      </View>
                      <Caption
                        style={[
                          styles.sortLabel,
                          isSelected && styles.selectedSortLabel,
                        ]}
                      >
                        {option.label}
                      </Caption>
                    </View>
                    {isSelected && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Colors.primary}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerButtons}>
            <Button
              variant="outline"
              onPress={onClose}
              size='sm'
              style={styles.cancelButton}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={handleApply}
              size='sm'
              style={styles.applyButton}
            >
              Appliquer
            </Button>
          </View>
        </View>
      </View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  headerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },

  resetButton: {
    marginLeft: Spacing.md,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },

  closeButton: {
    padding: Spacing.sm,
  },

  content: {
    flex: 1,
  },

  scrollContent: {
    paddingBottom: Spacing.xl,
  },

  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },

  sectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },

  optionsGrid: {
    gap: Spacing.sm,
  },

  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  selectedFilterOption: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  optionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },

  selectedOptionIcon: {
    backgroundColor: Colors.primary,
  },

  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },

  selectedOptionLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },

  priceInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  priceInputContainer: {
    flex: 1,
  },

  priceLabel: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginBottom: Spacing.xs,
  },

  priceInput: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border.primary,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text.primary,
  },

  priceSeparator: {
    fontSize: 18,
    color: Colors.text.tertiary,
    marginTop: 20,
  },

  sortOptions: {
    gap: Spacing.sm,
  },

  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.border.primary,
  },

  selectedSortOption: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },

  sortContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  sortIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },

  selectedSortIcon: {
    backgroundColor: Colors.primary,
  },

  sortLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text.primary,
  },

  selectedSortLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },

  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border.primary,
    backgroundColor: Colors.white,
  },

  footerButtons: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.sm,
  },

  cancelButton: {
    flex: 1,
  },

  applyButton: {
    flex: 2,
  },
});

export default AdvancedFiltersModal;
