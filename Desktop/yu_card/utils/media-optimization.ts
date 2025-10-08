import React from 'react';
import { Platform, Dimensions } from 'react-native';
import { SmartCache, MediaCache } from './smartCache';
import { PerformanceUtils } from './performance';

/**
 * Système d'optimisation des médias avec progressive loading et compression intelligente
 */

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface MediaOptimizationOptions {
  quality?: 'low' | 'medium' | 'high';
  maxWidth?: number;
  maxHeight?: number;
  progressive?: boolean;
  cacheEnabled?: boolean;
  compressionLevel?: number; // 0-100
}

export interface OptimizedMediaResult {
  uri: string;
  width: number;
  height: number;
  size: number;
  quality: 'low' | 'medium' | 'high';
  cached: boolean;
}

/**
 * Gestionnaire d'optimisation des médias
 */
export class MediaOptimizer {
  private static readonly QUALITY_CONFIGS = {
    low: { 
      quality: 60, 
      maxDimension: 400,
      suffix: '_low' 
    },
    medium: { 
      quality: 75, 
      maxDimension: 800,
      suffix: '_med' 
    },
    high: { 
      quality: 90, 
      maxDimension: 1200,
      suffix: '_high' 
    },
  };

  /**
   * Optimiser une image avec compression et redimensionnement
   */
  static async optimizeImage(
    sourceUri: string,
    options: MediaOptimizationOptions = {}
  ): Promise<OptimizedMediaResult> {
    const {
      quality = 'medium',
      maxWidth = SCREEN_WIDTH,
      maxHeight = SCREEN_HEIGHT,
      progressive = true,
      cacheEnabled = true,
      compressionLevel
    } = options;

    // Vérifier le cache d'abord
    if (cacheEnabled) {
      const cached = await MediaCache.getCachedImage(sourceUri, quality);
      if (cached) {
        return {
          uri: cached,
          width: maxWidth,
          height: maxHeight,
          size: 0, // Taille du cache
          quality,
          cached: true,
        };
      }
    }

    try {
      const config = this.QUALITY_CONFIGS[quality];
      const targetCompression = compressionLevel ?? config.quality;
      
      // Calcul des dimensions optimales
      const dimensions = await this.calculateOptimalDimensions(
        sourceUri, 
        Math.min(maxWidth, config.maxDimension),
        Math.min(maxHeight, config.maxDimension)
      );

      // Compression selon la plateforme
      const optimizedUri = await this.compressImage({
        uri: sourceUri,
        quality: targetCompression / 100,
        width: dimensions.width,
        height: dimensions.height,
        progressive,
      });

      // Mettre en cache le résultat
      if (cacheEnabled && optimizedUri) {
        await MediaCache.cacheImage(sourceUri, optimizedUri, quality);
      }

      return {
        uri: optimizedUri || sourceUri,
        width: dimensions.width,
        height: dimensions.height,
        size: await this.getFileSize(optimizedUri || sourceUri),
        quality,
        cached: false,
      };

    } catch (error) {
      return {
        uri: sourceUri,
        width: maxWidth,
        height: maxHeight,
        size: 0,
        quality,
        cached: false,
      };
    }
  }

  /**
   * Progressive loading : générer plusieurs versions d'une image
   */
  static async createProgressiveVersions(
    sourceUri: string,
    targetSizes: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high']
  ): Promise<Record<string, OptimizedMediaResult>> {
    const versions: Record<string, OptimizedMediaResult> = {};

    for (const quality of targetSizes) {
      versions[quality] = await this.optimizeImage(sourceUri, {
        quality,
        progressive: true,
        cacheEnabled: true,
      });
    }

    return versions;
  }

  /**
   * Calculer les dimensions optimales en conservant le ratio
   */
  private static async calculateOptimalDimensions(
    uri: string,
    maxWidth: number,
    maxHeight: number
  ): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
      const { Image } = require('react-native');
      
      Image.getSize(
        uri,
        (originalWidth: number, originalHeight: number) => {
          const aspectRatio = originalWidth / originalHeight;
          
          let targetWidth = Math.min(originalWidth, maxWidth);
          let targetHeight = Math.min(originalHeight, maxHeight);
          
          // Maintenir le ratio d'aspect
          if (targetWidth / targetHeight > aspectRatio) {
            targetWidth = targetHeight * aspectRatio;
          } else {
            targetHeight = targetWidth / aspectRatio;
          }
          
          resolve({
            width: Math.round(targetWidth),
            height: Math.round(targetHeight),
          });
        },
        () => {
          // Fallback si on ne peut pas obtenir les dimensions
          resolve({ width: maxWidth, height: maxHeight });
        }
      );
    });
  }

  /**
   * Compression d'image native selon la plateforme
   */
  private static async compressImage(options: {
    uri: string;
    quality: number;
    width: number;
    height: number;
    progressive: boolean;
  }): Promise<string | null> {
    // Dans une vraie implémentation, utiliser expo-image-manipulator ou similaire
    try {
      if (Platform.OS === 'web') {
        // Compression canvas pour le web
        return this.compressImageWeb(options);
      } else {
        // Compression native mobile
        return this.compressImageNative(options);
      }
    } catch (error) {
      return null;
    }
  }

  private static async compressImageWeb(options: {
    uri: string;
    quality: number;
    width: number;
    height: number;
  }): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        canvas.width = options.width;
        canvas.height = options.height;
        
        ctx.drawImage(img, 0, 0, options.width, options.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              resolve(url);
            } else {
              reject(new Error('Canvas compression failed'));
            }
          },
          'image/jpeg',
          options.quality
        );
      };
      
      img.onerror = reject;
      img.src = options.uri;
    });
  }

  private static async compressImageNative(options: {
    uri: string;
    quality: number;
    width: number;
    height: number;
  }): Promise<string> {
    // Exemple avec expo-image-manipulator
    // const { manipulateAsync, SaveFormat } = require('expo-image-manipulator');
    
    // const result = await manipulateAsync(
    //   options.uri,
    //   [{ resize: { width: options.width, height: options.height } }],
    //   { 
    //     compress: options.quality,
    //     format: SaveFormat.JPEG 
    //   }
    // );
    
    // return result.uri;
    
    // Pour cette démo, retourner l'URI original
    return options.uri;
  }

  /**
   * Obtenir la taille d'un fichier
   */
  private static async getFileSize(uri: string): Promise<number> {
    // Implémentation simplifiée
    // Dans une vraie app, utiliser FileSystem.getInfoAsync() d'Expo
    return 0;
  }
}

