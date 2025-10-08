import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  adminNotificationsService,
} from '@/services/adminNotificationsService';
import {
  NotificationChannel,
  NotificationHistoryItem,
  NotificationTypeAdmin,
} from '@/types/adminNotifications';

export const useNotifications = (
  selectedType: NotificationTypeAdmin | 'all',
  selectedChannel: NotificationChannel | 'all'
) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [history, setHistory] = useState<NotificationHistoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = useCallback(
    async (reset: boolean = true) => {
      try {
        if (reset) {
          setLoading(true);
          setCurrentPage(1);
        }

        const historyResponse = await adminNotificationsService.getHistory({
          page: reset ? 1 : currentPage,
          limit: 20,
          type: selectedType !== 'all' ? selectedType : undefined,
          channel: selectedChannel !== 'all' ? selectedChannel : undefined,
        });

        if (historyResponse?.notifications) {
          if (reset) {
            setHistory(historyResponse.notifications);
          } else {
            setHistory(prev => [...prev, ...historyResponse.notifications]);
          }
          setHasMoreData(historyResponse.pagination?.hasNext || false);
        } else {
          setHistory([]);
          setHasMoreData(false);
        }
        setApiError(false);
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error);
        console.warn('⚠️ Les endpoints de notifications admin ne sont pas encore implémentés');
        setHistory([]);
        setHasMoreData(false);
        setApiError(true);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [selectedType, selectedChannel, currentPage]
  );

  useEffect(() => {
    loadData();
  }, [selectedType, selectedChannel]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData(true);
  }, [loadData]);

  const loadMoreHistory = useCallback(() => {
    if (hasMoreData && !loading) {
      setCurrentPage(prev => prev + 1);
      loadData(false);
    }
  }, [hasMoreData, loading, loadData]);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          item.title.toLowerCase().includes(query) ||
          item.message.toLowerCase().includes(query) ||
          item.user.fullName.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [history, searchQuery]);

  return {
    loading,
    refreshing,
    history: filteredHistory,
    hasMoreData,
    apiError,
    searchQuery,
    setSearchQuery,
    onRefresh,
    loadMoreHistory,
  };
};
