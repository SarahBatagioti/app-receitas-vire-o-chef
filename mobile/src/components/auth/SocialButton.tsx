import React from 'react';

import { useAppTheme } from '../../contexts';
import { AppButton, AppContainer, AppText } from '../ui';

type SocialProvider = 'google' | 'facebook';

type SocialButtonProps = {
  provider: SocialProvider;
  label: string;
  onPress: () => void;
  loading?: boolean;
};

function SocialButton({ provider, label, onPress, loading = false }: SocialButtonProps) {
  const { theme } = useAppTheme();
  const isGoogle = provider === 'google';

  const icon = isGoogle ? (
    <AppText size="2xl" weight="bold" style={{ color: theme.colors.brandOrange }}>
      G
    </AppText>
  ) : (
    <AppContainer
      align="center"
      backgroundColor="info"
      borderRadius="full"
      justify="center"
      style={{
        width: theme.spacing['4xl'],
        height: theme.spacing['4xl'],
      }}
    >
      <AppText size="xl" weight="bold" color="textInverse">
        f
      </AppText>
    </AppContainer>
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
