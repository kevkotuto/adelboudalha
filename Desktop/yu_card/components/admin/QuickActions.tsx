/**
 * QuickActions Component - Quick action buttons grid for admin
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Title, Paragraph } from '@/components/ui/Typography';
import { Card } from '@/components/ui/Layout/Card';
import { Button } from '@/components/ui/Buttons/Button';
import { Colors, Spacing, BorderRadius } from '@/constants';

export interface QuickAction {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}

interface QuickActionsProps {
  title?: string;
  actions: QuickAction[];
  style?: any;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  title,
  actions,
  style,
}) => {
  return (
    <Card
      style={[
        styles.container,
        {
          backgroundColor: Colors.admin.dark.background.card,
          borderColor: Colors.admin.dark.border.primary,
        },
        style,
      ]}
    >
      {title && (
        <Title level={5} style={[styles.title, { color: Colors.admin.dark.text.primary }]}>
          {title}
        </Title>
      )}
      <View style={styles.actionsGrid}>
        {actions.map((action, index) => (
          <Button
            key={index}
            variant="outline"
            size="small"
            onPress={action.onPress}
            disabled={action.disabled}
            style={[
              styles.actionButton,
              { borderColor: Colors.admin.dark.border.primary },
            ]}
          >
            <Ionicons
              name={action.icon}
              size={16}
              color={Colors.admin.dark.text.accent}
            />
            <Paragraph size="small" style={styles.actionText}>
              {action.label}
            </Paragraph>
          </Button>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
  },

  title: {
    marginBottom: Spacing.md,
    color: Colors.admin.dark.text.primary,
  },

  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  actionButton: {
    flex: 1,
    marginHorizontal: Spacing.xs,
    flexDirection: 'column',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    minWidth: 80,
  },

  actionText: {
    marginTop: Spacing.xs,
    fontSize: 12,
    color: Colors.admin.dark.text.primary,
    textAlign: 'center',
  },
});
