import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/Buttons/Button';
import { Card } from '@/components/ui/Layout/Card';
import { Container } from '@/components/ui/Layout/Container';
import { Divider } from '@/components/ui/Layout/Divider';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

const LANGUAGES = [
  { code: 'fr', name: 'Français', flag: '🇫🇷', native: 'Français' },
  { code: 'en', name: 'Anglais', flag: '🇺🇸', native: 'English' },
  { code: 'ar', name: 'Arabe', flag: '🇸🇦', native: 'العربية' },
  { code: 'es', name: 'Espagnol', flag: '🇪🇸', native: 'Español' },
  { code: 'bm', name: 'Bambara', flag: '🇲🇱', native: 'Bamanankan' },
];

export default function LanguageScreen() {
  const [selectedLanguage, setSelectedLanguage] = useState('fr');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);

    // Simulation de la sauvegarde
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Succès',
        'La langue a été modifiée avec succès.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    }, 1000);
  };

  const LanguageOption = ({ language }: { language: typeof LANGUAGES[0] }) => {
    const isSelected = selectedLanguage === language.code;

    return (
      <Pressable
        style={[styles.languageItem, isSelected && styles.languageItemSelected]}
        onPress={() => setSelectedLanguage(language.code)}
      >
        <View style={styles.languageLeft}>
          <View style={styles.flagContainer}>
            <Paragraph style={styles.flag}>{language.flag}</Paragraph>
          </View>
          <View style={styles.languageText}>
            <Paragraph weight="medium">{language.name}</Paragraph>
            <Caption color="secondary">{language.native}</Caption>
          </View>
        </View>
        <View style={styles.languageRight}>
          {isSelected && (
            <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
          )}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>Langue</Title>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Info */}
          <View style={styles.infoSection}>
            <Paragraph color="secondary" style={styles.infoText}>
              Sélectionnez votre langue préférée. L'application redémarrera pour appliquer les changements.
            </Paragraph>
          </View>

          {/* Languages List */}
          <Card style={styles.languagesCard}>
            {LANGUAGES.map((language, index) => (
              <View key={language.code}>
                <LanguageOption language={language} />
                {index < LANGUAGES.length - 1 && <Divider />}
              </View>
            ))}
          </Card>

          {/* Save Button */}
          <Button
            onPress={handleSave}
            loading={isLoading}
            style={styles.saveButton}
            size="lg"
          >
            Appliquer les changements
          </Button>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },

  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.gray[50],
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerSpacer: {
    width: 40,
  },

  infoSection: {
    paddingVertical: Spacing.lg,
  },

  infoText: {
    textAlign: 'center',
    lineHeight: 20,
  },

  languagesCard: {
    marginBottom: Spacing.lg,
  },

  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 64,
  },

  languageItemSelected: {
    backgroundColor: Colors.primary + '10',
  },

  languageLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },

  flagContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  flag: {
    fontSize: 20,
  },

  languageText: {
    flex: 1,
  },

  languageRight: {
    marginLeft: Spacing.md,
  },

  saveButton: {
    marginHorizontal: Spacing.sm,
  },

  bottomPadding: {
    height: Spacing.xl,
  },
});