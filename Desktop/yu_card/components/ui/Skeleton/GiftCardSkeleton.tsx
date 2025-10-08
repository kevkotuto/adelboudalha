import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Colors, Spacing, BorderRadius } from '@/constants';

const GiftCardSkeletonItem = () => {
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
      {/* Image Container - Same height as GiftCard image (100) */}
      <Animated.View style={[styles.skeletonImage, { opacity }]} />

      {/* Content - Same as GiftCard content */}
      <View style={styles.skeletonContent}>
        {/* Title - small paragraph */}
        <Animated.View style={[styles.skeletonTitle, { opacity }]} />

        {/* Price - Title level 6 */}
        <Animated.View style={[styles.skeletonPrice, { opacity }]} />
      </View>

      {/* Button - Same size as sm button */}
      <Animated.View style={[styles.skeletonButton, { opacity }]} />
    </View>
  );
};

export const GiftCardSkeleton: React.FC = () => {
  return <GiftCardSkeletonItem />;
};

const styles = StyleSheet.create({
  skeletonItem: {
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    padding: Spacing.md,
    height: 210, // Same as GiftCard
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },

  skeletonImage: {
    height: 100, // Same as GiftCard image container
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.card,
  },

  skeletonContent: {
    gap: Spacing.xs,
  },

  skeletonTitle: {
    height: 14, // Small paragraph size
    width: '70%',
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.xs,
  },

  skeletonPrice: {
    height: 20, // Title level 6 size
    width: '50%',
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.xs,
  },

  skeletonButton: {
    height: 36, // Small button height
    width: '100%',
    backgroundColor: Colors.gray[200],
    borderRadius: BorderRadius.md,
  },
});

export default GiftCardSkeleton;
