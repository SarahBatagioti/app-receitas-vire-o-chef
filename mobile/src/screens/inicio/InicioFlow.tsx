import React from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Pressable,
  Share,
} from 'react-native';
import { Asset, launchImageLibrary } from 'react-native-image-picker';
import { ChevronLeft, ImagePlus, Link2, Save, Trash2 } from 'lucide-react-native';
import { AppButton, AppContainer, AppHeader, AppInput, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { useAuth } from '../../hooks/useAuth';
import { getErrorMessage } from '../../services/api';
import {
  RecipeApiDifficulty,
  RecipeApiMediaType,
  RecipeMediaRecord,
  RecipeRecord,
  recipeService,
} from '../../services/recipeService';
import { publicationService } from '../../services/publicationService';
import { RecipeDetailScreen, RecipeDetail, RecipeDetailMedia, RecipeListItem } from '../recipes';
import {
  CommentsScreen,
  FeedEmptyState,
  FeedListFooter,
  FeedSearchBar,
  FeedSkeletonCard,
  PublicationCard,
  PublicationComposerCard,
} from './components';
import {
  InicioFlowProps,
  InicioRoute,
  PublicationComposerValues,
  PublicationFeedItem,
  PublicationRecipeOption,
} from './types';
import {
  commentsReducer,
  feedReducer,
  initialCommentsState,
  initialFeedState,
} from './publicationState';

type ActiveCommentsRoute = {
  publication: PublicationFeedItem;
};

type ActiveComposerRoute = {
  publication?: PublicationFeedItem;
};

function inferImageFromAsset(asset: Asset | undefined | null) {
  if (!asset?.uri || !asset.type || !asset.type.startsWith('image/')) {
    return null;
  }

  return {
    uri: asset.uri,
    fileName: asset.fileName?.trim() || `publicacao-${Date.now()}.jpg`,
    mimeType: asset.type,
  };
}

function mapApiDifficultyToUi(
  difficulty: RecipeApiDifficulty | null,
): RecipeListItem['difficulty'] {
  switch (difficulty) {
    case 'FACIL':
      return 'facil';
    case 'DIFICIL':
      return 'dificil';
    default:
      return 'intermediario';
  }
}

function mapApiMediaTypeToUi(type: RecipeApiMediaType): 'image' | 'video' {
  return type === 'VIDEO' ? 'video' : 'image';
}

function buildRecipeListItem(recipe: RecipeRecord): RecipeListItem {
  return {
    id: recipe.id,
    title: recipe.nome,
    imageUrl: recipe.midiaPrincipal?.url ?? recipe.midias[0]?.url ?? null,
    difficulty: mapApiDifficultyToUi(recipe.dificuldade),
    prepMinutes: recipe.tempoPreparoMinutos ?? 0,
    rating: recipe.avaliacaoMedia,
    servings: recipe.rendimentoPorcoes ?? 0,
    authorName: recipe.autorNome || recipe.autorUsername || 'Autor da receita',
    isCollaborative: recipe.isColaborativa,
    status: recipe.status === 'PUBLICADA' ? 'published' : 'draft',
  };
}

function mapRecipeDetailMedia(media: RecipeMediaRecord): RecipeDetailMedia {
  return {
    id: media.id,
    type: mapApiMediaTypeToUi(media.tipo),
    url: media.url,
    fileName: media.nomeArquivo ?? '',
  };
}

function mapRecipeRecordToDetail(recipe: RecipeRecord): RecipeDetail {
  return {
    ...buildRecipeListItem(recipe),
    reviewsCount: 0,
    commentsCount: 0,
    author: {
      name: recipe.autorNome || recipe.autorUsername || 'Autor da receita',
      subtitle: recipe.autorUsername ?? undefined,
      avatarUrl: null,
    },
    primaryMedia: recipe.midiaPrincipal ? mapRecipeDetailMedia(recipe.midiaPrincipal) : null,
    nutrition: {
      calories: `${recipe.informacaoNutricional?.calorias ?? 0} kcal`,
      proteins: `${recipe.informacaoNutricional?.proteinas ?? 0} g`,
      carbohydrates: `${recipe.informacaoNutricional?.carboidratos ?? 0} g`,
      fats: `${recipe.informacaoNutricional?.gorduras ?? 0} g`,
    },
    ingredients: recipe.ingredientes.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.nome,
      quantity: [ingredient.quantidade, ingredient.unidade].filter(Boolean).join(' ') || 'A gosto',
    })),
    steps: recipe.modoPreparo.map((step, index) => ({
      id: step.id,
      title: `Passo ${index + 1}`,
      description: step.descricao,
      accentColor: index % 3 === 0 ? 'brandGreen' : index % 3 === 1 ? 'brandYellow' : 'brandOrange',
    })),
    media: recipe.midias.map(mapRecipeDetailMedia),
  };
}

