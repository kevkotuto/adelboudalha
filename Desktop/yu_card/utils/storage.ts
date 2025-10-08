import AsyncStorage from '@react-native-async-storage/async-storage';

class Storage {
  async set(key: string, value: any): Promise<void> {
    try {
      // Protection spéciale pour auth_token qui doit toujours être une string
      if (key === 'auth_token' && typeof value !== 'string') {
        value = typeof value === 'object' ? JSON.stringify(value) : String(value);
      }
      
      const serializedValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, serializedValue);
    } catch (error) {
    }
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) {
        return null;
      }
      return JSON.parse(value) as T;
    } catch (error) {
      return null;
    }
  }

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      return [];
    }
  }

  async contains(key: string): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  async setString(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
    }
  }

  async getString(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  async setNumber(key: string, value: number): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
    }
  }

  async getNumber(key: string): Promise<number | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null ? parseFloat(value) : null;
    } catch (error) {
      return null;
    }
  }

  async setBoolean(key: string, value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
    }
  }

  async getBoolean(key: string): Promise<boolean | null> {
    try {
      const value = await AsyncStorage.getItem(key);
      return value !== null ? value === 'true' : null;
    } catch (error) {
      return null;
    }
  }

  // Sync versions for compatibility (use sparingly)
  setSync(key: string, value: any): void {
    AsyncStorage.setItem(key, JSON.stringify(value)).catch(() => {});
  }

  getSync<T>(key: string): T | null {
    return null;
  }

  // Méthode pour nettoyer les données corrompues
  async cleanupCorruptedData(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      
      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        
        // Vérifier si auth_token contient un objet au lieu d'une string
        if (key === 'auth_token' && value) {
          try {
            const parsed = JSON.parse(value);
            // Si c'est un objet et pas une simple string, le nettoyer
            if (typeof parsed === 'object' && parsed !== null) {
              await AsyncStorage.removeItem(key);
            }
          } catch (error) {
            // Si on ne peut pas parser, c'est probablement OK (string simple)
          }
        }
      }
      
    } catch (error) {
    }
  }
}

export const storage = new Storage();