/**
 * Hook pour progressive loading d'images
 */
export function useProgressiveImage(sourceUri: string, options: MediaOptimizationOptions = {}) {
  const [currentUri, setCurrentUri] = React.useState<string>('');
  const [quality, setQuality] = React.useState<'low' | 'medium' | 'high'>('low');
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const loadProgressively = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Créer les versions progressives
        const versions = await MediaOptimizer.createProgressiveVersions(sourceUri);
        
        if (cancelled) return;

        // Charger la version basse qualité en premier
        if (versions.low) {
          setCurrentUri(versions.low.uri);
          setQuality('low');
        }

        // Passer à la qualité moyenne avec un délai
        await PerformanceUtils.runAfterInteractions(async () => {
          if (cancelled) return;
          
          if (versions.medium) {
            setCurrentUri(versions.medium.uri);
            setQuality('medium');
          }
        });

        // Charger la haute qualité si nécessaire
        if (options.quality === 'high' && versions.high) {
          await PerformanceUtils.runAfterInteractions(async () => {
            if (cancelled) return;
            
            setCurrentUri(versions.high.uri);
            setQuality('high');
          });
        }

        setIsLoading(false);
      } catch (err) {
        if (!cancelled) {
          setError(err as Error);
          setCurrentUri(sourceUri); // Fallback vers l'original
          setIsLoading(false);
        }
      }
    };

    if (sourceUri) {
      loadProgressively();
    }

    return () => {
      cancelled = true;
    };
  }, [sourceUri, options.quality]);

  return {
    uri: currentUri,
    quality,
    isLoading,
    error,
    isProgressiveComplete: quality === (options.quality || 'high'),
  };
}

/**
 * Component d'image progressive
 */
export interface ProgressiveImageProps {
  source: { uri: string };
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  onLoad?: () => void;
  onError?: (error: Error) => void;
  placeholder?: React.ReactNode;
  quality?: 'low' | 'medium' | 'high';
}

export const ProgressiveImage: React.FC<ProgressiveImageProps> = ({
  source,
  style,
  resizeMode = 'cover',
  onLoad,
  onError,
  placeholder,
  quality = 'high',
}) => {
  const { uri, isLoading, error } = useProgressiveImage(source.uri, { quality });
  const { Image, View, ActivityIndicator } = require('react-native');

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  React.useEffect(() => {
    if (!isLoading && uri && onLoad) {
      onLoad();
    }
  }, [isLoading, uri, onLoad]);

  if (error) {
    return placeholder || null;
  }

  return React.createElement(View, { style }, [
    uri && React.createElement(Image, {
      key: 'image',
      source: { uri },
      style,
      resizeMode
    }),
    isLoading && React.createElement(View, {
      key: 'loading',
      style: [style, { 
        position: 'absolute',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)'
      }]
    }, placeholder || React.createElement(ActivityIndicator, {
      size: 'small',
      color: '#2E38F8'
    }))
  ].filter(Boolean));
};

/**
 * Gestionnaire de préchargement intelligent
 */
export class MediaPreloader {
  private static preloadQueue: Map<string, Promise<void>> = new Map();

  /**
   * Précharger des images en arrière-plan
   */
  static async preloadImages(uris: string[], priority: 'low' | 'high' = 'low'): Promise<void> {
    const promises = uris.map(uri => this.preloadImage(uri, priority));
    
    if (priority === 'high') {
      await Promise.all(promises);
    } else {
      // Préchargement en arrière-plan pour faible priorité
      PerformanceUtils.runAfterInteractions(() => {
      });
    }
  }

  private static async preloadImage(uri: string, priority: 'low' | 'high'): Promise<void> {
    if (this.preloadQueue.has(uri)) {
      return this.preloadQueue.get(uri)!;
    }

    const preloadPromise = this.performPreload(uri, priority);
    this.preloadQueue.set(uri, preloadPromise);
    
    return preloadPromise;
  }

  private static async performPreload(uri: string, priority: 'low' | 'high'): Promise<void> {
    const { Image } = require('react-native');
    
    return new Promise((resolve, reject) => {
      Image.prefetch(uri)
        .then(() => {
          resolve();
          this.preloadQueue.delete(uri);
        })
        .catch((error: Error) => {
          resolve(); // Ne pas faire échouer le préchargement
          this.preloadQueue.delete(uri);
        });
    });
  }

  /**
   * Vider le cache de préchargement
   */
  static clearPreloadQueue(): void {
    this.preloadQueue.clear();
  }
}

