/**
 * Design system exports
 */

import { Colors } from './Colors';
import { Typography } from './Typography';
import { Spacing } from './Spacing';
import { Shadows } from './Shadows';
import { BorderRadius } from './BorderRadius';

export { Colors } from './Colors';
export { Typography } from './Typography';
export { Spacing } from './Spacing';
export { Shadows } from './Shadows';
export { BorderRadius } from './BorderRadius';

// Combined theme object
export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  shadows: Shadows,
  borderRadius: BorderRadius,
} as const;