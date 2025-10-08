/**
 * Typography system using Ubuntu font family
 */

export const Typography = {
  // Font Families
  fonts: {
    ubuntu: {
      light: 'Ubuntu_300Light',
      regular: 'Ubuntu_400Regular',
      medium: 'Ubuntu_500Medium',
      bold: 'Ubuntu_700Bold',
    },
  },

  // Font Sizes
  sizes: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },

  // Line Heights
  lineHeights: {
    xs: 16,
    sm: 20,
    base: 24,
    lg: 28,
    xl: 32,
    '2xl': 36,
    '3xl': 42,
    '4xl': 48,
    '5xl': 60,
    '6xl': 72,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Predefined Text Styles
  styles: {
    // Headings
    h1: {
      fontSize: 48,
      lineHeight: 60,
      fontFamily: 'Ubuntu_700Bold',
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 36,
      lineHeight: 48,
      fontFamily: 'Ubuntu_700Bold',
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 30,
      lineHeight: 42,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0,
    },
    h4: {
      fontSize: 24,
      lineHeight: 36,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0,
    },
    h5: {
      fontSize: 20,
      lineHeight: 32,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0,
    },
    h6: {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0,
    },
    h7: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0,
    },
    h8: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0,
    },
    h9: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0,
    },

    // Body Text
    bodyLarge: {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: 'Ubuntu_400Regular',
      letterSpacing: 0,
    },
    body: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Ubuntu_400Regular',
      letterSpacing: 0,
    },
    bodySmall: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Ubuntu_400Regular',
      letterSpacing: 0,
    },

    // Labels & Captions
    label: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0.25,
    },
    caption: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Ubuntu_400Regular',
      letterSpacing: 0.25,
    },
    overline: {
      fontSize: 12,
      lineHeight: 16,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },

    // Button Text
    button: {
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0.25,
    },
    buttonSmall: {
      fontSize: 14,
      lineHeight: 20,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0.25,
    },
    buttonLarge: {
      fontSize: 18,
      lineHeight: 28,
      fontFamily: 'Ubuntu_500Medium',
      letterSpacing: 0.25,
    },
  },
} as const;

export type FontFamily = keyof typeof Typography.fonts.ubuntu;
export type FontSize = keyof typeof Typography.sizes;
export type TextStyle = keyof typeof Typography.styles;