/**
 * Configuração de fontes do aplicativo
 * Define as famílias de fonte para tema light e dark
 */

export const fonts = {
  // Fonte primária - usada para a maioria do texto
  primary: {
    regular: 'System',
    bold: 'System',
    semibold: 'System',
  },

  // Fonte secundária - usada para elementos decorativos ou especiais
  secondary: {
    regular: 'System',
    bold: 'System',
  },

  // Fonte monoespacial - usada para código ou dados
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
