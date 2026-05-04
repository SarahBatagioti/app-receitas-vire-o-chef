import React from 'react';

import { useAuth } from '../../hooks/useAuth';
import { AuthUser } from '../../types/auth';
import { getErrorMessage } from '../../services/api';
import {
  CreateRecipePayload,
  RecipeApiDifficulty,
  RecipeApiMediaType,
  RecipeApiStatus,
  RecipeMediaRecord,
  RecipeRecord,
  recipeService,
} from '../../services/recipeService';
import RecipeDetailScreen from './RecipeDetailScreen';
import RecipesCreateScreen from './RecipesCreateScreen';
import RecipesHomeScreen from './RecipesHomeScreen';
import {
  RecipeCreateFormValues,
  RecipeDetail,
  RecipeDetailMedia,
  RecipeListItem,
  RecipeStatus,
  RecipesHomeCollections,
  RecipesRoute,
} from './types';

const STEP_ACCENTS: Array<'brandGreen' | 'brandYellow' | 'brandOrange'> = [
  'brandGreen',
  'brandYellow',
  'brandOrange',
];

type SubmitRecipeOptions = {
  onUploadStart?: () => void;
};

function createEmptyCollections(): RecipesHomeCollections {
  return {
    myPublications: [],
    publicRecipes: [],
    favoriteRecipes: [],
    draftRecipes: [],
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
    case 'INTERMEDIARIO':
    default:
      return 'intermediario';
  }
}

function mapUiDifficultyToApi(
  difficulty: RecipeCreateFormValues['difficulty'],
): RecipeApiDifficulty {
  switch (difficulty) {
    case 'facil':
      return 'FACIL';
    case 'dificil':
      return 'DIFICIL';
    case 'intermediario':
    default:
      return 'INTERMEDIARIO';
  }
}

function mapApiStatusToUi(status: RecipeApiStatus): RecipeStatus {
  return status === 'PUBLICADA' ? 'published' : 'draft';
}

function mapApiMediaTypeToUi(type: RecipeApiMediaType): 'image' | 'video' {
  return type === 'VIDEO' ? 'video' : 'image';
}

function toOptionalPositiveNumber(value: string): number | undefined {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return undefined;
  }

  const parsedValue = Number(normalizedValue);

  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return undefined;
  }

  return parsedValue;
}

function hasAnyNutritionValue(
  values: NonNullable<CreateRecipePayload['informacaoNutricional']>,
): boolean {
  return Object.values(values).some((value) => typeof value === 'number');
}

function buildCreateRecipePayload(
  formValues: RecipeCreateFormValues,
  status: RecipeStatus,
): CreateRecipePayload {
  const nutrition = {
    calorias: toOptionalPositiveNumber(formValues.nutrition.calories),
    proteinas: toOptionalPositiveNumber(formValues.nutrition.proteins),
    carboidratos: toOptionalPositiveNumber(formValues.nutrition.carbohydrates),
    gorduras: toOptionalPositiveNumber(formValues.nutrition.fats),
  };

  return {
    nome: formValues.title.trim(),
    tempoPreparoMinutos: toOptionalPositiveNumber(formValues.prepMinutes),
    rendimentoPorcoes: toOptionalPositiveNumber(formValues.servings),
    dificuldade: mapUiDifficultyToApi(formValues.difficulty),
    isColaborativa: formValues.isCollaborative,
    status: status === 'published' ? 'PUBLICADA' : 'RASCUNHO',
    ingredientes: formValues.selectedIngredients.map((ingredient) => ({
      nome: ingredient.name.trim(),
      quantidade: ingredient.quantity?.trim() || undefined,
      unidade: ingredient.unit?.trim() || undefined,
    })),
    informacaoNutricional: hasAnyNutritionValue(nutrition) ? nutrition : null,
    modoPreparo: formValues.preparationSteps
      .map((step, index) => ({
        ordem: index + 1,
        descricao: step.description.trim(),
      }))
      .filter((step) => step.descricao.length > 0),
  };
}

function getPrimaryMedia(recipe: RecipeRecord): RecipeMediaRecord | null {
  if (recipe.midiaPrincipal) {
    return recipe.midiaPrincipal;
  }

  return recipe.midias[0] ?? null;
}

function getPrimaryImageUrl(recipe: RecipeRecord): string | null {
  const primaryMedia =
    recipe.midias.find((media) => media.tipo === 'IMAGEM') ??
    (recipe.midiaPrincipal?.tipo === 'IMAGEM' ? recipe.midiaPrincipal : null);

  return primaryMedia?.url ?? null;
}

function mergeUploadedMedia(recipe: RecipeRecord, uploadedMedia: RecipeMediaRecord[]): RecipeRecord {
  const nextMedia = [...recipe.midias, ...uploadedMedia].sort(
    (left, right) => left.ordem - right.ordem,
  );

  return {
    ...recipe,
    midiaPrincipal: nextMedia[0] ?? recipe.midiaPrincipal,
    midias: nextMedia,
  };
}

