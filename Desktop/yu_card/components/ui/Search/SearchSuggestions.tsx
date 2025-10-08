import React from 'react';
import { View, StyleSheet, Pressable, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Caption } from '../Typography';
import { Colors, Spacing, BorderRadius } from '@/constants';

interface SearchSuggestionsProps {
  suggestions: string[];
  recentSearches?: string[];
  onSuggestionPress: (suggestion: string) => void;
  visible: boolean;
}

export const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({
  suggestions,
  recentSearches = [],
  onSuggestionPress,
  visible,
}) => {
  // Return wrapper with pointerEvents="none" when invisible to prevent blocking touches on Android
  if (!visible) {
    return <View style={styles.hiddenContainer} pointerEvents="none" />;
  }

  return (
    <View style={styles.container} pointerEvents="auto">
      {recentSearches.length > 0 && (
        <View style={styles.section}>
          <Caption color="secondary" style={styles.sectionTitle}>
            Recherches récentes
          </Caption>
          {recentSearches.map((search, index) => (
            <Pressable
              key={index}
              style={styles.suggestionItem}
              onPress={() => onSuggestionPress(search)}
            >
              <Ionicons name="time-outline" size={16} color={Colors.text.tertiary} />
              <Caption style={styles.suggestionText}>{search}</Caption>
            </Pressable>
          ))}
        </View>
      )}

      {suggestions.length > 0 && (
        <View style={styles.section}>
          <Caption color="secondary" style={styles.sectionTitle}>
            Suggestions
          </Caption>
          {suggestions.map((suggestion, index) => (
            <Pressable
              key={index}
              style={styles.suggestionItem}
              onPress={() => onSuggestionPress(suggestion)}
            >
              <Ionicons name="search" size={16} color={Colors.text.tertiary} />
              <Caption style={styles.suggestionText}>{suggestion}</Caption>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  hiddenContainer: {
    position: 'absolute',
    width: 0,
    height: 0,
  },

  container: {
    position: 'absolute',
    top: 60,
    left: Spacing.md,
    right: Spacing.md,
    backgroundColor: Colors.white,
    borderRadius: BorderRadius.md,
    zIndex: 1000,
    maxHeight: 300,
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  section: {
    paddingVertical: Spacing.sm,
  },

  sectionTitle: {
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
    fontSize: 12,
    textTransform: 'uppercase',
  },

  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  suggestionText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
});

export default SearchSuggestions;