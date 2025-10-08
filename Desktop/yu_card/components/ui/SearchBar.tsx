import { BorderRadius, Colors, Spacing } from '@/constants';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { Paragraph } from './Typography';

interface SearchBarProps {
  placeholder?: string;
  onPress?: () => void;
  style?: ViewStyle;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Rechercher...',
  onPress,
  style,
}) => {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
        style,
      ]}
      onPress={onPress}
    >
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={Colors.gray[500]} />
        <Paragraph color="tertiary" style={styles.placeholder}>
          {placeholder}
        </Paragraph>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gray[100],
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.sm,
  },

  placeholder: {
    flex: 1,
  },

  pressed: {
    opacity: 0.8,
  },
});

export default SearchBar;