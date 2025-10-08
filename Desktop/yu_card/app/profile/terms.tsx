import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Layout/Card';
import { Container } from '@/components/ui/Layout/Container';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>Conditions d'utilisation</Title>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <Card style={styles.introCard}>
            <View style={styles.introHeader}>
              <View style={styles.introIcon}>
                <Ionicons name="document-text" size={24} color={Colors.primary} />
              </View>
              <View style={styles.introText}>
                <Title level={5}>Conditions Générales d'Utilisation</Title>
                <Caption color="secondary">Yu Card - Application Mobile</Caption>
                <Caption color="secondary">Version 1.0 • 01 janvier 2025</Caption>
              </View>
            </View>
          </Card>

          {/* Sections */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              1. Acceptation des conditions
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                En utilisant l'application Yu Card, vous acceptez pleinement ces conditions d'utilisation.
                L'application est une marketplace spécialisée dans la vente de cartes cadeaux numériques
                et de produits physiques en Afrique de l'Ouest.
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              2. Services proposés
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                • Cartes cadeaux numériques (PlayStation, Xbox, Steam, etc.){'\n'}
                • Produits physiques (téléphones, électronique){'\n'}
                • Livraison via Wave Wallet exclusivement{'\n'}
                • Support client 7j/7
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              3. Utilisation autorisée
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Vous vous engagez à utiliser l'application de manière légale et conforme.
                Toute utilisation frauduleuse, usurpation d'identité ou tentative de piratage
                est strictement interdite et peut entraîner la suspension du compte.
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              4. Paiements et sécurité
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Tous les paiements s'effectuent via Wave Wallet. Nous garantissons la sécurité
                de vos transactions grâce au chiffrement des données et à la protection des
                informations personnelles selon les standards internationaux.
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              5. Responsabilités
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Yu Card s'engage à fournir un service de qualité mais ne peut être tenu
                responsable des dysfonctionnements liés à des causes externes, notamment
                les problèmes de réseau ou les interruptions de service des partenaires.
              </Paragraph>
            </Card>
          </View>

          {/* Contact */}
          <Card style={styles.contactCard}>
            <View style={styles.contactInfo}>
              <View style={styles.contactIcon}>
                <Ionicons name="business" size={20} color={Colors.primary} />
              </View>
              <View style={styles.contactText}>
                <Paragraph weight="medium">Lorient Plus (Yu Card)</Paragraph>
                <Caption color="secondary">Treichville, Abidjan, Côte d'Ivoire</Caption>
                <Caption color="secondary">kevine@generale-ci.com</Caption>
                <Caption color="secondary">+225 05 86 98 79 34</Caption>
              </View>
            </View>
          </Card>

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
    marginBottom: Spacing.md,
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

  introCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },

  introHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  introIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  introText: {
    flex: 1,
  },

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    marginBottom: Spacing.sm,
    color: Colors.text.primary,
  },

  contentCard: {
    padding: Spacing.md,
  },

  contentText: {
    lineHeight: 22,
  },

  contactCard: {
    padding: Spacing.lg,
    marginTop: Spacing.lg,
  },

  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  contactText: {
    flex: 1,
  },

  bottomPadding: {
    height: Spacing['8xl'],
  },
});