/**
 * Colors for Yu Card App
 * Primary palette: Black, White, Chick Yellow
 */

export const Colors = {
  // Primary Colors
  primary: '#F4D03F', // Jaune poussin
  primaryDark: '#D4AC0D', // Jaune poussin plus foncé
  primaryLight: '#FEF9E7', // Jaune poussin très clair

  // Base Colors
  black: '#000000',
  white: '#FFFFFF',

  // Grays (pour les nuances)
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F4',
    200: '#E8EAED',
    300: '#DADCE0',
    400: '#BDC1C6',
    500: '#9AA0A6',
    600: '#80868B',
    700: '#5F6368',
    800: '#3C4043',
    900: '#202124',
  },

  // Status Colors
  success: '#00C851',
  warning: '#FFB900',
  error: '#FF3547',
  info: '#33B5E5',

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#FEF9E7', // Fond jaune très clair
  },

  // Text Colors
  text: {
    primary: '#000000',
    secondary: '#5F6368',
    tertiary: '#80868B',
    inverse: '#FFFFFF',
    accent: '#D4AC0D', // Texte accent jaune
  },

  // Border Colors
  border: {
    primary: '#E8EAED',
    secondary: '#DADCE0',
    dark: '#5F6368',
    accent: '#F4D03F',
  },

  // Wave Wallet Brand Color
  wave: {
    primary: '#FF6B35', // Orange Wave
    secondary: '#FF8A65',
    background: '#FFF3E0',
  },

  // Admin Theme - adapts to light/dark mode
  admin: {
    light: {
      background: {
        primary: '#FFFFFF', // Blanc principal
        secondary: '#F8F9FA', // Gris très clair
        tertiary: '#E8EAED', // Gris clair
        card: '#FFFFFF', // Fond des cartes
        elevated: '#FFFFFF', // Éléments élevés
      },
      text: {
        primary: '#000000', // Noir principal
        secondary: '#5F6368', // Gris foncé
        tertiary: '#80868B', // Gris moyen
        accent: '#D4AC0D', // Jaune accent
        muted: '#9AA0A6', // Gris atténué
      },
      border: {
        primary: '#E8EAED', // Bordure principale
        secondary: '#DADCE0', // Bordure secondaire
        accent: '#F4D03F', // Bordure accent
        focus: '#F4D03F', // Bordure focus
      },
      status: {
        success: '#00C851',
        warning: '#FFB900',
        error: '#FF3547',
        info: '#33B5E5',
        pending: '#FFA500',
      },
    },
    dark: {
      background: {
        primary: '#0A0A0A', // Noir principal
        secondary: '#1A1A1A', // Gris très foncé
        tertiary: '#2D2D2D', // Gris foncé
        card: '#1E1E1E', // Fond des cartes
        elevated: '#2A2A2A', // Éléments élevés
      },
      text: {
        primary: '#FFFFFF', // Blanc principal
        secondary: '#B0B0B0', // Gris clair
        tertiary: '#808080', // Gris moyen
        accent: '#F4D03F', // Jaune accent
        muted: '#606060', // Gris très atténué
      },
      border: {
        primary: '#333333', // Bordure principale
        secondary: '#2A2A2A', // Bordure secondaire
        accent: '#F4D03F', // Bordure accent
        focus: '#F4D03F', // Bordure focus
      },
      status: {
        success: '#00C851',
        warning: '#FFB900',
        error: '#FF3547',
        info: '#33B5E5',
        pending: '#FFA500',
      },
    },
  },
} as const;

export type ColorName = keyof typeof Colors;