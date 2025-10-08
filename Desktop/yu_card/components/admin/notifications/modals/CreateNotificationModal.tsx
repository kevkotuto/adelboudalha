import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NotificationModeButton } from '../shared/NotificationModeButton';

import { Button } from '@/components/ui/Buttons/Button';
import { TextInput } from '@/components/ui/Inputs/TextInput';
import { Caption, Paragraph, Title } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { notificationHelpers } from '@/services/adminNotificationsService';
import {
  NotificationChannel,
  NotificationFormData,
  NotificationTypeAdmin,
} from '@/types/adminNotifications';

type SendMode = 'push' | 'sms' | 'broadcast';

interface CreateNotificationModalProps {
  visible: boolean;
  formData: NotificationFormData;
  sendMode: SendMode;
  creating: boolean;
  onClose: () => void;
  onFormChange: (updates: Partial<NotificationFormData>) => void;
  onModeChange: (mode: SendMode) => void;
  onSend: () => void;
  onOpenUserSelector: () => void;
}

const TYPE_FILTERS: { key: NotificationTypeAdmin; label: string; color: string }[] = [
  { key: 'PROMOTION', label: 'Promos', color: '#E91E63' },
  { key: 'SYSTEM', label: 'Système', color: '#FF9800' },
  { key: 'ORDER', label: 'Commandes', color: '#2196F3' },
  { key: 'PAYMENT', label: 'Paiements', color: '#4CAF50' },
  { key: 'DELIVERY', label: 'Livraisons', color: '#9C27B0' },
  { key: 'GIFT_CARD', label: 'Cartes', color: '#F44336' },
];

