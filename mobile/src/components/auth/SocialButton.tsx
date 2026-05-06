import React from 'react';

import { useAppTheme } from '../../contexts';
import { AppButton, AppText } from '../ui';

type SocialButtonProps = {
  label: string;
  onPress: () => void;
  loading?: boolean;
};

function SocialButton({ label, onPress, loading = false }: SocialButtonProps) {
  const { theme } = useAppTheme();
  const icon = (
    <AppText size="2xl" weight="bold" style={{ color: theme.colors.brandOrange }}>
      G
    </AppText>
  );

  return (
    <AppButton
      accessibilityRole="button"
      borderColor="primary"
      borderRadius="2xl"
      fullWidth
      icon={icon}
      label={label}
      loading={loading}
      onPress={onPress}
      style={{
        minHeight: theme.spacing['7xl'],
        justifyContent: 'center',
      }}
      textStyle={{
        color: theme.colors.primary,
        fontSize: theme.fontSizes.lg,
      }}
      variant="outline"
    />
  );
}

export default SocialButton;
