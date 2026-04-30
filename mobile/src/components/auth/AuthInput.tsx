import React from 'react';

import { useAppTheme } from '../../contexts';
import { AppContainer, AppInput, AppText } from '../ui';

type AuthInputProps = {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  inputType?: 'text' | 'email' | 'password';
  error?: string;
  editable?: boolean;
  accessibilityLabel: string;
};

function AuthInput({
  label,
  value,
  onChangeText,
  placeholder,
  inputType = 'text',
  error,
  editable = true,
  accessibilityLabel,
}: AuthInputProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer style={{ marginBottom: theme.spacing.lg, backgroundColor: 'transparent' }}>
      {label ? (
        <AppText
          size="lg"
          weight="bold"
          color="text"
          style={{ marginBottom: theme.spacing.md }}
        >
          {label}
        </AppText>
      ) : null}

      <AppInput
        accessibilityLabel={accessibilityLabel}
        autoCapitalize="none"
        autoCorrect={false}
        borderColor="border"
        editable={editable}
        error={error}
        fullWidth
        inputType={inputType}
        onChangeText={onChangeText}
        placeholder={placeholder}
        size="lg"
        value={value}
      />

      {error ? null : (
        <AppText
          size="sm"
          color="textSecondary"
          style={{
            minHeight: theme.fontSizes.sm * theme.lineHeights.normal,
            marginTop: theme.spacing.xs,
            opacity: 0,
          }}
        >
          placeholder
        </AppText>
      )}
    </AppContainer>
  );
}

export default AuthInput;
