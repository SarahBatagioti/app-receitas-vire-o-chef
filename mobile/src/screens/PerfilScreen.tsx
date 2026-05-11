import React from 'react';
import { ActivityIndicator, FlatList, Image } from 'react-native';
import { UserRound } from 'lucide-react-native';

import { AppButton, AppContainer, AppInput, AppText } from '../components/ui';
import { useAppTheme } from '../contexts';
import { useAuth } from '../hooks/useAuth';
import { publicationService } from '../services/publicationService';
import { getErrorMessage } from '../services/api';
import { PublicationFeedItem } from './inicio';

function ProfilePublicationCard({ publication }: { publication: PublicationFeedItem }) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      marginBottom="lg"
      padding="lg"
      shadow="sm"
    >
      <Image
        resizeMode="cover"
        source={{ uri: publication.mediaUrl }}
        style={{
          borderRadius: theme.borderRadius['3xl'],
          height: 220,
          marginBottom: theme.spacing.md,
          width: '100%',
        }}
      />
      <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.bold }}>
        {publication.autor.nome}
      </AppText>
      <AppText
        color="text"
        size="md"
        style={{ lineHeight: theme.fontSizes.md * 1.45, marginTop: theme.spacing.xs }}
      >
        {publication.legenda || 'Sem legenda.'}
      </AppText>
      <AppText color="textSecondary" size="sm" style={{ marginTop: theme.spacing.sm }}>
        {publication.likeCount} curtidas • {publication.commentCount} comentários •{' '}
        {publication.shareCount} compartilhamentos
      </AppText>
    </AppContainer>
  );
}

function ProfileHeader() {
  const { theme, themeMode, toggleTheme } = useAppTheme();
  const { status, isAuthenticated, user, logout } = useAuth();

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      marginBottom="xl"
      padding="lg"
      shadow="md"
    >
      <AppContainer align="center" backgroundColor="surface" direction="row">
        {user?.avatarUrl ? (
          <Image
            source={{ uri: user.avatarUrl }}
            style={{
              borderRadius: theme.borderRadius.full,
              height: theme.spacing['6xl'],
              marginRight: theme.spacing.md,
              width: theme.spacing['6xl'],
            }}
          />
        ) : (
          <AppContainer
            align="center"
            backgroundColor="surfaceSecondary"
            borderRadius="full"
            justify="center"
            style={{
              height: theme.spacing['6xl'],
              marginRight: theme.spacing.md,
              width: theme.spacing['6xl'],
            }}
          >
            <UserRound color={theme.colors.icon} size={theme.spacing['3xl']} />
          </AppContainer>
        )}

        <AppContainer backgroundColor="surface" style={{ flex: 1 }}>
          <AppText color="text" size="2xl" weight="bold">
            Minha conta
          </AppText>
          <AppText color="textSecondary" size="md">
            Status atual: {status} • {isAuthenticated ? 'Sessão autenticada.' : 'Sem sessão.'}
          </AppText>
        </AppContainer>
      </AppContainer>

      <AppContainer backgroundColor="surface" marginTop="lg">
        <AppInput editable={false} fullWidth label="E-mail" value={user?.email ?? ''} />
      </AppContainer>

      <AppContainer backgroundColor="surface" marginTop="sm">
        <AppInput editable={false} fullWidth label="Nome de usuário" value={user?.name ?? ''} />
      </AppContainer>

      <AppContainer
        backgroundColor="surfaceSecondary"
        borderRadius="xl"
        marginTop="lg"
        padding="md"
      >
        <AppText color="text" size="sm" weight="semibold">
          Aparência do aplicativo
        </AppText>
        <AppText color="textSecondary" size="sm" style={{ marginTop: 4 }}>
          Tema atual: {themeMode === 'light' ? 'claro' : 'escuro'}.
        </AppText>

        <AppContainer marginTop="md">
          <AppButton
            fullWidth
            label={themeMode === 'light' ? 'Mudar para tema escuro' : 'Mudar para tema claro'}
            onPress={toggleTheme}
            style={{ minHeight: theme.spacing['6xl'] }}
            variant="secondary"
          />
        </AppContainer>
      </AppContainer>

      <AppContainer marginTop="lg">
        <AppButton fullWidth label="Sair da conta" onPress={logout} variant="outline" />
      </AppContainer>
    </AppContainer>
  );
}

function PerfilScreen() {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [publications, setPublications] = React.useState<PublicationFeedItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const loadPublications = React.useCallback(async (mode: 'initial' | 'refresh' = 'initial') => {
    if (mode === 'initial') {
      setIsLoading(true);
    } else {
      setIsRefreshing(true);
    }

    setErrorMessage(null);

    try {
      const items = await publicationService.listMyPublications();
      setPublications(items);
    } catch (error) {
      setPublications([]);
      setErrorMessage(
        getErrorMessage(error, 'Não foi possível carregar suas publicações no momento.'),
      );
    } finally {
      if (mode === 'initial') {
        setIsLoading(false);
      } else {
        setIsRefreshing(false);
      }
    }
  }, []);

  React.useEffect(() => {
    if (!user?.id) {
      setPublications([]);
      setIsLoading(false);
      return;
    }

    void loadPublications('initial');
  }, [loadPublications, user?.id]);

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] }}
      data={publications}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <ProfileHeader />
          <AppContainer backgroundColor="background" marginBottom="lg">
            <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
              Minhas publicações
            </AppText>
            <AppText color="textSecondary" size="md" style={{ marginTop: theme.spacing.xs }}>
              As publicações abaixo são carregadas novamente do backend após o login.
            </AppText>
          </AppContainer>
        </>
      }
      ListEmptyComponent={
        isLoading ? (
          <AppContainer align="center" backgroundColor="background" padding="xl">
            <ActivityIndicator color={theme.colors.primary} />
          </AppContainer>
        ) : (
          <AppContainer align="center" backgroundColor="background" padding="xl">
            <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
              Nenhuma publicação encontrada
            </AppText>
            <AppText
              color={errorMessage ? 'error' : 'textSecondary'}
              size="md"
              style={{ marginTop: theme.spacing.sm, textAlign: 'center' }}
            >
              {errorMessage ?? 'Publique algo no início e volte aqui para conferir a persistência.'}
            </AppText>
          </AppContainer>
        )
      }
      onRefresh={() => {
        void loadPublications('refresh');
      }}
      refreshing={isRefreshing}
      renderItem={({ item }) => <ProfilePublicationCard publication={item} />}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default PerfilScreen;
