import { 
  withSpring, 
  withTiming, 
  withSequence, 
  withDelay,
  withRepeat,
  runOnJS,
  useSharedValue,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  SharedValue,
  AnimationCallback
} from 'react-native-reanimated';
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

/**
 * Système d'animations fluides optimisées pour 120fps
 * Utilise react-native-reanimated v3 avec les meilleures pratiques
 */

// Configuration des animations par défaut
export const AnimationConfig = {
  // Durées optimisées pour différents contextes
  durations: {
    fast: 200,
    normal: 300,
    slow: 500,
    typing: 50, // Pour animation de frappe
  },
  
  // Configurations Spring optimisées
  spring: {
    default: {
      damping: 20,
      stiffness: 90,
      mass: 1,
      overshootClamping: false,
      restDisplacementThreshold: 0.001,
      restSpeedThreshold: 0.001,
    },
    gentle: {
      damping: 25,
      stiffness: 120,
      mass: 1,
    },
    bouncy: {
      damping: 12,
      stiffness: 100,
      mass: 1,
    },
    snappy: {
      damping: 30,
      stiffness: 200,
      mass: 0.8,
    },
  },
  
  // Courbes de timing
  easing: {
    // Utilise les courbes natives pour de meilleures performances
    default: 'ease-out',
    gentle: 'ease-in-out', 
    sharp: 'ease-in',
  }
} as const;

/**
 * Animations prédéfinies pour les composants courants
 */
export class Animations {
  
  /**
   * Animation d'entrée pour les messages
   */
  static messageEntry(
    translateY: SharedValue<number>,
    opacity: SharedValue<number>,
    delay: number = 0
  ) {
    return {
      translateY: withDelay(
        delay,
        withSpring(0, AnimationConfig.spring.gentle)
      ),
      opacity: withDelay(
        delay,
        withTiming(1, { duration: AnimationConfig.durations.normal })
      ),
    };
  }

  /**
   * Animation de sortie pour les messages
   */
  static messageExit(
    translateX: SharedValue<number>,
    opacity: SharedValue<number>,
    callback?: AnimationCallback
  ) {
    return {
      translateX: withTiming(SCREEN_WIDTH, { 
        duration: AnimationConfig.durations.fast 
      }),
      opacity: withTiming(0, { 
        duration: AnimationConfig.durations.fast 
      }, callback),
    };
  }

  /**
   * Animation de frappe de texte
   */
  static typingText(
    progress: SharedValue<number>,
    textLength: number,
    callback?: () => void
  ) {
    progress.value = withTiming(
      textLength,
      { 
        duration: textLength * AnimationConfig.durations.typing 
      },
      callback ? runOnJS(callback) : undefined
    );
  }

  /**
   * Animation de chargement avec points
   */
  static loadingDots(
    scale1: SharedValue<number>,
    scale2: SharedValue<number>,
    scale3: SharedValue<number>
  ) {
    const scaleAnimation = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 400 }),
        withTiming(1, { duration: 400 })
      ),
      -1,
      false
    );

    scale1.value = scaleAnimation;
    scale2.value = withDelay(200, scaleAnimation);
    scale3.value = withDelay(400, scaleAnimation);
  }

  /**
   * Animation de bouton pressé
   */
  static buttonPress(scale: SharedValue<number>) {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, AnimationConfig.spring.snappy)
    );
  }

  /**
   * Animation de modal/bottom sheet
   */
  static modalSlide(
    translateY: SharedValue<number>,
    entering: boolean = true
  ) {
    if (entering) {
      translateY.value = withSpring(0, AnimationConfig.spring.default);
    } else {
      translateY.value = withTiming(SCREEN_HEIGHT, {
        duration: AnimationConfig.durations.fast
      });
    }
  }

  /**
   * Animation de swipe pour révéler actions
   */
  static swipeReveal(
    translateX: SharedValue<number>,
    revealed: boolean,
    maxTranslate: number = 80
  ) {
    translateX.value = withSpring(
      revealed ? -maxTranslate : 0,
      AnimationConfig.spring.gentle
    );
  }

  /**
   * Animation de highlight pour messages
   */
  static highlight(
    backgroundColor: SharedValue<string>,
    highlighted: boolean
  ) {
    backgroundColor.value = withSequence(
      withTiming(highlighted ? 'rgba(46, 56, 248, 0.1)' : 'transparent', {
        duration: AnimationConfig.durations.fast
      }),
      withDelay(
        2000,
        withTiming('transparent', {
          duration: AnimationConfig.durations.normal
        })
      )
    );
  }

  /**
   * Animation d'accordéon/collapse
   */
  static expand(
    height: SharedValue<number>,
    expanded: boolean,
    maxHeight: number = 200
  ) {
    height.value = withSpring(
      expanded ? maxHeight : 0,
      AnimationConfig.spring.default
    );
  }

  /**
   * Animation de tabs/navigation
   */
  static tabTransition(
    translateX: SharedValue<number>,
    activeIndex: number,
    tabWidth: number
  ) {
    translateX.value = withSpring(
      activeIndex * tabWidth,
      AnimationConfig.spring.snappy
    );
  }

  /**
   * Animation de pull-to-refresh
   */
  static pullToRefresh(
    translateY: SharedValue<number>,
    rotation: SharedValue<number>,
    pullDistance: number,
    refreshing: boolean
  ) {
    if (refreshing) {
      translateY.value = withSpring(60, AnimationConfig.spring.default);
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else {
      translateY.value = withSpring(0, AnimationConfig.spring.default);
      rotation.value = withTiming(0, { duration: 300 });
    }
  }

  /**
   * Animation de progress bar
   */
  static progressBar(
    width: SharedValue<number>,
    progress: number, // 0-1
    maxWidth: number
  ) {
    width.value = withSpring(
      progress * maxWidth,
      AnimationConfig.spring.gentle
    );
  }
}

