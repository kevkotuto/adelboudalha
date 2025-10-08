import { useEffect, useState } from 'react';

import { adminNotificationsService } from '@/services/adminNotificationsService';
import { NotificationStats } from '@/types/adminNotifications';

export const useNotificationStats = () => {
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const statsResponse = await adminNotificationsService.getStats();
        if (statsResponse) {
          setStats(statsResponse);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  return { stats, loading };
};
