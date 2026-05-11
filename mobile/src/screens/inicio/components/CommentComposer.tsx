import React from 'react';
import { Image, Pressable } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { AppContainer, AppInput } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type CommentComposerProps = {
  avatarUrl?: string | null;
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

function CommentComposer({
  avatarUrl,
  value,
  onChangeText,
  onSubmit,
  disabled,
}: CommentComposerProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      borderRadius="3xl"
      direction="row"
      marginBottom="xl"
      padding="md"
      shadow="sm"
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={{
            borderRadius: theme.borderRadius.full,
            height: theme.spacing['5xl'],
            marginRight: theme.spacing.md,
            width: theme.spacing['5xl'],
          }}
        />
      ) : (
        <AppContainer
          align="center"
          backgroundColor="surfaceSecondary"
          borderRadius="full"
          justify="center"
          style={{
            height: theme.spacing['5xl'],
            marginRight: theme.spacing.md,
            width: theme.spacing['5xl'],
          }}
        >
          <UserRound color={theme.colors.icon} size={theme.spacing['2xl']} />
        </AppContainer>
      )}

      <AppInput
        borderColor="surface"
        fullWidth
        onChangeText={onChangeText}
        placeholder="Adicione um comentário"
        style={{ flex: 1 }}
        value={value}
      />
      <Pressable disabled={disabled || !value.trim()} onPress={onSubmit} style={{ marginLeft: theme.spacing.sm }} />
    </AppContainer>
  );
}

export default CommentComposer;
