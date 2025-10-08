/**
 * Financial Report Screen
 * Displays detailed financial statistics and analytics
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { Title, Paragraph, Caption } from '@/components/ui/Typography';
import { Container } from '@/components/ui/Layout/Container';
import { Card } from '@/components/ui/Layout/Card';
import { Divider } from '@/components/ui/Layout/Divider';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { Colors, Spacing, BorderRadius } from '@/constants';
import { apiClient } from '@/services/apiClient';

interface FinancialSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalRefunds: number;
  refundCount: number;
  totalTax: number;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface CategoryRevenue {
  category: string;
  revenue: number;
  percentage: number;
}

interface FinancialReport {
  summary: FinancialSummary;
  trends: {
    dailyRevenue: DailyRevenue[];
    averageOrderValue: any[];
  };
  breakdown: {
    ordersByStatus: any[];
    revenueByCategory: CategoryRevenue[];
    revenueByPaymentMethod: any[];
  };
}

const PERIODS = [
  { id: 'day', label: 'Aujourd\'hui' },
  { id: 'week', label: 'Cette semaine' },
  { id: 'month', label: 'Ce mois' },
  { id: 'year', label: 'Cette année' },
];

export default function FinancialReportScreen() {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [report, setReport] = useState<FinancialReport | null>(null);

  const fetchFinancialReport = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiClient.request({
        method: 'GET',
        url: '/admin/reports/financial',
        params: {
          period: selectedPeriod,
        },
      });

      if (response) {
        setReport(response as FinancialReport);
      }
    } catch (error) {
      console.error('Error fetching financial report:', error);
      Alert.alert('Erreur', 'Impossible de charger le rapport financier');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPeriod]);

  useEffect(() => {
    fetchFinancialReport();
  }, [fetchFinancialReport]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFinancialReport();
  }, [fetchFinancialReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const renderSummaryCard = (
    title: string,
    value: string | number,
    icon: keyof typeof Ionicons.glyphMap,
    color: string = Colors.primary
  ) => (
    <Card style={styles.summaryCard}>
      <View style={styles.summaryCardContent}>
        <View style={[styles.summaryIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={24} color={color} />
        </View>
        <View style={styles.summaryText}>
          <Caption style={styles.summaryLabel}>{title}</Caption>
          <Title style={styles.summaryValue}>{value}</Title>
        </View>
      </View>
    </Card>
  );

  if (loading && !report) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <Container>
          <LoadingSpinner />
        </Container>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Title style={styles.headerTitle}>Rapport Financier</Title>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <Container>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {PERIODS.map((period) => (
              <Pressable
                key={period.id}
                style={[
                  styles.periodButton,
                  selectedPeriod === period.id && styles.periodButtonActive,
                ]}
                onPress={() => setSelectedPeriod(period.id)}
              >
                <Paragraph
                  style={[
                    styles.periodButtonText,
                    selectedPeriod === period.id && styles.periodButtonTextActive,
                  ]}
                >
                  {period.label}
                </Paragraph>
              </Pressable>
            ))}
          </View>

          {report && (
            <>
              {/* Summary Cards */}
              <View style={styles.section}>
                <Title style={styles.sectionTitle}>Résumé</Title>
                <View style={styles.summaryGrid}>
                  {renderSummaryCard(
                    'Revenu Total',
                    formatCurrency(report.summary.totalRevenue),
                    'trending-up-outline',
                    '#4CAF50'
                  )}
                  {renderSummaryCard(
                    'Commandes',
                    report.summary.totalOrders.toString(),
                    'cart-outline',
                    Colors.primary
                  )}
                  {renderSummaryCard(
                    'Panier Moyen',
                    formatCurrency(report.summary.averageOrderValue),
                    'stats-chart-outline',
                    '#2196F3'
                  )}
                  {renderSummaryCard(
                    'Remboursements',
                    formatCurrency(report.summary.totalRefunds),
                    'arrow-undo-outline',
                    '#FF5722'
                  )}
                </View>
              </View>

              {/* Daily Revenue Trend */}
              {report.trends.dailyRevenue.length > 0 && (
                <View style={styles.section}>
                  <Title style={styles.sectionTitle}>Tendance des revenus</Title>
                  <Card>
                    {report.trends.dailyRevenue.slice(-7).map((day, index) => (
                      <React.Fragment key={day.date}>
                        <View style={styles.trendItem}>
                          <View style={styles.trendLeft}>
                            <Paragraph style={styles.trendDate}>
                              {new Date(day.date).toLocaleDateString('fr-FR', {
                                weekday: 'short',
                                day: '2-digit',
                                month: 'short',
                              })}
                            </Paragraph>
                            <Caption style={styles.trendOrders}>
                              {day.orders} commandes
                            </Caption>
                          </View>
                          <Paragraph style={styles.trendRevenue}>
                            {formatCurrency(day.revenue)}
                          </Paragraph>
                        </View>
                        {index < report.trends.dailyRevenue.length - 1 && (
                          <Divider style={styles.trendDivider} />
                        )}
                      </React.Fragment>
                    ))}
                  </Card>
                </View>
              )}

              {/* Revenue by Category */}
              {report.breakdown.revenueByCategory.length > 0 && (
                <View style={styles.section}>
                  <Title style={styles.sectionTitle}>Revenus par catégorie</Title>
                  <Card>
                    {report.breakdown.revenueByCategory.map((category, index) => (
                      <React.Fragment key={category.category}>
                        <View style={styles.categoryItem}>
                          <View style={styles.categoryLeft}>
                            <Paragraph style={styles.categoryName}>
                              {category.category}
                            </Paragraph>
                            <View style={styles.categoryBar}>
                              <View
                                style={[
                                  styles.categoryBarFill,
                                  { width: `${category.percentage}%` },
                                ]}
                              />
                            </View>
                          </View>
                          <View style={styles.categoryRight}>
                            <Paragraph style={styles.categoryRevenue}>
                              {formatCurrency(category.revenue)}
                            </Paragraph>
                            <Caption style={styles.categoryPercentage}>
                              {category.percentage.toFixed(1)}%
                            </Caption>
                          </View>
                        </View>
                        {index < report.breakdown.revenueByCategory.length - 1 && (
                          <Divider style={styles.categoryDivider} />
                        )}
                      </React.Fragment>
                    ))}
                  </Card>
                </View>
              )}
            </>
          )}
        </Container>
      </ScrollView>
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
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background.secondary,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.lg,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  periodButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.background.secondary,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  periodButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  periodButtonText: {
    fontSize: 12,
    color: Colors.text.secondary,
  },
  periodButtonTextActive: {
    color: Colors.text.inverse,
    fontWeight: '600',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: Spacing.md,
  },
  summaryGrid: {
    gap: Spacing.md,
  },
  summaryCard: {
    padding: Spacing.md,
  },
  summaryCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  summaryText: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  trendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  trendLeft: {
    flex: 1,
  },
  trendDate: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  trendOrders: {
    fontSize: 12,
  },
  trendRevenue: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  trendDivider: {
    marginVertical: Spacing.xs,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  categoryLeft: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.xs,
  },
  categoryBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  categoryRight: {
    alignItems: 'flex-end',
  },
  categoryRevenue: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  categoryPercentage: {
    fontSize: 12,
    color: Colors.primary,
  },
  categoryDivider: {
    marginVertical: Spacing.xs,
  },
});
