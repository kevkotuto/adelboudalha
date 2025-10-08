import AsyncStorage from '@react-native-async-storage/async-storage';

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiryTime: number;
  version: string;
}

interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  version?: string;
  serialize?: boolean;
  maxSize?: number; // Maximum cache size in MB
}

/**
 * Système de cache intelligent avec expiration, versioning et nettoyage automatique
 */
export class SmartCache {
  private static readonly DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes
  private static readonly MAX_CACHE_SIZE = 50 * 1024 * 1024; // 50MB
  private static readonly CACHE_PREFIX = '@akili_cache_';
  private static readonly METADATA_KEY = '@akili_cache_metadata';

  /**
   * Sauvegarder des données en cache avec options
   */
  static async set<T>(
    key: string,
    data: T,
    options: CacheOptions = {}
  ): Promise<void> {
    const {
      ttl = this.DEFAULT_TTL,
      version = '1.0',
      serialize = true,
      maxSize = this.MAX_CACHE_SIZE
    } = options;

    try {
      const now = Date.now();
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: now,
        expiryTime: now + ttl,
        version
      };

      const serializedData = serialize 
        ? JSON.stringify(cacheItem)
        : cacheItem as any;

      const cacheKey = this.CACHE_PREFIX + key;
      
      // Vérifier la taille avant de sauvegarder
      const dataSize = new Blob([serializedData]).size;
      if (dataSize > maxSize) {
        return;
      }

      await AsyncStorage.setItem(cacheKey, serializedData);
      
      // Mettre à jour les métadonnées
      await this.updateMetadata(key, dataSize, now + ttl);
      
      // Nettoyage automatique si nécessaire
      await this.cleanupIfNeeded();

    } catch (error) {
    }
  }

  /**
   * Récupérer des données du cache
   */
  static async get<T>(
    key: string,
    options: { version?: string } = {}
  ): Promise<T | null> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      const cachedData = await AsyncStorage.getItem(cacheKey);
      
      if (!cachedData) {
        return null;
      }

      const cacheItem: CacheItem<T> = JSON.parse(cachedData);
      const now = Date.now();

      // Vérifier l'expiration
      if (now > cacheItem.expiryTime) {
        await this.remove(key);
        return null;
      }

      // Vérifier la version si spécifiée
      if (options.version && cacheItem.version !== options.version) {
        await this.remove(key);
        return null;
      }

      return cacheItem.data;

    } catch (error) {
      return null;
    }
  }

  /**
   * Récupérer ou générer des données (pattern cache-aside)
   */
  static async getOrSet<T>(
    key: string,
    generator: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    // Essayer de récupérer du cache
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    // Générer les nouvelles données
    const data = await generator();
    
    // Mettre en cache
    await this.set(key, data, options);
    
    return data;
  }

  /**
   * Supprimer un élément du cache
   */
  static async remove(key: string): Promise<void> {
    try {
      const cacheKey = this.CACHE_PREFIX + key;
      await AsyncStorage.removeItem(cacheKey);
      await this.removeFromMetadata(key);
    } catch (error) {
    }
  }

  /**
   * Vérifier si une clé existe et est valide
   */
  static async has(key: string, options: { version?: string } = {}): Promise<boolean> {
    const data = await this.get(key, options);
    return data !== null;
  }

  /**
   * Nettoyer le cache (éléments expirés)
   */
  static async cleanup(): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      const now = Date.now();
      const expiredKeys: string[] = [];

      for (const [key, item] of Object.entries(metadata.items)) {
        if (now > item.expiryTime) {
          expiredKeys.push(key);
        }
      }

      // Supprimer les éléments expirés
      for (const key of expiredKeys) {
        await this.remove(key);
      }

    } catch (error) {
    }
  }

  /**
   * Vider tout le cache
   */
  static async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      await AsyncStorage.multiRemove(cacheKeys);
      await AsyncStorage.removeItem(this.METADATA_KEY);
      
    } catch (error) {
    }
  }

  /**
   * Obtenir des statistiques du cache
   */
  static async getStats(): Promise<{
    totalItems: number;
    totalSize: number;
    validItems: number;
    expiredItems: number;
  }> {
    try {
      const metadata = await this.getMetadata();
      const now = Date.now();
      
      let validItems = 0;
      let expiredItems = 0;
      
      for (const item of Object.values(metadata.items)) {
        if (now > item.expiryTime) {
          expiredItems++;
        } else {
          validItems++;
        }
      }

      return {
        totalItems: metadata.totalItems,
        totalSize: metadata.totalSize,
        validItems,
        expiredItems
      };
    } catch (error) {
      return { totalItems: 0, totalSize: 0, validItems: 0, expiredItems: 0 };
    }
  }

  /**
   * Gestion des métadonnées privées
   */
  private static async getMetadata(): Promise<{
    totalItems: number;
    totalSize: number;
    items: Record<string, { size: number; expiryTime: number }>;
  }> {
    try {
      const metadata = await AsyncStorage.getItem(this.METADATA_KEY);
      return metadata ? JSON.parse(metadata) : { 
        totalItems: 0, 
        totalSize: 0, 
        items: {} 
      };
    } catch {
      return { totalItems: 0, totalSize: 0, items: {} };
    }
  }

  private static async updateMetadata(
    key: string, 
    size: number, 
    expiryTime: number
  ): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      
      const wasNew = !metadata.items[key];
      metadata.items[key] = { size, expiryTime };
      
      if (wasNew) {
        metadata.totalItems++;
      }
      metadata.totalSize += size;

      await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
    }
  }

  private static async removeFromMetadata(key: string): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      
      if (metadata.items[key]) {
        metadata.totalSize -= metadata.items[key].size;
        metadata.totalItems--;
        delete metadata.items[key];
        
        await AsyncStorage.setItem(this.METADATA_KEY, JSON.stringify(metadata));
      }
    } catch (error) {
    }
  }

  private static async cleanupIfNeeded(): Promise<void> {
    const stats = await this.getStats();
    
    // Nettoyer si plus de 10MB ou plus de 1000 éléments
    if (stats.totalSize > 10 * 1024 * 1024 || stats.totalItems > 1000) {
      await this.cleanup();
    }
  }
}

