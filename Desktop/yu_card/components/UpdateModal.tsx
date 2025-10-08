import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Title, Paragraph, Caption } from '@/components/ui/Typography';
import { Button } from '@/components/ui/Buttons/Button';
import { Colors, Spacing, BorderRadius } from '@/constants';
import useTranslation from '@/hooks/useTranslation';
import { UpdateInfo, UpdateService } from '@/services/updateService';

interface UpdateModalProps {
  visible: boolean;
  updateInfo: UpdateInfo;
  onClose: () => void;
  onUpdate: () => Promise<void>;
}

export const UpdateModal: React.FC<UpdateModalProps> = ({
  visible,
  updateInfo,
  onClose,
  onUpdate,
}) => {
  const { t } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);

  const handleUpdate = async () => {
    try {
      setIsUpdating(true);
      setUpdateProgress(0);

      // Simulate progress (since expo-updates doesn't provide real-time progress)
      const progressInterval = setInterval(() => {
        setUpdateProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      await onUpdate();

      clearInterval(progressInterval);
      setUpdateProgress(100);
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
      // You could add error handling UI here
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close button */}
          {!isUpdating && (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.text.secondary} />
            </Pressable>
          )}

          {/* Icon */}
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
              <Ionicons
                name="cloud-download-outline"
                size={48}
                color={Colors.primary}
              />
            </View>
          </View>

          {/* Title */}
          <Title level={4} align="center" style={styles.title}>
            {t('update.title') || 'Mise à jour disponible'}
          </Title>

          {/* Description */}
          <Paragraph align="center" color="secondary" style={styles.description}>
            {isUpdating
              ? t('update.downloading') || 'Téléchargement en cours...'
              : t('update.message') ||
                'Une nouvelle version de l\'application est disponible. Mettez à jour pour profiter des dernières fonctionnalités et améliorations.'}
          </Paragraph>

          {/* Progress bar (only shown during update) */}
          {isUpdating && (
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${updateProgress}%` },
                  ]}
                />
              </View>
              <Caption align="center" color="secondary">
                {updateProgress}%
              </Caption>
            </View>
          )}

          {/* Version info */}
          {updateInfo.updateId && !isUpdating && (
            <View style={styles.versionInfo}>
              <Caption align="center" color="secondary">
                {t('update.version') || 'Version'}: {updateInfo.updateId.substring(0, 8)}
              </Caption>
            </View>
          )}

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <Button
              variant="primary"
              onPress={handleUpdate}
              disabled={isUpdating}
              loading={isUpdating}
              style={styles.updateButton}
            >
              {isUpdating
                ? t('update.updating') || 'Mise à jour...'
                : t('update.update_now') || 'Mettre à jour maintenant'}
            </Button>

            {!isUpdating && (
              <Button
                variant="ghost"
                onPress={onClose}
                style={styles.laterButton}
              >
                {t('update.later') || 'Plus tard'}
              </Button>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  modalContainer: {
    backgroundColor: Colors.background.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing['2xl'],
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 32,
    height: 32,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    marginBottom: Spacing.md,
  },
  description: {
    marginBottom: Spacing.xl,
    lineHeight: 22,
  },
  progressContainer: {
    marginBottom: Spacing.xl,
  },
  progressBar: {
    height: 8,
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
  },
  versionInfo: {
    marginBottom: Spacing.lg,
  },
  buttonContainer: {
    gap: Spacing.sm,
  },
  updateButton: {
    width: '100%',
  },
  laterButton: {
    width: '100%',
  },
});
