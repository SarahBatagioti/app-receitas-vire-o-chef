import React, { useState } from 'react';
import { Pressable, TextInput, TextInputProps, TextStyle, View, ViewStyle } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

import { useAppTheme } from '../../contexts';
import { ColorKey } from '../../styles/colors';
import { BorderRadiusKey, SpacingKey } from '../../styles/spacing';
import AppText from './AppText';

interface AppInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  placeholder?: string;
  inputType?: 'text' | 'email' | 'password' | 'phone' | 'number';
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  required?: boolean;
  size?: 'sm' | 'md' | 'lg';
  borderRadius?: BorderRadiusKey;
  padding?: SpacingKey;
  width?: ViewStyle['width'];
  fullWidth?: boolean;
  borderColor?: ColorKey;
  onChangeText?: (text: string) => void;
  value?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
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
      style,
      inputStyle: customInputStyle,
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
    } as const;

    const containerStyle: ViewStyle = {
      marginBottom: error ? theme.spacing.sm : 0,
      width: fullWidth ? '100%' : width,
    };

    const resolvedBorderColor = error
      ? theme.colors.error
      : isFocused
        ? theme.colors.primary
        : borderColor
          ? theme.colors[borderColor]
          : theme.colors.border;

    const inputContainerStyle: ViewStyle = {
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderColor: resolvedBorderColor,
      borderRadius: theme.borderRadius[borderRadius],
      borderWidth: 1,
      flexDirection: 'row',
      opacity: disabled ? 0.6 : 1,
      paddingHorizontal: padding ? theme.spacing[padding] : theme.spacing.md,
    };

    const inputStyle: TextStyle = {
      color: theme.colors.text,
      flex: 1,
      fontFamily: theme.fonts.primary.regular,
      fontSize: sizeConfig[size].fontSize,
      paddingVertical: sizeConfig[size].paddingVertical,
    };

    const secureTextEntry = inputType === 'password' && !showPassword;

    return (
      <View style={[containerStyle, style]}>
        {label ? (
          <View style={{ flexDirection: 'row', marginBottom: theme.spacing.sm }}>
            <AppText color="text" size="sm" weight="semibold">
              {label}
            </AppText>
            {required ? (
              <AppText color="error" size="sm">
                {' '}
                *
              </AppText>
            ) : null}
          </View>
        ) : null}

        <View style={inputContainerStyle}>
          {leftIcon ? <View style={{ marginRight: theme.spacing.sm }}>{leftIcon}</View> : null}

          <TextInput
            ref={ref}
            editable={!disabled}
            keyboardType={
              inputType === 'email'
                ? 'email-address'
                : inputType === 'phone'
                  ? 'phone-pad'
                  : inputType === 'number'
                    ? 'numeric'
                    : 'default'
            }
            onBlur={() => setIsFocused(false)}
            onChangeText={onChangeText}
            onFocus={() => setIsFocused(true)}
            placeholder={placeholder}
            placeholderTextColor={theme.colors.textTertiary}
            secureTextEntry={secureTextEntry}
            style={[inputStyle, customInputStyle]}
            value={value}
            {...props}
          />

          {inputType === 'password' ? (
            <Pressable
              accessibilityLabel={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onPress={() => setShowPassword((current) => !current)}
              style={{ marginLeft: theme.spacing.sm }}
            >
              {showPassword ? (
                <Eye color={theme.colors.icon} size={20} />
              ) : (
                <EyeOff color={theme.colors.icon} size={20} />
              )}
            </Pressable>
          ) : null}

          {rightIcon ? <View style={{ marginLeft: theme.spacing.sm }}>{rightIcon}</View> : null}
        </View>

        {error ? (
          <AppText color="error" size="sm" style={{ marginTop: theme.spacing.xs }}>
            {error}
          </AppText>
        ) : null}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';

export default AppInput;
