/**
 * Audit Logs Screen
 * Displays audit logs of admin actions
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
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
import { EmptyState } from '@/components/ui/Feedback/EmptyState';
import { LoadingSpinner } from '@/components/ui/Feedback/LoadingSpinner';
import { Colors, Spacing, BorderRadius } from '@/constants';
import { apiClient } from '@/services/apiClient';

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues: any;
  newValues: any;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
  user: {
    fullName: string;
    phone: string;
    role: string;
  };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const ACTION_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  CREATE: 'add-circle-outline',
  UPDATE: 'create-outline',
  DELETE: 'trash-outline',
  UPDATE_ORDER_STATUS: 'swap-horizontal-outline',
  SUSPEND_USER: 'ban-outline',
  ACTIVATE_USER: 'checkmark-circle-outline',
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: '#4CAF50',
  UPDATE: '#2196F3',
  DELETE: '#FF5722',
  UPDATE_ORDER_STATUS: Colors.primary,
  SUSPEND_USER: '#FF9800',
  ACTIVATE_USER: '#4CAF50',
};

export default function AuditLogsScreen() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  const fetchAuditLogs = useCallback(async (page: number = 1) => {
    try {
      if (page === 1) {
        setLoading(true);
      }

      const response = await apiClient.request({
        method: 'GET',
        url: '/admin/audit-logs',
        params: {
          page,
          limit: 20,
        },
      });

      if (response) {
        const data = response as { logs: AuditLog[]; pagination: PaginationInfo };

        if (page === 1) {
          setLogs(data.logs);
        } else {
          setLogs((prev) => [...prev, ...data.logs]);
        }

        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      Alert.alert('Erreur', 'Impossible de charger les logs d\'audit');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchAuditLogs();
  }, [fetchAuditLogs]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAuditLogs(1);
  }, [fetchAuditLogs]);

  const handleLoadMore = useCallback(() => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchAuditLogs(pagination.page + 1);
    }
  }, [pagination, loading, fetchAuditLogs]);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatAction = (action: string) => {
    return action.replace(/_/g, ' ');
  };

  const getActionIcon = (action: string): keyof typeof Ionicons.glyphMap => {
    return ACTION_ICONS[action] || 'document-outline';
  };

  const getActionColor = (action: string): string => {
    return ACTION_COLORS[action] || Colors.text.secondary;
  };

  const renderLogItem = ({ item }: { item: AuditLog }) => {
    const actionColor = getActionColor(item.action);

    return (
      <Card style={styles.logCard}>
        <View style={styles.logHeader}>
          <View style={[styles.actionIcon, { backgroundColor: `${actionColor}20` }]}>
            <Ionicons name={getActionIcon(item.action)} size={20} color={actionColor} />
          </View>
          <View style={styles.logHeaderText}>
            <Paragraph style={styles.logAction}>{formatAction(item.action)}</Paragraph>
            <Caption style={styles.logEntity}>
              {item.entityType} {item.entityId.slice(0, 8)}...
            </Caption>
          </View>
          <Caption style={styles.logTime}>{formatDate(item.createdAt)}</Caption>
        </View>

        <View style={styles.logBody}>
          <View style={styles.logUser}>
            <Ionicons name="person-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.logUserText}>
              {item.user.fullName} ({item.user.role})
            </Caption>
          </View>

          <View style={styles.logMeta}>
            <Ionicons name="location-outline" size={14} color={Colors.text.secondary} />
            <Caption style={styles.logMetaText}>{item.ipAddress}</Caption>
          </View>
        </View>

        {(item.oldValues || item.newValues) && (
          <Pressable
            style={styles.logDetailsButton}
            onPress={() => {
              Alert.alert(
                'Détails de l\'action',
                `Anciennes valeurs:\n${JSON.stringify(item.oldValues, null, 2)}\n\nNouvelles valeurs:\n${JSON.stringify(item.newValues, null, 2)}`,
                [{ text: 'OK' }]
              );
            }}
          >
            <Caption style={styles.logDetailsText}>Voir les détails</Caption>
            <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
          </Pressable>
        )}
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors.text.primary} />
        </Pressable>
        <Title style={styles.headerTitle}>Journal d'Audit</Title>
        <View style={styles.headerSpacer} />
      </View>

      <Container>
        {loading && logs.length === 0 ? (
          <LoadingSpinner />
        ) : logs.length === 0 ? (
          <EmptyState
            icon="shield-checkmark-outline"
            title="Aucun log d'audit"
            description="Les actions des administrateurs apparaîtront ici"
          />
        ) : (
          <FlatList
            data={logs}
            renderItem={renderLogItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              loading && logs.length > 0 ? (
                <View style={styles.loadingMore}>
                  <LoadingSpinner size="small" />
                </View>
              ) : null
            }
          />
        )}
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
  listContent: {
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  logCard: {
    padding: Spacing.md,
  },
  logHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  logHeaderText: {
    flex: 1,
  },
  logAction: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  logEntity: {
    fontSize: 12,
  },
  logTime: {
    fontSize: 11,
    color: Colors.text.tertiary,
  },
  logBody: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingLeft: 48,
    marginBottom: Spacing.xs,
  },
  logUser: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logUserText: {
    fontSize: 12,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  logMetaText: {
    fontSize: 12,
  },
  logDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingTop: Spacing.xs,
    gap: 4,
  },
  logDetailsText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
  },
  loadingMore: {
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
});
