/**
 * Escala de tamanhos de fonte do aplicativo
 * Define uma escala tipográfica consistente e escalável
 */

export const fontSizes = {
  // Tamanhos pequenos
  xs: 10,
  sm: 12,

  // Tamanhos base
  base: 14,
  md: 16,

  // Tamanhos grandes
  lg: 18,
  xl: 20,

  // Tamanhos para títulos
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
};

export const lineHeights = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2,
};

export const letterSpacing = {
  tight: -0.5,
  normal: 0,
  wide: 0.5,
  wider: 1,
};

export type FontSizeKey = keyof typeof fontSizes;
export type LineHeightKey = keyof typeof lineHeights;
export type LetterSpacingKey = keyof typeof letterSpacing;
