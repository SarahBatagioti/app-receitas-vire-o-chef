/**
 * Paleta de cores do aplicativo
 * Define todas as cores para tema claro e escuro
 */

export const lightColors = {
  // Cores primárias e de marca
  primary: '#D7040A',
  primaryLight: '#E63E42',
  primaryDark: '#8B0208',

  // Cores neutras
  background: '#E5E5E5',
  surface: '#FFFFFF',
  surfaceSecondary: '#F5F5F5',

  // Cores de texto
  text: '#1F1F1F',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',

  // Cores de estado
  success: '#22C55E',
  warning: '#F97316',
  error: '#EF4444',
  info: '#3B82F6',

  // Cores de borda e divisão
  border: '#EEEEEE',
  divider: '#E0E0E0',

  // Cores de feedback
  disabled: '#D1D5DB',
  hover: '#F3F4F6',
  focus: '#DBEAFE',

  // Cores de ícones
  icon: '#4B5563',
  iconInactive: 'rgba(255, 255, 255, 0.72)',
  iconActive: '#FFFFFF',
};

export const darkColors = {
  // Cores primárias e de marca
  primary: '#FF6B6F',
  primaryLight: '#FF8A8F',
  primaryDark: '#C70305',

  // Cores neutras
  background: '#1A1A1A',
  surface: '#242424',
  surfaceSecondary: '#2E2E2E',

  // Cores de texto
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#1F1F1F',

  // Cores de estado
  success: '#4ADE80',
  warning: '#FB923C',
  error: '#F87171',
  info: '#60A5FA',

  // Cores de borda e divisão
  border: '#3F3F3F',
  divider: '#2A2A2A',

  // Cores de feedback
  disabled: '#4B5563',
  hover: '#3F3F3F',
  focus: '#1E3A8A',

  // Cores de ícones
  icon: '#E0E0E0',
  iconInactive: 'rgba(255, 255, 255, 0.5)',
  iconActive: '#FFFFFF',
};

export type ColorKey = keyof typeof lightColors;
export type Colors = typeof lightColors;
