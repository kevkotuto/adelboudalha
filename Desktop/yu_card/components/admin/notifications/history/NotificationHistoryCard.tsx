import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';

import { NotificationBadge } from './NotificationBadge';

import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { notificationHelpers } from '@/services/adminNotificationsService';
import { NotificationHistoryItem } from '@/types/adminNotifications';

interface NotificationHistoryCardProps {
  item: NotificationHistoryItem;
  onPress?: () => void;
}

export const NotificationHistoryCard: React.FC<NotificationHistoryCardProps> = ({
  item,
  onPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.admin.dark : Colors.admin.light;

  const iconColor = notificationHelpers.getTypeColor(item.type);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.background.card,
          borderColor: isDark ? theme.border.primary : Colors.gray[200],
        },
        pressed && styles.pressed,
      ]}
    >
      {/* Barre de couleur à gauche pour le type */}
      <View style={[styles.colorBar, { backgroundColor: iconColor }]} />

      <View style={styles.content}>
        {/* En-tête avec icône et badges */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, { backgroundColor: iconColor + '15' }]}>
            <Ionicons
              name={notificationHelpers.getTypeIcon(item.type) as any}
              size={18}
              color={iconColor}
            />
          </View>
          <View style={styles.headerRight}>
            <View style={styles.badges}>
              <NotificationBadge
                label={item.channel}
                color={notificationHelpers.getChannelColor(item.channel)}
              />
              {item.isRead && (
                <View style={styles.readBadge}>
                  <Ionicons name="checkmark-circle" size={14} color={Colors.admin.light.status.success} />
                  <Caption style={[styles.readText, { color: Colors.admin.light.status.success }]}>
                    Lu
                  </Caption>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Titre */}
        <Title level={5} style={[styles.title, { color: theme.text.primary }]}>
          {item.title}
        </Title>

        {/* Message */}
        <Paragraph
          style={[styles.message, { color: theme.text.secondary }]}
          numberOfLines={2}
          size="small"
        >
          {item.message}
        </Paragraph>

        {/* Informations utilisateur et date */}
        <View style={styles.footer}>
          <View style={styles.userInfo}>
            <View style={[styles.userAvatar, { backgroundColor: Colors.primary + '20' }]}>
              <Ionicons name="person" size={12} color={Colors.primary} />
            </View>
            <Caption style={[styles.userName, { color: theme.text.tertiary }]}>
              {item.user.fullName}
            </Caption>
          </View>
          <View style={styles.dateInfo}>
            <Ionicons name="time-outline" size={12} color={theme.text.tertiary} />
            <Caption style={[styles.date, { color: theme.text.tertiary }]}>
              {notificationHelpers.formatDate(item.sentAt || item.createdAt)}
            </Caption>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.99 }],
  },
  colorBar: {
    width: 4,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  readBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  readText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
  },
  title: {
    fontWeight: '600',
    fontFamily: 'Ubuntu_600SemiBold',
    lineHeight: 22,
  },
  message: {
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userAvatar: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Ubuntu_500Medium',
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
    fontFamily: 'Ubuntu_400Regular',
  },
});
