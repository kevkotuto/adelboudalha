/**
 * Spacing system for consistent layout
 */

export const Spacing = {
  // Base spacing unit (4px)
  unit: 4,

  // Spacing scale
  xs: 4,    // 4px
  sm: 8,    // 8px
  md: 12,   // 12px
  lg: 16,   // 16px
  xl: 20,   // 20px
  '2xl': 24, // 24px
  '3xl': 32, // 32px
  '4xl': 40, // 40px
  '5xl': 48, // 48px
  '6xl': 64, // 64px
  '7xl': 80, // 80px
  '8xl': 96, // 96px

  // Semantic spacing
  padding: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
  },

  margin: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
  },

  gap: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
  },

  // Container spacing
  container: {
    horizontal: 16, // Padding horizontal par défaut des containers
    vertical: 20,   // Padding vertical par défaut des containers
  },

  // Safe area spacing
  safeArea: {
    top: 44,    // iOS status bar + extra
    bottom: 34, // iOS home indicator + extra
  },

  // Component specific spacing
  button: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 8, // Entre icône et texte
  },

  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12, // Entre icône et input
  },

  card: {
    padding: 16,
    margin: 8,
    gap: 12,
  },

  list: {
    itemPadding: 16,
    sectionGap: 24,
  },
} as const;

export type SpacingKey = keyof typeof Spacing;