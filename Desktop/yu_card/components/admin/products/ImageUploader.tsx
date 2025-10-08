/**
 * ImageUploader Component
 * Professional multi-image uploader with preview, reorder, and delete
 * Now with automatic upload to server
 */

import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';

import { Button } from '@/components/ui/Buttons/Button';
import { Caption, Paragraph } from '@/components/ui/Typography';
import { BorderRadius, Colors, Spacing } from '@/constants';
import { uploadService } from '@/services/uploadService';
import type { FileUpload } from '@/types';

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  style?: any;
  type?: 'product' | 'gift_card';
}

interface ImageUploadStatus {
  uri: string;
  url?: string;
  uploading: boolean;
  error?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images,
  onImagesChange,
  maxImages = 5,
  style,
  type = 'product',
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadStatuses, setUploadStatuses] = useState<Map<string, ImageUploadStatus>>(new Map());

  const pickImages = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'Veuillez autoriser l\'accès à la galerie pour sélectionner des images'
        );
        return;
      }

      // Calculate remaining slots
      const remainingSlots = maxImages - images.length;
      if (remainingSlots <= 0) {
        Alert.alert(
          'Limite atteinte',
          `Vous ne pouvez ajouter que ${maxImages} images maximum`
        );
        return;
      }

      // Launch image picker
      // Note: allowsEditing ne peut pas être utilisé avec allowsMultipleSelection
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets) {
        // Juste ajouter les URIs locaux, pas d'upload immédiat
        const newImages = result.assets.slice(0, remainingSlots).map(asset => asset.uri);
        console.log('[ImageUploader] Images sélectionnées (URIs locaux):', newImages.length);
        onImagesChange([...images, ...newImages]);
      }
    } catch (error) {
      console.error('[ImageUploader] Error picking images:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner les images');
    }
  };

  const removeImage = (index: number) => {
    Alert.alert(
      'Supprimer l\'image',
      'Voulez-vous vraiment supprimer cette image ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: () => {
            const newImages = images.filter((_, i) => i !== index);
            onImagesChange(newImages);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Paragraph style={styles.label}>
          Images ({images.length}/{maxImages})
        </Paragraph>
        {images.length < maxImages && (
          <Button
            variant="outline"
            size="sm"
            onPress={pickImages}
            leftIcon="images-outline"
          >
            Ajouter
          </Button>
        )}
      </View>

      {/* Images Grid */}
      {images.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imagesContainer}
        >
          {images.map((imageUri, index) => (
            <View key={index} style={styles.imageWrapper}>
              <Image source={{ uri: imageUri }} style={styles.image} />

              {/* Badge */}
              <View style={styles.badge}>
                <Caption style={styles.badgeText}>
                  {index === 0 ? 'Principal' : index + 1}
                </Caption>
              </View>

              {/* Delete Button */}
              <Pressable
                style={styles.deleteButton}
                onPress={() => removeImage(index)}
              >
                <Ionicons name="close-circle" size={24} color="#f44336" />
              </Pressable>
            </View>
          ))}
        </ScrollView>
      ) : (
        <Pressable style={styles.emptyState} onPress={pickImages}>
          <Ionicons name="images-outline" size={48} color={Colors.text.secondary} />
          <Paragraph style={styles.emptyText}>
            Aucune image sélectionnée
          </Paragraph>
          <Caption style={styles.emptyHint}>
            Appuyez pour ajouter des images
          </Caption>
        </Pressable>
      )}

      {/* Hint */}
      <Caption style={styles.hint}>
        La première image sera utilisée comme image principale
      </Caption>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },

  label: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.text.primary,
  },

  imagesContainer: {
    gap: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  imageWrapper: {
    position: 'relative',
    width: 120,
    height: 120,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    backgroundColor: Colors.background.secondary,
  },

  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },

  badge: {
    position: 'absolute',
    top: Spacing.xs,
    left: Spacing.xs,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xs,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },

  badgeText: {
    fontFamily: 'Ubuntu_600SemiBold',
    color: Colors.white,
    fontSize: 10,
  },

  deleteButton: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
    backgroundColor: Colors.white,
    borderRadius: 12,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['2xl'],
    backgroundColor: Colors.background.secondary,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border.primary,
    borderStyle: 'dashed',
  },

  emptyText: {
    marginTop: Spacing.sm,
    color: Colors.text.secondary,
    fontFamily: 'Ubuntu_500Medium',
  },

  emptyHint: {
    marginTop: Spacing.xs,
    color: Colors.text.secondary,
    fontSize: 11,
  },

  hint: {
    marginTop: Spacing.sm,
    color: Colors.text.secondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
