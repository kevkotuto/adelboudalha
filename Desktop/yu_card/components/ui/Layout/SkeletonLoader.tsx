import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, BorderRadius } from '@/constants';

interface SkeletonItemProps {
  width: number | string;
  height: number;
  marginBottom?: number;
  borderRadius?: number;
}

interface SkeletonLoaderProps {
  variant?: 'card' | 'detail' | 'list' | 'custom';
  isLoading?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
  layout?: SkeletonItemProps[];
}

const SkeletonItem: React.FC<SkeletonItemProps> = ({
  width,
  height,
  marginBottom = 0,
  borderRadius = 4,
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(opacity.value, [0.3, 1], [0.3, 0.7]),
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          marginBottom,
          borderRadius,
          backgroundColor: Colors.gray[100],
          overflow: 'hidden',
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[Colors.gray[100], Colors.gray[50], Colors.gray[100]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{ flex: 1 }}
      />
    </Animated.View>
  );
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  variant = 'card',
  isLoading = true,
  children,
  style,
  layout,
}) => {
  const getLayout = (): SkeletonItemProps[] => {
    if (layout) return layout;

    switch (variant) {
      case 'card':
        return [
          // Image placeholder
          { width: '100%', height: 120, marginBottom: 12, borderRadius: BorderRadius.md },
          // Title
          { width: '80%', height: 16, marginBottom: 8, borderRadius: 4 },
          // Subtitle
          { width: '60%', height: 14, marginBottom: 8, borderRadius: 4 },
          // Price
          { width: '40%', height: 18, marginBottom: 12, borderRadius: 4 },
          // Button
          { width: '100%', height: 36, borderRadius: BorderRadius.md },
        ];

      case 'detail':
        return [
          // Large image
          { width: '100%', height: 250, marginBottom: 20, borderRadius: BorderRadius.lg },
          // Title
          { width: '90%', height: 24, marginBottom: 12, borderRadius: 4 },
          // Price
          { width: '50%', height: 20, marginBottom: 16, borderRadius: 4 },
          // Amount options
          { width: '100%', height: 40, marginBottom: 20, borderRadius: BorderRadius.md },
          // Details section
          { width: '100%', height: 80, marginBottom: 16, borderRadius: BorderRadius.md },
          // Description header
          { width: '70%', height: 18, marginBottom: 12, borderRadius: 4 },
          // Description content
          { width: '100%', height: 60, borderRadius: 4 },
        ];

      case 'list':
        return [
          { width: '100%', height: 16, marginBottom: 8, borderRadius: 4 },
          { width: '80%', height: 14, marginBottom: 8, borderRadius: 4 },
          { width: '60%', height: 14, marginBottom: 12, borderRadius: 4 },
        ];

      case 'custom':
      default:
        return [
          { width: '100%', height: 20, marginBottom: 8, borderRadius: 4 },
          { width: '70%', height: 16, borderRadius: 4 },
        ];
    }
  };

  if (!isLoading) {
    return <>{children}</>;
  }

  return (
    <View style={[styles.container, style]}>
      {getLayout().map((item, index) => (
        <SkeletonItem
          key={index}
          width={item.width}
          height={item.height}
          marginBottom={item.marginBottom}
          borderRadius={item.borderRadius}
        />
      ))}
    </View>
  );
};

// Composants spécialisés pour différents cas d'usage
export const CardSkeleton: React.FC<{ isLoading?: boolean; children?: React.ReactNode }> = ({
  isLoading = true,
  children
}) => (
  <SkeletonLoader variant="card" isLoading={isLoading}>
    {children}
  </SkeletonLoader>
);

export const DetailSkeleton: React.FC<{ isLoading?: boolean; children?: React.ReactNode }> = ({
  isLoading = true,
  children
}) => (
  <SkeletonLoader variant="detail" isLoading={isLoading}>
    {children}
  </SkeletonLoader>
);

export const ListItemSkeleton: React.FC<{ isLoading?: boolean; children?: React.ReactNode }> = ({
  isLoading = true,
  children
}) => (
  <SkeletonLoader variant="list" isLoading={isLoading}>
    {children}
  </SkeletonLoader>
);

// Skeleton pour image uniquement
export const ImageSkeleton: React.FC<{
  width: number | string;
  height: number;
  isLoading?: boolean;
  children?: React.ReactNode;
  style?: ViewStyle;
}> = ({
  width,
  height,
  isLoading = true,
  children,
  style
}) => (
  <SkeletonLoader
    isLoading={isLoading}
    style={style}
    layout={[{ width, height, borderRadius: BorderRadius.md }]}
  >
    {children}
  </SkeletonLoader>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    padding: Spacing.md,
  },
});

export default SkeletonLoader;