export const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  visible,
  formData,
  sendMode,
  creating,
  onClose,
  onFormChange,
  onModeChange,
  onSend,
  onOpenUserSelector,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = isDark ? Colors.admin.dark : Colors.admin.light;

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.background.primary }]}
        edges={['top']}
      >
        <View style={styles.inner}>
          <View style={[styles.header, { borderBottomColor: theme.border.primary }]}>
            <Title level={3} style={{ color: theme.text.primary }}>
              Nouvelle notification
            </Title>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.text.primary} />
            </Pressable>
          </View>

          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
            {/* Mode d'envoi */}
            <View style={styles.section}>
              <Title level={5} style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Mode d'envoi
              </Title>
              <View style={styles.modeButtons}>
                <NotificationModeButton
                  icon="notifications"
                  label="Push Only"
                  active={sendMode === 'push'}
                  onPress={() => onModeChange('push')}
                />
                <NotificationModeButton
                  icon="chatbubbles"
                  label="SMS Only"
                  active={sendMode === 'sms'}
                  onPress={() => onModeChange('sms')}
                />
                <NotificationModeButton
                  icon="megaphone"
                  label="Broadcast"
                  active={sendMode === 'broadcast'}
                  onPress={() => onModeChange('broadcast')}
                />
              </View>
            </View>

            {/* Titre (sauf pour SMS) */}
            {sendMode !== 'sms' && (
              <TextInput
                label="Titre"
                value={formData.title}
                onChangeText={text => onFormChange({ title: text })}
                placeholder="Ex: 🎉 Nouvelle promotion !"
                style={{
                  backgroundColor: theme.background.card,
                  borderColor: theme.border.primary,
                }}
              />
            )}

            {/* Message */}
            <TextInput
              label={`Message ${sendMode === 'sms' ? '(max 160 car.)' : '(max 500 car.)'}`}
              value={formData.message}
              onChangeText={text => onFormChange({ message: text })}
              placeholder="Votre message..."
              multiline
              numberOfLines={4}
              style={{
                backgroundColor: theme.background.card,
                borderColor: theme.border.primary,
              }}
            />
            <Caption style={styles.charCount}>
              {formData.message.length} / {sendMode === 'sms' ? 160 : 500}
            </Caption>

            {/* Destinataires */}
            <View style={styles.section}>
              <Title level={5} style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Destinataires
              </Title>
              <View style={styles.recipientButtons}>
                <Pressable
                  style={[
                    styles.recipientButton,
                    { backgroundColor: theme.background.card, borderColor: theme.border.primary },
                    formData.targetType === 'all' && {
                      backgroundColor: Colors.primary,
                      borderColor: Colors.primary,
                    },
                  ]}
                  onPress={() => onFormChange({ targetType: 'all', userIds: [] })}
                >
                  <Ionicons
                    name="people"
                    size={20}
                    color={formData.targetType === 'all' ? Colors.white : theme.text.primary}
                  />
                  <Paragraph
                    size="small"
                    style={[
                      styles.recipientButtonText,
                      formData.targetType === 'all' && { color: Colors.white },
                    ]}
                  >
                    Tous les utilisateurs
                  </Paragraph>
                </Pressable>
                <Pressable
                  style={[
                    styles.recipientButton,
                    { backgroundColor: theme.background.card, borderColor: theme.border.primary },
                    formData.targetType === 'specific' && {
                      backgroundColor: Colors.primary,
                      borderColor: Colors.primary,
                    },
                  ]}
                  onPress={() => onFormChange({ targetType: 'specific' })}
                >
                  <Ionicons
                    name="person"
                    size={20}
                    color={formData.targetType === 'specific' ? Colors.white : theme.text.primary}
                  />
                  <Paragraph
                    size="small"
                    style={[
                      styles.recipientButtonText,
                      formData.targetType === 'specific' && { color: Colors.white },
                    ]}
                  >
                    Utilisateurs spécifiques
                  </Paragraph>
                </Pressable>
              </View>
              {formData.targetType === 'specific' && (
                <View style={styles.userIdsInput}>
                  <Button variant="outline" onPress={onOpenUserSelector} icon="people">
                    Sélectionner les utilisateurs ({formData.userIds.length})
                  </Button>
                  {formData.userIds.length > 0 && (
                    <Caption
                      color="secondary"
                      style={{ marginTop: Spacing.sm, textAlign: 'center' }}
                    >
                      {formData.userIds.length} utilisateur(s) sélectionné(s)
                    </Caption>
                  )}
                </View>
              )}
            </View>

            {/* Type (sauf pour SMS) */}
            {sendMode !== 'sms' && (
              <View style={styles.section}>
                <Title level={5} style={[styles.sectionTitle, { color: theme.text.primary }]}>
                  Type de notification
                </Title>
                <View style={styles.typeButtons}>
                  {TYPE_FILTERS.map(type => (
                    <Pressable
                      key={type.key}
                      style={[
                        styles.typeButton,
                        {
                          backgroundColor: theme.background.card,
                          borderColor: theme.border.primary,
                        },
                        formData.type === type.key && {
                          backgroundColor: type.color,
                          borderColor: type.color,
                        },
                      ]}
                      onPress={() => onFormChange({ type: type.key })}
                    >
                      <Caption
                        style={[
                          styles.typeButtonText,
                          { color: theme.text.secondary },
                          formData.type === type.key && { color: Colors.white },
                        ]}
                      >
                        {type.label}
                      </Caption>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Canaux (uniquement pour broadcast) */}
            {sendMode === 'broadcast' && (
              <View style={styles.section}>
                <Title level={5} style={[styles.sectionTitle, { color: theme.text.primary }]}>
                  Canaux (sélectionner 1 ou plusieurs)
                </Title>
                <View style={styles.channelButtons}>
                  {(['PUSH', 'SMS', 'IN_APP'] as NotificationChannel[]).map(channel => (
                    <Pressable
                      key={channel}
                      style={[
                        styles.channelButton,
                        {
                          backgroundColor: theme.background.card,
                          borderColor: theme.border.primary,
                        },
                        formData.channels.includes(channel) && {
                          backgroundColor: notificationHelpers.getChannelColor(channel),
                          borderColor: notificationHelpers.getChannelColor(channel),
                        },
                      ]}
                      onPress={() => {
                        const newChannels = formData.channels.includes(channel)
                          ? formData.channels.filter(c => c !== channel)
                          : [...formData.channels, channel];
                        onFormChange({ channels: newChannels });
                      }}
                    >
                      <Caption
                        style={[
                          styles.channelButtonText,
                          { color: theme.text.secondary },
                          formData.channels.includes(channel) && { color: Colors.white },
                        ]}
                      >
                        {channel}
                        {channel === 'SMS' && ' 💰'}
                      </Caption>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={[styles.actions, { borderTopColor: theme.border.primary }]}>
            <Button
              variant="outline"
              onPress={onClose}
              style={[styles.button, { borderColor: theme.border.primary }]}
              disabled={creating}
            >
              Annuler
            </Button>
            <Button
              variant="primary"
              onPress={onSend}
              style={[styles.button, { backgroundColor: Colors.primary }]}
              loading={creating}
              disabled={
                creating ||
                !formData.message.trim() ||
                (sendMode !== 'sms' && !formData.title.trim())
              }
            >
              Envoyer
            </Button>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  inner: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    borderBottomWidth: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontWeight: '600',
    marginBottom: Spacing.md,
    fontSize: 14,
    textTransform: 'uppercase',
  },
  modeButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  recipientButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  recipientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  recipientButtonText: {
    fontFamily: 'Ubuntu_500Medium',
    fontSize: 12,
  },
  userIdsInput: {
    marginTop: Spacing.md,
  },
  charCount: {
    textAlign: 'right',
    marginTop: -Spacing.sm,
    marginBottom: Spacing.md,
    color: Colors.text.tertiary,
  },
  typeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  typeButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  channelButtons: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  channelButton: {
    flex: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  channelButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    gap: Spacing.md,
  },
  button: {
    flex: 1,
  },
});