/**
 * Cache spécialisé pour les conversations
 */
export class ConversationCache extends SmartCache {
  private static readonly CONVERSATION_PREFIX = 'conversation_';
  private static readonly MESSAGE_PREFIX = 'messages_';
  private static readonly MEDIA_PREFIX = 'media_';

  static async cacheConversation(conversationId: string, data: any): Promise<void> {
    await this.set(`${this.CONVERSATION_PREFIX}${conversationId}`, data, {
      ttl: 60 * 60 * 1000, // 1 heure
      version: '2.0'
    });
  }

  static async getCachedConversation(conversationId: string): Promise<any> {
    return this.get(`${this.CONVERSATION_PREFIX}${conversationId}`, {
      version: '2.0'
    });
  }

  static async cacheMessages(conversationId: string, messages: any[]): Promise<void> {
    await this.set(`${this.MESSAGE_PREFIX}${conversationId}`, messages, {
      ttl: 30 * 60 * 1000, // 30 minutes
      version: '2.0'
    });
  }

  static async getCachedMessages(conversationId: string): Promise<any[] | null> {
    return this.get(`${this.MESSAGE_PREFIX}${conversationId}`, {
      version: '2.0'
    });
  }

  static async cacheMedia(mediaUrl: string, data: any): Promise<void> {
    await this.set(`${this.MEDIA_PREFIX}${btoa(mediaUrl)}`, data, {
      ttl: 24 * 60 * 60 * 1000, // 24 heures
      version: '1.0'
    });
  }
}

/**
 * Cache pour les images avec compression progressive
 */
export class MediaCache extends SmartCache {
  static async cacheImage(
    url: string, 
    imageData: string, 
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<void> {
    const ttlMap = {
      low: 60 * 60 * 1000,      // 1 heure
      medium: 6 * 60 * 60 * 1000, // 6 heures  
      high: 24 * 60 * 60 * 1000   // 24 heures
    };

    await this.set(`image_${btoa(url)}_${quality}`, imageData, {
      ttl: ttlMap[quality],
      version: '1.0'
    });
  }

  static async getCachedImage(
    url: string, 
    quality: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<string | null> {
    return this.get(`image_${btoa(url)}_${quality}`, { version: '1.0' });
  }
}