function buildRecipeListItem(
  recipe: RecipeRecord,
  favoriteRecipeIds: string[] = [],
): RecipeListItem {
  return {
    id: recipe.id,
    title: recipe.nome,
    imageUrl: getPrimaryImageUrl(recipe),
    difficulty: mapApiDifficultyToUi(recipe.dificuldade),
    prepMinutes: recipe.tempoPreparoMinutos ?? 0,
    rating: recipe.avaliacaoMedia,
    servings: recipe.rendimentoPorcoes ?? 0,
    authorName: recipe.autorNome || recipe.autorUsername || 'Autor da receita',
    isFavorite: favoriteRecipeIds.includes(recipe.id),
    isCollaborative: recipe.isColaborativa,
    status: mapApiStatusToUi(recipe.status),
  };
}

function syncCollectionsWithFavorites(
  collections: RecipesHomeCollections,
  favoriteRecipeIds: string[],
): RecipesHomeCollections {
  const favoriteIdsSet = new Set(favoriteRecipeIds);
  const applyFavoriteFlag = (recipes: RecipeListItem[]) =>
    recipes.map((recipe) => ({
      ...recipe,
      isFavorite: favoriteIdsSet.has(recipe.id),
    }));

  const myPublications = applyFavoriteFlag(collections.myPublications);
  const publicRecipes = applyFavoriteFlag(collections.publicRecipes);
  const draftRecipes = applyFavoriteFlag(collections.draftRecipes);
  const allRecipes = [...myPublications, ...publicRecipes, ...draftRecipes];
  const favoriteRecipes = favoriteRecipeIds.reduce<RecipeListItem[]>((recipes, recipeId) => {
    const matchingRecipe = allRecipes.find((recipe) => recipe.id === recipeId);

    if (matchingRecipe) {
      recipes.push(matchingRecipe);
    }

    return recipes;
  }, []);

  return {
    myPublications,
    publicRecipes,
    favoriteRecipes,
    draftRecipes,
  };
}

function buildRecipesCollections(
  recipes: RecipeRecord[],
  currentUserId: string,
  favoriteRecipeIds: string[] = [],
): RecipesHomeCollections {
  return recipes.reduce<RecipesHomeCollections>(
    (collections, recipe) => {
      const listItem = buildRecipeListItem(recipe, favoriteRecipeIds);

      if (recipe.status === 'RASCUNHO') {
        collections.draftRecipes.push(listItem);
      } else if (recipe.autorId === currentUserId) {
        collections.myPublications.push(listItem);
      } else {
        collections.publicRecipes.push(listItem);
      }

      if (listItem.isFavorite) {
        collections.favoriteRecipes.push(listItem);
      }

      return collections;
    },
    createEmptyCollections(),
  );
}

function formatNutritionValue(value: number | null, suffix: string) {
  return value !== null ? `${value} ${suffix}` : `0 ${suffix}`;
}

function formatIngredientQuantity(quantity: string | null, unit: string | null): string {
  const valueParts = [quantity, unit].filter(
    (item): item is string => Boolean(item && item.trim()),
  );

  return valueParts.length ? valueParts.join(' ') : 'A gosto';
}

function mapRecipeDetailMedia(media: RecipeMediaRecord): RecipeDetailMedia {
  return {
    id: media.id,
    type: mapApiMediaTypeToUi(media.tipo),
    url: media.url,
    fileName: media.nomeArquivo ?? `${media.tipo.toLowerCase()}-${media.ordem}`,
  };
}

function buildRecipeDetail(
  recipe: RecipeRecord,
  user: AuthUser | null,
  favoriteRecipeIds: string[] = [],
): RecipeDetail {
  const listItem = buildRecipeListItem(recipe, favoriteRecipeIds);
  const orderedMedia = [...recipe.midias].sort((left, right) => left.ordem - right.ordem);
  const media = orderedMedia.map(mapRecipeDetailMedia);
  const primaryMediaRecord = getPrimaryMedia(recipe);
  const primaryMedia = primaryMediaRecord ? mapRecipeDetailMedia(primaryMediaRecord) : media[0] ?? null;
  const mediaWithPrimary =
    primaryMedia && !media.some((item) => item.id === primaryMedia.id)
      ? [primaryMedia, ...media]
      : media;

  return {
    ...listItem,
    reviewsCount: 0,
    commentsCount: 0,
    author: {
      name: recipe.autorNome || user?.name || 'Autor da receita',
      subtitle: recipe.autorUsername ? `@${recipe.autorUsername}` : user?.email ?? undefined,
      avatarUrl: user?.avatarUrl ?? null,
    },
    primaryMedia,
    nutrition: {
      calories: formatNutritionValue(recipe.informacaoNutricional?.calorias ?? null, 'kcal'),
      proteins: formatNutritionValue(recipe.informacaoNutricional?.proteinas ?? null, 'g'),
      carbohydrates: formatNutritionValue(recipe.informacaoNutricional?.carboidratos ?? null, 'g'),
      fats: formatNutritionValue(recipe.informacaoNutricional?.gorduras ?? null, 'g'),
    },
    ingredients: recipe.ingredientes.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.nome,
      quantity: formatIngredientQuantity(ingredient.quantidade, ingredient.unidade),
      imageUrl: null,
    })),
    steps: recipe.modoPreparo.map((step, index) => ({
      id: step.id,
      title: `Passo ${step.ordem}`,
      description: step.descricao,
      accentColor: STEP_ACCENTS[index % STEP_ACCENTS.length],
    })),
    media: mediaWithPrimary,
  };
}

