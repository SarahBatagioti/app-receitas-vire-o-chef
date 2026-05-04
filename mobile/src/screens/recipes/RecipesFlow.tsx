import React from 'react';

import { useAuth } from '../../hooks/useAuth';
import {
  CreateRecipePayload,
  RecipeApiDifficulty,
  RecipeApiStatus,
  RecipeRecord,
  recipeService,
} from '../../services/recipeService';
import { cloneRecipeDetails, cloneRecipesCollections } from './mocks/recipes';
import RecipeDetailScreen from './RecipeDetailScreen';
import RecipesCreateScreen from './RecipesCreateScreen';
import RecipesHomeScreen from './RecipesHomeScreen';
import {
  RecipeCreateFormValues,
  RecipeDetail,
  RecipeListItem,
  RecipeStatus,
  RecipesHomeCollections,
  RecipesRoute,
} from './types';

const RECIPE_PLACEHOLDER_IMAGE =
  'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=900&q=80';

const STEP_ACCENTS: Array<'brandGreen' | 'brandYellow' | 'brandOrange'> = [
  'brandGreen',
  'brandYellow',
  'brandOrange',
];

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

function hasAnyNutritionValue(values: NonNullable<CreateRecipePayload['informacaoNutricional']>): boolean {
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

function buildRecipeListItem(recipe: RecipeRecord): RecipeListItem {
  return {
    id: recipe.id,
    title: recipe.nome,
    imageUrl: recipe.midiaPrincipal?.url ?? RECIPE_PLACEHOLDER_IMAGE,
    difficulty: mapApiDifficultyToUi(recipe.dificuldade),
    prepMinutes: recipe.tempoPreparoMinutos ?? 0,
    rating: recipe.avaliacaoMedia,
    servings: recipe.rendimentoPorcoes ?? 0,
    isCollaborative: recipe.isColaborativa,
    status: mapApiStatusToUi(recipe.status),
  };
}

function formatNutritionValue(value: number | null, suffix: string) {
  return value !== null ? `${value} ${suffix}` : `0 ${suffix}`;
}

function buildRecipeDetail(recipe: RecipeRecord, authorName: string): RecipeDetail {
  const listItem = buildRecipeListItem(recipe);

  return {
    ...listItem,
    reviewsCount: 0,
    commentsCount: 0,
    author: {
      name: authorName,
      followers: 1258,
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
    nutrition: {
      calories: formatNutritionValue(recipe.informacaoNutricional?.calorias ?? null, 'kcal'),
      proteins: formatNutritionValue(recipe.informacaoNutricional?.proteinas ?? null, 'g'),
      carbohydrates: formatNutritionValue(recipe.informacaoNutricional?.carboidratos ?? null, 'g'),
      fats: formatNutritionValue(recipe.informacaoNutricional?.gorduras ?? null, 'g'),
    },
    ingredients: recipe.ingredientes.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.nome,
      quantity: ingredient.quantidade ?? ingredient.unidade ?? 'a gosto',
      imageUrl:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=300&q=80',
    })),
    steps: recipe.modoPreparo.map((step, index) => ({
      id: step.id,
      title: `Passo ${step.ordem}`,
      description: step.descricao,
      accentColor: STEP_ACCENTS[index % STEP_ACCENTS.length],
    })),
  };
}

function RecipesFlow() {
  const { user } = useAuth();
  const [currentRoute, setCurrentRoute] = React.useState<RecipesRoute>('home');
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<string | null>(null);
  const [collections, setCollections] = React.useState<RecipesHomeCollections>(() =>
    cloneRecipesCollections(),
  );
  const [recipeDetails, setRecipeDetails] = React.useState<Record<string, RecipeDetail>>(() =>
    cloneRecipeDetails(),
  );
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);

  const selectedRecipeDetail = selectedRecipeId ? recipeDetails[selectedRecipeId] : undefined;

  const handleGoHome = React.useCallback(() => {
    setCurrentRoute('home');
    setSelectedRecipeId(null);
  }, []);

  const handleOpenCreate = React.useCallback(() => {
    setFeedbackMessage(null);
    setCurrentRoute('create');
  }, []);

  const handleOpenRecipe = React.useCallback((recipe: RecipeListItem) => {
    setFeedbackMessage(null);
    setSelectedRecipeId(recipe.id);
    setCurrentRoute('detail');
  }, []);

  const handleSubmitRecipe = React.useCallback(
    async (values: RecipeCreateFormValues, status: RecipeStatus) => {
      const createdRecipe = await recipeService.createRecipe(
        buildCreateRecipePayload(values, status),
      );
      const nextListItem = buildRecipeListItem(createdRecipe);
      const nextDetail = buildRecipeDetail(createdRecipe, user?.name ?? 'Você');
      const nextStatus = mapApiStatusToUi(createdRecipe.status);

      setCollections((current) => ({
        ...current,
        myPublications: current.myPublications.filter((recipe) => recipe.id !== createdRecipe.id),
        draftRecipes: current.draftRecipes.filter((recipe) => recipe.id !== createdRecipe.id),
      }));
      setCollections((current) => ({
        ...current,
        myPublications:
          nextStatus === 'published'
            ? [nextListItem, ...current.myPublications]
            : current.myPublications,
        draftRecipes:
          nextStatus === 'draft' ? [nextListItem, ...current.draftRecipes] : current.draftRecipes,
      }));
      setRecipeDetails((current) => ({
        ...current,
        [createdRecipe.id]: nextDetail,
      }));

      if (nextStatus === 'published') {
        setFeedbackMessage('Receita publicada com sucesso.');
        setSelectedRecipeId(createdRecipe.id);
        setCurrentRoute('detail');
        return;
      }

      setFeedbackMessage('Rascunho salvo com sucesso.');
      setCurrentRoute('home');
      setSelectedRecipeId(null);
    },
    [user?.name],
  );

  if (currentRoute === 'create') {
    return <RecipesCreateScreen onBack={handleGoHome} onSubmitRecipe={handleSubmitRecipe} />;
  }

  if (currentRoute === 'detail' && selectedRecipeDetail) {
    return <RecipeDetailScreen onBack={handleGoHome} recipe={selectedRecipeDetail} />;
  }

  return (
    <RecipesHomeScreen
      collections={collections}
      feedbackMessage={feedbackMessage}
      onAddRecipe={handleOpenCreate}
      onOpenRecipe={handleOpenRecipe}
    />
  );
}

export default RecipesFlow;
