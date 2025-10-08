import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { NotificationStatsCard } from './NotificationStatsCard';

import { Spacing } from '@/constants';
import { NotificationStats } from '@/types/adminNotifications';

interface NotificationStatsGridProps {
  stats: NotificationStats | null;
}

export const NotificationStatsGrid: React.FC<NotificationStatsGridProps> = ({ stats }) => {
  if (!stats) return null;

  const pushCount = stats.byChannel.find(c => c.channel === 'PUSH')?.count || 0;
  const smsCount = stats.byChannel.find(c => c.channel === 'SMS')?.count || 0;
  const readRate = parseFloat(stats.summary.readRate);

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.container}>
      <View style={styles.row}>
        <NotificationStatsCard
          title="Total envoyées"
          value={stats.summary.totalNotifications.toLocaleString()}
          icon="paper-plane"
          iconColor="#E91E63"
          trend="up"
          trendValue="+12%"
          subtitle="Ce mois"
        />
        <NotificationStatsCard
          title="Taux de lecture"
          value={`${stats.summary.readRate}%`}
          subtitle={`${stats.summary.totalRead} notifications lues`}
          icon="eye"
          iconColor="#4CAF50"
          trend={readRate >= 70 ? 'up' : readRate >= 50 ? 'neutral' : 'down'}
          trendValue={readRate >= 70 ? 'Excellent' : readRate >= 50 ? 'Moyen' : 'Faible'}
        />
        <NotificationStatsCard
          title="Notifications Push"
          value={pushCount.toLocaleString()}
          icon="notifications"
          iconColor="#2196F3"
          subtitle="Canal gratuit"
        />
        <NotificationStatsCard
          title="SMS envoyés"
          value={smsCount.toLocaleString()}
          icon="chatbubbles"
          iconColor="#FF9800"
          subtitle={`${smsCount * 25} XOF dépensés`}
        />
        <NotificationStatsCard
          title="In-App"
          value={stats.byChannel.find(c => c.channel === 'IN_APP')?.count.toLocaleString() || '0'}
          icon="phone-portrait"
          iconColor="#9C27B0"
          subtitle="Dans l'application"
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xs,
  },
});
