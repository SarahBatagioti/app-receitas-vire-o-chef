/**
 * Paleta de cores do aplicativo
 * Define todas as cores para tema claro e escuro
 */

export const lightColors = {
  // Cores primarias e de marca
  primary: '#D7070C',
  primaryLight: '#E63E42',
  primaryDark: '#8B0208',
  brandGreen: '#008721',
  brandOrange: '#F3571C',
  brandYellow: '#F2AB01',
  brandRed: '#D7070C',

  // Cores neutras
  background: '#E5E5E5',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',
  overlay: 'rgba(31, 31, 31, 0.08)',

  // Cores de texto
  text: '#1F1F1F',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  // Cores de estado
  success: '#008721',
  warning: '#F3571C',
  error: '#D7070C',
  info: '#3B82F6',

  // Cores de borda e divisao
  border: '#EEEEEE',
  divider: '#E0E0E0',

  // Cores de feedback
  disabled: '#D1D5DB',
  hover: '#F3F4F6',
  focus: '#DBEAFE',

  // Cores de icones
  icon: '#4B5563',
  iconInactive: 'rgba(255, 255, 255, 0.72)',
  iconActive: '#FFFFFF',
};

export const darkColors = {
  // Cores primarias e de marca
  primary: '#FF6B6F',
  primaryLight: '#FF8A8F',
  primaryDark: '#C70305',
  brandGreen: '#23A94A',
  brandOrange: '#FF8752',
  brandYellow: '#FFC739',
  brandRed: '#FF6B6F',

  // Cores neutras
  background: '#1A1A1A',
  surface: '#242424',
  surfaceSecondary: '#2E2E2E',
  overlay: 'rgba(255, 255, 255, 0.08)',

  // Cores de texto
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#1F1F1F',

  // Cores de estado
  success: '#23A94A',
  warning: '#FF8752',
  error: '#FF6B6F',
  info: '#60A5FA',

  // Cores de borda e divisao
  border: '#3F3F3F',
  divider: '#2A2A2A',

  // Cores de feedback
  disabled: '#4B5563',
  hover: '#3F3F3F',
  focus: '#1E3A8A',

  // Cores de icones
  icon: '#E0E0E0',
  iconInactive: 'rgba(255, 255, 255, 0.5)',
  iconActive: '#FFFFFF',
};

export type ColorKey = keyof typeof lightColors;
export type Colors = typeof lightColors;
