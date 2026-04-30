import React from 'react';

import { useAppTheme } from '../../contexts';
import { AppButton } from '../ui';

type AuthButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

function AuthButton({ label, onPress, loading = false, disabled = false }: AuthButtonProps) {
  const { theme } = useAppTheme();

  return (
    <AppButton
      accessibilityRole="button"
      backgroundColor="primary"
      borderRadius="2xl"
      disabled={disabled}
      fullWidth
      label={label}
      loading={loading}
      onPress={onPress}
      style={{
        minHeight: theme.spacing['7xl'],
        justifyContent: 'center',
      }}
      textStyle={{
        fontSize: theme.fontSizes.lg,
      }}
    />
  );
}

export default AuthButton;
