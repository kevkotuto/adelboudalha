import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '@/components/ui/Layout/Card';
import { Container } from '@/components/ui/Layout/Container';
import { Divider } from '@/components/ui/Layout/Divider';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';

const FAQ_DATA = [
  {
    question: 'Comment acheter une carte cadeau ?',
    answer: 'Sélectionnez la carte cadeau souhaitée, choisissez le montant, et procédez au paiement via Wave. Vous recevrez le code par SMS.',
  },
  {
    question: 'Quels sont les moyens de paiement acceptés ?',
    answer: 'Nous acceptons uniquement Wave comme moyen de paiement pour garantir la sécurité et la simplicité des transactions.',
  },
  {
    question: 'Comment utiliser ma carte cadeau ?',
    answer: 'Une fois votre achat confirmé, vous recevrez un code par SMS. Utilisez ce code sur la plateforme correspondante (PlayStation, Xbox, etc.).',
  },
  {
    question: 'Que faire si je n\'ai pas reçu mon code ?',
    answer: 'Vérifiez vos SMS et votre historique de commandes. Si le problème persiste, contactez notre support via WhatsApp.',
  },
  {
    question: 'Puis-je annuler ma commande ?',
    answer: 'Les commandes peuvent être annulées dans les 5 minutes suivant l\'achat si le code n\'a pas encore été généré.',
  },
];

const CONTACT_OPTIONS = [
  {
    id: 'whatsapp1',
    icon: 'logo-whatsapp' as const,
    title: 'WhatsApp Support 1',
    subtitle: '+225 05 00 80 85 85',
    color: '#25D366',
    action: () => Linking.openURL('https://wa.me/2250500808585'),
  },
  {
    id: 'whatsapp2',
    icon: 'logo-whatsapp' as const,
    title: 'WhatsApp Support 2',
    subtitle: '+225 05 86 98 79 34',
    color: '#25D366',
    action: () => Linking.openURL('https://wa.me/2250586987934'),
  },
  {
    id: 'phone1',
    icon: 'call' as const,
    title: 'Appel Support 1',
    subtitle: '+225 05 00 80 85 85',
    color: Colors.info,
    action: () => Linking.openURL('tel:+2250500808585'),
  },
  {
    id: 'phone2',
    icon: 'call' as const,
    title: 'Appel Support 2',
    subtitle: '+225 05 86 98 79 34',
    color: Colors.info,
    action: () => Linking.openURL('tel:+2250586987934'),
  },
  {
    id: 'email',
    icon: 'mail' as const,
    title: 'Email',
    subtitle: 'kevine@generale-ci.com',
    color: Colors.error,
    action: () => Linking.openURL('mailto:kevine@generale-ci.com'),
  },
];

