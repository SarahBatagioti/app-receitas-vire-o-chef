import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
} from 'react-native';
import { EllipsisVertical, UserRound } from 'lucide-react-native';

import { AppButton, AppContainer, AppInput, AppText } from '../components/ui';
import { useAppTheme } from '../contexts';
import { useAuth } from '../hooks/useAuth';
import { getErrorMessage } from '../services/api';
import { publicationService } from '../services/publicationService';
import { PublicationFeedItem } from './inicio';
import PublicationOptionsMenu from './inicio/components/PublicationOptionsMenu';

type ProfilePublicationCardProps = {
  publication: PublicationFeedItem;
  onOpenOptions: (publication: PublicationFeedItem) => void;
};

type EditPublicationModalProps = {
  visible: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  isSaving: boolean;
};

function ProfilePublicationCard({
  publication,
  onOpenOptions,
}: ProfilePublicationCardProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      marginBottom="lg"
      padding="lg"
      shadow="sm"
    >
      <AppContainer
        align="center"
        backgroundColor="surface"
        direction="row"
        justify="space-between"
        marginBottom="md"
      >
        <AppText color="text" size="md" style={{ flex: 1, fontWeight: theme.fontWeights.bold }}>
          {publication.autor.nome}
        </AppText>

        <Pressable
          accessibilityLabel="Abrir opções da publicação"
          onPress={() => onOpenOptions(publication)}
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.borderRadius.full,
            height: theme.spacing['5xl'],
            justifyContent: 'center',
            width: theme.spacing['5xl'],
            ...theme.shadows.sm,
          }}
        >
          <EllipsisVertical color={theme.colors.text} size={theme.spacing['2xl']} />
        </Pressable>
      </AppContainer>

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

      <AppText
        color="text"
        size="md"
        style={{ lineHeight: theme.fontSizes.md * 1.45 }}
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

function EditPublicationModal({
  visible,
  value,
  onChangeText,
  onClose,
  onSave,
  isSaving,
}: EditPublicationModalProps) {
  const { theme } = useAppTheme();

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable
        onPress={onClose}
        style={{
          alignItems: 'center',
          backgroundColor: theme.colors.overlay,
          flex: 1,
          justifyContent: 'center',
          padding: theme.spacing.lg,
        }}
      >
        <Pressable onPress={() => undefined} style={{ width: '100%' }}>
          <AppContainer
            backgroundColor="surface"
            borderRadius="3xl"
            padding="lg"
            style={{ gap: theme.spacing.md }}
          >
            <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
              Editar publicação
            </AppText>

            <AppInput
              borderRadius="3xl"
              multiline
              onChangeText={onChangeText}
              placeholder="Escreva uma legenda para a publicação..."
              value={value}
            />

            <AppButton label="Salvar alterações" loading={isSaving} onPress={onSave} />
            <AppButton label="Cancelar" onPress={onClose} variant="secondary" />
          </AppContainer>
        </Pressable>
      </Pressable>
    </Modal>
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
  const [isSavingPublication, setIsSavingPublication] = React.useState(false);
  const [activePublication, setActivePublication] = React.useState<PublicationFeedItem | null>(null);
  const [isOptionsVisible, setIsOptionsVisible] = React.useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editValue, setEditValue] = React.useState('');
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

  const handleOpenOptions = React.useCallback((publication: PublicationFeedItem) => {
    setActivePublication(publication);
    setIsOptionsVisible(true);
  }, []);

  const handleCloseOptions = React.useCallback(() => {
    setIsOptionsVisible(false);
  }, []);

  const handleOpenEditor = React.useCallback(() => {
    if (!activePublication) {
      return;
    }

    setEditValue(activePublication.legenda);
    setIsOptionsVisible(false);
    setIsEditModalVisible(true);
  }, [activePublication]);

  const handleCloseEditor = React.useCallback(() => {
    setIsEditModalVisible(false);
    setEditValue('');
  }, []);

  const handleSavePublication = React.useCallback(async () => {
    if (!activePublication || isSavingPublication) {
      return;
    }

    setIsSavingPublication(true);

    try {
      const updatedPublication = await publicationService.updatePublication(activePublication.id, {
        legenda: editValue.trim(),
        recipeId: activePublication.receita?.id ?? null,
      });

      setPublications((current) =>
        current.map((publication) =>
          publication.id === updatedPublication.id ? updatedPublication : publication,
        ),
      );
      setActivePublication(updatedPublication);
      setIsEditModalVisible(false);
      setEditValue('');
    } catch (error) {
      Alert.alert(
        'Erro ao salvar',
        getErrorMessage(error, 'Não foi possível salvar as alterações da publicação.'),
      );
    } finally {
      setIsSavingPublication(false);
    }
  }, [activePublication, editValue, isSavingPublication]);

  const handleDeletePublication = React.useCallback(() => {
    if (!activePublication) {
      return;
    }

    setIsOptionsVisible(false);

    Alert.alert('Apagar publicação', 'Deseja apagar esta publicação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => {
          const publicationToDelete = activePublication;

          setPublications((current) =>
            current.filter((publication) => publication.id !== publicationToDelete.id),
          );

          void publicationService.deletePublication(publicationToDelete.id).catch((error) => {
            setPublications((current) => [publicationToDelete, ...current]);
            Alert.alert(
              'Erro ao apagar',
              getErrorMessage(error, 'Não foi possível apagar a publicação.'),
            );
          });
        },
      },
    ]);
  }, [activePublication]);

  return (
    <>
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
                {errorMessage ?? 'Publique algo no início e volte aqui para conferir.'}
              </AppText>
            </AppContainer>
          )
        }
        onRefresh={() => {
          void loadPublications('refresh');
        }}
        refreshing={isRefreshing}
        renderItem={({ item }) => (
          <ProfilePublicationCard publication={item} onOpenOptions={handleOpenOptions} />
        )}
        showsVerticalScrollIndicator={false}
      />

      <PublicationOptionsMenu
        onClose={handleCloseOptions}
        onDelete={handleDeletePublication}
        onEdit={handleOpenEditor}
        visible={isOptionsVisible}
      />

      <EditPublicationModal
        isSaving={isSavingPublication}
        onChangeText={setEditValue}
        onClose={handleCloseEditor}
        onSave={handleSavePublication}
        value={editValue}
        visible={isEditModalVisible}
      />
    </>
  );
}

export default PerfilScreen;
