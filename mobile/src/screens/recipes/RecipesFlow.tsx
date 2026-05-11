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

type RecipesFlowProps = {
  initialRecipeId?: string | null;
  onInitialRecipeHandled?: () => void;
};

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
      id: recipe.autorId,
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

function buildRecipeCreateFormValues(recipe: RecipeRecord): RecipeCreateFormValues {
  return {
    title: recipe.nome,
    prepMinutes: recipe.tempoPreparoMinutos?.toString() ?? '',
    servings: recipe.rendimentoPorcoes?.toString() ?? '',
    difficulty: mapApiDifficultyToUi(recipe.dificuldade),
    isCollaborative: recipe.isColaborativa,
    selectedIngredients: recipe.ingredientes.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.nome,
      quantity: ingredient.quantidade ?? undefined,
      unit: ingredient.unidade ?? undefined,
    })),
    nutrition: {
      calories: recipe.informacaoNutricional?.calorias?.toString() ?? '',
      proteins: recipe.informacaoNutricional?.proteinas?.toString() ?? '',
      carbohydrates: recipe.informacaoNutricional?.carboidratos?.toString() ?? '',
      fats: recipe.informacaoNutricional?.gorduras?.toString() ?? '',
    },
    preparationSteps: recipe.modoPreparo.map((step) => ({
      id: step.id,
      description: step.descricao,
    })),
    media: [],
  };
}

type RecipeCollectionBucket = 'myPublications' | 'publicRecipes' | 'draftRecipes';

type RecipeCollectionEntry = {
  recipe: RecipeRecord;
  listItem: RecipeListItem;
};

export function buildRecipesCollections(
  recipes: RecipeRecord[],
  currentUserId: string,
  favoriteRecipeIds: string[] = [],
): RecipesHomeCollections {
  const recipesById = new Map<string, RecipeCollectionEntry>();

  recipes.forEach((recipe) => {
    const listItem = buildRecipeListItem(recipe, favoriteRecipeIds);
    const existingEntry = recipesById.get(recipe.id);

    if (!existingEntry) {
      recipesById.set(recipe.id, { recipe, listItem });
      return;
    }

    if (existingEntry.recipe.status === 'RASCUNHO') {
      return;
    }

    if (recipe.status === 'RASCUNHO') {
      recipesById.set(recipe.id, { recipe, listItem });
    }
  });

  return Array.from(recipesById.values()).reduce<RecipesHomeCollections>(
    (collections, entry) => {
      const bucket: RecipeCollectionBucket =
        entry.recipe.status === 'RASCUNHO'
          ? 'draftRecipes'
          : entry.recipe.autorId === currentUserId
            ? 'myPublications'
            : 'publicRecipes';

      collections[bucket].push(entry.listItem);

      if (entry.listItem.isFavorite) {
        collections.favoriteRecipes.push(entry.listItem);
      }

      return collections;
    },
    createEmptyCollections(),
  );
}

