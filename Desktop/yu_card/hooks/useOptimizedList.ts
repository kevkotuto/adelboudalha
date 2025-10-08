import { PerformanceUtils } from '@/utils/performance';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface UseOptimizedListOptions<T> {
  data: T[];
  pageSize?: number;
  preloadThreshold?: number;
  enableVirtualization?: boolean;
  keyExtractor?: (item: T, index: number) => string;
}

interface UseOptimizedListReturn<T> {
  // Data management
  visibleData: T[];
  isLoading: boolean;
  hasMore: boolean;
  
  // Actions
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  scrollToItem: (index: number) => void;
  
  // Performance metrics
  totalItems: number;
  visibleItems: number;
  
  // Refs
  listRef: React.RefObject<any>;
}

/**
 * Hook personnalisé pour optimiser les listes grandes avec virtualisation intelligente
 */
export function useOptimizedList<T>({
  data,
  pageSize = 50,
  preloadThreshold = 0.8,
  enableVirtualization = true,
  keyExtractor = (_, index) => index.toString()
}: UseOptimizedListOptions<T>): UseOptimizedListReturn<T> {
  
  const [visibleData, setVisibleData] = useState<T[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const listRef = useRef<any>(null);
  const loadingRef = useRef(false);
  
  // Initialisation des données visibles
  useEffect(() => {
    const initialData = enableVirtualization 
      ? data.slice(0, Math.min(pageSize, data.length))
      : data;
      
    setVisibleData(initialData);
    setCurrentPage(0);
  }, [data, pageSize, enableVirtualization]);

  // Calculs memoized
  const totalItems = useMemo(() => data.length, [data]);
  const visibleItems = useMemo(() => visibleData.length, [visibleData]);
  const hasMore = useMemo(() => visibleItems < totalItems, [visibleItems, totalItems]);

  // Chargement paresseux optimisé
  const loadMore = useCallback(async () => {
    if (!enableVirtualization || loadingRef.current || !hasMore) {
      return;
    }

    loadingRef.current = true;
    setIsLoading(true);

    await PerformanceUtils.runAfterInteractions(async () => {
      const nextPage = currentPage + 1;
      const startIndex = nextPage * pageSize;
      const endIndex = Math.min(startIndex + pageSize, totalItems);
      
      if (startIndex < totalItems) {
        const newItems = data.slice(startIndex, endIndex);
        
        setVisibleData(prev => [...prev, ...newItems]);
        setCurrentPage(nextPage);
      }
    });

    setIsLoading(false);
    loadingRef.current = false;
  }, [currentPage, pageSize, totalItems, hasMore, data, enableVirtualization]);

  // Actualisation optimisée
  const refresh = useCallback(async () => {
    setIsRefreshing(true);
    
    await PerformanceUtils.runAfterInteractions(async () => {
      const refreshData = enableVirtualization 
        ? data.slice(0, Math.min(pageSize, data.length))
        : data;
        
      setVisibleData(refreshData);
      setCurrentPage(0);
    });
    
    setIsRefreshing(false);
  }, [data, pageSize, enableVirtualization]);

  // Navigation optimisée vers un élément
  const scrollToItem = useCallback((index: number) => {
    if (!listRef.current) return;

    const isItemVisible = index < visibleItems;
    
    if (!isItemVisible && enableVirtualization) {
      // Charger les données jusqu'à l'index voulu
      const targetPage = Math.floor(index / pageSize);
      const newEndIndex = Math.min((targetPage + 1) * pageSize, totalItems);
      const newData = data.slice(0, newEndIndex);
      
      setVisibleData(newData);
      setCurrentPage(targetPage);
    }

    // Scroll après le rendu
    PerformanceUtils.runAfterInteractions(() => {
      if (listRef.current?.scrollToIndex) {
        listRef.current.scrollToIndex({
          index: Math.min(index, visibleItems - 1),
          animated: true,
          viewPosition: 0.5
        });
      }
    });
  }, [visibleItems, pageSize, totalItems, data, enableVirtualization]);

  return {
    visibleData,
    isLoading,
    hasMore,
    loadMore,
    refresh,
    scrollToItem,
    totalItems,
    visibleItems,
    listRef,
  };
}

/**
 * Hook pour optimiser le rendu des messages avec lazy loading intelligent
 */
export function useOptimizedMessages<T extends { id: string | number }>(
  messages: T[],
  options: Partial<UseOptimizedListOptions<T>> = {}
) {
  const keyExtractor = useCallback(
    (item: T, index: number) => `${item.id}-${index}`,
    []
  );

  return useOptimizedList({
    data: messages,
    pageSize: 30,
    preloadThreshold: 0.7,
    enableVirtualization: messages.length > 100,
    keyExtractor,
    ...options,
  });
}

/**
 * Hook pour la performance des animations de messages
 */
export function useMessageAnimations() {
  const [visibleTextIndices, setVisibleTextIndices] = useState<Record<string, number>>({});
  const animatingRef = useRef<Record<string, boolean>>({});

  const startTextAnimation = useCallback((messageId: string, fullText: string) => {
    if (animatingRef.current[messageId]) return;

    animatingRef.current[messageId] = true;
    let currentIndex = 0;
    
    const animate = () => {
      if (currentIndex <= fullText.length) {
        setVisibleTextIndices(prev => ({
          ...prev,
          [messageId]: currentIndex
        }));
        currentIndex += 2; // 2 caractères par frame pour fluidité
        
        requestAnimationFrame(animate);
      } else {
        animatingRef.current[messageId] = false;
      }
    };

    requestAnimationFrame(animate);
  }, []);

  const stopTextAnimation = useCallback((messageId: string) => {
    animatingRef.current[messageId] = false;
  }, []);

  const resetAnimation = useCallback((messageId: string) => {
    animatingRef.current[messageId] = false;
    setVisibleTextIndices(prev => {
      const newIndices = { ...prev };
      delete newIndices[messageId];
      return newIndices;
    });
  }, []);

  return {
    visibleTextIndices,
    animatingRef,
    startTextAnimation,
    stopTextAnimation,
    resetAnimation,
  };
}

/**
 * Hook pour gérer la performance audio dans les messages
 */
export function useOptimizedAudio() {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const audioRef = useRef<any>(null);

  const playAudio = useCallback(async (audioUrl: string, messageId: string) => {
    if (playingAudio) {
      // Arrêter l'audio en cours
      audioRef.current?.stop();
    }

    setPlayingAudio(`${messageId}`);
    
    try {
      // Implementation audio optimisée
      // await AudioPlayer.play(audioUrl);
      
      // Simuler la fin de lecture
      setTimeout(() => {
        setPlayingAudio(null);
      }, 5000);
      
    } catch (error) {
      setPlayingAudio(null);
    }
  }, [playingAudio]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.stop();
    }
    setPlayingAudio(null);
  }, []);

  return {
    playingAudio,
    playAudio,
    stopAudio,
  };
}