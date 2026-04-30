import React from 'react';
import { ActivityIndicator, Pressable, PressableProps, TextStyle, ViewStyle } from 'react-native';

import { useAppTheme } from '../../contexts';
import { ColorKey } from '../../styles/colors';
import { BorderRadiusKey, SpacingKey } from '../../styles/spacing';
import AppText from './AppText';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  onPress?: () => void | Promise<void>;
  icon?: React.ReactNode;
  backgroundColor?: ColorKey;
  style?: ViewStyle;
  textStyle?: TextStyle;
  borderColor?: ColorKey;
  borderRadius?: BorderRadiusKey;
  padding?: SpacingKey;
  width?: ViewStyle['width'];
  fullWidth?: boolean;
}

const AppButton = React.forwardRef<React.ElementRef<typeof Pressable>, AppButtonProps>(
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
    const { theme } = useAppTheme();

    const sizeConfig = {
      sm: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        fontSize: theme.fontSizes.sm,
      },
      md: {
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        fontSize: theme.fontSizes.base,
      },
      lg: {
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.lg,
        fontSize: theme.fontSizes.lg,
      },
    } as const;

    const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: TextStyle }> = {
      primary: {
        container: {
          backgroundColor: theme.colors.primary,
        },
        text: {
          color: theme.colors.textInverse,
        },
      },
      secondary: {
        container: {
          backgroundColor: theme.colors.surfaceSecondary,
        },
        text: {
          color: theme.colors.text,
        },
      },
      outline: {
        container: {
          backgroundColor: 'transparent',
          borderColor: theme.colors.primary,
          borderWidth: 1.5,
        },
        text: {
          color: theme.colors.primary,
        },
      },
      ghost: {
        container: {
          backgroundColor: 'transparent',
        },
        text: {
          color: theme.colors.primary,
        },
      },
    };

    const computedContainerStyle: ViewStyle = {
      alignItems: 'center',
      borderRadius: theme.borderRadius[borderRadius],
      flexDirection: 'row',
      gap: theme.spacing.sm,
      justifyContent: 'center',
      opacity: disabled || loading ? 0.6 : 1,
      paddingHorizontal: padding ? theme.spacing[padding] : sizeConfig[size].paddingHorizontal,
      paddingVertical: padding ? theme.spacing[padding] : sizeConfig[size].paddingVertical,
      width: fullWidth ? '100%' : width,
      ...variantStyles[variant].container,
    };

    if (backgroundColor) {
      computedContainerStyle.backgroundColor = theme.colors[backgroundColor];
    }
    if (borderColor) {
      computedContainerStyle.borderColor = theme.colors[borderColor];
    }

    const computedTextStyle: TextStyle = {
      fontFamily: theme.fonts.primary.semibold,
      fontSize: sizeConfig[size].fontSize,
      fontWeight: theme.fontWeights.semibold,
      ...variantStyles[variant].text,
    };

    const loadingColor =
      variant === 'outline' || variant === 'ghost'
        ? theme.colors.primary
        : theme.colors.textInverse;

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
        {loading ? <ActivityIndicator color={loadingColor} size="small" /> : null}
        {icon && !loading ? icon : null}
        <AppText style={[computedTextStyle, textStyle]}>{label}</AppText>
      </Pressable>
    );
  },
);

AppButton.displayName = 'AppButton';

export default AppButton;
