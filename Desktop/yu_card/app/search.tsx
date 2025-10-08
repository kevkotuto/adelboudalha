import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { searchService } from '@/services/searchService';

const RECENT_SEARCHES_KEY = '@recent_searches';

interface Suggestion {
  text: string;
  type: 'query' | 'related';
}

const SearchScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  // Load recent searches on mount
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // Get autocomplete suggestions
  useEffect(() => {
    const loadSuggestions = async () => {
      if (searchQuery.length >= 2) {
        try {
          setLoadingSuggestions(true);
          const response = await searchService.autocomplete({ q: searchQuery, limit: 10 });

          console.log('Autocomplete response:', response);

          setSuggestions(response.suggestions || []);
        } catch (error) {
          console.error('Failed to load suggestions:', error);
          setSuggestions([]);
        } finally {
          setLoadingSuggestions(false);
        }
      } else {
        setSuggestions([]);
        setLoadingSuggestions(false);
      }
    };

    const debounce = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const loadRecentSearches = async () => {
    try {
      const recent = await AsyncStorage.getItem(RECENT_SEARCHES_KEY);
      if (recent) {
        setRecentSearches(JSON.parse(recent));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };

  const saveToRecentSearches = async (query: string) => {
    try {
      const trimmed = query.trim();
      if (!trimmed) return;

      const updated = [trimmed, ...recentSearches.filter(s => s !== trimmed)].slice(0, 10);
      await AsyncStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      setRecentSearches(updated);
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  };

  const handleSearch = (query: string) => {
    const trimmed = query.trim();
    if (trimmed) {
      saveToRecentSearches(trimmed);
      router.push({
        pathname: '/search-results',
        params: { query: trimmed }
      });
    }
  };

  const handleSuggestionPress = (suggestion: Suggestion) => {
    handleSearch(suggestion.text);
  };

  const handleRecentSearchPress = (query: string) => {
    handleSearch(query);
  };

  const clearRecentSearches = async () => {
    try {
      await AsyncStorage.removeItem(RECENT_SEARCHES_KEY);
      setRecentSearches([]);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Header avec SearchBar */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </Pressable>

          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <Ionicons name="search" size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus
                returnKeyType="search"
                onSubmitEditing={() => handleSearch(searchQuery)}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={20} color="#666" />
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Contenu */}
        <View style={styles.content}>
          {searchQuery.length === 0 ? (
            <>
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Recherches récentes</Text>
                    <Pressable onPress={clearRecentSearches}>
                      <Text style={styles.clearButton}>Effacer</Text>
                    </Pressable>
                  </View>
                  <FlatList
                    data={recentSearches}
                    keyExtractor={(item, index) => `recent-${index}`}
                    renderItem={({ item }) => (
                      <Pressable
                        style={styles.suggestionItem}
                        onPress={() => handleRecentSearchPress(item)}
                      >
                        <Ionicons name="time-outline" size={20} color="#666" />
                        <Text style={styles.suggestionText}>{item}</Text>
                      </Pressable>
                    )}
                  />
                </>
              )}
              <Text style={styles.infoText}>Commencez à taper pour rechercher des cartes cadeaux et produits</Text>
            </>
          ) : (
            <>
              {/* Autocomplete Suggestions */}
              {loadingSuggestions && (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#F4D03F" />
                </View>
              )}
              {suggestions.length > 0 && !loadingSuggestions && (
                <FlatList
                  data={suggestions}
                  keyExtractor={(item, index) => `suggestion-${index}`}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.suggestionItem}
                      onPress={() => handleSuggestionPress(item)}
                    >
                      <Ionicons
                        name={item.type === 'related' ? 'trending-up' : 'search'}
                        size={20}
                        color="#666"
                      />
                      <Text style={styles.suggestionText}>{item.text}</Text>
                    </Pressable>
                  )}
                />
              )}
              <Pressable
                style={styles.searchButton}
                onPress={() => handleSearch(searchQuery)}
              >
                <Text style={styles.searchButtonText}>Rechercher "{searchQuery}"</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  searchContainer: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    paddingVertical: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  searchButton: {
    backgroundColor: '#F4D03F',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  clearButton: {
    fontSize: 14,
    color: '#F4D03F',
    fontWeight: '500',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  loadingContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
});

export default SearchScreen;