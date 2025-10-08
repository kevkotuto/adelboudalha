import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaWrapper } from '@/components/ui/Layout/SafeAreaWrapper';
import { Title } from '@/components/ui/Typography/Title';
import { Paragraph } from '@/components/ui/Typography/Paragraph';
import Loader from '@/components/ui/Loader';
import { Colors, Spacing } from '@/constants';

interface LoaderPageProps {
  title?: string;
  message?: string;
}

export default function LoaderPage({
  title = "Yu Card",
  message = "Chargement en cours..."
}: LoaderPageProps) {
  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <View style={styles.content}>
          <Title level={1} color="primary" align="center" style={styles.title}>
            {title}
          </Title>

          <Loader size="lg" style={styles.loader} />

          <Paragraph size="large" color="secondary" align="center" style={styles.message}>
            {message}
          </Paragraph>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },

  content: {
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },

  title: {
    marginBottom: Spacing['2xl'],
  },

  loader: {
    marginVertical: Spacing['2xl'],
  },

  message: {
    marginTop: Spacing.lg,
  },
});