import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { Spacing, Colors } from '@/constants';

interface ContainerProps {
  children: React.ReactNode;
  variant?: 'default' | 'padded' | 'centered' | 'fullscreen';
  backgroundColor?: string;
  style?: ViewStyle;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  variant = 'default',
  backgroundColor = Colors.background.primary,
  style,
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'padded':
        return {
          paddingHorizontal: Spacing.container.horizontal,
          paddingVertical: Spacing.container.vertical,
        };
      case 'centered':
        return {
          alignItems: 'center' as const,
          justifyContent: 'center' as const,
          paddingHorizontal: Spacing.container.horizontal,
        };
      case 'fullscreen':
        return {
          flex: 1,
          paddingHorizontal: Spacing.container.horizontal,
          paddingVertical: Spacing.container.vertical,
        };
      case 'default':
      default:
        return {
          paddingHorizontal: Spacing.container.horizontal,
        };
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor },
        getVariantStyles(),
        style,
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Base container styles
  },
});

export default Container;