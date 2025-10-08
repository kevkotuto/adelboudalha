import { BorderRadius, Colors, Spacing } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import {
  Dimensions,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Caption, Title } from '../Typography';

const { width } = Dimensions.get('window');

interface CategoryItem {
  id: string;
  name: string;
  image: any; // Support for require() and URI strings
  count?: number; // Nombre d'articles dans la cat�gorie
}

interface CategorieCardProps {
  title: string;
  categories: CategoryItem[];
  numberOfColumns?: number;
  numberOfLines?: number;
  onSeeAll?: () => void;
  onCategoryPress?: (category: CategoryItem) => void;
  style?: ViewStyle;
}

export const CategorieCard: React.FC<CategorieCardProps> = ({
  title,
  categories,
  numberOfColumns = 3,
  numberOfLines = 2,
  onSeeAll,
  onCategoryPress,
  style,
}) => {
  // Calculer le nombre d'items � afficher
  const itemsToShow = numberOfColumns * numberOfLines;
  const displayedCategories = categories.slice(0, itemsToShow);

  // Calculer la largeur d'un item
  const itemWidth = (width - Spacing.md * 2 - Spacing.xs * (numberOfColumns - 1)) / numberOfColumns;

  const renderCategory = ({ item }: { item: CategoryItem }) => (
    <Pressable
      style={({ pressed }) => [
        styles.categoryItem,
        {
          width: itemWidth,
          height: itemWidth * 0.8, // Ratio rectangulaire
        },
        pressed && styles.pressed,
      ]}
      onPress={() => onCategoryPress?.(item)}
    >
      <View style={styles.categoryCard}>
        <Image
          source={typeof item.image === 'string' ? { uri: item.image } : item.image}
          style={styles.categoryImage}
          contentFit="contain"
          transition={300}
        />
      </View>
    </Pressable>
  );

  return (
    <View style={[styles.container, style]}>
      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Title level={7}>{title}</Title>
        {onSeeAll && (
          <Pressable onPress={onSeeAll} style={styles.seeAllButton}>
            <Caption color="accent" style={styles.seeAllText}>
              Voir plus
            </Caption>
            <Ionicons name="chevron-forward" size={16} color={Colors.primaryDark} />
          </Pressable>
        )}
      </View>

      {/* Categories Grid */}
      <FlatList
        data={displayedCategories}
        renderItem={renderCategory}
        keyExtractor={(item) => item.id}
        numColumns={numberOfColumns}
        scrollEnabled={false}
        columnWrapperStyle={numberOfColumns > 1 ? styles.row : null}
        contentContainerStyle={styles.gridContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  seeAllText: {
    fontWeight: '600',
    marginRight: Spacing.xs,
  },

  gridContainer: {
    paddingHorizontal: Spacing.md,
  },

  row: {
    justifyContent: 'space-between',
    gap: 1, // Gap très minimal entre les colonnes
  },

  categoryItem: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },

  categoryCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },

  categoryImage: {
    width: '100%',
    height: 75,
    aspectRatio : 16/9,
  },


  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  singleCard: {
    borderRadius: BorderRadius.card,
    overflow: 'hidden',
  },
});

// Version simplifi�e pour une seule cat�gorie
export const SingleCategoryCard: React.FC<{
  category: CategoryItem;
  width?: number;
  onPress?: () => void;
  style?: ViewStyle;
}> = ({ category, width: customWidth, onPress, style }) => {
  const cardWidth = customWidth || width * 0.3;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.singleCard,
        {
          width: cardWidth,
          height: cardWidth * 0.8,
        },
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.categoryCard}>
        <Image
          source={typeof category.image === 'string' ? { uri: category.image } : category.image}
          style={styles.categoryImage}
          contentFit="cover"
          transition={300}
        />
      </View>
    </Pressable>
  );
};

export default CategorieCard;