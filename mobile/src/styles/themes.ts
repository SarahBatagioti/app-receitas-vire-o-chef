/**
 * Definição de temas do aplicativo
 * Combina cores, fontes, espaçamentos e outros estilos em uma estrutura unificada
 */

import { lightColors, darkColors, type Colors } from './colors';
import { fonts, fontWeights, type FontFamily, type FontWeight } from './fonts';
import { fontSizes, lineHeights, letterSpacing, type FontSizeKey } from './fontSizes';
import {
  spacing,
  borderRadius,
  shadows,
  type SpacingKey,
  type BorderRadiusKey,
  type ShadowKey,
} from './spacing';

export type Theme = {
  colors: Colors;
  fonts: typeof fonts;
  fontWeights: typeof fontWeights;
  fontSizes: typeof fontSizes;
  lineHeights: typeof lineHeights;
  letterSpacing: typeof letterSpacing;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  shadows: typeof shadows;
};

export const lightTheme: Theme = {
  colors: lightColors,
  fonts,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  spacing,
  borderRadius,
  shadows,
};

export const darkTheme: Theme = {
  colors: darkColors,
  fonts,
  fontWeights,
  fontSizes,
  lineHeights,
  letterSpacing,
  spacing,
  borderRadius,
  shadows,
};

export type ThemeMode = 'light' | 'dark';
