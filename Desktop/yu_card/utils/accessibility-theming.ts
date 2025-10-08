import { useSettingsStore } from '@/stores/settingsStore';
import React from 'react';
import { Dimensions } from 'react-native';

/**
 * Système de thématisation accessible avec support contraste élevé et Dynamic Type
 */

export interface AccessibilityTheme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontSize: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
    lineHeight: {
      small: number;
      medium: number;
      large: number;
      xlarge: number;
    };
    fontWeight: {
      regular: string;
      medium: string;
      bold: string;
    };
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    small: number;
    medium: number;
    large: number;
  };
}

/**
 * Thèmes prédéfinis optimisés pour l'accessibilité
 */
export const AccessibilityThemes = {
  // Thème standard (WCAG AA)
  standard: {
    colors: {
      primary: '#2E38F8',
      secondary: '#050C91', 
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#212529',
      textSecondary: '#6C757D',
      border: '#DEE2E6',
      error: '#DC3545',
      warning: '#FFC107',
      success: '#28A745',
      info: '#17A2B8',
    },
    typography: {
      fontSize: {
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 24,
      },
      lineHeight: {
        small: 16,
        medium: 22,
        large: 28,
        xlarge: 32,
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        bold: '700',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
    },
  } as AccessibilityTheme,

  // Thème contraste élevé (WCAG AAA)
  highContrast: {
    colors: {
      primary: '#0000FF', // Bleu pur pour contraste maximum
      secondary: '#000080',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#000000',
      textSecondary: '#333333',
      border: '#000000',
      error: '#CC0000',
      warning: '#FF8C00',
      success: '#008000',
      info: '#0066CC',
    },
    typography: {
      fontSize: {
        small: 14,
        medium: 18,
        large: 22,
        xlarge: 28,
      },
      lineHeight: {
        small: 20,
        medium: 26,
        large: 32,
        xlarge: 38,
      },
      fontWeight: {
        regular: '500', // Plus épais pour meilleure lisibilité
        medium: '600',
        bold: '700',
      },
    },
    spacing: {
      xs: 6,
      sm: 12,
      md: 20,
      lg: 28,
      xl: 36,
    },
    borderRadius: {
      small: 2,
      medium: 4,
      large: 6,
    },
  } as AccessibilityTheme,

  // Thème sombre accessible
  darkAccessible: {
    colors: {
      primary: '#4D7FFF', // Bleu plus clair pour contraste sur fond sombre
      secondary: '#6B7FFF',
      background: '#121212',
      surface: '#1E1E1E',
      text: '#FFFFFF',
      textSecondary: '#B3B3B3',
      border: '#3C3C3C',
      error: '#FF5252',
      warning: '#FFB74D',
      success: '#4CAF50',
      info: '#29B6F6',
    },
    typography: {
      fontSize: {
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 24,
      },
      lineHeight: {
        small: 18,
        medium: 24,
        large: 30,
        xlarge: 36,
      },
      fontWeight: {
        regular: '400',
        medium: '500',
        bold: '700',
      },
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 16,
      lg: 24,
      xl: 32,
    },
    borderRadius: {
      small: 4,
      medium: 8,
      large: 12,
    },
  } as AccessibilityTheme,
};

/**
 * Gestionnaire de thème accessible avec Dynamic Type
 */
export class AccessibilityThemeManager {
  private static instance: AccessibilityThemeManager;
  private currentTheme: AccessibilityTheme = AccessibilityThemes.standard;
  private dynamicTypeScale: number = 1.0;
  private highContrastEnabled: boolean = false;

  static getInstance(): AccessibilityThemeManager {
    if (!AccessibilityThemeManager.instance) {
      AccessibilityThemeManager.instance = new AccessibilityThemeManager();
    }
    return AccessibilityThemeManager.instance;
  }

  /**
   * Définir le thème actuel
   */
  setTheme(theme: AccessibilityTheme): void {
    this.currentTheme = theme;
  }

  /**
   * Basculer vers le thème contraste élevé
   */
  setHighContrast(enabled: boolean): void {
    this.highContrastEnabled = enabled;
    this.currentTheme = enabled 
      ? AccessibilityThemes.highContrast 
      : AccessibilityThemes.standard;
  }

  /**
   * Définir l'échelle Dynamic Type
   */
  setDynamicTypeScale(scale: number): void {
    // Échelles supportées par iOS : 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4
    this.dynamicTypeScale = Math.max(0.8, Math.min(1.4, scale));
  }

  /**
   * Obtenir le thème actuel avec Dynamic Type appliqué
   */
  getCurrentTheme(): AccessibilityTheme {
    const theme = { ...this.currentTheme };
    
    // Appliquer l'échelle Dynamic Type à la typographie
    theme.typography = {
      ...theme.typography,
      fontSize: {
        small: Math.round(theme.typography.fontSize.small * this.dynamicTypeScale),
        medium: Math.round(theme.typography.fontSize.medium * this.dynamicTypeScale),
        large: Math.round(theme.typography.fontSize.large * this.dynamicTypeScale),
        xlarge: Math.round(theme.typography.fontSize.xlarge * this.dynamicTypeScale),
      },
      lineHeight: {
        small: Math.round(theme.typography.lineHeight.small * this.dynamicTypeScale),
        medium: Math.round(theme.typography.lineHeight.medium * this.dynamicTypeScale),
        large: Math.round(theme.typography.lineHeight.large * this.dynamicTypeScale),
        xlarge: Math.round(theme.typography.lineHeight.xlarge * this.dynamicTypeScale),
      },
    };

    // Adapter l'espacement si nécessaire pour les grandes tailles
    if (this.dynamicTypeScale > 1.2) {
      theme.spacing = {
        xs: Math.round(theme.spacing.xs * 1.2),
        sm: Math.round(theme.spacing.sm * 1.2),
        md: Math.round(theme.spacing.md * 1.2),
        lg: Math.round(theme.spacing.lg * 1.2),
        xl: Math.round(theme.spacing.xl * 1.2),
      };
    }

    return theme;
  }

  /**
   * Vérifier le contraste entre deux couleurs
   */
  checkContrast(foreground: string, background: string): number {
    // Implémentation simplifiée - dans une vraie app, utiliser une lib complète
    const getLuminance = (color: string): number => {
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
    return (Math.max(lum1, lum2) + 0.05) / (Math.min(lum1, lum2) + 0.05);
  }

  /**
   * Obtenir une couleur avec contraste suffisant
   */
  getAccessibleColor(
    baseColor: string,
    backgroundColor: string,
    minContrast: number = 4.5
  ): string {
    const contrast = this.checkContrast(baseColor, backgroundColor);
    
    if (contrast >= minContrast) {
      return baseColor;
    }

    // Si contraste insuffisant, utiliser une couleur du thème contraste élevé
    return this.highContrastEnabled 
      ? AccessibilityThemes.highContrast.colors.text
      : baseColor;
  }
}

/**
 * Hook pour utiliser le thème accessible
 */
export function useAccessibilityTheme() {
  const themeManager = AccessibilityThemeManager.getInstance();
  const theme = themeManager.getCurrentTheme();
  const { settings } = useSettingsStore();

  // Configuration automatique basée sur les préférences système
  // Dans une vraie implémentation, écouter AccessibilityInfo
  const isHighContrastEnabled = false; // AccessibilityInfo.isHighContrastEnabled
  const prefersReducedTransparency = false; // AccessibilityInfo.prefersReducedTransparency

  return {
    theme,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
    isHighContrast: isHighContrastEnabled,
    prefersReducedTransparency,
    
    // Méthodes utilitaires
    getTextStyle: (size: keyof typeof theme.typography.fontSize, weight?: keyof typeof theme.typography.fontWeight) => ({
      fontSize: theme.typography.fontSize[size],
      lineHeight: theme.typography.lineHeight[size],
      fontWeight: theme.typography.fontWeight[weight || 'regular'],
      color: theme.colors.text,
    }),
    
    getSurfaceStyle: (elevated: boolean = false) => ({
      backgroundColor: elevated ? theme.colors.surface : theme.colors.background,
      borderColor: theme.colors.border,
    }),
    
    getInteractiveStyle: (pressed: boolean = false) => ({
      backgroundColor: pressed 
        ? `${theme.colors.primary}15` 
        : theme.colors.primary,
      borderColor: theme.colors.primary,
    }),
  };
}

/**
 * Composant wrapper pour texte accessible
 */
export interface AccessibleTextProps {
  children: React.ReactNode;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  weight?: 'regular' | 'medium' | 'bold';
  color?: 'primary' | 'secondary' | 'text' | 'textSecondary' | 'error' | 'warning' | 'success' | 'info';
  style?: any;
  numberOfLines?: number;
}

export const AccessibleText: React.FC<AccessibleTextProps> = ({
  children,
  size = 'medium',
  weight = 'regular',
  color = 'text',
  style,
  numberOfLines,
}) => {
  const { theme, getTextStyle } = useAccessibilityTheme();
  const { Text } = require('react-native');
  
  const textStyle = {
    ...getTextStyle(size, weight),
    color: theme.colors[color as keyof typeof theme.colors],
    ...style,
  };

  return React.createElement(Text, { 
    style: textStyle, 
    numberOfLines 
  }, children);
};

/**
 * Utilitaires pour responsive design accessible
 */
export const ResponsiveUtils = {
  /**
   * Obtenir des breakpoints adaptatifs
   */
  getBreakpoints() {
    const { width } = Dimensions.get('window');
    return {
      isSmall: width < 400,
      isMedium: width >= 400 && width < 768,
      isLarge: width >= 768,
      width,
    };
  },

  /**
   * Adapter les tailles selon l'écran et l'accessibilité
   */
  adaptSize(baseSize: number, options: {
    dynamicType?: boolean;
    responsive?: boolean;
  } = {}): number {
    let size = baseSize;

    if (options.responsive) {
      const { isSmall } = this.getBreakpoints();
      if (isSmall) {
        size *= 0.9; // Réduire sur petits écrans
      }
    }

    if (options.dynamicType) {
      const themeManager = AccessibilityThemeManager.getInstance();
      // Applique l'échelle Dynamic Type
      size *= (themeManager as any).dynamicTypeScale || 1.0;
    }

    return Math.round(size);
  },
};