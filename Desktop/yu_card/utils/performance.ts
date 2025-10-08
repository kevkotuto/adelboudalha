import { InteractionManager, Platform } from 'react-native';

/**
 * Performance utilities optimized for Expo SDK 53 and React Native New Architecture
 */
export class PerformanceUtils {
  
  /**
   * Run a task after interactions are complete to avoid blocking UI
   * Optimized for New Architecture's concurrent features
   */
  static runAfterInteractions<T>(task: () => Promise<T> | T): Promise<T> {
    return new Promise((resolve, reject) => {
      InteractionManager.runAfterInteractions(async () => {
        try {
          const result = await task();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  /**
   * Debounce function calls to improve performance
   * Particularly useful for search and API calls
   */
  static debounce<T extends (...args: any[]) => void>(
    func: T,
    delay: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: any;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }

  /**
   * Throttle function calls to limit execution frequency
   */
  static throttle<T extends (...args: any[]) => void>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Batch multiple operations to reduce re-renders
   * Leverages React's batching improvements in concurrent mode
   */
  static batchUpdates<T>(operations: Array<() => T>): T[] {
    const results: T[] = [];
    
    // In React 18+ with concurrent features, this is handled automatically
    // but we can still manually batch for older versions
    if (Platform.OS === 'web' && 'unstable_batchedUpdates' in require('react-dom')) {
      const { unstable_batchedUpdates } = require('react-dom');
      unstable_batchedUpdates(() => {
        operations.forEach(operation => {
          results.push(operation());
        });
      });
    } else {
      operations.forEach(operation => {
        results.push(operation());
      });
    }
    
    return results;
  }

  /**
   * Lazy load data with proper error handling
   * Optimized for New Architecture's startup performance
   */
  static async lazyLoad<T>(
    loader: () => Promise<T>,
    fallback?: T,
    retries: number = 3
  ): Promise<T> {
    let attempt = 0;
    
    while (attempt < retries) {
      try {
        return await this.runAfterInteractions(loader);
      } catch (error) {
        attempt++;
        
        if (attempt >= retries) {
          if (fallback !== undefined) {
            return fallback;
          }
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    
    throw new Error('Lazy load failed');
  }

  /**
   * Memory-efficient image loading for better performance
   */
  static getOptimizedImageUri(
    uri: string,
    width?: number,
    height?: number,
    quality: number = 80
  ): string {
    if (!uri || uri.startsWith('data:') || uri.startsWith('file:')) {
      return uri;
    }

    // For remote images, add optimization parameters
    const params = new URLSearchParams();
    if (width) params.append('w', width.toString());
    if (height) params.append('h', height.toString());
    params.append('q', quality.toString());
    params.append('f', 'webp'); // Use WebP for better compression

    const separator = uri.includes('?') ? '&' : '?';
    return `${uri}${separator}${params.toString()}`;
  }

  /**
   * Check if device has sufficient resources for heavy operations
   */
  static canPerformHeavyOperation(): boolean {
    // Basic heuristics for device capability
    const isLowEndDevice = Platform.OS === 'android' && parseInt(String(Platform.constants.Release)) < 8;
    const hasLimitedMemory = Platform.OS === 'ios' && Platform.isPad === false;
    
    return !isLowEndDevice && !hasLimitedMemory;
  }

  /**
   * Queue management for API calls to prevent overwhelming the server
   */
  static createApiQueue(concurrency: number = 3) {
    let running = 0;
    const queue: Array<() => Promise<any>> = [];

    const processQueue = async () => {
      if (running >= concurrency || queue.length === 0) {
        return;
      }

      running++;
      const task = queue.shift()!;
      
      try {
        await task();
      } catch (error) {
      } finally {
        running--;
        processQueue();
      }
    };

    return {
      add: <T>(apiCall: () => Promise<T>): Promise<T> => {
        return new Promise((resolve, reject) => {
          queue.push(async () => {
            try {
              const result = await apiCall();
              resolve(result);
            } catch (error) {
              reject(error);
            }
          });
          processQueue();
        });
      },
      
      size: () => queue.length,
      clear: () => {
        queue.length = 0;
      }
    };
  }
}

/**
 * Global API queue instance
 */
export const apiQueue = PerformanceUtils.createApiQueue(3);

/**
 * Hook-like utilities for React components
 */
export const usePerformanceOptimization = () => {
  return {
    runAfterInteractions: PerformanceUtils.runAfterInteractions,
    debounce: PerformanceUtils.debounce,
    throttle: PerformanceUtils.throttle,
    lazyLoad: PerformanceUtils.lazyLoad,
  };
};