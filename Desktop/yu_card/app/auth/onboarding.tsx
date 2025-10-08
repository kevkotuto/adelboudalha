import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Pressable, Animated } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Title } from '@/components/ui/Typography/Title';
import { Paragraph } from '@/components/ui/Typography/Paragraph';
import { Button } from '@/components/ui/Buttons/Button';
import { Colors, Spacing } from '@/constants';
import { useAuthStore } from '@/stores/authStore';
import useTranslation from '@/hooks/useTranslation';

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { setOnboardingComplete } = useAuthStore();
  const [currentPage, setCurrentPage] = useState(0);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const onboardingPages = [
    {
      title: t('onboarding.page1.title') || 'Bienvenue sur Yu Card',
      text: t('onboarding.page1.text') || 'Votre plateforme de cartes cadeaux et produits électroniques.',
      emoji: '🎁'
    },
    {
      title: t('onboarding.page2.title') || 'Paiement Wave',
      text: t('onboarding.page2.text') || 'Payez facilement avec Wave Wallet, votre portefeuille mobile.',
      emoji: '💳'
    },
    {
      title: t('onboarding.page3.title') || 'Commencer',
      text: t('onboarding.page3.text') || 'Créez votre compte et découvrez nos offres exclusives.',
      emoji: '🚀'
    }
  ];

  // Animation on page change
  useEffect(() => {
    // Fade out
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      // Fade in
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    // Slide animation
    slideAnim.setValue(-20);
    Animated.spring(slideAnim, {
      toValue: 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [currentPage, fadeAnim, slideAnim]);

  const handleNext = () => {
    if (currentPage < onboardingPages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    console.log('Onboarding completed, setting flag and navigating to login');
    setOnboardingComplete();
    // Small delay to ensure state is updated
    setTimeout(() => {
      router.replace('/auth/login');
    }, 100);
  };

  const currentPageData = onboardingPages[currentPage];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={[Colors.background.primary, Colors.background.tertiary]}
        style={styles.gradient}
      >
        {/* Skip button */}
        <View style={styles.header}>
          <Pressable onPress={handleSkip} style={styles.skipButton}>
            <Paragraph color="secondary">
              {t('common.skip') || 'Passer'}
            </Paragraph>
          </Pressable>
        </View>

        {/* Content with animations */}
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.emojiContainer}>
            <Title level={1} style={styles.emoji}>
              {currentPageData.emoji}
            </Title>
          </View>

          <View style={styles.textContainer}>
            <Title level={2} align="center" style={styles.title}>
              {currentPageData.title}
            </Title>

            <Paragraph
              size="large"
              align="center"
              color="secondary"
              style={styles.description}
            >
              {currentPageData.text}
            </Paragraph>
          </View>
        </Animated.View>

        {/* Pagination dots */}
        <View style={styles.pagination}>
          {onboardingPages.map((_, index) => (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                index === currentPage && styles.activeDot,
                index === currentPage && {
                  transform: [{
                    scale: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1]
                    })
                  }]
                }
              ]}
            />
          ))}
        </View>

        {/* Bottom buttons */}
        <View style={styles.bottom}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onPress={handleNext}
            rightIcon={currentPage === onboardingPages.length - 1 ? undefined : 'arrow-forward'}
          >
            {currentPage === onboardingPages.length - 1
              ? t('common.continue') || 'Continuer'
              : t('common.next') || 'Suivant'}
          </Button>

          {currentPage > 0 && (
            <Button
              variant="ghost"
              size="md"
              onPress={() => setCurrentPage(currentPage - 1)}
              leftIcon="arrow-back"
              style={styles.backButton}
            >
              {t('common.previous') || 'Précédent'}
            </Button>
          )}
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  gradient: {
    flex: 1,
  },

  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    alignItems: 'flex-end',
  },

  skipButton: {
    padding: Spacing.sm,
  },

  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  emojiContainer: {
    marginBottom: Spacing['3xl'],
  },

  emoji: {
    fontSize: 80,
    textAlign: 'center',
  },

  textContainer: {
    alignItems: 'center',
  },

  title: {
    marginBottom: Spacing.lg,
  },

  description: {
    lineHeight: 24,
  },

  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.gray[300],
    marginHorizontal: 4,
  },

  activeDot: {
    backgroundColor: Colors.primary,
    width: 20,
  },

  bottom: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
    gap: Spacing.md,
  },

  backButton: {
    alignSelf: 'center',
  },
});