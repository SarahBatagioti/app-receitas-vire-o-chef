/**
 * Configuracao de fontes do aplicativo
 * Define as familias de fonte para tema light e dark
 */

export const fonts = {
  // Fonte primaria - usada para a maioria do texto
  primary: {
    regular: 'System',
    bold: 'System',
    semibold: 'System',
  },

  // Fonte secundaria - usada para elementos decorativos ou especiais
  secondary: {
    regular: 'Dacherry',
    bold: 'Dacherry',
  },

  // Fonte monoespacial - usada para codigo ou dados
  mono: {
    regular: 'Courier New',
  },
};

/**
 * Mapeamento de pesos de fonte
 * Utilizado para definir fontWeight em diferentes plataformas
 */
export const fontWeights = {
  light: '300' as const,
  regular: '400' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export type FontFamily = keyof typeof fonts;
export type FontWeight = keyof typeof fontWeights;
