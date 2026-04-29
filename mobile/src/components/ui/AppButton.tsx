/**
 * Componente AppButton
 * Botão reutilizável que usa o tema global
 * Oferece variações de estilo e estados
 */

import React from 'react';
import {
  Pressable,
  PressableProps,
  ViewStyle,
  TextStyle,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAppTheme } from '../../contexts';
import { SpacingKey, BorderRadiusKey } from '../../styles/spacing';
import AppText from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends Omit<PressableProps, 'style'> {
  /**
   * Rótulo do botão
   */
  label: string;

  /**
   * Variação visual do botão
   * @default 'primary'
   */
  variant?: ButtonVariant;

  /**
   * Tamanho do botão
   * @default 'md'
   */
  size?: ButtonSize;

  /**
   * Se o botão está desativado
   * @default false
   */
  disabled?: boolean;

  /**
   * Se o botão está carregando
   * @default false
   */
  loading?: boolean;

  /**
   * Callback executado ao pressionar
   */
  onPress?: () => void | Promise<void>;

  /**
   * Ícone opcional à esquerda do texto (component)
   */
  icon?: React.ReactNode;

  /**
   * Cor de fundo customizada (sobrescreve variant)
   */
  backgroundColor?: keyof ReturnType<(typeof import('../../styles/colors'))['lightColors']>;

  /**
   * Estilo customizado
   */
  style?: ViewStyle;

  /**
   * Estilo de texto customizado
   */
  textStyle?: TextStyle;

  /**
   * Cor da borda (para outline)
   */
  borderColor?: keyof ReturnType<(typeof import('../../styles/colors'))['lightColors']>;

  /**
   * Border radius customizado
   */
  borderRadius?: BorderRadiusKey;

  /**
   * Padding customizado
   */
  padding?: SpacingKey;

  /**
   * Largura do botão
   */
  width?: ViewStyle['width'];

  /**
   * Full width (100%)
   */
  fullWidth?: boolean;
}

const getButtonStyles = (
  theme: ReturnType<typeof useAppTheme>['theme'],
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  loading: boolean,
): { container: ViewStyle; text: TextStyle } => {
  const sizeConfig = {
    sm: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 'sm' as const,
    },
    md: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      fontSize: 'base' as const,
    },
    lg: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      fontSize: 'lg' as const,
    },
  };

  const config = sizeConfig[size];

  const baseContainerStyle: ViewStyle = {
    paddingHorizontal: config.paddingHorizontal,
    paddingVertical: config.paddingVertical,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.sm,
  };

  const baseTextStyle: TextStyle = {
    fontSize: theme.fontSizes[config.fontSize],
    fontWeight: theme.fontWeights.semibold,
    fontFamily: theme.fonts.primary.semibold,
  };

  if (disabled || loading) {
    baseContainerStyle.opacity = 0.6;
  }

  switch (variant) {
    case 'primary':
      return {
        container: {
          ...baseContainerStyle,
          backgroundColor: theme.colors.primary,
        },
        text: {
          ...baseTextStyle,
          color: theme.colors.textInverse,
        },
      };

    case 'secondary':
      return {
        container: {
          ...baseContainerStyle,
          backgroundColor: theme.colors.surfaceSecondary,
        },
        text: {
          ...baseTextStyle,
          color: theme.colors.text,
        },
      };

    case 'outline':
      return {
        container: {
          ...baseContainerStyle,
          backgroundColor: 'transparent',
          borderWidth: 1.5,
          borderColor: theme.colors.primary,
        },
        text: {
          ...baseTextStyle,
          color: theme.colors.primary,
        },
      };

    case 'ghost':
      return {
        container: {
          ...baseContainerStyle,
          backgroundColor: 'transparent',
        },
        text: {
          ...baseTextStyle,
          color: theme.colors.primary,
        },
      };

    default:
      return { container: baseContainerStyle, text: baseTextStyle };
  }
};

const AppButton = React.forwardRef<Pressable, AppButtonProps>(
  (
    {
      label,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      onPress,
      icon,
      backgroundColor,
      style,
      textStyle,
      borderColor,
      borderRadius = 'md',
      padding,
      width,
      fullWidth = false,
      ...props
    },
    ref,
  ) => {
    const appTheme = useAppTheme();
    const { theme } = appTheme;

    const { container: containerStyle, text: defaultTextStyle } = getButtonStyles(
      theme,
      variant,
      size,
      disabled,
      loading,
    );

    const computedContainerStyle: ViewStyle = {
      ...containerStyle,
      borderRadius: theme.borderRadius[borderRadius],
      width: fullWidth ? '100%' : width,
      opacity: disabled || loading ? 0.6 : 1,
    };

    if (backgroundColor) {
      computedContainerStyle.backgroundColor = theme.colors[backgroundColor];
    }

    if (borderColor) {
      computedContainerStyle.borderColor = theme.colors[borderColor];
    }

    if (padding) {
      computedContainerStyle.paddingHorizontal = theme.spacing[padding];
      computedContainerStyle.paddingVertical = theme.spacing[padding];
    }

    return (
      <Pressable
        ref={ref}
        disabled={disabled || loading}
        onPress={onPress}
        style={({ pressed }) => [
          computedContainerStyle,
          {
            opacity: pressed && !disabled && !loading ? 0.8 : computedContainerStyle.opacity,
          },
          style,
        ]}
        {...props}
      >
        {loading && <ActivityIndicator color={theme.colors.textInverse} size="small" />}
        {icon && !loading && icon}
        <AppText style={[defaultTextStyle, textStyle]}>{label}</AppText>
      </Pressable>
    );
  },
);

AppButton.displayName = 'AppButton';

export default AppButton;
