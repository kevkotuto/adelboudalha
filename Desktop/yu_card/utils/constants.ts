export const API_CONFIG = {
  BASE_URL: 'https://server.akilicheck.com',
  TIMEOUT: {
    DEFAULT: 30000,
    AI_ANALYSIS: 20000,
    VIDEO_ANALYSIS: 60000,
  },
  MAX_FILE_SIZE: {
    IMAGE: 10 * 1024 * 1024, // 10MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    AUDIO: 25 * 1024 * 1024, // 25MB
  },
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
  SETTINGS: 'settings',
  CONVERSATIONS: 'conversations',
  DEVICE_LANGUAGE: 'device_language',
} as const;

export const SUPPORTED_LANGUAGES = {
  FR: 'fr',
  EN: 'en',
  AR: 'ar',
  ES: 'es',
  BM: 'bm',
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

export const FILE_FORMATS = {
  IMAGES: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  VIDEOS: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv', 'm4v'],
  AUDIO: ['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac', 'wma', 'opus'],
} as const;

export const ERROR_CODES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DAILY_LIMIT_REACHED: 'DAILY_LIMIT_REACHED',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  INVALID_FILE_FORMAT: 'INVALID_FILE_FORMAT',
  AI_SERVICE_UNAVAILABLE: 'AI_SERVICE_UNAVAILABLE',
  SERVER_ERROR: 'SERVER_ERROR',
} as const;