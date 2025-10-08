import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { Title, Caption } from '../Typography';
import { Button } from '../Buttons';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';

type FilterType = 'all' | 'gift_card' | 'product';
type CategoryType = 'all' | 'gaming' | 'tech' | 'entertainment' | 'smartphone' | 'tablet' | 'accessories' | 'laptop' | 'shopping';

interface FilterBottomSheetProps {
  activeFilter: FilterType;
  activeCategory: CategoryType;
  onFilterChange: (filter: FilterType) => void;
  onCategoryChange: (category: CategoryType) => void;
  onApply: () => void;
  onClose: () => void;
}

interface FilterOption {
  value: FilterType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

interface CategoryOption {
  value: CategoryType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const FilterBottomSheet = forwardRef<BottomSheet, FilterBottomSheetProps>(({
  activeFilter,
  activeCategory,
  onFilterChange,
  onCategoryChange,
  onApply,
  onClose,
}, ref) => {
  const { t } = useTranslation();

  const snapPoints = useMemo(() => ['75%'], []);

  const filterOptions: FilterOption[] = [
    {
      value: 'all',
      label: t('filter.all') || 'Tout',
      icon: 'apps',
    },
    {
      value: 'gift_card',
      label: t('filter.gift_cards') || 'Cartes cadeaux',
      icon: 'card',
    },
    {
      value: 'product',
      label: t('filter.products') || 'Produits physiques',
      icon: 'phone-portrait',
    },
  ];

  const categoryOptions: CategoryOption[] = [
    {
      value: 'all',
      label: t('categories.all') || 'Toutes les catégories',
      icon: 'apps',
    },
    {
      value: 'gaming',
      label: t('categories.gaming') || 'Gaming',
      icon: 'game-controller',
    },
    {
      value: 'tech',
      label: t('categories.tech') || 'Technologie',
      icon: 'hardware-chip',
    },
    {
      value: 'entertainment',
      label: t('categories.entertainment') || 'Divertissement',
      icon: 'musical-notes',
    },
    {
      value: 'smartphone',
      label: t('categories.smartphone') || 'Smartphones',
      icon: 'phone-portrait',
    },
    {
      value: 'tablet',
      label: t('categories.tablet') || 'Tablettes',
      icon: 'tablet-portrait',
    },
    {
      value: 'accessories',
      label: t('categories.accessories') || 'Accessoires',
      icon: 'headset',
    },
    {
      value: 'laptop',
      label: t('categories.laptop') || 'Ordinateurs',
      icon: 'laptop',
    },
    {
      value: 'shopping',
      label: t('categories.shopping') || 'Shopping',
      icon: 'bag',
    },
  ];

  const renderBackdrop = useCallback(
    (props: any) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  const FilterOption = ({ option, isSelected, onPress }: {
    option: FilterOption;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      style={[
        styles.filterOption,
        isSelected && styles.selectedOption,
      ]}
      onPress={onPress}
    >
      <View style={styles.optionContent}>
        <Ionicons
          name={option.icon}
          size={20}
          color={isSelected ? Colors.primary : Colors.text.secondary}
        />
        <Caption
          style={[
            styles.optionLabel,
            isSelected && styles.selectedLabel,
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

  const CategoryOption = ({ option, isSelected, onPress }: {
    option: CategoryOption;
    isSelected: boolean;
    onPress: () => void;
  }) => (
    <Pressable
      style={[
        styles.categoryOption,
        isSelected && styles.selectedCategoryOption,
      ]}
      onPress={onPress}
    >
      <View style={styles.categoryContent}>
        <View style={[
          styles.categoryIcon,
          isSelected && styles.selectedCategoryIcon,
        ]}>
          <Ionicons
            name={option.icon}
            size={16}
            color={isSelected ? Colors.black : Colors.text.secondary}
          />
        </View>
        <Caption
          style={[
            styles.categoryLabel,
            isSelected && styles.selectedCategoryLabel,
          ]}
          numberOfLines={1}
        >
          {option.label}
        </Caption>
      </View>
    </Pressable>
  );

  const resetFilters = () => {
    onFilterChange('all');
    onCategoryChange('all');
  };

  const hasActiveFilters = activeFilter !== 'all' || activeCategory !== 'all';

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      backdropComponent={renderBackdrop}
      enablePanDownToClose
      onClose={onClose}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Title level={5}>
              {t('filter.title') || 'Filtres'}
            </Title>
            {hasActiveFilters && (
              <Pressable onPress={resetFilters} style={styles.resetButton}>
                <Caption color="accent">
                  {t('filter.reset') || 'Réinitialiser'}
                </Caption>
              </Pressable>
            )}
          </View>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.secondary} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Type Filter */}
          <View style={styles.section}>
            <Title level={6} style={styles.sectionTitle}>
              {t('filter.type') || 'Type de produit'}
            </Title>
            <View style={styles.filterOptions}>
              {filterOptions.map((option) => (
                <FilterOption
                  key={option.value}
                  option={option}
                  isSelected={activeFilter === option.value}
                  onPress={() => onFilterChange(option.value)}
                />
              ))}
            </View>
          </View>

          {/* Category Filter */}
          <View style={styles.section}>
            <Title level={6} style={styles.sectionTitle}>
              {t('filter.category') || 'Catégorie'}
            </Title>
            <View style={styles.categoryGrid}>
              {categoryOptions.map((option) => (
                <CategoryOption
                  key={option.value}
                  option={option}
                  isSelected={activeCategory === option.value}
                  onPress={() => onCategoryChange(option.value)}
                />
              ))}
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Button
            variant="primary"
            onPress={onApply}
            style={styles.applyButton}
          >
            {t('filter.apply') || 'Appliquer les filtres'}
          </Button>
        </View>
      </BottomSheetView>
    </BottomSheet>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.light,
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
    padding: Spacing.xs,
  },

  content: {
    flex: 1,
    padding: Spacing.lg,
  },

  section: {
    marginBottom: Spacing.xl,
  },

  sectionTitle: {
    marginBottom: Spacing.md,
  },

  filterOptions: {
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
    borderColor: Colors.border.light,
  },

  selectedOption: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },

  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  optionLabel: {
    marginLeft: Spacing.sm,
  },

  selectedLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },

  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },

  categoryOption: {
    width: '48%',
    marginBottom: Spacing.sm,
  },

  selectedCategoryOption: {
    // Additional styling if needed
  },

  categoryContent: {
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.border.light,
  },

  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },

  selectedCategoryIcon: {
    backgroundColor: Colors.primary,
  },

  categoryLabel: {
    textAlign: 'center',
    fontSize: 12,
  },

  selectedCategoryLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },

  footer: {
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.border.light,
  },

  applyButton: {
    width: '100%',
  },
});

FilterBottomSheet.displayName = 'FilterBottomSheet';

export default FilterBottomSheet;