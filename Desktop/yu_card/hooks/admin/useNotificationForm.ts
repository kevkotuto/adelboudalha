import { useState } from 'react';
import { Alert } from 'react-native';

import {
  adminNotificationsService,
  notificationHelpers,
} from '@/services/adminNotificationsService';
import { NotificationFormData } from '@/types/adminNotifications';

type SendMode = 'push' | 'sms' | 'broadcast';

const INITIAL_FORM_DATA: NotificationFormData = {
  title: '',
  message: '',
  type: 'PROMOTION',
  channels: ['PUSH', 'IN_APP'],
  targetType: 'all',
  userIds: [],
  data: undefined,
};

export const useNotificationForm = (onSuccess?: () => void) => {
  const [formData, setFormData] = useState<NotificationFormData>(INITIAL_FORM_DATA);
  const [sendMode, setSendMode] = useState<SendMode>('broadcast');
  const [creating, setCreating] = useState(false);

  const updateFormData = (updates: Partial<NotificationFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const resetForm = () => {
    setFormData(INITIAL_FORM_DATA);
    setSendMode('broadcast');
  };

  const handleSendNotification = async () => {
    // Validation
    const titleValidation = notificationHelpers.validateTitle(formData.title);
    if (!titleValidation.valid) {
      Alert.alert('Erreur', titleValidation.error);
      return;
    }

    const messageValidation = notificationHelpers.validateMessageLength(
      formData.message,
      sendMode === 'sms' ? 'SMS' : 'PUSH'
    );
    if (!messageValidation.valid) {
      Alert.alert('Erreur', messageValidation.error);
      return;
    }

    // Avertissement SMS
    if (
      (sendMode === 'sms' || formData.channels.includes('SMS')) &&
      !notificationHelpers.isChannelFree('SMS')
    ) {
      Alert.alert(
        '⚠️ Attention - Coût SMS',
        "L'envoi de SMS consomme des crédits. Voulez-vous continuer ?",
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Continuer', onPress: () => executeSend() },
        ]
      );
      return;
    }

    executeSend();
  };

  const executeSend = async () => {
    try {
      setCreating(true);

      let response;

      switch (sendMode) {
        case 'push':
          response = await adminNotificationsService.sendPushNotification({
            title: formData.title,
            message: formData.message,
            type: formData.type,
            userIds: formData.targetType === 'all' ? undefined : formData.userIds,
            data: formData.data,
          });
          break;

        case 'sms':
          response = await adminNotificationsService.sendSMS({
            message: formData.message,
            userIds: formData.targetType === 'all' ? undefined : formData.userIds,
          });
          break;

        case 'broadcast':
          response = await adminNotificationsService.broadcast({
            title: formData.title,
            message: formData.message,
            type: formData.type,
            channels: formData.channels,
            userIds: formData.targetType === 'all' ? undefined : formData.userIds,
            data: formData.data,
          });
          break;
      }

      const successCount =
        response?.data?.sent ||
        response?.data?.totalUsers ||
        response?.data?.stats?.smsSent ||
        response?.data?.stats?.pushSent ||
        formData.userIds.length ||
        'plusieurs';

      Alert.alert('Succès ! 🎉', `Notification envoyée à ${successCount} utilisateur(s)`, [
        {
          text: 'OK',
          onPress: () => {
            resetForm();
            onSuccess?.();
          },
        },
      ]);
    } catch (error: any) {
      console.error("Erreur lors de l'envoi:", error);
      Alert.alert('Erreur', error.message || "Impossible d'envoyer la notification");
    } finally {
      setCreating(false);
    }
  };

  return {
    formData,
    sendMode,
    creating,
    updateFormData,
    setSendMode,
    resetForm,
    handleSendNotification,
  };
};
