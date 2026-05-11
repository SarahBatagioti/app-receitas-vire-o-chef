import React from 'react';
import { Pressable } from 'react-native';
import { Send, UserRound } from 'lucide-react-native';
import { AppContainer, AppInput, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type CommentComposerProps = {
  authorName?: string | null;
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
};

function CommentComposer({
  authorName,
  value,
  onChangeText,
  onSubmit,
  disabled,
}: CommentComposerProps) {
  const { theme } = useAppTheme();
  const hasValue = value.trim().length > 0;
  const authorInitial = React.useMemo(() => {
    const normalizedName = authorName?.trim() ?? '';

    return normalizedName ? normalizedName.charAt(0).toUpperCase() : '?';
  }, [authorName]);

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
      <AppContainer
        align="center"
        backgroundColor="primary"
        borderRadius="full"
        justify="center"
        style={{
          height: theme.spacing['5xl'],
          marginRight: theme.spacing.md,
          width: theme.spacing['5xl'],
        }}
      >
        {authorInitial === '?' ? (
          <UserRound color={theme.colors.textInverse} size={theme.spacing['2xl']} />
        ) : (
          <AppText color="textInverse" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
            {authorInitial}
          </AppText>
        )}
      </AppContainer>

      <AppInput
        borderColor="surface"
        fullWidth
        onChangeText={onChangeText}
        onSubmitEditing={() => {
          if (!disabled && hasValue) {
            onSubmit();
          }
        }}
        placeholder="Adicione um comentário"
        returnKeyType="send"
        style={{ flex: 1 }}
        value={value}
      />

      {hasValue ? (
        <Pressable
          accessibilityLabel="Enviar comentário"
          disabled={disabled}
          onPress={onSubmit}
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.primary,
            borderRadius: theme.borderRadius.full,
            height: theme.spacing['5xl'],
            justifyContent: 'center',
            marginLeft: theme.spacing.sm,
            opacity: disabled ? 0.6 : 1,
            width: theme.spacing['5xl'],
          }}
        >
          <Send color={theme.colors.textInverse} size={theme.spacing.xl} />
        </Pressable>
      ) : null}
    </AppContainer>
  );
}

export default CommentComposer;
