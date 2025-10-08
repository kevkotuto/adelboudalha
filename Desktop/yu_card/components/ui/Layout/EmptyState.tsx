import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants';
import { Title, Paragraph } from '../Typography';
import { Button } from '../Buttons';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionLabel?: string;
  onActionPress?: () => void;
  style?: ViewStyle;
  variant?: 'default' | 'minimal' | 'illustration';
  illustration?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionLabel,
  onActionPress,
  style,
  variant = 'default',
  illustration,
}) => {
  const renderIcon = () => {
    if (variant === 'illustration' && illustration) {
      return <View style={styles.illustration}>{illustration}</View>;
    }

    return (
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={variant === 'minimal' ? 48 : 64}
          color={Colors.text.tertiary}
        />
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {renderIcon()}

      <View style={styles.content}>
        <Title
          level={variant === 'minimal' ? 5 : 4}
          color="primary"
          align="center"
          style={styles.title}
        >
          {title}
        </Title>

        {description && (
          <Paragraph
            size={variant === 'minimal' ? 'small' : 'base'}
            color="secondary"
            align="center"
            style={styles.description}
          >
            {description}
          </Paragraph>
        )}

        {actionLabel && onActionPress && (
          <Button
            variant={variant === 'minimal' ? 'outline' : 'primary'}
            size={variant === 'minimal' ? 'sm' : 'md'}
            onPress={onActionPress}
            style={styles.action}
          >
            {actionLabel}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },

  iconContainer: {
    marginBottom: Spacing.xl,
    opacity: 0.6,
  },

  illustration: {
    marginBottom: Spacing.xl,
  },

  content: {
    alignItems: 'center',
    maxWidth: 280,
  },

  title: {
    marginBottom: Spacing.md,
  },

  description: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },

  action: {
    minWidth: 140,
  },
});

export default EmptyState;