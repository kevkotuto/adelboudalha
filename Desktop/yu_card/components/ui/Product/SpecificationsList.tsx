import React, { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Title, Paragraph, Caption } from '../Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';

interface Specification {
  key: string;
  value: string;
}

interface SpecificationsListProps {
  specifications: Specification[] | Record<string, any>;
  title?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

export function SpecificationsList({
  specifications,
  title = 'Spécifications',
  collapsible = false,
  defaultExpanded = true,
}: SpecificationsListProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  // Normalize specifications to array format
  const normalizeSpecs = (): Specification[] => {
    if (Array.isArray(specifications)) {
      return specifications;
    }

    // Convert object to array of key-value pairs
    return Object.entries(specifications).map(([key, value]) => ({
      key,
      value: String(value),
    }));
  };

  const specs = normalizeSpecs();

  if (!specs || specs.length === 0) {
    return null;
  }

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.header}
        onPress={handleToggle}
        disabled={!collapsible}
      >
        <Title level={6}>{title}</Title>
        {collapsible && (
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.text.primary}
          />
        )}
      </Pressable>

      {isExpanded && (
        <View style={styles.specsContainer}>
          {specs.map((spec, index) => (
            <View
              key={`${spec.key}-${index}`}
              style={[
                styles.specRow,
                index !== specs.length - 1 && styles.specRowBorder,
              ]}
            >
              <View style={styles.specKeyContainer}>
                <Caption color="secondary" style={styles.specKey}>
                  {spec.key}
                </Caption>
              </View>
              <View style={styles.specValueContainer}>
                <Paragraph style={styles.specValue}>{spec.value}</Paragraph>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },

  specsContainer: {
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  specRow: {
    flexDirection: 'row',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },

  specRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border.primary,
  },

  specKeyContainer: {
    flex: 2,
    justifyContent: 'center',
  },

  specKey: {
    fontWeight: '500',
  },

  specValueContainer: {
    flex: 3,
    justifyContent: 'center',
  },

  specValue: {
    fontWeight: '600',
    textAlign: 'right',
  },
});
