import React from 'react';
import { Search } from 'lucide-react-native';
import { AppContainer, AppInput } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type FeedSearchBarProps = {
  value: string;
  onChangeText: (value: string) => void;
};

function FeedSearchBar({ value, onChangeText }: FeedSearchBarProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer backgroundColor="background" marginBottom="xl">
      <AppInput
        borderRadius="3xl"
        inputStyle={{ fontSize: theme.fontSizes.lg }}
        leftIcon={<Search color={theme.colors.primary} size={theme.spacing['2xl']} />}
        onChangeText={onChangeText}
        placeholder="Pesquisar chefs..."
        value={value}
      />
    </AppContainer>
  );
}

export default FeedSearchBar;
