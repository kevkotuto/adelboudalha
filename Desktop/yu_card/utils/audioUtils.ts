import { 
  RecordingPresets, 
  setAudioModeAsync,
  requestRecordingPermissionsAsync,
  getRecordingPermissionsAsync 
} from 'expo-audio';

/**
 * Formate la durée en format lisible
 * @param seconds - Durée en secondes
 * @returns string
 */
export const formatDuration = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return '0:00';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Convertit une durée en millisecondes vers un format lisible
 * @param seconds - Durée en secondes
 * @returns string
 */
export const formatRecordingTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Vérifie si l'enregistrement audio est supporté
 * @returns boolean
 */
export const isRecordingSupported = (): boolean => {
  return true; // expo-audio supporte toujours l'enregistrement
};

/**
 * Obtient les contraintes audio optimales pour l'enregistrement
 * @returns RecordingPreset
 */
export const getOptimalRecordingOptions = () => {
  // Essayer HIGH_QUALITY en premier, avec fallback sur une config personnalisée
  try {
    return RecordingPresets.HIGH_QUALITY;
  } catch (error) {

    try {
      return RecordingPresets.LOW_QUALITY;
    } catch (error2) {
   
      // Configuration personnalisée de base si les presets ne fonctionnent pas
      return {
        extension: '.m4a',
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        android: {
          outputFormat: 'mpeg4',
          audioEncoder: 'aac',
        },
        ios: {
          outputFormat: 'IOSOutputFormat.MPEG4AAC',
          audioQuality: 'AudioQuality.HIGH',
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };
    }
  }
};

/**
 * Configure le mode audio pour l'enregistrement
 * @returns Promise<void>
 */
export const setupRecordingMode = async (): Promise<void> => {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
  });
};

/**
 * Configure le mode audio pour la lecture
 * @returns Promise<void>
 */
export const setupPlaybackMode = async (): Promise<void> => {
  await setAudioModeAsync({
    playsInSilentMode: true,
    shouldPlayInBackground: false,
  });
};

/**
 * Types de statut de permission audio
 */
export type AudioPermissionStatus = 'granted' | 'denied' | 'blocked' | 'unknown';

/**
 * Résultat de la demande de permission
 */
export interface AudioPermissionResult {
  granted: boolean;
  status: AudioPermissionStatus;
  canAskAgain: boolean;
}

/**
 * Vérifie les permissions microphone actuelles
 * @returns Promise<AudioPermissionResult>
 */
export const checkMicrophonePermission = async (): Promise<AudioPermissionResult> => {
  try {
    const { status, canAskAgain } = await getRecordingPermissionsAsync();
    
    const mappedStatus: AudioPermissionStatus = 
      status === 'granted' ? 'granted' :
      status === 'denied' ? 'denied' :
      status === 'blocked' ? 'blocked' :
      'unknown';

    return {
      granted: status === 'granted',
      status: mappedStatus,
      canAskAgain: canAskAgain
    };
  } catch  {

    return {
      granted: false,
      status: 'unknown',
      canAskAgain: true
    };
  }
};

/**
 * Demande les permissions microphone
 * @returns Promise<AudioPermissionResult>
 */
export const requestMicrophonePermission = async (): Promise<AudioPermissionResult> => {
  try {
    // D'abord vérifier les permissions existantes
    const currentPermission = await checkMicrophonePermission();
    
    // Si déjà accordées, retourner directement
    if (currentPermission.granted) {
      return currentPermission;
    }

    // Si on peut demander, faire la demande
    if (currentPermission.canAskAgain) {
      const response = await requestRecordingPermissionsAsync();
      
      // Vérifier la structure de réponse - peut être { granted } ou { status, canAskAgain }
      const status = response.granted !== undefined ? (response.granted ? 'granted' : 'denied') : response.status;
      const canAskAgain = response.canAskAgain !== undefined ? response.canAskAgain : !response.granted;
      
      const mappedStatus: AudioPermissionStatus = 
        status === 'granted' ? 'granted' :
        status === 'denied' ? 'denied' :
        status === 'blocked' ? 'blocked' :
        'unknown';

      return {
        granted: status === 'granted',
        status: mappedStatus,
        canAskAgain: canAskAgain
      };
    }

    // Si on ne peut plus demander, retourner l'état actuel
    return currentPermission;
  } catch {
    return {
      granted: false,
      status: 'unknown',
      canAskAgain: true
    };
  }
};

/**
 * Valide si un fichier est un audio valide
 * @param file - Le fichier à valider
 * @returns boolean
 */
export const isValidAudioFile = (file: any): boolean => {
  if (!file || !file.type) return false;
  const validTypes = [
    'audio/mp3',
    'audio/mpeg',
    'audio/wav',
    'audio/wave',
    'audio/x-wav',
    'audio/m4a',
    'audio/x-m4a',
    'audio/aac',
    'audio/ogg',
    'audio/oga',
    'audio/flac',
    'audio/x-flac',
    'audio/wma',
    'audio/x-ms-wma',
    'audio/opus',
    'audio/webm'
  ];
  return validTypes.includes(file.type.toLowerCase());
};

/**
 * Valide la taille du fichier audio (limite à 25MB selon Whisper)
 * @param fileSize - Taille du fichier en bytes
 * @param maxSizeInMB - Taille maximale en MB (défaut: 25)
 * @returns boolean
 */
export const isValidAudioSize = (fileSize: number, maxSizeInMB: number = 25): boolean => {
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return fileSize <= maxSizeInBytes;
};

/**
 * Obtient les extensions de fichiers audio supportées
 * @returns string
 */
export const getSupportedAudioExtensions = (): string => {
  return '.mp3,.wav,.m4a,.aac,.ogg,.flac,.wma,.opus,.webm';
};

/**
 * Obtient la liste des formats audio supportés pour l'affichage
 * @returns Array<string>
 */
export const getSupportedAudioFormats = (): string[] => {
  return ['MP3', 'WAV', 'M4A', 'AAC', 'OGG', 'FLAC', 'WMA', 'OPUS', 'WebM'];
};

/**
 * Estime la taille approximative d'un enregistrement
 * @param durationSeconds - Durée en secondes
 * @param bitrate - Bitrate en kbps (défaut: 128)
 * @returns number - Taille estimée en bytes
 */
export const estimateRecordingSize = (durationSeconds: number, bitrate: number = 128): number => {
  // Formule approximative: (bitrate * duration) / 8
  return Math.round((bitrate * 1024 * durationSeconds) / 8);
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
 * Prépare un fichier audio pour l'upload
 * @param uri - URI du fichier audio
 * @param recordingDuration - Durée de l'enregistrement en secondes
 * @returns File-like object for upload
 */
export const prepareAudioForUpload = (uri: string, recordingDuration: number = 0) => {
  return {
    uri,
    type: 'audio/mp3',
    name: `audio_${Date.now()}.mp3`
  };
};