export default function HelpScreen() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const ContactOption = ({ option }: { option: typeof CONTACT_OPTIONS[0] }) => (
    <Pressable style={styles.contactItem} onPress={option.action}>
      <View style={[styles.contactIcon, { backgroundColor: option.color + '20' }]}>
        <Ionicons name={option.icon} size={24} color={option.color} />
      </View>
      <View style={styles.contactText}>
        <Paragraph weight="medium">{option.title}</Paragraph>
        <Caption color="secondary">{option.subtitle}</Caption>
      </View>
      <Ionicons name="chevron-forward" size={16} color={Colors.text.secondary} />
    </Pressable>
  );

  const FAQItem = ({ item, index }: { item: typeof FAQ_DATA[0]; index: number }) => {
    const isExpanded = expandedFaq === index;

    return (
      <View style={styles.faqItem}>
        <Pressable style={styles.faqQuestion} onPress={() => toggleFaq(index)}>
          <Paragraph weight="medium" style={styles.faqQuestionText}>
            {item.question}
          </Paragraph>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={Colors.text.secondary}
          />
        </Pressable>
        {isExpanded && (
          <View style={styles.faqAnswer}>
            <Paragraph color="secondary" style={styles.faqAnswerText}>
              {item.answer}
            </Paragraph>
          </View>
        )}
      </View>
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
          <Title level={4}>Aide et support</Title>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Contact Options */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Nous contacter
            </Title>
            <Card>
              {CONTACT_OPTIONS.map((option, index) => (
                <View key={option.id}>
                  <ContactOption option={option} />
                  {index < CONTACT_OPTIONS.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          </View>

          {/* FAQ */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Questions fréquentes
            </Title>
            <Card>
              {FAQ_DATA.map((item, index) => (
                <View key={index}>
                  <FAQItem item={item} index={index} />
                  {index < FAQ_DATA.length - 1 && <Divider />}
                </View>
              ))}
            </Card>
          </View>

          {/* App Info */}
          <Card style={styles.appInfoCard}>
            <View style={styles.appInfo}>
              <View style={styles.appIcon}>
                <Ionicons name="information-circle" size={24} color={Colors.primary} />
              </View>
              <View style={styles.appInfoText}>
                <Paragraph weight="medium">Yu Card</Paragraph>
                <Caption color="secondary">Version 1.0.0</Caption>
                <Caption color="secondary">© 2025 Yu Card. Tous droits réservés.</Caption>
              </View>
            </View>
          </Card>

          {/* Developer Info */}
          <View style={styles.section}>
            <Title level={5} style={styles.sectionTitle}>
              Développeur
            </Title>
            <Card style={styles.developerCard}>
              <View style={styles.developerHeader}>
                <View style={styles.developerIconContainer}>
                  <Ionicons name="code-slash" size={28} color={Colors.primary} />
                </View>
                <View style={styles.developerHeaderText}>
                  <Paragraph weight="bold" style={styles.developerName}>
                    Boudalha Ghossoub Kevine Adel Junior
                  </Paragraph>
                  <Caption color="secondary">Full Stack Developer</Caption>
                </View>
              </View>

              <Divider style={{ marginVertical: Spacing.md }} />

              <View style={styles.developerSkills}>
                <View style={styles.skillBadge}>
                  <Ionicons name="logo-react" size={16} color={Colors.primary} />
                  <Caption style={styles.skillText}>React Native</Caption>
                </View>
                <View style={styles.skillBadge}>
                  <Ionicons name="logo-nodejs" size={16} color={Colors.success} />
                  <Caption style={styles.skillText}>Node.js</Caption>
                </View>
                <View style={styles.skillBadge}>
                  <Ionicons name="phone-portrait" size={16} color={Colors.info} />
                  <Caption style={styles.skillText}>Mobile Apps</Caption>
                </View>
              </View>

              <View style={styles.developerCTA}>
                <Ionicons name="bulb" size={20} color={Colors.primary} />
                <View style={styles.developerCTAText}>
                  <Paragraph weight="medium" style={styles.ctaTitle}>
                    Besoin d'une application mobile ?
                  </Paragraph>
                  <Caption color="secondary" style={styles.ctaSubtitle}>
                    Contactez-moi pour développer votre projet
                  </Caption>
                </View>
              </View>

              <Pressable
                style={styles.contactDeveloperButton}
                onPress={() => Linking.openURL('mailto:kevine@generale-ci.com')}
              >
                <Ionicons name="mail" size={20} color={Colors.white} />
                <Paragraph weight="medium" style={styles.contactButtonText}>
                  kevine@generale-ci.com
                </Paragraph>
              </Pressable>
            </Card>
          </View>

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

  section: {
    marginBottom: Spacing.lg,
  },

  sectionTitle: {
    marginBottom: Spacing.md,
    color: Colors.text.primary,
  },

  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },

  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  contactText: {
    flex: 1,
  },

  faqItem: {
    paddingHorizontal: Spacing.lg,
  },

  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.md,
  },

  faqQuestionText: {
    flex: 1,
    marginRight: Spacing.md,
  },

  faqAnswer: {
    paddingBottom: Spacing.md,
    paddingRight: Spacing.xl,
  },

  faqAnswerText: {
    lineHeight: 20,
  },

  appInfoCard: {
    padding: Spacing.lg,
  },

  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },

  appInfoText: {
    flex: 1,
  },

  bottomPadding: {
    height: 120,
  },

  developerCard: {
    padding: Spacing.lg,
  },

  developerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },

  developerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.lg,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },

  developerHeaderText: {
    flex: 1,
    gap: 4,
  },

  developerName: {
    color: Colors.text.primary,
    fontSize: 16,
  },

  developerSkills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },

  skillBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.gray[50],
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.gray[100],
  },

  skillText: {
    fontSize: 12,
    color: Colors.text.primary,
    fontWeight: '500',
  },

  developerCTA: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    padding: Spacing.md,
    backgroundColor: Colors.primary + '08',
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
    marginBottom: Spacing.md,
  },

  developerCTAText: {
    flex: 1,
    gap: 4,
  },

  ctaTitle: {
    color: Colors.text.primary,
    fontSize: 14,
  },

  ctaSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },

  contactDeveloperButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },

  contactButtonText: {
    color: Colors.white,
    fontSize: 14,
  },
});