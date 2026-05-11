import React from 'react';
import { Pressable } from 'react-native';
import { EllipsisVertical } from 'lucide-react-native';
import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { PublicationAuthor } from '../types';

type PublicationHeaderProps = {
  author: PublicationAuthor;
  canManage: boolean;
  onPressOptions?: () => void;
};

function PublicationHeader({ author, canManage, onPressOptions }: PublicationHeaderProps) {
  const { theme } = useAppTheme();
  const authorInitial = React.useMemo(() => {
    const normalizedName = author.nome.trim();

    return normalizedName ? normalizedName.charAt(0).toUpperCase() : '?';
  }, [author.nome]);

  return (
    <AppContainer
      align="center"
      direction="row"
      justify="space-between"
      style={{
        backgroundColor: 'transparent',
        left: theme.spacing.lg,
        position: 'absolute',
        right: theme.spacing.lg,
        top: theme.spacing.lg,
        zIndex: 2,
      }}
    >
      <AppContainer
        align="center"
        backgroundColor="surface"
        borderRadius="full"
        direction="row"
        paddingHorizontal="md"
        paddingVertical="md"
        shadow="md"
        style={{ width: '70%' }}
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
          <AppText
            color="textInverse"
            size="xl"
            style={{ fontWeight: theme.fontWeights.bold }}
          >
            {authorInitial}
          </AppText>
        </AppContainer>
        <AppText
          color="text"
          ellipsizeMode="tail"
          numberOfLines={1}
          size="xl"
          style={{ flex: 1, flexShrink: 1, fontWeight: theme.fontWeights.bold, minWidth: 0 }}
        >
          {author.nome}
        </AppText>
      </AppContainer>

      {canManage ? (
        <Pressable
          accessibilityLabel="Abrir opções da publicação"
          onPress={onPressOptions}
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.full,
            height: theme.spacing['5xl'],
            justifyContent: 'center',
            marginLeft: theme.spacing.md,
            width: theme.spacing['5xl'],
            ...theme.shadows.sm,
          }}
        >
          <EllipsisVertical color={theme.colors.text} size={theme.spacing['2xl']} />
        </Pressable>
      ) : null}
    </AppContainer>
  );
}

export default PublicationHeader;