function RecipesFlow({ initialRecipeId = null, onInitialRecipeHandled }: RecipesFlowProps) {
  const { user } = useAuth();
  const [currentRoute, setCurrentRoute] = React.useState<RecipesRoute>('home');
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<string | null>(null);
  const [selectedRecipeDetail, setSelectedRecipeDetail] = React.useState<RecipeDetail | null>(null);
  const [editingRecipeId, setEditingRecipeId] = React.useState<string | null>(null);
  const [editingRecipeFormValues, setEditingRecipeFormValues] = React.useState<RecipeCreateFormValues | null>(null);
  const [collections, setCollections] = React.useState<RecipesHomeCollections>(createEmptyCollections);
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const [isCollectionsLoading, setIsCollectionsLoading] = React.useState(true);
  const [collectionsError, setCollectionsError] = React.useState<string | null>(null);
  const [isRecipeLoading, setIsRecipeLoading] = React.useState(false);
  const [recipeError, setRecipeError] = React.useState<string | null>(null);
  const latestRequestedRecipeIdRef = React.useRef<string | null>(null);
  const favoriteRecipeIdsRef = React.useRef<string[]>([]);

  const loadRecipes = React.useCallback(async () => {
    setCollectionsError(null);
    setIsCollectionsLoading(true);

    try {
      const [myRecipes, publicRecipes, favoriteRecipeIds] = await Promise.all([
        recipeService.listMyRecipes(),
        recipeService.listPublicRecipes(),
        recipeService.listFavoriteRecipeIds(),
      ]);
      const publicRecipesFromOthers = publicRecipes.filter((recipe) => recipe.autorId !== user?.id);
      favoriteRecipeIdsRef.current = favoriteRecipeIds;

      setCollections(
        buildRecipesCollections(
          [...myRecipes, ...publicRecipesFromOthers],
          user?.id ?? '',
          favoriteRecipeIds,
        ),
      );
    } catch (error) {
      favoriteRecipeIdsRef.current = [];
      setCollections(createEmptyCollections());
      setCollectionsError(
        getErrorMessage(error, 'Nao foi possivel carregar suas receitas no momento.'),
      );
    } finally {
      setIsCollectionsLoading(false);
    }
  }, [user?.id]);

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

  const handleOpenRecipeById = React.useCallback(
    (recipeId: string) => {
      setFeedbackMessage(null);
      setSelectedRecipeId(recipeId);
      setSelectedRecipeDetail(null);
      setCurrentRoute('detail');
      loadRecipeDetail(recipeId).catch(() => undefined);
    },
    [loadRecipeDetail],
  );

  React.useEffect(() => {
    loadRecipes().catch(() => undefined);
  }, [loadRecipes]);

  React.useEffect(() => {
    if (!initialRecipeId) {
      return;
    }

    handleOpenRecipeById(initialRecipeId);
    onInitialRecipeHandled?.();
  }, [handleOpenRecipeById, initialRecipeId, onInitialRecipeHandled]);

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

  const handleOpenEdit = React.useCallback(
    (recipeId: string) => {
      if (!selectedRecipeDetail) {
        return;
      }

      setFeedbackMessage(null);
      const formValues = buildRecipeCreateFormValues(
        // Converter RecipeDetail de volta para RecipeRecord (aproximação)
        {
          id: selectedRecipeDetail.id,
          nome: selectedRecipeDetail.title,
          tempoPreparoMinutos: selectedRecipeDetail.prepMinutes,
          rendimentoPorcoes: selectedRecipeDetail.servings,
          dificuldade: selectedRecipeDetail.difficulty.toUpperCase() as any,
          isColaborativa: selectedRecipeDetail.isCollaborative,
          status: selectedRecipeDetail.status === 'published' ? 'PUBLICADA' : 'RASCUNHO',
          avaliacaoMedia: selectedRecipeDetail.rating,
          autorId: '',
          autorNome: selectedRecipeDetail.author.name,
          autorUsername: null,
          createdAt: '',
          updatedAt: '',
          midiaPrincipal: null,
          ingredientes: selectedRecipeDetail.ingredients.map((ing) => ({
            id: ing.id,
            nome: ing.name,
            quantidade: ing.quantity !== 'A gosto' ? ing.quantity : null,
            unidade: null,
          })),
          informacaoNutricional: null,
          modoPreparo: selectedRecipeDetail.steps.map((step, idx) => ({
            id: step.id,
            ordem: idx + 1,
            descricao: step.description,
          })),
          midias: [],
        } as RecipeRecord,
      );

      setEditingRecipeId(recipeId);
      setEditingRecipeFormValues(formValues);
      setCurrentRoute('edit');
    },
    [selectedRecipeDetail],
  );

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

  const persistFavoriteToggle = React.useCallback(async (recipeId: string) => {
    const currentFavoriteRecipeIds = favoriteRecipeIdsRef.current;
    const isCurrentlyFavorite = currentFavoriteRecipeIds.includes(recipeId);
    const nextFavoriteRecipeIds = isCurrentlyFavorite
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

    try {
      if (isCurrentlyFavorite) {
        await recipeService.unfavoriteRecipe(recipeId);
      } else {
        await recipeService.favoriteRecipe(recipeId);
      }
    } catch (error) {
      favoriteRecipeIdsRef.current = currentFavoriteRecipeIds;
      setCollections((currentCollections) =>
        syncCollectionsWithFavorites(currentCollections, currentFavoriteRecipeIds),
      );
      setSelectedRecipeDetail((currentRecipeDetail) =>
        currentRecipeDetail && currentRecipeDetail.id === recipeId
          ? {
              ...currentRecipeDetail,
              isFavorite: currentFavoriteRecipeIds.includes(recipeId),
            }
          : currentRecipeDetail,
      );
      setFeedbackMessage(
        getErrorMessage(error, 'Nao foi possivel atualizar seus favoritos.'),
      );
    }
  }, []);

  const handleToggleFavorite = React.useCallback(
    (recipeId: string) => {
      persistFavoriteToggle(recipeId).catch(() => undefined);
    },
    [persistFavoriteToggle],
  );

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

  const handleSubmitEditRecipe = React.useCallback(
    async (
      values: RecipeCreateFormValues,
      status: RecipeStatus,
      options?: SubmitRecipeOptions,
    ) => {
      if (!editingRecipeId) {
        return;
      }

      const updatedRecipe = await recipeService.updateRecipe(
        editingRecipeId,
        buildCreateRecipePayload(values, status),
      );
      let nextRecipe = updatedRecipe;
      let uploadFeedbackMessage: string | null = null;

      if (values.media.length) {
        options?.onUploadStart?.();

        try {
          const uploadPromise = recipeService.uploadRecipeMedia(
            updatedRecipe.id,
            values.media.map((item) => ({
              uri: item.uri,
              name: item.fileName,
              type: item.mimeType,
              mediaType: item.type,
            })),
          );

          const timeout = (ms: number) =>
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('timeout')), ms),
            );

          // 30s timeout to avoid hanging indefinitely
          const uploadedMedia = await Promise.race([uploadPromise, timeout(30000)]) as
            | import('../../services/recipeService').RecipeMediaRecord[]
            | undefined;

          if (Array.isArray(uploadedMedia)) {
            nextRecipe = mergeUploadedMedia(updatedRecipe, uploadedMedia);
          } else {
            uploadFeedbackMessage =
              "A atualização da receita levou tempo demais para enviar as mídias.";
          }
        } catch (error) {
          uploadFeedbackMessage = getErrorMessage(
            error,
            'A receita foi atualizada, mas nao foi possivel enviar as novas midias.',
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

      setFeedbackMessage(uploadFeedbackMessage ?? 'Receita atualizada com sucesso.');
      setSelectedRecipeId(nextRecipe.id);
      setSelectedRecipeDetail(nextDetail);
      setRecipeError(null);
      setIsRecipeLoading(false);
      setCurrentRoute('detail');
      setEditingRecipeId(null);
      setEditingRecipeFormValues(null);
    },
    [editingRecipeId, user],
  );

  const handleEditFromList = React.useCallback(
    async (recipe: RecipeListItem) => {
      setFeedbackMessage(null);
      setSelectedRecipeId(recipe.id);
      setSelectedRecipeDetail(null);
      setCurrentRoute('detail');
      setIsRecipeLoading(true);
      
      try {
        const detailedRecipe = await recipeService.getRecipeById(recipe.id);
        const detail = buildRecipeDetail(detailedRecipe, user, favoriteRecipeIdsRef.current);
        setSelectedRecipeDetail(detail);
        
        const formValues = buildRecipeCreateFormValues(detailedRecipe);
        setEditingRecipeId(recipe.id);
        setEditingRecipeFormValues(formValues);
        setCurrentRoute('edit');
        setIsRecipeLoading(false);
      } catch (error) {
        setIsRecipeLoading(false);
        setFeedbackMessage(
          getErrorMessage(error, 'Não foi possível carregar a receita para edição.'),
        );
      }
    },
    [user],
  );

  const handleDeleteFromList = React.useCallback(
    async (recipe: RecipeListItem) => {
      setFeedbackMessage(null);
      
      try {
        await recipeService.deleteRecipe(recipe.id);
        
        setCollections((current) => ({
          ...current,
          myPublications: current.myPublications.filter((r) => r.id !== recipe.id),
          draftRecipes: current.draftRecipes.filter((r) => r.id !== recipe.id),
        }));
        
        setFeedbackMessage('Receita excluída com sucesso.');
      } catch (error) {
        setFeedbackMessage(
          getErrorMessage(error, 'Não foi possível excluir a receita.'),
        );
      }
    },
    [],
  );

  if (currentRoute === 'create') {
    return <RecipesCreateScreen onBack={handleGoHome} onSubmitRecipe={handleSubmitRecipe} />;
  }

  if (currentRoute === 'edit' && editingRecipeId) {
    return (
      <RecipesCreateScreen
        editingRecipeId={editingRecipeId}
        initialValues={editingRecipeFormValues}
        onBack={handleGoHome}
        onSubmitRecipe={handleSubmitEditRecipe}
      />
    );
  }

  if (currentRoute === 'detail' && selectedRecipeId) {
    return (
      <RecipeDetailScreen
        errorMessage={recipeError}
        isLoading={isRecipeLoading}
        onBack={handleGoHome}
        onEdit={selectedRecipeDetail?.author?.id === user?.id ? handleOpenEdit : undefined}
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
      onEditRecipe={handleEditFromList}
      onDeleteRecipe={handleDeleteFromList}
      onRetryLoad={loadRecipes}
    />
  );
}

export default RecipesFlow;
