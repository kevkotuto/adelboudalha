import React from 'react';
import { StyleSheet, View } from 'react-native';

import { NotificationChannelFilter } from './NotificationChannelFilter';
import { NotificationTypeFilter } from './NotificationTypeFilter';

import { SearchInput } from '@/components/ui/Inputs/SearchInput';
import { Spacing } from '@/constants';
import { NotificationChannel, NotificationTypeAdmin } from '@/types/adminNotifications';

interface NotificationFiltersBarProps {
  searchQuery: string;
  selectedType: NotificationTypeAdmin | 'all';
  selectedChannel: NotificationChannel | 'all';
  onSearchChange: (query: string) => void;
  onTypeChange: (type: NotificationTypeAdmin | 'all') => void;
  onChannelChange: (channel: NotificationChannel | 'all') => void;
}

export const NotificationFiltersBar: React.FC<NotificationFiltersBarProps> = ({
  searchQuery,
  selectedType,
  selectedChannel,
  onSearchChange,
  onTypeChange,
  onChannelChange,
}) => {
  return (
    <View style={styles.container}>
      <SearchInput
        placeholder="Rechercher..."
        value={searchQuery}
        onChangeText={onSearchChange}
        style={styles.searchInput}
      />
      <NotificationTypeFilter selectedType={selectedType} onSelectType={onTypeChange} />
      <NotificationChannelFilter selectedChannel={selectedChannel} onSelectChannel={onChannelChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
    gap : 5
  },
  searchInput: {
    marginBottom: Spacing.md,
  },
});
