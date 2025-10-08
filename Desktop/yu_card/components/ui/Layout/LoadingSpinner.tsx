import React from 'react';
import { View, ViewStyle, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors, Spacing } from '@/constants';
import { Paragraph } from '../Typography';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  style?: ViewStyle;
  variant?: 'default' | 'overlay' | 'fullscreen';
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = Colors.primary,
  text,
  style,
  variant = 'default',
}) => {
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 'small' as const;
      case 'medium':
        return 'large' as const;
      case 'large':
        return 'large' as const;
      default:
        return 'large' as const;
    }
  };

  const getContainerStyles = () => {
    switch (variant) {
      case 'overlay':
        return styles.overlay;
      case 'fullscreen':
        return styles.fullscreen;
      case 'default':
      default:
        return styles.default;
    }
  };

  return (
    <View style={[getContainerStyles(), style]}>
      <View style={styles.content}>
        <ActivityIndicator
          size={getSpinnerSize()}
          color={color}
          style={styles.spinner}
        />

        {text && (
          <Paragraph
            size="small"
            color="secondary"
            align="center"
            style={styles.text}
          >
            {text}
          </Paragraph>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  default: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },

  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },

  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background.primary,
  },

  content: {
    alignItems: 'center',
  },

  spinner: {
    marginBottom: Spacing.md,
  },

  text: {
    maxWidth: 200,
  },
});

export default LoadingSpinner;