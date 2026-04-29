/**
 * Context API para gerenciar temas da aplicação
 * Permite trocar entre tema claro, escuro e customizar fontes e tamanhos
 */

import React, { createContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { lightTheme, darkTheme, Theme, ThemeMode } from '../styles/themes';

export type FontCustomization = 'default' | 'large' | 'extra-large';
export type FontFamilyCustomization = 'default' | 'custom1' | 'custom2';

export interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  fontCustomization: FontCustomization;
  fontFamilyCustomization: FontFamilyCustomization;
  setThemeMode: (mode: ThemeMode) => void;
  setFontCustomization: (customization: FontCustomization) => void;
  setFontFamilyCustomization: (customization: FontFamilyCustomization) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeMode;
  initialFontCustomization?: FontCustomization;
  initialFontFamilyCustomization?: FontFamilyCustomization;
}

/**
 * Aplica customização de tamanho de fonte ao tema
 */
const applyFontCustomization = (
  theme: Theme,
  customization: FontCustomization,
): Theme => {
  if (customization === 'default') return theme;

  const multiplier = customization === 'large' ? 1.15 : customization === 'extra-large' ? 1.3 : 1;

  return {
    ...theme,
    fontSizes: Object.entries(theme.fontSizes).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: Math.round(value * multiplier),
      }),
      {} as typeof theme.fontSizes,
    ),
  };
};

/**
 * Aplica customização de família de fonte ao tema
 */
const applyFontFamilyCustomization = (
  theme: Theme,
  customization: FontFamilyCustomization,
): Theme => {
  if (customization === 'default') return theme;

  // Aqui você pode adicionar lógica para diferentes famílias de fonte
  // Por enquanto, retorna o tema padrão
  return theme;
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'light',
  initialFontCustomization = 'default',
  initialFontFamilyCustomization = 'default',
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>(initialTheme);
  const [fontCustomization, setFontCustomization] =
    useState<FontCustomization>(initialFontCustomization);
  const [fontFamilyCustomization, setFontFamilyCustomization] =
    useState<FontFamilyCustomization>(initialFontFamilyCustomization);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  // Seleciona o tema base conforme o mode
  const baseTheme = useMemo(() => (themeMode === 'light' ? lightTheme : darkTheme), [themeMode]);

  // Aplica customizações de fonte
  const customizedTheme = useMemo(() => {
    let theme = applyFontCustomization(baseTheme, fontCustomization);
    theme = applyFontFamilyCustomization(theme, fontFamilyCustomization);
    return theme;
  }, [baseTheme, fontCustomization, fontFamilyCustomization]);

  const value: ThemeContextType = {
    theme: customizedTheme,
    themeMode,
    fontCustomization,
    fontFamilyCustomization,
    setThemeMode,
    setFontCustomization,
    setFontFamilyCustomization,
    toggleTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook para acessar o contexto de tema
 * @throws Error se usado fora de ThemeProvider
 */
export const useAppTheme = (): ThemeContextType => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within ThemeProvider');
  }
  return context;
};
