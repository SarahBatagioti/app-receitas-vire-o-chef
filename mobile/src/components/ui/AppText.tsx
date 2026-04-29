/**
 * Componente AppText
 * Wrapper tipográfico que usa o tema global
 * Substitui Text para garantir consistência visual
 */

import React from 'react';
import {
  Text,
  TextProps,
  StyleSheet,
  TextStyle,
} from 'react-native';
import { useAppTheme } from '../../contexts';
import { FontSizeKey } from '../../styles/fontSizes';

interface AppTextProps extends TextProps {
  /**
   * Tamanho do texto. Usa a escala de fontSizes do tema
   * @default 'base'
   */
  size?: FontSizeKey;

  /**
   * Peso da fonte
   * @default 'regular'
   */
  weight?: keyof typeof import('../../styles/fonts').fontWeights;

  /**
   * Cor do texto. Usa as cores do tema
   * @default 'text'
   */
  color?: keyof ReturnType<(typeof import('../../styles/colors'))['lightColors']>;

  /**
   * Altura de linha
   * @default 'normal'
   */
  lineHeight?: keyof typeof import('../../styles/fontSizes').lineHeights;

  /**
   * Se true, o texto fica desativado (opacidade 0.5)
   * @default false
   */
  disabled?: boolean;

  /**
   * Se true, o texto fica bold (para compatibilidade)
   * @deprecated Use weight='bold' em vez disso
   */
  bold?: boolean;

  children?: React.ReactNode;
}

const AppText = React.forwardRef<Text, AppTextProps>(
  (
    {
      size = 'base',
      weight = 'regular',
      color = 'text',
      lineHeight = 'normal',
      disabled = false,
      bold,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { theme } = useAppTheme();

    // Se bold for verdadeiro, usa weight bold
    const effectiveWeight = bold ? 'bold' : weight;

    const computedStyle: TextStyle = {
      fontSize: theme.fontSizes[size],
      fontWeight: theme.fontWeights[effectiveWeight],
      color: theme.colors[color],
      lineHeight: theme.fontSizes[size] * theme.lineHeights[lineHeight],
      fontFamily: theme.fonts.primary.regular,
      opacity: disabled ? 0.5 : 1,
    };

    return (
      <Text
        ref={ref}
        style={[computedStyle, style]}
        {...props}
      >
        {children}
      </Text>
    );
  },
);

AppText.displayName = 'AppText';

export default AppText;
