import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Caption } from '../Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';

interface FilterChip {
  id: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  value: any;
}

interface QuickFiltersProps {
  filters: FilterChip[];
  activeFilters: string[];
  onFilterPress: (filterId: string) => void;
  onClearAll?: () => void;
}

export const QuickFilters: React.FC<QuickFiltersProps> = ({
  filters,
  activeFilters,
  onFilterPress,
  onClearAll,
}) => {
  const { t } = useTranslation();
  const hasActiveFilters = activeFilters.length > 0;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled={true}
      >
        {/* Clear All Button */}
        {hasActiveFilters && onClearAll && (
          <Pressable
            style={[styles.chip, styles.clearChip]}
            onPress={onClearAll}
          >
            <Ionicons name="close-circle" size={16} color={Colors.text.secondary} />
            <Caption style={styles.clearText}>{t('common.cancel')}</Caption>
          </Pressable>
        )}

        {/* Filter Chips */}
        {filters.map((filter) => {
          const isActive = activeFilters.includes(filter.id);
          return (
            <Pressable
              key={filter.id}
              style={[
                styles.chip,
                isActive && styles.activeChip,
              ]}
              onPress={() => onFilterPress(filter.id)}
            >
              {filter.icon && (
                <Ionicons
                  name={filter.icon}
                  size={16}
                  color={isActive ? Colors.black : Colors.text.secondary}
                  style={styles.chipIcon}
                />
              )}
              <Caption
                style={[
                  styles.chipText,
                  isActive && styles.activeChipText,
                ]}
              >
                {filter.label}
              </Caption>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray[100],
  },

  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.xs,
  },

  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[50],
    borderWidth: 1,
    borderColor: Colors.gray[200],
    marginRight: Spacing.xs,
  },

  activeChip: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },

  clearChip: {
    backgroundColor: Colors.white,
    borderColor: Colors.gray[300],
  },

  chipIcon: {
    marginRight: Spacing.xs,
  },

  chipText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.text.secondary,
  },

  activeChipText: {
    color: Colors.black,
    fontWeight: '600',
  },

  clearText: {
    marginLeft: Spacing.xs,
    color: Colors.text.secondary,
    fontWeight: '500',
  },
});

export default QuickFilters;