/**
 * Hooks personnalisés pour les animations courantes
 */

/**
 * Hook pour animation de message entrant
 */
export function useMessageAnimation() {
  const translateY = useSharedValue(30);
  const opacity = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const startAnimation = (delay: number = 0) => {
    Animations.messageEntry(translateY, opacity, delay);
  };

  return { animatedStyle, startAnimation };
}

/**
 * Hook pour animation de frappe de texte
 */
export function useTypingAnimation(text: string) {
  const progress = useSharedValue(0);
  
  const animatedText = useAnimatedStyle(() => {
    const currentLength = Math.floor(progress.value);
    return {
      // Ce style sera appliqué au wrapper du texte
      opacity: progress.value > 0 ? 1 : 0,
    };
  });

  const startTyping = (callback?: () => void) => {
    progress.value = 0;
    Animations.typingText(progress, text.length, callback);
  };

  // Fonction pour obtenir le texte visible
  const getVisibleText = () => {
    'worklet';
    return text.substring(0, Math.floor(progress.value));
  };

  return { animatedText, startTyping, progress, getVisibleText };
}

/**
 * Hook pour animation de bouton
 */
export function useButtonAnimation() {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPress = () => {
    Animations.buttonPress(scale);
  };

  return { animatedStyle, onPress };
}

/**
 * Hook pour animation de swipe
 */
export function useSwipeAnimation(maxTranslate: number = 80) {
  const translateX = useSharedValue(0);
  const revealed = useSharedValue(false);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const reveal = () => {
    revealed.value = true;
    Animations.swipeReveal(translateX, true, maxTranslate);
  };

  const hide = () => {
    revealed.value = false;
    Animations.swipeReveal(translateX, false, maxTranslate);
  };

  const toggle = () => {
    revealed.value ? hide() : reveal();
  };

  return { animatedStyle, reveal, hide, toggle, revealed };
}

/**
 * Hook pour animation de modal
 */
export function useModalAnimation() {
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const opacity = useSharedValue(0);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const show = () => {
    opacity.value = withTiming(1, { duration: 200 });
    Animations.modalSlide(translateY, true);
  };

  const hide = (callback?: () => void) => {
    opacity.value = withTiming(0, { duration: 200 });
    Animations.modalSlide(translateY, false);
    if (callback) {
      // Délai pour laisser l'animation se terminer
      setTimeout(callback, AnimationConfig.durations.fast);
    }
  };

  return { animatedStyle, show, hide };
}

/**
 * Hook pour animation de loading dots
 */
export function useLoadingDotsAnimation() {
  const scale1 = useSharedValue(1);
  const scale2 = useSharedValue(1);
  const scale3 = useSharedValue(1);
  
  const dot1Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale1.value }],
  }));
  
  const dot2Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale2.value }],
  }));
  
  const dot3Style = useAnimatedStyle(() => ({
    transform: [{ scale: scale3.value }],
  }));

  const start = () => {
    Animations.loadingDots(scale1, scale2, scale3);
  };

  const stop = () => {
    scale1.value = withTiming(1, { duration: 200 });
    scale2.value = withTiming(1, { duration: 200 });
    scale3.value = withTiming(1, { duration: 200 });
  };

  return { dot1Style, dot2Style, dot3Style, start, stop };
}

/**
 * Utilitaires pour optimisation des performances
 */
export const AnimationUtils = {
  /**
   * Vérifier si les animations doivent être réduites (préférence système)
   */
  shouldReduceMotion(): boolean {
    // Dans une vraie implémentation, utiliser AccessibilityInfo.isReduceMotionEnabled
    return false;
  },

  /**
   * Adapter les durées selon les préférences
   */
  adaptDuration(duration: number): number {
    return this.shouldReduceMotion() ? Math.min(duration, 100) : duration;
  },

  /**
   * Configuration conditionnelle selon la plateforme
   */
  getPlatformConfig() {
    return Platform.select({
      ios: { useNativeDriver: true },
      android: { useNativeDriver: true },
      default: { useNativeDriver: false }
    });
  },
};