function RecipesFlow() {
  const { user } = useAuth();
  const [currentRoute, setCurrentRoute] = React.useState<RecipesRoute>('home');
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<string | null>(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = React.useState<RecipeDetail | null>(null);
  const [collections, setCollections] = React.useState<RecipesHomeCollections>(() =>
    createEmptyCollections(),
  );
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [isCollectionsLoading, setIsCollectionsLoading] = React.useState(true);
  const [collectionsError, setCollectionsError] = React.useState<string | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = React.useState(false);
  const [recipeError, setRecipeError] = React.useState<string | null>(null);
  const [, setFavoriteRecipeIds] = React.useState<string[]>([]);
  const latestRequestedRecipeIdRef = React.useRef<string | null>(null);
  const favoriteRecipeIdsRef = React.useRef<string[]>([]);

  const loadRecipes = React.useCallback(async () => {
    setCollectionsError(null);
    setIsCollectionsLoading(true);

    try {
      const [myRecipes, publicRecipes] = await Promise.all([
        recipeService.listMyRecipes(),
        recipeService.listPublicRecipes(),
      ]);
      const publicRecipesFromOthers = publicRecipes.filter((recipe) => recipe.autorId !== user?.id);

      setCollections(
        buildRecipesCollections(
          [...myRecipes, ...publicRecipesFromOthers],
          user?.id ?? '',
          favoriteRecipeIdsRef.current,
        ),
      );
    } catch (error) {
      setCollections(createEmptyCollections());
      setCollectionsError(
        getErrorMessage(error, 'Nao foi possivel carregar suas receitas no momento.'),
      );
    } finally {
      setIsCollectionsLoading(false);
    }
  }, []);

  const loadRecipeDetail = React.useCallback(
    async (recipeId: string) => {
      latestRequestedRecipeIdRef.current = recipeId;
      setRecipeError(null);
      setIsRecipeLoading(true);

      try {
        const recipe = await recipeService.getRecipeById(recipeId);

        if (latestRequestedRecipeIdRef.current !== recipeId) {
          return;
        }

        setSelectedRecipeDetail(buildRecipeDetail(recipe, user, favoriteRecipeIdsRef.current));
      } catch (error) {
        if (latestRequestedRecipeIdRef.current !== recipeId) {
          return;
        }

        setSelectedRecipeDetail(null);
        setRecipeError(
          getErrorMessage(error, 'Nao foi possivel carregar os detalhes da receita.'),
        );
      } finally {
        if (latestRequestedRecipeIdRef.current === recipeId) {
          setIsRecipeLoading(false);
        }
      }
    },
    [user],
  );

  React.useEffect(() => {
    loadRecipes().catch(() => undefined);
  }, [loadRecipes]);

  const handleGoHome = React.useCallback(() => {
    latestRequestedRecipeIdRef.current = null;
    setCurrentRoute('home');
    setSelectedRecipeId(null);
    setSelectedRecipeDetail(null);
    setRecipeError(null);
    setIsRecipeLoading(false);
  }, []);

  const handleOpenCreate = React.useCallback(() => {
    setFeedbackMessage(null);
    setCurrentRoute('create');
  }, []);

  const handleOpenRecipe = React.useCallback(
    (recipe: RecipeListItem) => {
      setFeedbackMessage(null);
      setSelectedRecipeId(recipe.id);
      setSelectedRecipeDetail(null);
      setCurrentRoute('detail');
      loadRecipeDetail(recipe.id).catch(() => undefined);
    },
    [loadRecipeDetail],
  );

  const handleRetryRecipe = React.useCallback(() => {
    if (!selectedRecipeId) {
      return;
    }

    loadRecipeDetail(selectedRecipeId).catch(() => undefined);
  }, [loadRecipeDetail, selectedRecipeId]);

  const handleToggleFavorite = React.useCallback((recipeId: string) => {
    setFavoriteRecipeIds((currentFavoriteRecipeIds) => {
      const nextFavoriteRecipeIds = currentFavoriteRecipeIds.includes(recipeId)
        ? currentFavoriteRecipeIds.filter((currentRecipeId) => currentRecipeId !== recipeId)
        : [recipeId, ...currentFavoriteRecipeIds];

      favoriteRecipeIdsRef.current = nextFavoriteRecipeIds;
      setCollections((currentCollections) =>
        syncCollectionsWithFavorites(currentCollections, nextFavoriteRecipeIds),
      );
      setSelectedRecipeDetail((currentRecipeDetail) =>
        currentRecipeDetail && currentRecipeDetail.id === recipeId
          ? {
              ...currentRecipeDetail,
              isFavorite: nextFavoriteRecipeIds.includes(recipeId),
            }
          : currentRecipeDetail,
      );

      return nextFavoriteRecipeIds;
    });
  }, []);

  const handleToggleFavoriteFromList = React.useCallback(
    (recipe: RecipeListItem) => {
      handleToggleFavorite(recipe.id);
    },
    [handleToggleFavorite],
  );

  const handleSubmitRecipe = React.useCallback(
    async (
      values: RecipeCreateFormValues,
      status: RecipeStatus,
      options?: SubmitRecipeOptions,
    ) => {
      const createdRecipe = await recipeService.createRecipe(
        buildCreateRecipePayload(values, status),
      );
      let nextRecipe = createdRecipe;
      let uploadFeedbackMessage: string | null = null;

      if (values.media.length) {
        options?.onUploadStart?.();

        try {
          const uploadedMedia = await recipeService.uploadRecipeMedia(
            createdRecipe.id,
            values.media.map((item) => ({
              uri: item.uri,
              name: item.fileName,
              type: item.mimeType,
              mediaType: item.type,
            })),
          );

          nextRecipe = mergeUploadedMedia(createdRecipe, uploadedMedia);
        } catch (error) {
          uploadFeedbackMessage = getErrorMessage(
            error,
            'A receita foi criada, mas nao foi possivel enviar as midias.',
          );
        }
      }

      const nextListItem = buildRecipeListItem(nextRecipe, favoriteRecipeIdsRef.current);
      const nextDetail = buildRecipeDetail(nextRecipe, user, favoriteRecipeIdsRef.current);
      const nextStatus = mapApiStatusToUi(nextRecipe.status);

      setCollections((current) => ({
        ...current,
        myPublications: current.myPublications.filter((recipe) => recipe.id !== nextRecipe.id),
        publicRecipes: current.publicRecipes.filter((recipe) => recipe.id !== nextRecipe.id),
        draftRecipes: current.draftRecipes.filter((recipe) => recipe.id !== nextRecipe.id),
      }));
      setCollections((current) => ({
        ...current,
        myPublications:
          nextStatus === 'published'
            ? [nextListItem, ...current.myPublications]
            : current.myPublications,
        publicRecipes: current.publicRecipes,
        draftRecipes:
          nextStatus === 'draft' ? [nextListItem, ...current.draftRecipes] : current.draftRecipes,
      }));

      if (nextStatus === 'published') {
        setFeedbackMessage(uploadFeedbackMessage ?? 'Receita publicada com sucesso.');
        setSelectedRecipeId(nextRecipe.id);
        setSelectedRecipeDetail(nextDetail);
        setRecipeError(null);
        setIsRecipeLoading(false);
        setCurrentRoute('detail');
        return;
      }

      setFeedbackMessage(uploadFeedbackMessage ?? 'Rascunho salvo com sucesso.');
      setCurrentRoute('home');
      setSelectedRecipeId(null);
      setSelectedRecipeDetail(null);
    },
    [user],
  );

  if (currentRoute === 'create') {
    return <RecipesCreateScreen onBack={handleGoHome} onSubmitRecipe={handleSubmitRecipe} />;
  }

  if (currentRoute === 'detail' && selectedRecipeId) {
    return (
      <RecipeDetailScreen
        errorMessage={recipeError}
        isLoading={isRecipeLoading}
        onBack={handleGoHome}
        onRetry={handleRetryRecipe}
        onToggleFavorite={handleToggleFavorite}
        recipe={selectedRecipeDetail}
      />
    );
  }

  return (
    <RecipesHomeScreen
      collections={collections}
      feedbackMessage={feedbackMessage}
      isLoading={isCollectionsLoading}
      loadError={collectionsError}
      onAddRecipe={handleOpenCreate}
      onOpenRecipe={handleOpenRecipe}
      onToggleFavorite={handleToggleFavoriteFromList}
      onRetryLoad={loadRecipes}
    />
  );
}

export default RecipesFlow;
