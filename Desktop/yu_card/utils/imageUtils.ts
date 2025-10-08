import * as ImagePicker from 'expo-image-picker';

/**
 * Valide si un fichier est une image valide
 * @param file - Le fichier à valider
 * @returns boolean
 */
export const isValidImageFile = (file: any): boolean => {
  if (!file || !file.type) return false;
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type.toLowerCase());
};

/**
 * Valide la taille d'une image (basé sur l'asset d'ImagePicker)
 * @param asset - Asset from ImagePicker
 * @param maxSizeInMB - Taille maximale en MB
 * @returns boolean
 */
export const isValidImageSize = (asset: ImagePicker.ImagePickerAsset, maxSizeInMB: number = 10): boolean => {
  if (!asset.fileSize) return true; // Si pas d'info de taille, on accepte
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return asset.fileSize <= maxSizeInBytes;
};

/**
 * Formate la taille du fichier en format lisible
 * @param bytes - Taille en bytes
 * @returns string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Obtient les options d'image picker optimisées
 * @returns ImagePickerOptions
 */
export const getImagePickerOptions = (allowsEditing: boolean = true): ImagePicker.ImagePickerOptions => ({
  mediaTypes: ['images'],
  allowsEditing,
  quality: 0.8,
  aspect: allowsEditing ? [1, 1] : undefined,
  base64: false,
});

/**
 * Obtient les options de caméra optimisées
 * @returns ImagePickerOptions
 */
export const getCameraOptions = (allowsEditing: boolean = true): ImagePicker.ImagePickerOptions => ({
  mediaTypes: 'images',
  allowsEditing,
  quality: 0.8,
  aspect: allowsEditing ? [1, 1] : undefined,
  base64: false,
});

/**
 * Prépare un fichier image pour l'upload depuis un asset ImagePicker
 * @param asset - Asset from ImagePicker
 * @returns File-like object for upload
 */
export const prepareImageForUpload = (asset: ImagePicker.ImagePickerAsset) => {
  return {
    uri: asset.uri,
    type: asset.type === 'image' ? 'image/jpeg' : asset.mimeType || 'image/jpeg',
    name: asset.fileName || `image_${Date.now()}.jpg`
  };
};

/**
 * Obtient les formats d'image supportés
 * @returns Array<string>
 */
export const getSupportedImageFormats = (): string[] => {
  return ['JPEG', 'JPG', 'PNG', 'GIF', 'WebP'];
};

/**
 * Vérifie les permissions de caméra
 * @returns Promise<boolean>
 */
export const requestCameraPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
};

/**
 * Vérifie les permissions de galerie
 * @returns Promise<boolean>
 */
export const requestGalleryPermission = async (): Promise<boolean> => {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    return false;
  }
};

/**
 * Lance la caméra pour prendre une photo
 * @param options - Options pour ImagePicker
 * @returns Promise<ImagePicker.ImagePickerResult>
 */
export const launchCamera = async (options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> => {
  const hasPermission = await requestCameraPermission();
  if (!hasPermission) {
    throw new Error('Permission caméra refusée');
  }

  const defaultOptions = getCameraOptions();
  return ImagePicker.launchCameraAsync({ ...defaultOptions, ...options });
};

/**
 * Lance la galerie pour sélectionner une image
 * @param options - Options pour ImagePicker
 * @returns Promise<ImagePicker.ImagePickerResult>
 */
export const launchImageLibrary = async (options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> => {
  const hasPermission = await requestGalleryPermission();
  if (!hasPermission) {
    throw new Error('Permission galerie refusée');
  }

  const defaultOptions = getImagePickerOptions();
  return ImagePicker.launchImageLibraryAsync({ ...defaultOptions, ...options });
};