/**
 * Exporta todos os estilos e temas da aplicação
 */

export { lightTheme, darkTheme } from './themes';
export type { Theme, ThemeMode } from './themes';

export { lightColors, darkColors } from './colors';
export type { ColorKey, Colors } from './colors';

export { fonts, fontWeights } from './fonts';
export type { FontFamily, FontWeight } from './fonts';

export { fontSizes, lineHeights, letterSpacing } from './fontSizes';
export type { FontSizeKey, LineHeightKey, LetterSpacingKey } from './fontSizes';

export { spacing, borderRadius, shadows } from './spacing';
export type { SpacingKey, BorderRadiusKey, ShadowKey } from './spacing';

export { createGlobalStyles } from './globalStyles';
export type { GlobalStyles } from './globalStyles';