const initialComposerValues: PublicationComposerValues = {
  legenda: '',
  recipeId: null,
  imageUri: null,
  imageFileName: null,
  imageMimeType: null,
};

function InicioFlow({ onOpenRecipesScreen }: InicioFlowProps) {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const [route, setRoute] = React.useState<InicioRoute>('feed');
  const [feedState, dispatchFeed] = React.useReducer(feedReducer, initialFeedState);
  const [commentsState, dispatchComments] = React.useReducer(commentsReducer, initialCommentsState);
  const [activeCommentsRoute, setActiveCommentsRoute] = React.useState<ActiveCommentsRoute | null>(null);
  const [activeComposerRoute, setActiveComposerRoute] = React.useState<ActiveComposerRoute | null>(null);
  const [commentValue, setCommentValue] = React.useState('');
  const [composerValues, setComposerValues] = React.useState<PublicationComposerValues>(initialComposerValues);
  const [composerError, setComposerError] = React.useState<string | null>(null);
  const [isSavingComposer, setIsSavingComposer] = React.useState(false);
  const [availableRecipes, setAvailableRecipes] = React.useState<PublicationRecipeOption[]>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = React.useState(false);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = React.useState<RecipeDetail | null>(null);
  const [recipeDetailError, setRecipeDetailError] = React.useState<string | null>(null);
  const [isLoadingRecipeDetail, setIsLoadingRecipeDetail] = React.useState(false);

  const loadFeed = React.useCallback(
    async (mode: 'initial' | 'refresh' | 'more' = 'initial', cursor?: string | null, query?: string) => {
      try {
        if (mode === 'initial') {
          dispatchFeed({ type: 'LOAD_INITIAL_START' });
        } else if (mode === 'refresh') {
          dispatchFeed({ type: 'REFRESH_START' });
        } else {
          dispatchFeed({ type: 'LOAD_MORE_START' });
        }

        const page = await publicationService.listFeed(cursor ?? null, query ?? feedState.searchQuery);

        if (mode === 'initial') {
          dispatchFeed({ type: 'LOAD_INITIAL_SUCCESS', payload: page });
        } else if (mode === 'refresh') {
          dispatchFeed({ type: 'REFRESH_SUCCESS', payload: page });
        } else {
          dispatchFeed({ type: 'LOAD_MORE_SUCCESS', payload: page });
        }
      } catch (error) {
        const message = getErrorMessage(error, 'Não foi possível carregar o feed.');
        if (mode === 'initial') {
          dispatchFeed({ type: 'LOAD_INITIAL_ERROR', payload: message });
        } else {
          dispatchFeed({ type: 'LOAD_MORE_ERROR', payload: message });
        }
      }
    },
    [feedState.searchQuery],
  );

  React.useEffect(() => {
    void loadFeed('initial', null, '');
  }, [loadFeed]);

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      dispatchFeed({ type: 'APPLY_SEARCH_QUERY', payload: feedState.searchValue.trim() });
    }, 350);

    return () => clearTimeout(timeout);
  }, [feedState.searchValue]);

  React.useEffect(() => {
    if (!feedState.isLoadingInitial) {
      return;
    }

    void loadFeed('initial', null, feedState.searchQuery);
  }, [feedState.isLoadingInitial, feedState.searchQuery, loadFeed]);

  const refreshFeed = React.useCallback(async () => {
    await loadFeed('refresh', null, feedState.searchQuery);
  }, [feedState.searchQuery, loadFeed]);

  const handleLoadMoreFeed = React.useCallback(async () => {
    if (!feedState.hasMore || feedState.isLoadingMore || !feedState.nextCursor) {
      return;
    }

    await loadFeed('more', feedState.nextCursor, feedState.searchQuery);
  }, [feedState.hasMore, feedState.isLoadingMore, feedState.nextCursor, feedState.searchQuery, loadFeed]);

  const loadComments = React.useCallback(
    async (publicationId: string, cursor?: string | null) => {
      try {
        if (!cursor) {
          dispatchComments({ type: 'LOAD_INITIAL_START' });
        } else {
          dispatchComments({ type: 'LOAD_MORE_START' });
        }

        const page = await publicationService.listComments(publicationId, cursor);

        if (!cursor) {
          dispatchComments({ type: 'LOAD_INITIAL_SUCCESS', payload: page });
        } else {
          dispatchComments({ type: 'LOAD_MORE_SUCCESS', payload: page });
        }
      } catch (error) {
        const message = getErrorMessage(error, 'Não foi possível carregar os comentários.');
        if (!cursor) {
          dispatchComments({ type: 'LOAD_INITIAL_ERROR', payload: message });
        } else {
          dispatchComments({ type: 'LOAD_MORE_ERROR', payload: message });
        }
      }
    },
    [],
  );

  const openComments = React.useCallback(
    async (publication: PublicationFeedItem) => {
      setRoute('comments');
      setActiveCommentsRoute({ publication });
      setCommentValue('');
      await loadComments(publication.id);
    },
    [loadComments],
  );

  const updatePublicationInFeed = React.useCallback((publication: PublicationFeedItem) => {
    dispatchFeed({ type: 'SYNC_PUBLICATION', payload: publication });

    if (activeCommentsRoute?.publication.id === publication.id) {
      setActiveCommentsRoute({ publication });
    }
  }, [activeCommentsRoute]);

  const handleToggleLike = React.useCallback(
    async (publication: PublicationFeedItem) => {
      const optimisticPublication: PublicationFeedItem = {
        ...publication,
        isLikedByRequester: !publication.isLikedByRequester,
        likeCount: Math.max(0, publication.likeCount + (publication.isLikedByRequester ? -1 : 1)),
      };

      dispatchFeed({ type: 'SYNC_PUBLICATION', payload: optimisticPublication });

      try {
        const nextPublication = publication.isLikedByRequester
          ? await publicationService.unlikePublication(publication.id)
          : await publicationService.likePublication(publication.id);

        updatePublicationInFeed(nextPublication);
      } catch {
        dispatchFeed({ type: 'SYNC_PUBLICATION', payload: publication });
      }
    },
    [updatePublicationInFeed],
  );

  const handleShare = React.useCallback(
    async (publication: PublicationFeedItem) => {
      try {
        const publicationUrl = `https://vireochef.app/publicacoes/${publication.id}`;
        const recipeUrl = publication.receita
          ? `https://vireochef.app/receitas/${publication.receita.id}`
          : null;
        const message = recipeUrl
          ? `${publication.legenda}\n\nPublicação: ${publicationUrl}\nReceita: ${recipeUrl}`
          : `${publication.legenda}\n\nPublicação: ${publicationUrl}`;
        await Share.share({ message });
        const updatedPublication = await publicationService.registerShare(publication.id);
        updatePublicationInFeed(updatedPublication);
      } catch {
        return;
      }
    },
    [updatePublicationInFeed],
  );

  const handleDeletePublication = React.useCallback((publication: PublicationFeedItem) => {
    Alert.alert('Apagar publicação', 'Deseja apagar esta publicação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Apagar',
        style: 'destructive',
        onPress: () => {
          dispatchFeed({ type: 'REMOVE_PUBLICATION', payload: publication.id });
          void publicationService.deletePublication(publication.id).catch(() => {
            dispatchFeed({ type: 'UPSERT_PUBLICATION', payload: publication });
          });
        },
      },
    ]);
  }, []);

  const handleOpenComposer = React.useCallback(async (publication?: PublicationFeedItem) => {
    setRoute('composer');
    setActiveComposerRoute(publication ? { publication } : {});
    setComposerError(null);
    setComposerValues(
      publication
        ? {
            legenda: publication.legenda,
            recipeId: publication.receita?.id ?? null,
            imageUri: publication.mediaUrl,
            imageFileName: null,
            imageMimeType: null,
          }
        : initialComposerValues,
    );

    if (!availableRecipes.length) {
      setIsLoadingRecipes(true);
      try {
        const recipes = await recipeService.listMyRecipes();
        setAvailableRecipes(
          recipes
            .filter((recipe) => recipe.status === 'PUBLICADA')
            .map((recipe) => ({ id: recipe.id, title: recipe.nome })),
        );
      } catch {
        setAvailableRecipes([]);
      } finally {
        setIsLoadingRecipes(false);
      }
    }
  }, [availableRecipes.length]);

  const handlePickImage = React.useCallback(async () => {
    try {
      const response = await launchImageLibrary({
        assetRepresentationMode: 'current',
        includeBase64: false,
        mediaType: 'photo',
        quality: 1,
        selectionLimit: 1,
      });

      if (response.didCancel) {
        return;
      }

      const normalized = inferImageFromAsset(response.assets?.[0]);

      if (!normalized) {
        setComposerError('Selecione uma imagem válida para a publicação.');
        return;
      }

      setComposerError(null);
      setComposerValues((current) => ({
        ...current,
        imageUri: normalized.uri,
        imageFileName: normalized.fileName,
        imageMimeType: normalized.mimeType,
      }));
    } catch (error) {
      setComposerError(getErrorMessage(error, 'Não foi possível abrir a galeria.'));
    }
  }, []);

  const handleSaveComposer = React.useCallback(async () => {
    if (isSavingComposer) {
      return;
    }

    if (!activeComposerRoute?.publication && (!composerValues.imageUri || !composerValues.imageFileName || !composerValues.imageMimeType)) {
      setComposerError('Selecione uma imagem antes de publicar.');
      return;
    }

    setIsSavingComposer(true);
    setComposerError(null);

    try {
      const savedPublication = activeComposerRoute?.publication
        ? await publicationService.updatePublication(activeComposerRoute.publication.id, {
            legenda: composerValues.legenda,
            recipeId: composerValues.recipeId,
          })
        : await publicationService.createPublication({
            legenda: composerValues.legenda,
            recipeId: composerValues.recipeId,
            image: {
              uri: composerValues.imageUri!,
              fileName: composerValues.imageFileName!,
              mimeType: composerValues.imageMimeType!,
            },
          });

      dispatchFeed({ type: 'UPSERT_PUBLICATION', payload: savedPublication });
      setRoute('feed');
      setActiveComposerRoute(null);
      setComposerValues(initialComposerValues);
    } catch (error) {
      setComposerError(getErrorMessage(error, 'Não foi possível salvar a publicação.'));
    } finally {
      setIsSavingComposer(false);
    }
  }, [activeComposerRoute, composerValues, isSavingComposer]);

  const handleSubmitComment = React.useCallback(async () => {
    const publication = activeCommentsRoute?.publication;

    if (!publication || !commentValue.trim()) {
      return;
    }

    dispatchComments({ type: 'SUBMIT_START' });

    try {
      const createdComment = await publicationService.createComment(publication.id, commentValue.trim());
      dispatchComments({ type: 'SUBMIT_SUCCESS', payload: createdComment });
      setCommentValue('');

      const updatedPublication = {
        ...publication,
        commentCount: publication.commentCount + 1,
      };

      updatePublicationInFeed(updatedPublication);
    } catch (error) {
      dispatchComments({
        type: 'SUBMIT_ERROR',
        payload: getErrorMessage(error, 'Não foi possível enviar o comentário.'),
      });
    }
  }, [activeCommentsRoute, commentValue, updatePublicationInFeed]);

  const openLinkedRecipe = React.useCallback(async (publication: PublicationFeedItem) => {
    if (!publication.receita) {
      return;
    }

    setRoute('recipe-detail');
    setIsLoadingRecipeDetail(true);
    setRecipeDetailError(null);
    setSelectedRecipeDetail(null);

    try {
      const recipe = await recipeService.getRecipeById(publication.receita.id);
      setSelectedRecipeDetail(mapRecipeRecordToDetail(recipe));
    } catch (error) {
      setRecipeDetailError(getErrorMessage(error, 'Não foi possível abrir a receita vinculada.'));
    } finally {
      setIsLoadingRecipeDetail(false);
    }
  }, []);

  if (route === 'comments' && activeCommentsRoute) {
    return (
      <CommentsScreen
        avatarUrl={user?.avatarUrl}
        comments={commentsState.items}
        errorMessage={commentsState.errorMessage}
        hasMore={commentsState.hasMore}
        isLoadingInitial={commentsState.isLoadingInitial}
        isLoadingMore={commentsState.isLoadingMore}
        isSubmitting={commentsState.isSubmitting}
        onBack={() => setRoute('feed')}
        onChangeText={setCommentValue}
        onLoadMore={() => {
          if (commentsState.nextCursor) {
            void loadComments(activeCommentsRoute.publication.id, commentsState.nextCursor);
          }
        }}
        onSubmit={handleSubmitComment}
        value={commentValue}
      />
    );
  }

  if (route === 'recipe-detail') {
    return (
      <RecipeDetailScreen
        errorMessage={recipeDetailError}
        isLoading={isLoadingRecipeDetail}
        onBack={() => setRoute('feed')}
        recipe={selectedRecipeDetail}
      />
    );
  }

  if (route === 'composer') {
    return (
      <FlatList
        contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] }}
        data={availableRecipes}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <AppContainer backgroundColor="background">
            <AppContainer
              align="center"
              backgroundColor="background"
              direction="row"
              marginBottom="xl"
              style={{ minHeight: theme.spacing['5xl'] }}
            >
              <ChevronLeft color={theme.colors.primary} size={theme.spacing['3xl']} onPress={() => setRoute('feed')} />
              <AppText color="text" size="2xl" style={{ fontWeight: theme.fontWeights.bold, marginLeft: theme.spacing.md }}>
                {activeComposerRoute?.publication ? 'Editar publicação' : 'Nova publicação'}
              </AppText>
            </AppContainer>

            <Pressable accessibilityRole="button" onPress={handlePickImage}>
              <AppContainer
                align="center"
                backgroundColor="surface"
                borderRadius="3xl"
                justify="center"
                padding="lg"
                shadow="sm"
                style={{ aspectRatio: 1.02, marginBottom: theme.spacing.xl, overflow: 'hidden' }}
              >
                {composerValues.imageUri ? (
                  <Image source={{ uri: composerValues.imageUri }} style={{ borderRadius: theme.borderRadius['3xl'], height: '100%', width: '100%' }} />
                ) : (
                  <AppContainer align="center" backgroundColor="surface" justify="center">
                    <ImagePlus color={theme.colors.primary} size={theme.spacing['5xl']} />
                    <AppText color="textSecondary" marginTop="md">
                      Toque para selecionar a foto da publicação
                    </AppText>
                  </AppContainer>
                )}
              </AppContainer>
            </Pressable>

            <AppInput
              borderRadius="3xl"
              multiline
              onChangeText={(value) => setComposerValues((current) => ({ ...current, legenda: value }))}
              placeholder="Escreva uma legenda para a receita..."
              style={{ marginBottom: theme.spacing.xl }}
              value={composerValues.legenda}
            />

            <AppContainer backgroundColor="background" marginBottom="lg">
              <AppText color="text" size="lg" style={{ fontWeight: theme.fontWeights.bold }}>
                Vincular a uma receita publicada
              </AppText>
              <AppText color="textSecondary" size="md" style={{ marginTop: theme.spacing.xs }}>
                Escolha uma receita sua já publicada para exibir a tag verde “Acessar receita”.
              </AppText>
            </AppContainer>

            <Pressable
              onPress={() =>
                setComposerValues((current) => ({
                  ...current,
                  recipeId: current.recipeId ? null : availableRecipes[0]?.id ?? null,
                }))
              }
            >
              <AppContainer
                align="center"
                backgroundColor="surface"
                borderRadius="3xl"
                direction="row"
                marginBottom="md"
                padding="lg"
                shadow="sm"
              >
                <Link2 color={theme.colors.primary} size={theme.spacing['2xl']} />
                <AppText color="text" style={{ marginLeft: theme.spacing.md }}>
                  {composerValues.recipeId
                    ? availableRecipes.find((recipe) => recipe.id === composerValues.recipeId)?.title ?? 'Receita vinculada'
                    : 'Selecionar primeira receita publicada disponível'}
                </AppText>
              </AppContainer>
            </Pressable>

            {composerValues.recipeId ? (
              <AppButton
                label="Remover vínculo da receita"
                onPress={() => setComposerValues((current) => ({ ...current, recipeId: null }))}
                variant="secondary"
              />
            ) : null}

            {isLoadingRecipes ? (
              <AppContainer align="center" backgroundColor="background" padding="lg">
                <ActivityIndicator color={theme.colors.primary} />
              </AppContainer>
            ) : null}

            {composerError ? (
              <AppText color="error" marginTop="md">
                {composerError}
              </AppText>
            ) : null}

            <AppButton
              icon={<Save color={theme.colors.textInverse} size={18} />}
              label={activeComposerRoute?.publication ? 'Salvar alterações' : 'Publicar agora'}
              loading={isSavingComposer}
              onPress={handleSaveComposer}
              style={{ marginTop: theme.spacing.xl }}
            />

            {activeComposerRoute?.publication ? (
              <AppButton
                icon={<Trash2 color={theme.colors.textInverse} size={18} />}
                label="Apagar publicação"
                onPress={() => {
                  const publication = activeComposerRoute.publication;

                  if (!publication) {
                    return;
                  }

                  handleDeletePublication(publication);
                  setRoute('feed');
                }}
                style={{ marginTop: theme.spacing.md }}
                backgroundColor="error"
              />
            ) : null}
          </AppContainer>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => setComposerValues((current) => ({ ...current, recipeId: item.id }))}
          >
            <AppContainer
              backgroundColor={composerValues.recipeId === item.id ? 'surfaceSecondary' : 'surface'}
              borderRadius="3xl"
              marginBottom="md"
              padding="lg"
            >
              <AppText color="text" style={{ fontWeight: theme.fontWeights.semibold }}>
                {item.title}
              </AppText>
            </AppContainer>
          </Pressable>
        )}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <FlatList
      contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] }}
      data={feedState.items}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={
        feedState.isLoadingInitial ? (
          <>
            <FeedSkeletonCard />
            <FeedSkeletonCard />
          </>
        ) : (
          <FeedEmptyState
            message={
              feedState.errorMessage ??
              (feedState.searchQuery ? 'Tente outro nome de usuário.' : 'Publique a primeira receita do feed.')
            }
          />
        )
      }
      ListFooterComponent={<FeedListFooter hasMore={feedState.hasMore} isLoadingMore={feedState.isLoadingMore} />}
      ListHeaderComponent={
        <AppContainer backgroundColor="background">
          <AppHeader />
          <AppContainer style={{ height: theme.spacing.xl, backgroundColor: 'transparent' }} />
          <FeedSearchBar
            onChangeText={(value) => dispatchFeed({ type: 'SET_SEARCH_VALUE', payload: value })}
            value={feedState.searchValue}
          />
          <PublicationComposerCard avatarUrl={user?.avatarUrl} onPress={() => void handleOpenComposer()} />
        </AppContainer>
      }
      onEndReached={() => {
        void handleLoadMoreFeed();
      }}
      onEndReachedThreshold={0.4}
      onRefresh={() => {
        void refreshFeed();
      }}
      refreshing={feedState.isRefreshing}
      renderItem={({ item }) => (
        <PublicationCard
          isOwner={item.autor.id === user?.id}
          onDelete={() => handleDeletePublication(item)}
          onEdit={() => void handleOpenComposer(item)}
          onPressComments={() => void openComments(item)}
          onPressLike={() => void handleToggleLike(item)}
          onPressRecipeLink={() => void openLinkedRecipe(item)}
          onPressShare={() => void handleShare(item)}
          publication={item}
        />
      )}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default InicioFlow;
