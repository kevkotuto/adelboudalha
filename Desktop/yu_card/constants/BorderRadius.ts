/**
 * Border radius system for consistent rounded corners
 */

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999, // Fully rounded

  // Component specific radius
  button: 13,
  input: 8,
  card: 10,
  modal: 16,
  image: 8,
  avatar: 9999,
  tag: 16,
} as const;

export type BorderRadiusKey = keyof typeof BorderRadius;