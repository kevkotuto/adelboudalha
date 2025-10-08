import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { NotificationHistoryCard } from './NotificationHistoryCard';

import { EmptyState } from '@/components/ui/Layout/EmptyState';
import { LoadingSpinner } from '@/components/ui/Layout/LoadingSpinner';
import { Colors, Spacing } from '@/constants';
import { NotificationHistoryItem } from '@/types/adminNotifications';

interface NotificationHistoryListProps {
  history: NotificationHistoryItem[];
  loading?: boolean;
  refreshing?: boolean;
  hasMoreData?: boolean;
  apiError?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
}

export const NotificationHistoryList: React.FC<NotificationHistoryListProps> = ({
  history,
  loading = false,
  refreshing = false,
  hasMoreData = false,
  apiError = false,
  onRefresh,
  onLoadMore,
}) => {
  const handleScroll = ({ nativeEvent }: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    if (isCloseToBottom && hasMoreData && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  if (history.length === 0 && !loading) {
    return (
      <EmptyState
        title={apiError ? 'API non disponible' : 'Aucune notification'}
        description={
          apiError
            ? 'Les endpoints de notifications ne sont pas encore implémentés'
            : 'Aucune notification trouvée'
        }
        icon="notifications-outline"
      />
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
      onScroll={handleScroll}
      scrollEventThrottle={400}
    >
      <View style={styles.list}>
        {history.map(item => (
          <NotificationHistoryCard key={item.id} item={item} />
        ))}
        {hasMoreData && (
          <View style={styles.loadingMore}>
            <LoadingSpinner size="small" color={Colors.primary} />
          </View>
        )}
      </View>
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding : 10
  },
  list: {
    paddingBottom: Spacing.xl,
  },
  loadingMore: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  bottomPadding: {
    height: 120,
  },
});
