/**
 * ImageUploadButton - Composant réutilisable pour l'upload d'images
 * Gère avatar, gift cards et produits avec optimisation automatique
 */

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { LoadingSpinner } from '../Feedback/LoadingSpinner';
import { Caption } from '../Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { uploadService } from '@/services/uploadService';
import type { FileUpload } from '@/types';

type UploadType = 'avatar' | 'gift-card' | 'product';

interface ImageUploadButtonProps {
  type: UploadType;
  currentImageUrl?: string;
  onUploadComplete: (url: string) => void;
  onUploadStart?: () => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
}

const UPLOAD_CONFIG = {
  avatar: {
    label: 'Avatar',
    maxFiles: 1,
    uploadFn: 'uploadAvatar',
  },
  'gift-card': {
    label: 'Gift Card',
    maxFiles: 1,
    uploadFn: 'uploadGiftCardImage',
  },
  product: {
    label: 'Produit',
    maxFiles: 10,
    uploadFn: 'uploadProductImages',
  },
} as const;

const SIZE_CONFIG = {
  small: { width: 60, height: 60, iconSize: 24 },
  medium: { width: 100, height: 100, iconSize: 32 },
  large: { width: 120, height: 120, iconSize: 40 },
};

export function ImageUploadButton({
  type,
  currentImageUrl,
  onUploadComplete,
  onUploadStart,
  onUploadError,
  multiple = false,
  disabled = false,
  size = 'medium',
}: ImageUploadButtonProps) {
  const [uploading, setUploading] = useState(false);
  const [localImageUri, setLocalImageUri] = useState<string | undefined>(currentImageUrl);

  const config = UPLOAD_CONFIG[type];
  const sizeConfig = SIZE_CONFIG[size];

  const handlePickImage = async () => {
    if (disabled) return;

    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        "L'accès à la galerie photo est nécessaire pour uploader une image."
      );
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: multiple && type === 'product',
      quality: 0.8,
      allowsEditing: type === 'avatar', // Crop pour avatar
      aspect: type === 'avatar' ? [1, 1] : undefined,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await uploadImages(result.assets.map(asset => asset.uri));
    }
  };

  const uploadImages = async (uris: string[]) => {
    try {
      setUploading(true);
      onUploadStart?.();

      // Set local preview immediately
      if (uris.length > 0) {
        setLocalImageUri(uris[0]);
      }

      // Create FileUpload objects
      const files: FileUpload[] = uris.map((uri, index) => {
        const fileName = uri.split('/').pop() || `image_${Date.now()}_${index}.jpg`;
        return {
          uri,
          type: 'image/jpeg',
          name: fileName,
        };
      });

      // Upload based on type
      let response: any;

      if (type === 'avatar') {
        response = await uploadService.uploadAvatar(files[0]);
        // Backend returns: { data: { user: { avatarUrl }, file: { url } } }
        const uploadedUrl = response?.data?.user?.avatarUrl || response?.data?.file?.url;
        if (uploadedUrl) {
          setLocalImageUri(uploadedUrl);
          setUploading(false); // Reset loading immediately before callback
          onUploadComplete(uploadedUrl);
        }
      } else if (type === 'gift-card') {
        response = await uploadService.uploadGiftCardImage(files[0]);
        const uploadedUrl = response.files?.[0]?.url;
        if (uploadedUrl) {
          setLocalImageUri(uploadedUrl);
          setUploading(false); // Reset loading immediately before callback
          onUploadComplete(uploadedUrl);
        }
      } else {
        // product
        response = await uploadService.uploadProductImages(files);
        const uploadedUrl = response.files?.[0]?.url;
        if (uploadedUrl) {
          setLocalImageUri(uploadedUrl);
          setUploading(false); // Reset loading immediately before callback
          onUploadComplete(uploadedUrl);
        }
      }
    } catch (error: any) {
      console.error(`[ImageUploadButton] Upload error:`, error);
      const errorMessage = error.message || 'Erreur lors de l\'upload';
      Alert.alert('Erreur d\'upload', errorMessage);
      onUploadError?.(errorMessage);

      // Reset to previous image on error
      setLocalImageUri(currentImageUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Pressable
      style={[
        styles.container,
        {
          width: sizeConfig.width,
          height: sizeConfig.height,
        },
        disabled && styles.disabled,
      ]}
      onPress={handlePickImage}
      disabled={disabled || uploading}
    >
      {/* Image Preview */}
      {localImageUri ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: localImageUri }}
            style={[
              styles.image,
              type === 'avatar' && styles.avatarImage,
            ]}
          />

          {/* Upload Overlay */}
          {uploading && (
            <View style={styles.uploadOverlay}>
              <LoadingSpinner size="small" color={Colors.white} />
            </View>
          )}

          {/* Success Badge */}
          {!uploading && localImageUri !== currentImageUrl && (
            <View style={styles.successBadge}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
          )}

          {/* Change Icon */}
          {!uploading && (
            <View style={styles.changeBadge}>
              <Ionicons name="camera" size={16} color={Colors.white} />
            </View>
          )}
        </View>
      ) : (
        // Empty State
        <View style={styles.emptyState}>
          {uploading ? (
            <LoadingSpinner size="small" color={Colors.primary} />
          ) : (
            <>
              <Ionicons
                name="image-outline"
                size={sizeConfig.iconSize}
                color={Colors.text.tertiary}
              />
              <Caption
                color="secondary"
                style={styles.emptyText}
              >
                Ajouter
              </Caption>
            </>
          )}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    borderStyle: 'dashed',
  },

  disabled: {
    opacity: 0.5,
  },

  imageContainer: {
    flex: 1,
    position: 'relative',
  },

  image: {
    width: '100%',
    height: '100%',
  },

  avatarImage: {
    borderRadius: BorderRadius.full,
  },

  uploadOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  successBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },

  changeBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.text.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  emptyText: {
    fontSize: 11,
  },
});
