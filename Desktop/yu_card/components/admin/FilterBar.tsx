/**
 * FilterBar Component - Horizontal filter buttons for admin screens
 */

import React from 'react';
import { View, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Paragraph } from '@/components/ui/Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';

export interface FilterOption {
  key: string;
  label: string;
  color?: string;
}

interface FilterBarProps {
  filters: FilterOption[];
  selectedFilter: string;
  onFilterChange: (filterKey: string) => void;
  style?: any;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  selectedFilter,
  onFilterChange,
  style,
}) => {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
    >
      <View style={styles.filtersRow}>
        {filters.map((filter) => (
          <Pressable
            key={filter.key}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedFilter === filter.key
                    ? filter.color || Colors.admin.dark.text.accent
                    : Colors.admin.dark.background.card,
                borderColor:
                  selectedFilter === filter.key
                    ? filter.color || Colors.admin.dark.text.accent
                    : Colors.admin.dark.border.primary,
              },
            ]}
            onPress={() => onFilterChange(filter.key)}
          >
            <Paragraph
              size="small"
              style={[
                styles.filterText,
                {
                  color:
                    selectedFilter === filter.key
                      ? Colors.white
                      : Colors.admin.dark.text.secondary,
                },
              ]}
            >
              {filter.label}
            </Paragraph>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },

  filtersRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
    gap: Spacing.sm,
  },

  filterButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },

  filterText: {
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
  },
});
