import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useStoreHydration = () => {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Wait for the store to be hydrated from AsyncStorage
    const unsubFinishHydration = useAuthStore.persist.onFinishHydration(() => {
      console.log('Store hydrated successfully');
      setIsHydrated(true);
    });

    // Check if store is already hydrated
    if (useAuthStore.persist.hasHydrated()) {
      console.log('Store already hydrated');
      setIsHydrated(true);
    }

    return unsubFinishHydration;
  }, []);

  return isHydrated;
};