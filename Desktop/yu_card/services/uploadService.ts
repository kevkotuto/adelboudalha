import { apiClient } from './apiClient';
import { API_ENDPOINTS } from './config';
import {
  UploadResponse,
  UploadMultipleResponse,
  UploadImageRequest,
  UploadMultipleImagesRequest,
  UploadProductImagesRequest,
  UploadGiftCardImagesRequest,
  UploadAvatarRequest,
  UploadDocumentRequest,
  ValidateFileRequest,
  FileValidationResult,
  DeleteFileRequest,
  FileInfo,
  UploadConfig,
  StorageInfo,
  CleanupTempFilesRequest,
  CleanupTempFilesResponse,
  UploadHealth,
  FileUpload,
  UploadProgressCallback,
} from '@/types';

// ==================================
// UPLOAD SERVICE
// ==================================

export class UploadService {
  // ==================================
  // SINGLE FILE UPLOADS
  // ==================================

  /**
   * Upload single image
   */
  async uploadImage(
    file: FileUpload,
    options: Omit<UploadImageRequest, 'file'> = { type: 'general' },
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    return await apiClient.upload<UploadResponse>(
      API_ENDPOINTS.UPLOAD.IMAGE,
      file,
      options,
      onProgress
    );
  }

  /**
   * Upload user avatar
   * Note: Backend expects 'avatar' as the field name, not 'file'
   */
  async uploadAvatar(
    file: FileUpload,
    options: Omit<UploadAvatarRequest, 'file'> = {},
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    // Create FormData manually to use 'avatar' as field name
    const formData = new FormData();
    formData.append('avatar', file as any);

    // Add any additional options
    if (options) {
      Object.entries(options).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    return await apiClient.post<UploadResponse>(
      API_ENDPOINTS.UPLOAD.AVATAR,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 seconds for upload
        onUploadProgress: onProgress
          ? (progressEvent) => {
              if (progressEvent.total) {
                onProgress({
                  loaded: progressEvent.loaded,
                  total: progressEvent.total,
                  percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total),
                });
              }
            }
          : undefined,
      }
    );
  }

  /**
   * Upload document
   */
  async uploadDocument(
    file: FileUpload,
    options: Omit<UploadDocumentRequest, 'file'>,
    onProgress?: UploadProgressCallback
  ): Promise<UploadResponse> {
    return await apiClient.upload<UploadResponse>(
      API_ENDPOINTS.UPLOAD.DOCUMENT,
      file,
      options,
      onProgress
    );
  }

  // ==================================
  // MULTIPLE FILE UPLOADS
  // ==================================

  /**
   * Upload multiple images
   */
  async uploadMultipleImages(
    files: FileUpload[],
    options: Omit<UploadMultipleImagesRequest, 'files'> = { type: 'general' },
    onProgress?: UploadProgressCallback
  ): Promise<UploadMultipleResponse> {
    return await apiClient.upload<UploadMultipleResponse>(
      API_ENDPOINTS.UPLOAD.IMAGES,
      files,
      options,
      onProgress
    );
  }

  /**
   * Upload product images
   */
  async uploadProductImages(
    files: FileUpload[],
    options: Omit<UploadProductImagesRequest, 'files'> = {},
    onProgress?: UploadProgressCallback
  ): Promise<UploadMultipleResponse> {
    return await apiClient.upload<UploadMultipleResponse>(
      API_ENDPOINTS.UPLOAD.PRODUCT_IMAGES,
      files,
      options,
      onProgress
    );
  }

  /**
   * Upload gift card images
   */
  async uploadGiftCardImages(
    files: FileUpload[],
    options: Omit<UploadGiftCardImagesRequest, 'files'>,
    onProgress?: UploadProgressCallback
  ): Promise<UploadMultipleResponse> {
    return await apiClient.upload<UploadMultipleResponse>(
      API_ENDPOINTS.UPLOAD.GIFT_CARD_IMAGES,
      files,
      options,
      onProgress
    );
  }

  /**
   * Upload single gift card image
   */
  async uploadGiftCardImage(
    file: FileUpload,
    options: Omit<UploadImageRequest, 'file'> = { type: 'gift-card' },
    onProgress?: UploadProgressCallback
  ): Promise<UploadMultipleResponse> {
    // Reuse uploadGiftCardImages with single file wrapped in array
    return await this.uploadGiftCardImages([file], options as any, onProgress);
  }

  // ==================================
  // FILE VALIDATION
  // ==================================

  /**
   * Validate file before upload
   */
  async validateFile(fileInfo: ValidateFileRequest): Promise<FileValidationResult> {
    return await apiClient.post<FileValidationResult>(
      API_ENDPOINTS.UPLOAD.VALIDATE,
      fileInfo
    );
  }

  // ==================================
  // FILE MANAGEMENT
  // ==================================

  /**
   * Delete file by filename
   */
  async deleteFile(filename: string, permanent = false): Promise<{ success: boolean }> {
    const deleteData: DeleteFileRequest = { filename, permanent };
    return await apiClient.delete<{ success: boolean }>(
      API_ENDPOINTS.UPLOAD.FILE(filename),
      { data: deleteData }
    );
  }

  /**
   * Get file information
   */
  async getFileInfo(filename: string): Promise<FileInfo> {
    return await apiClient.get<FileInfo>(
      API_ENDPOINTS.UPLOAD.FILE(filename)
    );
  }

  // ==================================
  // CONFIGURATION & ADMIN
  // ==================================

  /**
   * Get upload configuration
   */
  async getUploadConfig(): Promise<UploadConfig> {
    return await apiClient.get<UploadConfig>(
      API_ENDPOINTS.UPLOAD.CONFIG
    );
  }

  /**
   * Get storage information (Admin only)
   */
  async getStorageInfo(): Promise<StorageInfo> {
    return await apiClient.get<StorageInfo>(
      API_ENDPOINTS.UPLOAD.STORAGE_INFO
    );
  }

  /**
   * Cleanup temporary files (Admin only)
   */
  async cleanupTempFiles(
    options: CleanupTempFilesRequest = {}
  ): Promise<CleanupTempFilesResponse> {
    return await apiClient.post<CleanupTempFilesResponse>(
      API_ENDPOINTS.UPLOAD.CLEANUP_TEMP,
      options
    );
  }

  /**
   * Check upload service health
   */
  async checkHealth(): Promise<UploadHealth> {
    return await apiClient.get<UploadHealth>(
      API_ENDPOINTS.UPLOAD.HEALTH
    );
  }
}

