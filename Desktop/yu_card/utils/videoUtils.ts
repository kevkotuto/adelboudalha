import * as ImagePicker from 'expo-image-picker';

/**
 * Valide si un fichier est une vidéo valide
 * @param file - Le fichier à valider
 * @returns boolean
 */
export const isValidVideoFile = (file: any): boolean => {
  if (!file || !file.type) return false;
  const validTypes = [
    'video/mp4',
    'video/avi',
    'video/quicktime', // MOV
    'video/x-ms-wmv', // WMV
    'video/x-flv', // FLV
    'video/webm',
    'video/x-matroska', // MKV
    'video/x-m4v' // M4V
  ];
  return validTypes.includes(file.type.toLowerCase());
};

/**
 * Valide la taille du fichier vidéo
 * @param asset - Asset from ImagePicker
 * @param maxSizeInMB - Taille maximale en MB (défaut: 100)
 * @returns boolean
 */
export const isValidVideoSize = (asset: ImagePicker.ImagePickerAsset, maxSizeInMB: number = 100): boolean => {
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
 * Formate la durée en format lisible
 * @param seconds - Durée en secondes
 * @returns string
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '--:--';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Obtient les options de vidéo picker optimisées
 * @returns ImagePickerOptions
 */
export const getVideoPickerOptions = (): ImagePicker.ImagePickerOptions => ({
  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
  allowsEditing: true,
  quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
  videoMaxDuration: 60, // 1 minute max pour éviter les gros fichiers
});

/**
 * Obtient les options de caméra vidéo optimisées
 * @returns ImagePickerOptions
 */
export const getVideoCameraOptions = (): ImagePicker.ImagePickerOptions => ({
  mediaTypes: ImagePicker.MediaTypeOptions.Videos,
  allowsEditing: true,
  quality: ImagePicker.UIImagePickerControllerQualityType.Medium,
  videoMaxDuration: 60, // 1 minute max
});

/**
 * Prépare un fichier vidéo pour l'upload depuis un asset ImagePicker
 * @param asset - Asset from ImagePicker
 * @returns File-like object for upload
 */
export const prepareVideoForUpload = (asset: ImagePicker.ImagePickerAsset) => {
  return {
    uri: asset.uri,
    type: 'video/mp4', // On force MP4 pour la compatibilité
    name: asset.fileName || `video_${Date.now()}.mp4`
  };
};

/**
 * Obtient les extensions de fichiers vidéo supportées
 * @returns string
 */
export const getSupportedVideoExtensions = (): string => {
  return '.mp4,.avi,.mov,.wmv,.flv,.webm,.mkv,.m4v';
};

/**
 * Obtient la liste des formats vidéo supportés pour l'affichage
 * @returns Array<string>
 */
export const getSupportedVideoFormats = (): string[] => {
  return ['MP4', 'AVI', 'MOV', 'WMV', 'FLV', 'WebM', 'MKV', 'M4V'];
};

/**
 * Lance la caméra pour enregistrer une vidéo
 * @param options - Options pour ImagePicker
 * @returns Promise<ImagePicker.ImagePickerResult>
 */
export const launchVideoCamera = async (options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> => {
  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission caméra refusée');
  }

  const defaultOptions = getVideoCameraOptions();
  return ImagePicker.launchCameraAsync({ ...defaultOptions, ...options });
};

/**
 * Lance la galerie pour sélectionner une vidéo
 * @param options - Options pour ImagePicker
 * @returns Promise<ImagePicker.ImagePickerResult>
 */
export const launchVideoLibrary = async (options?: ImagePicker.ImagePickerOptions): Promise<ImagePicker.ImagePickerResult> => {
  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission galerie refusée');
  }

  const defaultOptions = getVideoPickerOptions();
  return ImagePicker.launchImageLibraryAsync({ ...defaultOptions, ...options });
};