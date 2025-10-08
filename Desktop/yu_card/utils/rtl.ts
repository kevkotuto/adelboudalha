import { useSettingsStore } from '@/stores/settingsStore';
import React from 'react';
import { I18nManager, Platform } from 'react-native';

/**
 * Utilitaires pour le support RTL (Right-to-Left) complet
 * Optimisé pour l'arabe avec gestion des transitions fluides
 */

export interface RTLLayoutProps {
  flexDirection?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  textAlign?: 'left' | 'right' | 'center' | 'justify' | 'auto';
  writingDirection?: 'ltr' | 'rtl' | 'auto';
  marginLeft?: number;
  marginRight?: number;
  paddingLeft?: number;
  paddingRight?: number;
  left?: number;
  right?: number;
}

export class RTLUtils {
  
  /**
   * Langues RTL supportées
   */
  static readonly RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];
  
  /**
   * Vérifier si une langue utilise RTL
   */
  static isRTLLanguage(languageCode: string): boolean {
    return this.RTL_LANGUAGES.includes(languageCode.toLowerCase());
  }

  /**
   * Obtenir la direction actuelle
   */
  static getCurrentDirection(): 'ltr' | 'rtl' {
    return I18nManager.isRTL ? 'rtl' : 'ltr';
  }

  /**
   * Forcer la direction RTL (nécessite redémarrage de l'app)
   */
  static async forceRTL(enabled: boolean): Promise<void> {
    if (I18nManager.isRTL !== enabled) {
      I18nManager.allowRTL(enabled);
      I18nManager.forceRTL(enabled);
      
      if (Platform.OS === 'android') {
        // Sur Android, on peut redémarrer automatiquement
        const { Updates } = require('expo-updates');
        if (Updates.isAvailable) {
          await Updates.reloadAsync();
        }
      }
    }
  }

  /**
   * Adapter les styles pour RTL
   */
  static adaptStyle(style: any, isRTL?: boolean): any {
    const rtl = isRTL ?? this.getCurrentDirection() === 'rtl';
    
    if (!rtl || !style) return style;

    const adapted = { ...style };

    // Inverser les marges horizontales
    if (style.marginLeft !== undefined || style.marginRight !== undefined) {
      adapted.marginLeft = style.marginRight;
      adapted.marginRight = style.marginLeft;
    }

    // Inverser les paddings horizontaux
    if (style.paddingLeft !== undefined || style.paddingRight !== undefined) {
      adapted.paddingLeft = style.paddingRight;
      adapted.paddingRight = style.paddingLeft;
    }

    // Inverser les positions horizontales
    if (style.left !== undefined || style.right !== undefined) {
      adapted.left = style.right;
      adapted.right = style.left;
    }

    // Adapter flexDirection
    if (style.flexDirection === 'row') {
      adapted.flexDirection = 'row-reverse';
    } else if (style.flexDirection === 'row-reverse') {
      adapted.flexDirection = 'row';
    }

    // Adapter textAlign
    if (style.textAlign === 'left') {
      adapted.textAlign = 'right';
    } else if (style.textAlign === 'right') {
      adapted.textAlign = 'left';
    }

    return adapted;
  }

  /**
   * Générer des styles adaptatifs pour RTL
   */
  static createRTLStyles(styles: Record<string, any>): Record<string, any> {
    const isRTL = this.getCurrentDirection() === 'rtl';
    const adaptedStyles: Record<string, any> = {};

    for (const [key, style] of Object.entries(styles)) {
      adaptedStyles[key] = this.adaptStyle(style, isRTL);
    }

    return adaptedStyles;
  }

  /**
   * Obtenir la direction de flexDirection appropriée
   */
  static getFlexDirection(
    defaultDirection: 'row' | 'column' = 'row',
    isRTL?: boolean
  ): 'row' | 'row-reverse' | 'column' | 'column-reverse' {
    const rtl = isRTL ?? this.getCurrentDirection() === 'rtl';
    
    if (defaultDirection === 'row') {
      return rtl ? 'row-reverse' : 'row';
    }
    
    return defaultDirection;
  }

  /**
   * Obtenir l'alignement de texte approprié
   */
  static getTextAlign(
    defaultAlign: 'left' | 'right' | 'center' | 'justify' = 'left',
    isRTL?: boolean
  ): 'left' | 'right' | 'center' | 'justify' {
    const rtl = isRTL ?? this.getCurrentDirection() === 'rtl';
    
    if (defaultAlign === 'left') {
      return rtl ? 'right' : 'left';
    } else if (defaultAlign === 'right') {
      return rtl ? 'left' : 'right';
    }
    
    return defaultAlign;
  }

  /**
   * Helper pour les margins/paddings horizontaux
   */
  static getHorizontalSpacing(
    leftValue: number,
    rightValue: number = leftValue,
    isRTL?: boolean
  ): { marginLeft: number; marginRight: number } {
    const rtl = isRTL ?? this.getCurrentDirection() === 'rtl';
    
    return rtl 
      ? { marginLeft: rightValue, marginRight: leftValue }
      : { marginLeft: leftValue, marginRight: rightValue };
  }

  /**
   * Helper pour les positions horizontales
   */
  static getHorizontalPosition(
    leftValue: number | string,
    rightValue?: number | string,
    isRTL?: boolean
  ): { left?: number | string; right?: number | string } {
    const rtl = isRTL ?? this.getCurrentDirection() === 'rtl';
    
    if (rtl) {
      return { 
        left: rightValue, 
        right: leftValue 
      };
    }
    
    return { left: leftValue, right: rightValue };
  }

  /**
   * Adapter les icons pour RTL (certains doivent être retournés)
   */
  static adaptIconName(iconName: string, isRTL?: boolean): string {
    const rtl = isRTL ?? this.getCurrentDirection() === 'rtl';
    
    if (!rtl) return iconName;

    // Mapping des icônes à retourner en RTL
    const rtlIconMap: Record<string, string> = {
      'chevron.left': 'chevron.right',
      'chevron.right': 'chevron.left',
      'arrow.left': 'arrow.right',
      'arrow.right': 'arrow.left',
      'chevron-left': 'chevron-right',
      'chevron-right': 'chevron-left',
      'arrow-back': 'arrow-forward',
      'arrow-forward': 'arrow-back',
    };

    return rtlIconMap[iconName] || iconName;
  }
}