// ==================================
// UPLOAD HELPER FUNCTIONS
// ==================================

export const uploadHelpers = {
  /**
   * Validate file type
   */
  validateFileType(file: FileUpload, allowedTypes: string[]): boolean {
    return allowedTypes.some(type => file.type.includes(type));
  },

  /**
   * Validate file size
   */
  validateFileSize(file: FileUpload, maxSizeBytes: number): boolean {
    return (file.size || 0) <= maxSizeBytes;
  },

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  },

  /**
   * Get file extension
   */
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  },

  /**
   * Generate unique filename
   */
  generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = uploadHelpers.getFileExtension(originalName);
    const nameWithoutExt = originalName.replace(/\.[^/.]+$/, '');

    return `${nameWithoutExt}_${timestamp}_${random}.${extension}`;
  },

  /**
   * Check if file is an image
   */
  isImageFile(file: FileUpload): boolean {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return imageTypes.includes(file.type);
  },

  /**
   * Check if file is a document
   */
  isDocumentFile(file: FileUpload): boolean {
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
    ];
    return documentTypes.includes(file.type);
  },

  /**
   * Get file type category
   */
  getFileTypeCategory(file: FileUpload): 'image' | 'document' | 'other' {
    if (uploadHelpers.isImageFile(file)) return 'image';
    if (uploadHelpers.isDocumentFile(file)) return 'document';
    return 'other';
  },

  /**
   * Create file upload object from URI (React Native)
   */
  createFileUploadFromUri(uri: string, type: string, name: string): FileUpload {
    return {
      uri,
      type,
      name,
    };
  },

  /**
   * Validate multiple files
   */
  validateMultipleFiles(
    files: FileUpload[],
    maxFiles: number,
    maxTotalSize: number,
    allowedTypes: string[]
  ): {
    valid: boolean;
    errors: string[];
    validFiles: FileUpload[];
    invalidFiles: Array<{ file: FileUpload; error: string }>;
  } {
    const errors: string[] = [];
    const validFiles: FileUpload[] = [];
    const invalidFiles: Array<{ file: FileUpload; error: string }> = [];

    // Check file count
    if (files.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} fichiers autorisés`);
    }

    // Check total size
    const totalSize = files.reduce((sum, file) => sum + (file.size || 0), 0);
    if (totalSize > maxTotalSize) {
      errors.push(
        `Taille totale dépassée: ${uploadHelpers.formatFileSize(totalSize)} / ${uploadHelpers.formatFileSize(maxTotalSize)}`
      );
    }

    // Validate each file
    files.forEach(file => {
      const fileErrors: string[] = [];

      if (!uploadHelpers.validateFileType(file, allowedTypes)) {
        fileErrors.push('Type de fichier non autorisé');
      }

      if (fileErrors.length > 0) {
        invalidFiles.push({ file, error: fileErrors.join(', ') });
      } else {
        validFiles.push(file);
      }
    });

    return {
      valid: errors.length === 0 && invalidFiles.length === 0,
      errors,
      validFiles,
      invalidFiles,
    };
  },

  /**
   * Get upload progress message
   */
  getUploadProgressMessage(progress: {
    loaded: number;
    total: number;
    percentage: number;
  }): string {
    const { loaded, total, percentage } = progress;
    const loadedSize = uploadHelpers.formatFileSize(loaded);
    const totalSize = uploadHelpers.formatFileSize(total);

    return `${loadedSize} / ${totalSize} (${percentage}%)`;
  },

  /**
   * Generate image thumbnails (client-side)
   */
  async generateThumbnail(
    file: FileUpload,
    maxWidth: number,
    maxHeight: number,
    quality = 0.8
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
        const newWidth = img.width * ratio;
        const newHeight = img.height * ratio;

        canvas.width = newWidth;
        canvas.height = newHeight;

        // Draw and convert to blob
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              reject(new Error('Failed to generate thumbnail'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = file.uri;
    });
  },

  /**
   * Compress image before upload
   */
  async compressImage(
    file: FileUpload,
    maxWidth: number,
    maxHeight: number,
    quality = 0.8
  ): Promise<FileUpload> {
    const compressedUri = await uploadHelpers.generateThumbnail(
      file,
      maxWidth,
      maxHeight,
      quality
    );

    return {
      ...file,
      uri: compressedUri,
      name: `compressed_${file.name}`,
    };
  },

  /**
   * Batch upload with progress tracking
   */
  async batchUpload(
    files: FileUpload[],
    uploadFunction: (file: FileUpload) => Promise<UploadResponse>,
    onProgress?: (completed: number, total: number, currentFile?: string) => void
  ): Promise<{
    successful: UploadResponse[];
    failed: Array<{ file: FileUpload; error: string }>;
  }> {
    const successful: UploadResponse[] = [];
    const failed: Array<{ file: FileUpload; error: string }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      try {
        onProgress?.(i, files.length, file.name);
        const result = await uploadFunction(file);
        successful.push(result);
      } catch (error) {
        failed.push({
          file,
          error: error instanceof Error ? error.message : 'Upload failed',
        });
      }
    }

    onProgress?.(files.length, files.length);

    return { successful, failed };
  },

  /**
   * Get recommended image dimensions
   */
  getRecommendedDimensions(purpose: string): { width: number; height: number } {
    const dimensions = {
      avatar: { width: 200, height: 200 },
      'product-main': { width: 800, height: 800 },
      'product-thumbnail': { width: 300, height: 300 },
      'gift-card-main': { width: 600, height: 400 },
      'gift-card-background': { width: 800, height: 500 },
      banner: { width: 1200, height: 400 },
      default: { width: 600, height: 600 },
    };

    return dimensions[purpose] || dimensions.default;
  },

  /**
   * Create upload summary
   */
  createUploadSummary(results: UploadMultipleResponse): {
    totalFiles: number;
    successfulUploads: number;
    failedUploads: number;
    totalSize: string;
    successRate: string;
  } {
    const totalFiles = results.files.length + (results.failedUploads?.length || 0);
    const successfulUploads = results.files.length;
    const failedUploads = results.failedUploads?.length || 0;
    const totalSize = results.files.reduce((sum, file) => sum + file.size, 0);
    const successRate = totalFiles > 0 ? ((successfulUploads / totalFiles) * 100).toFixed(1) : '0';

    return {
      totalFiles,
      successfulUploads,
      failedUploads,
      totalSize: uploadHelpers.formatFileSize(totalSize),
      successRate: `${successRate}%`,
    };
  },
};

// ==================================
// SINGLETON INSTANCE
// ==================================

export const uploadService = new UploadService();
export default uploadService;