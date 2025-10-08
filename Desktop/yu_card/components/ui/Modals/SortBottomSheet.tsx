import React, { forwardRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';

import { Title, Caption } from '../Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';

type SortType = 'relevance' | 'popularity' | 'price_asc' | 'price_desc' | 'newest' | 'rating';

interface SortBottomSheetProps {
  activeSortBy: SortType;
  onSortChange: (sortBy: SortType) => void;
  onClose: () => void;
}

interface SortOption {
  value: SortType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const SortBottomSheet = forwardRef<BottomSheet, SortBottomSheetProps>(({
  activeSortBy,
  onSortChange,
  onClose,
}, ref) => {
  const { t } = useTranslation();

  const snapPoints = useMemo(() => ['45%'], []);

  const sortOptions: SortOption[] = [
    {
      value: 'relevance',
      label: t('sort.relevance') || 'Pertinence',
      icon: 'search',
    },
    {
      value: 'popularity',
      label: t('sort.popularity') || 'Popularité',
      icon: 'trending-up',
    },
    {
      value: 'price_asc',
      label: t('sort.price_low_to_high') || 'Prix croissant',
      icon: 'arrow-up',
    },
    {
      value: 'price_desc',
      label: t('sort.price_high_to_low') || 'Prix décroissant',
      icon: 'arrow-down',
    },
    {
      value: 'newest',
      label: t('sort.newest') || 'Plus récents',
      icon: 'time',
    },
    {
      value: 'rating',
      label: t('sort.rating') || 'Mieux notés',
      icon: 'star',
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

  const handleSortSelect = (sortBy: SortType) => {
    onSortChange(sortBy);
    onClose();
  };

  const SortOption = ({ option, isSelected }: {
    option: SortOption;
    isSelected: boolean;
  }) => (
    <Pressable
      style={[
        styles.sortOption,
        isSelected && styles.selectedOption,
      ]}
      onPress={() => handleSortSelect(option.value)}
    >
      <View style={styles.optionContent}>
        <View style={[
          styles.iconContainer,
          isSelected && styles.selectedIconContainer,
        ]}>
          <Ionicons
            name={option.icon}
            size={20}
            color={isSelected ? Colors.black : Colors.text.secondary}
          />
        </View>
        <View style={styles.labelContainer}>
          <Caption
            style={[
              styles.optionLabel,
              isSelected && styles.selectedLabel,
            ]}
          >
            {option.label}
          </Caption>
        </View>
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
          <Title level={5}>
            {t('sort.title') || 'Trier par'}
          </Title>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.text.secondary} />
          </Pressable>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {sortOptions.map((option) => (
            <SortOption
              key={option.value}
              option={option}
              isSelected={activeSortBy === option.value}
            />
          ))}
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

  closeButton: {
    padding: Spacing.xs,
  },

  content: {
    flex: 1,
    padding: Spacing.lg,
  },

  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.sm,
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
    flex: 1,
  },

  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  selectedIconContainer: {
    backgroundColor: Colors.primary,
  },

  labelContainer: {
    flex: 1,
  },

  optionLabel: {
    fontSize: 14,
    fontWeight: '500',
  },

  selectedLabel: {
    color: Colors.primary,
    fontWeight: '600',
  },
});

SortBottomSheet.displayName = 'SortBottomSheet';

export default SortBottomSheet;