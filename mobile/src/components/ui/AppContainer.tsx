/**
 * Componente AppContainer
 * Wrapper de view/container que usa o tema global
 * Substitui View para garantir espaçamento e cores consistentes
 */

import React from 'react';
import {
  View,
  ViewProps,
  StyleSheet,
  ViewStyle,
  Platform,
} from 'react-native';
import { useAppTheme } from '../../contexts';
import { SpacingKey, BorderRadiusKey, ShadowKey } from '../../styles/spacing';

interface AppContainerProps extends ViewProps {
  /**
   * Padding horizontal e vertical
   * Usa a escala de spacing do tema
   * @default 'none'
   */
  padding?: SpacingKey;

  /**
   * Padding apenas horizontal
   */
  paddingHorizontal?: SpacingKey;

  /**
   * Padding apenas vertical
   */
  paddingVertical?: SpacingKey;

  /**
   * Margin do container
   * @default 'none'
   */
  margin?: SpacingKey;

  /**
   * Margin apenas horizontal
   */
  marginHorizontal?: SpacingKey;

  /**
   * Margin apenas vertical
   */
  marginVertical?: SpacingKey;

  /**
   * Border radius do container
   * @default 'none'
   */
  borderRadius?: BorderRadiusKey;

  /**
   * Shadow/elevation do container
   * @default 'none'
   */
  shadow?: ShadowKey;

  /**
   * Cor de fundo do container
   * Usa as cores do tema
   * @default 'background'
   */
  backgroundColor?: keyof ReturnType<(typeof import('../../styles/colors'))['lightColors']>;

  /**
   * Direção do flex
   * @default 'column'
   */
  direction?: 'row' | 'column';

  /**
   * Justificação do conteúdo
   * @default 'flex-start'
   */
  justify?: ViewStyle['justifyContent'];

  /**
   * Alinhamento do conteúdo
   * @default 'stretch'
   */
  align?: ViewStyle['alignItems'];

  /**
   * Se o container deve preencher o espaço disponível
   * @default false
   */
  flex?: boolean | number;

  /**
   * Se true, o container fica desativado
   * @default false
   */
  disabled?: boolean;

  children?: React.ReactNode;
}

const AppContainer = React.forwardRef<View, AppContainerProps>(
  (
    {
      padding,
      paddingHorizontal,
      paddingVertical,
      margin,
      marginHorizontal,
      marginVertical,
      borderRadius = 'none',
      shadow = 'none',
      backgroundColor = 'background',
      direction = 'column',
      justify = 'flex-start',
      align = 'stretch',
      flex,
      disabled = false,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const { theme } = useAppTheme();

    const computedStyle: ViewStyle = {
      flex: flex === true ? 1 : flex === false ? undefined : flex,
      flexDirection: direction,
      justifyContent: justify,
      alignItems: align,
      backgroundColor: theme.colors[backgroundColor],
      borderRadius: theme.borderRadius[borderRadius],
      opacity: disabled ? 0.5 : 1,
    };

    // Adiciona padding
    if (padding) {
      computedStyle.paddingHorizontal = theme.spacing[padding];
      computedStyle.paddingVertical = theme.spacing[padding];
    }
    if (paddingHorizontal) {
      computedStyle.paddingHorizontal = theme.spacing[paddingHorizontal];
    }
    if (paddingVertical) {
      computedStyle.paddingVertical = theme.spacing[paddingVertical];
    }

    // Adiciona margin
    if (margin) {
      computedStyle.marginHorizontal = theme.spacing[margin];
      computedStyle.marginVertical = theme.spacing[margin];
    }
    if (marginHorizontal) {
      computedStyle.marginHorizontal = theme.spacing[marginHorizontal];
    }
    if (marginVertical) {
      computedStyle.marginVertical = theme.spacing[marginVertical];
    }

    // Adiciona shadow
    if (shadow !== 'none' && theme.shadows[shadow]) {
      const shadowStyle = theme.shadows[shadow];
      Object.assign(computedStyle, shadowStyle);
    }

    return (
      <View
        ref={ref}
        style={[computedStyle, style]}
        {...props}
      >
        {children}
      </View>
    );
  },
);

AppContainer.displayName = 'AppContainer';

export default AppContainer;
