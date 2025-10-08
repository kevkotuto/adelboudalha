import React from 'react';
import {
  Image,
  Pressable,
  StyleSheet,
  View,
  ViewStyle
} from 'react-native';

import { BorderRadius, Spacing } from '@/constants';
import { Paragraph } from '../Typography';

interface CategoryImageCardProps {
  title: string;
  image: any;
  onPress?: () => void;
  style?: ViewStyle;
}

export const CategoryImageCard: React.FC<CategoryImageCardProps> = ({
  title,
  image,
  onPress,
  style,
}) => {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Image
        source={image}
        style={styles.imageBackground}
        resizeMode="contain"
      />
      <View style={styles.textContainer}>
        <Paragraph style={styles.title}>
          {title}
        </Paragraph>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    marginVertical: Spacing.sm,
    alignSelf: 'center',
    marginHorizontal: Spacing.sm,
  },

  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },

  imageBackground: {
    aspectRatio: 16 / 9,
    borderRadius: BorderRadius.lg,
    padding : 5,
    height: 110
  },

  image: {
    borderRadius: BorderRadius.lg,
  },

  textContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
  },

  title: {
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default CategoryImageCard;