/**
 * Hook pour utiliser RTL dans les composants
 */
export function useRTL() {
  const { settings } = useSettingsStore();
  const isRTL = RTLUtils.isRTLLanguage(settings.language);
  
  return {
    isRTL,
    direction: isRTL ? 'rtl' : 'ltr' as 'rtl' | 'ltr',
    adaptStyle: (style: any) => RTLUtils.adaptStyle(style, isRTL),
    getFlexDirection: (defaultDir: 'row' | 'column' = 'row') => 
      RTLUtils.getFlexDirection(defaultDir, isRTL),
    getTextAlign: (defaultAlign: 'left' | 'right' | 'center' | 'justify' = 'left') => 
      RTLUtils.getTextAlign(defaultAlign, isRTL),
    getHorizontalSpacing: RTLUtils.getHorizontalSpacing,
    getHorizontalPosition: RTLUtils.getHorizontalPosition,
    adaptIconName: (iconName: string) => RTLUtils.adaptIconName(iconName, isRTL),
  };
}

/**
 * HOC pour wrapper un composant avec support RTL
 */
export function withRTL<P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.ComponentType<P & { forceRTL?: boolean }> {
  return function RTLWrappedComponent(props: P & { forceRTL?: boolean }) {
    const { forceRTL, ...restProps } = props;
    const { isRTL: contextRTL } = useRTL();
    const isRTL = forceRTL !== undefined ? forceRTL : contextRTL;

    const adaptedProps = {
      ...restProps,
      style: RTLUtils.adaptStyle((restProps as any).style, isRTL)
    } as P;

    return React.createElement(WrappedComponent, adaptedProps);
  };
}

/**
 * Constantes et utilitaires pour les polices arabes
 */
export const ArabicFontUtils = {
  /**
   * Polices optimisées pour l'arabe
   */
  ARABIC_FONTS: {
    regular: 'NotoSansArabic-Regular',
    bold: 'NotoSansArabic-Bold',
    light: 'NotoSansArabic-Light',
  },

  /**
   * Obtenir la police appropriée selon la langue
   */
  getFontFamily(language: string, weight: 'regular' | 'bold' | 'light' = 'regular'): string {
    if (RTLUtils.isRTLLanguage(language)) {
      return this.ARABIC_FONTS[weight];
    }
    
    // Fallback vers les polices par défaut
    const fontMap = {
      regular: 'System',
      bold: 'System-Bold', 
      light: 'System-Light',
    };
    
    return fontMap[weight];
  },

  /**
   * Ajustements de line height pour l'arabe
   */
  getLineHeight(fontSize: number, language: string): number {
    if (RTLUtils.isRTLLanguage(language)) {
      return fontSize * 1.8; // L'arabe nécessite plus d'espace vertical
    }
    return fontSize * 1.4; // Standard pour LTR
  },

  /**
   * Ajustements de letter spacing pour l'arabe
   */
  getLetterSpacing(language: string): number {
    if (RTLUtils.isRTLLanguage(language)) {
      return 0.5; // Espacement plus large pour la lisibilité
    }
    return 0;
  },
};

/**
 * Composant wrapper pour texte RTL avec typographie optimisée
 */
export interface RTLTextProps {
  children: React.ReactNode;
  style?: any;
  language?: string;
  textAlign?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  numberOfLines?: number;
}

export const RTLText: React.FC<RTLTextProps> = ({
  children,
  style,
  language,
  textAlign = 'auto',
  numberOfLines,
}) => {
  const { isRTL, getTextAlign } = useRTL();
  const { settings } = useSettingsStore();
  const currentLanguage = language || settings.language;
  
  const textStyle = {
    ...style,
    fontFamily: ArabicFontUtils.getFontFamily(currentLanguage, 'regular'),
    lineHeight: ArabicFontUtils.getLineHeight(style?.fontSize || 16, currentLanguage),
    letterSpacing: ArabicFontUtils.getLetterSpacing(currentLanguage),
    textAlign: textAlign === 'auto' ? getTextAlign('left') : textAlign,
    writingDirection: isRTL ? 'rtl' : 'ltr',
  };

  const { Text } = require('react-native');
  
  return React.createElement(Text, { 
    style: textStyle, 
    numberOfLines 
  }, children);
};