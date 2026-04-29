/**
 * Componente AppInput
 * Input de texto reutilizável que usa o tema global
 * Substitui TextInput para garantir consistência visual
 */

import React, { useState } from 'react';
import {
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
  TextStyle,
  Pressable,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { useAppTheme } from '../../contexts';
import { SpacingKey, BorderRadiusKey } from '../../styles/spacing';
import AppText from './AppText';

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  /**
   * Label do input
   */
  label?: string;

  /**
   * Placeholder do input
   */
  placeholder?: string;

  /**
   * Tipo de input
   * @default 'text'
   */
  inputType?: 'text' | 'email' | 'password' | 'phone' | 'number';

  /**
   * Mensagem de erro
   */
  error?: string;

  /**
   * Ícone à esquerda (component)
   */
  leftIcon?: React.ReactNode;

  /**
   * Ícone à direita (component)
   */
  rightIcon?: React.ReactNode;

  /**
   * Se o input está desativado
   * @default false
   */
  disabled?: boolean;

  /**
   * Se o input é obrigatório
   * @default false
   */
  required?: boolean;

  /**
   * Tamanho do input
   * @default 'md'
   */
  size?: 'sm' | 'md' | 'lg';

  /**
   * Border radius do input
   * @default 'md'
   */
  borderRadius?: BorderRadiusKey;

  /**
   * Padding do input
   * @default 'md'
   */
  padding?: SpacingKey;

  /**
   * Largura do input
   */
  width?: ViewStyle['width'];

  /**
   * Full width (100%)
   */
  fullWidth?: boolean;

  /**
   * Cor da borda customizada
   */
  borderColor?: keyof ReturnType<(typeof import('../../styles/colors'))['lightColors']>;

  /**
   * Callback para mudanças de valor
   */
  onChangeText?: (text: string) => void;

  /**
   * Valor controlado
   */
  value?: string;
}

const AppInput = React.forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      placeholder,
      inputType = 'text',
      error,
      leftIcon,
      rightIcon,
      disabled = false,
      required = false,
      size = 'md',
      borderRadius = 'md',
      padding,
      width,
      fullWidth = false,
      borderColor,
      onChangeText,
      value,
      ...props
    },
    ref,
  ) => {
    const { theme } = useAppTheme();
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const sizeConfig = {
      sm: { paddingVertical: theme.spacing.sm, fontSize: theme.fontSizes.sm },
      md: { paddingVertical: theme.spacing.md, fontSize: theme.fontSizes.base },
      lg: { paddingVertical: theme.spacing.lg, fontSize: theme.fontSizes.lg },
    };

    const config = sizeConfig[size];

    const containerStyle: ViewStyle = {
      width: fullWidth ? '100%' : width,
      marginBottom: error ? theme.spacing.sm : 0,
    };

    const borderColorValue = error
      ? theme.colors.error
      : isFocused
        ? theme.colors.primary
        : borderColor
          ? theme.colors[borderColor]
          : theme.colors.border;

    const inputContainerStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: borderColorValue,
      borderRadius: theme.borderRadius[borderRadius],
      paddingHorizontal: padding ? theme.spacing[padding] : theme.spacing.md,
      opacity: disabled ? 0.6 : 1,
    };

    const inputStyle: TextStyle = {
      flex: 1,
      fontSize: config.fontSize,
      color: theme.colors.text,
      paddingVertical: config.paddingVertical,
      fontFamily: theme.fonts.primary.regular,
    };

    const secureTextEntry = inputType === 'password' && !showPassword;

    return (
      <View style={containerStyle}>
        {label && (
          <View style={{ marginBottom: theme.spacing.sm, flexDirection: 'row' }}>
            <AppText weight="semibold" size="sm" color="text">
              {label}
            </AppText>
            {required && (
              <AppText color="error" size="sm">
                {' '}
                *
              </AppText>
            )}
          </View>
        )}

        <View style={inputContainerStyle}>
          {leftIcon && (
            <View style={{ marginRight: theme.spacing.sm }}>{leftIcon}</View>
          )}

          <TextInput
            ref={ref}
            style={inputStyle}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textTertiary}
            editable={!disabled}
            secureTextEntry={secureTextEntry}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChangeText={onChangeText}
            value={value}
            keyboardType={
              inputType === 'email'
                ? 'email-address'
                : inputType === 'phone'
                  ? 'phone-pad'
                  : inputType === 'number'
                    ? 'numeric'
                    : 'default'
            }
            {...props}
          />

          {inputType === 'password' ? (
            <Pressable
              onPress={() => setShowPassword(!showPassword)}
              style={{ marginLeft: theme.spacing.sm }}
            >
              {showPassword ? (
                <Eye size={20} color={theme.colors.icon} />
              ) : (
                <EyeOff size={20} color={theme.colors.icon} />
              )}
            </Pressable>
          ) : null}

          {rightIcon && !props.editable && (
            <View style={{ marginLeft: theme.spacing.sm }}>{rightIcon}</View>
          )}
        </View>

        {error && (
          <AppText size="sm" color="error" style={{ marginTop: theme.spacing.xs }}>
            {error}
          </AppText>
        )}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';

export default AppInput;
