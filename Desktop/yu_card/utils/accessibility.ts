import { AccessibilityRole } from 'react-native';

/**
 * Utilités pour l'accessibilité universelle
 * Fournit des helpers pour l'implémentation WCAG 2.1 AA/AAA
 */

export interface AccessibilityProps {
  accessible?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
    busy?: boolean;
    expanded?: boolean;
  };
  accessibilityValue?: {
    min?: number;
    max?: number;
    now?: number;
    text?: string;
  };
  accessibilityLiveRegion?: 'none' | 'polite' | 'assertive';
  importantForAccessibility?: 'auto' | 'yes' | 'no' | 'no-hide-descendants';
}

/**
 * Configuration d'accessibilité pour différents types d'éléments
 */
export class AccessibilityUtils {
  
  /**
   * Configuration pour boutons standard
   */
  static button(
    label: string,
    hint?: string,
    disabled?: boolean,
    selected?: boolean
  ): AccessibilityProps {
    return {
      accessible: true,
      accessibilityRole: 'button',
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityState: { disabled, selected },
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour boutons de toggle (switch, checkbox)
   */
  static toggle(
    label: string,
    checked: boolean,
    hint?: string,
    disabled?: boolean
  ): AccessibilityProps {
    return {
      accessible: true,
      accessibilityRole: 'switch',
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityState: { checked, disabled },
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour champs de texte
   */
  static textInput(
    label: string,
    value?: string,
    placeholder?: string,
    required?: boolean,
    error?: string
  ): AccessibilityProps {
    const hint = [
      placeholder && `Placeholder: ${placeholder}`,
      required && 'Champ requis',
      error && `Erreur: ${error}`
    ].filter(Boolean).join('. ');

    return {
      accessible: true,
      accessibilityRole: 'text',
      accessibilityLabel: label,
      accessibilityHint: hint || undefined,
      accessibilityValue: { text: value },
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour éléments de navigation
   */
  static navigationItem(
    label: string,
    selected?: boolean,
    hint?: string
  ): AccessibilityProps {
    return {
      accessible: true,
      accessibilityRole: 'tab',
      accessibilityLabel: label,
      accessibilityHint: hint,
      accessibilityState: { selected },
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour headers/titres
   */
  static header(label: string, level?: number): AccessibilityProps {
    return {
      accessible: true,
      accessibilityRole: 'header',
      accessibilityLabel: label,
      accessibilityHint: level ? `Titre de niveau ${level}` : undefined,
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour images avec description
   */
  static image(
    description: string,
    decorative?: boolean
  ): AccessibilityProps {
    if (decorative) {
      return {
        accessible: false,
        importantForAccessibility: 'no',
      };
    }

    return {
      accessible: true,
      accessibilityRole: 'image',
      accessibilityLabel: description,
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour listes et éléments de liste
   */
  static listItem(
    label: string,
    position?: { index: number, total: number },
    hint?: string
  ): AccessibilityProps {
    const positionHint = position ? 
      `Élément ${position.index + 1} sur ${position.total}` : '';
    
    const fullHint = [positionHint, hint].filter(Boolean).join('. ');

    return {
      accessible: true,
      accessibilityLabel: label,
      accessibilityHint: fullHint || undefined,
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour éléments de chargement
   */
  static loading(message: string = 'Chargement en cours'): AccessibilityProps {
    return {
      accessible: true,
      accessibilityLabel: message,
      accessibilityLiveRegion: 'polite',
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour messages d'erreur/succès
   */
  static alert(
    message: string,
    type: 'error' | 'success' | 'warning' | 'info' = 'info'
  ): AccessibilityProps {
    const roleMap = {
      error: 'alert',
      success: 'none',
      warning: 'alert', 
      info: 'none'
    } as const;

    return {
      accessible: true,
      accessibilityRole: roleMap[type],
      accessibilityLabel: `${type === 'error' ? 'Erreur' : type === 'success' ? 'Succès' : type === 'warning' ? 'Attention' : 'Information'}: ${message}`,
      accessibilityLiveRegion: type === 'error' ? 'assertive' : 'polite',
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Configuration pour éléments de progression
   */
  static progress(
    label: string,
    current: number,
    max: number,
    min: number = 0
  ): AccessibilityProps {
    const percentage = Math.round(((current - min) / (max - min)) * 100);
    
    return {
      accessible: true,
      accessibilityRole: 'progressbar',
      accessibilityLabel: label,
      accessibilityValue: { min, max, now: current, text: `${percentage}%` },
      accessibilityHint: `Progression: ${percentage} pourcent`,
      importantForAccessibility: 'yes',
    };
  }

  /**
   * Vérification de contraste des couleurs (WCAG AA: 4.5:1, AAA: 7:1)
   */
  static checkColorContrast(
    foreground: string,
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): boolean {
    const getLuminance = (color: string): number => {
      // Simplification - dans une vraie app, utiliser une lib comme chroma-js
      const r = parseInt(color.slice(1, 3), 16) / 255;
      const g = parseInt(color.slice(3, 5), 16) / 255;
      const b = parseInt(color.slice(5, 7), 16) / 255;
      
      const sRGB = [r, g, b].map(c => {
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
      });
      
      return 0.2126 * sRGB[0] + 0.7152 * sRGB[1] + 0.0722 * sRGB[2];
    };

    const lum1 = getLuminance(foreground);
    const lum2 = getLuminance(background);
    const ratio = (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
    
    return level === 'AAA' ? ratio >= 7 : ratio >= 4.5;
  }

  /**
   * Tailles minimales recommandées pour les zones tactiles
   */
  static getTouchTargetSize(size: 'small' | 'medium' | 'large' = 'medium') {
    const sizes = {
      small: { width: 36, height: 36 },   // Minimum absolu
      medium: { width: 44, height: 44 },  // Recommandé Apple/Google
      large: { width: 56, height: 56 },   // Optimal pour accessibilité
    };
    return sizes[size];
  }

  /**
   * Génère un ID unique pour les éléments liés (labelledBy, describedBy)
   */
  static generateId(prefix: string = 'accessibility'): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Configuration pour éléments avec état de chargement/busy
   */
  static busy(label: string, isBusy: boolean, hint?: string): AccessibilityProps {
    return {
      accessible: true,
      accessibilityLabel: isBusy ? `${label}, chargement` : label,
      accessibilityHint: hint,
      accessibilityState: { busy: isBusy },
      importantForAccessibility: 'yes',
    };
  }
}

/**
 * Hook pour les préférences d'accessibilité système
 */
export const useAccessibilityPreferences = () => {
  // Dans une vraie implémentation, utiliser des APIs système
  return {
    isScreenReaderEnabled: false, // AccessibilityInfo.isScreenReaderEnabled
    isHighContrastEnabled: false, // AccessibilityInfo.isHighContrastEnabled  
    prefersCrossFadeTransitions: false, // AccessibilityInfo.prefersCrossFadeTransitions
    isReduceMotionEnabled: false, // AccessibilityInfo.isReduceMotionEnabled
    fontSize: 'medium' as 'small' | 'medium' | 'large' | 'xlarge',
  };
};

/**
 * Constantes pour l'accessibilité
 */
export const AccessibilityConstants = {
  // Délais recommandés
  TOAST_DURATION: 5000,
  ANNOUNCEMENT_DELAY: 100,
  
  // Tailles de police dynamiques
  FONT_SCALES: {
    small: 0.9,
    medium: 1.0,
    large: 1.2,
    xlarge: 1.4,
  },
  
  // Couleurs haute accessibilité  
  HIGH_CONTRAST_COLORS: {
    text: '#000000',
    background: '#FFFFFF',
    primary: '#0000FF',
    danger: '#FF0000',
    success: '#008000',
  },
} as const;