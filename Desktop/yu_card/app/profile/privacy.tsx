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

export default function PrivacyScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Container>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text.primary} />
          </Pressable>
          <Title level={4}>Politique de confidentialité</Title>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Introduction */}
          <Card style={styles.introCard}>
            <View style={styles.introHeader}>
              <View style={styles.introIcon}>
                <Ionicons name="shield-checkmark" size={24} color={Colors.primary} />
              </View>
              <View style={styles.introText}>
                <Title level={5}>Protection des Données</Title>
                <Caption color="secondary">Yu Card s'engage à protéger vos données personnelles</Caption>
                <Caption color="secondary">Version 1.0 • 01 janvier 2025</Caption>
              </View>
            </View>
          </Card>

          {/* Sections */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Données collectées
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Nous collectons uniquement les données nécessaires au fonctionnement du service :
                {'\n\n'}
                • Nom complet et numéro de téléphone{'\n'}
                • Adresse de livraison{'\n'}
                • Historique des commandes{'\n'}
                • Préférences de l'application
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Utilisation des données
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Vos données sont utilisées pour :
                {'\n\n'}
                • Traiter vos commandes et livraisons{'\n'}
                • Vous contacter en cas de problème{'\n'}
                • Améliorer nos services{'\n'}
                • Respecter nos obligations légales
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Sécurité
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Nous protégeons vos données grâce à :
                {'\n\n'}
                • Chiffrement AES-256 pour les données sensibles{'\n'}
                • Serveurs sécurisés et audités{'\n'}
                • Accès limité aux personnes autorisées{'\n'}
                • Surveillance 24h/24
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Vos droits
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Vous avez le droit de :
                {'\n\n'}
                • Accéder à vos données personnelles{'\n'}
                • Rectifier vos informations{'\n'}
                • Supprimer votre compte{'\n'}
                • Vous opposer au traitement{'\n'}
                • Récupérer vos données (portabilité)
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Partage des données
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Nous ne vendons jamais vos données. Nous les partageons uniquement avec :
                {'\n\n'}
                • Wave Wallet pour les paiements{'\n'}
                • Transporteurs pour les livraisons{'\n'}
                • Autorités sur réquisition judiciaire
              </Paragraph>
            </Card>
          </View>

          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Conservation
            </Title>
            <Card style={styles.contentCard}>
              <Paragraph style={styles.contentText}>
                Nous conservons vos données :
                {'\n\n'}
                • Compte : 3 ans après dernière activité{'\n'}
                • Transactions : 10 ans (obligations légales){'\n'}
                • Données de livraison : 1 an{'\n'}
                • Logs techniques : 12 mois
              </Paragraph>
            </Card>
          </View>

          {/* Contact */}
          <Card style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View style={styles.contactIcon}>
                <Ionicons name="mail" size={20} color={Colors.primary} />
              </View>
              <Title level={6}>Exercer vos droits</Title>
            </View>
            <Paragraph style={styles.contactText}>
              Pour toute question sur vos données personnelles ou pour exercer vos droits,
              contactez notre délégué à la protection des données :
            </Paragraph>
            <View style={styles.contactDetails}>
              <Caption color="secondary">Email : kevine@generale-ci.com</Caption>
              <Caption color="secondary">WhatsApp : +225 05 86 98 79 34</Caption>
              <Caption color="secondary">Délai de réponse : 30 jours maximum</Caption>
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
    marginBottom : Spacing.md,
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

  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
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
    lineHeight: 20,
    marginBottom: Spacing.md,
  },

  contactDetails: {
    backgroundColor: Colors.background.secondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.card,
  },

  bottomPadding: {
    height: Spacing['4xl'],
  },
});