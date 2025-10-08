// ==================================
// UPLOAD REQUEST TYPES
// ==================================

export interface UploadImageRequest {
  file: File | Blob;
  type: 'product' | 'gift-card' | 'avatar' | 'document' | 'general';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface UploadMultipleImagesRequest {
  files: (File | Blob)[];
  type: 'product' | 'gift-card' | 'avatar' | 'document' | 'general';
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
}

export interface UploadProductImagesRequest {
  files: (File | Blob)[];
  productId?: string;
  optimize?: boolean;
  generateThumbnails?: boolean;
}

export interface UploadGiftCardImagesRequest {
  files: (File | Blob)[];
  giftCardId?: string;
  imageType: 'main' | 'background' | 'template';
}

export interface UploadAvatarRequest {
  file: File | Blob;
  userId?: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface UploadDocumentRequest {
  file: File | Blob;
  documentType: 'invoice' | 'receipt' | 'terms' | 'privacy' | 'manual' | 'other';
  description?: string;
}

export interface ValidateFileRequest {
  filename: string;
  fileSize: number;
  fileType: string;
  purpose: 'image' | 'document' | 'avatar';
}

// ==================================
// UPLOAD RESPONSE TYPES
// ==================================

export interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimeType: string;
  dimensions?: {
    width: number;
    height: number;
  };
  thumbnails?: {
    small: string;
    medium: string;
    large: string;
  };
  metadata?: Record<string, any>;
}

export interface UploadMultipleResponse {
  success: boolean;
  files: UploadResponse[];
  failedUploads?: Array<{
    filename: string;
    error: string;
  }>;
}

export interface UploadProductImagesResponse extends UploadMultipleResponse {
  productId?: string;
}

export interface UploadGiftCardImagesResponse extends UploadMultipleResponse {
  giftCardId?: string;
  imageType: string;
}

export interface UploadProgressCallback {
  (progress: {
    loaded: number;
    total: number;
    percentage: number;
    filename?: string;
  }): void;
}

// ==================================
// FILE MANAGEMENT TYPES
// ==================================

export interface DeleteFileRequest {
  filename: string;
  permanent?: boolean;
}

export interface FileInfo {
  filename: string;
  originalName: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  uploadedBy?: string;
  dimensions?: {
    width: number;
    height: number;
  };
  metadata?: Record<string, any>;
}

// ==================================
// UPLOAD CONFIGURATION TYPES
// ==================================

export interface UploadConfig {
  maxFileSize: {
    image: number;
    document: number;
    avatar: number;
  };
  allowedMimeTypes: {
    image: string[];
    document: string[];
    avatar: string[];
  };
  imageOptimization: {
    quality: number;
    maxDimensions: {
      width: number;
      height: number;
    };
    generateThumbnails: boolean;
    thumbnailSizes: Array<{
      name: string;
      width: number;
      height: number;
    }>;
  };
  storageProvider: 'local' | 'aws-s3' | 'cloudinary';
  baseUrl: string;
}

// ==================================
// STORAGE INFO TYPES (Admin)
// ==================================

export interface StorageInfo {
  totalFiles: number;
  totalSize: number;
  usedSpace: number;
  availableSpace?: number;
  filesByType: {
    images: number;
    documents: number;
    avatars: number;
    other: number;
  };
  sizeByType: {
    images: number;
    documents: number;
    avatars: number;
    other: number;
  };
  recentUploads: FileInfo[];
}

// ==================================
// UPLOAD HEALTH TYPES
// ==================================

export interface UploadHealth {
  status: 'healthy' | 'degraded' | 'down';
  storageProvider: {
    name: string;
    status: 'connected' | 'disconnected';
    responseTime?: number;
  };
  diskSpace?: {
    total: number;
    used: number;
    available: number;
    percentUsed: number;
  };
  recentErrors?: Array<{
    timestamp: string;
    error: string;
    filename?: string;
  }>;
}

// ==================================
// VALIDATION TYPES
// ==================================

export interface FileValidationResult {
  valid: boolean;
  errors?: string[];
  warnings?: string[];
  fileInfo: {
    size: number;
    type: string;
    extension: string;
  };
}

// ==================================
// CLEANUP TYPES
// ==================================

export interface CleanupTempFilesRequest {
  olderThan?: number; // hours
  dryRun?: boolean;
}

export interface CleanupTempFilesResponse {
  deletedFiles: number;
  freedSpace: number;
  errors?: string[];
  files?: string[];
}