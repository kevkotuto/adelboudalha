import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants';

const { width } = Dimensions.get('window');

interface ProductSkeletonProps {
  count?: number;
}

const SkeletonItem = () => {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.skeletonItem}>
      {/* Image Container - Same as ProductCard */}
      <Animated.View style={[styles.skeletonImage, { opacity }]} />

      {/* Content - Same structure as ProductCard */}
      <View style={styles.skeletonContent}>
        {/* Brand */}
        <Animated.View style={[styles.skeletonBrand, { opacity }]} />

        {/* Product Name */}
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />

        {/* Price */}
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />

        {/* Button - Same as ProductCard sm button */}
        <Animated.View style={[styles.skeletonButton, { opacity }]} />
      </View>
    </View>
  );
};

export const ProductSkeleton: React.FC<ProductSkeletonProps> = ({ count = 6 }) => {
  const renderSkeletonRow = (startIndex: number) => {
    return (
      <View key={startIndex} style={styles.row}>
        <View style={[styles.skeletonItemWrapper, styles.firstColumn]}>
          <SkeletonItem />
        </View>
        {startIndex + 1 < count && (
          <View style={styles.skeletonItemWrapper}>
            <SkeletonItem />
          </View>
        )}
      </View>
    );
  };

  const rows = [];
  for (let i = 0; i < count; i += 2) {
    rows.push(renderSkeletonRow(i));
  }

  return <View style={styles.container}>{rows}</View>;
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: Spacing.xl,
  },

  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
  },

  skeletonItemWrapper: {
    flex: 1,
    maxWidth: (width - Spacing.lg * 2) / 2,
    marginHorizontal: Spacing.xs,
  },

  firstColumn: {
    marginLeft: Spacing.md,
    marginRight: Spacing.xs,
  },

  skeletonItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    height: 300, // Same as ProductCard
    margin: 5,
  },

  skeletonImage: {
    height: 150,
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.card,
  },

  skeletonContent: {
    padding: Spacing.md,
    flex: 1,
    justifyContent: 'space-between',
  },

  skeletonBrand: {
    height: 12, // Caption size
    width: '40%',
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.xs,
    marginBottom: 2,
  },

  skeletonTitle: {
    height: 16, // Paragraph base size
    width: '80%',
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.xs,
  },

  skeletonPrice: {
    height: 20, // Title level 6
    width: '60%',
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.xs,
    marginBottom: Spacing.sm,
  },

  skeletonButton: {
    height: 36, // Small button height
    width: '100%',
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
  },
});

export default ProductSkeleton;