import React from 'react';

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

function buildRecipeListItem(
  formValues: RecipeCreateFormValues,
  status: RecipeStatus,
  recipeId: string,
): RecipeListItem {
  return {
    id: recipeId,
    title: formValues.title.trim(),
    imageUrl: RECIPE_PLACEHOLDER_IMAGE,
    difficulty: formValues.difficulty,
    prepMinutes: Number(formValues.prepMinutes) || 0,
    rating: 0,
    servings: Number(formValues.servings) || 0,
    isCollaborative: formValues.isCollaborative,
    status,
  };
}

function formatNutritionValue(value: string, suffix: string) {
  const normalizedValue = value.trim();
  return normalizedValue ? `${normalizedValue} ${suffix}` : `0 ${suffix}`;
}

function buildRecipeDetail(
  formValues: RecipeCreateFormValues,
  status: RecipeStatus,
  recipeId: string,
): RecipeDetail {
  const listItem = buildRecipeListItem(formValues, status, recipeId);

  return {
    ...listItem,
    reviewsCount: 0,
    commentsCount: 0,
    author: {
      name: 'Sarah Batagioti',
      followers: 1258,
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
    nutrition: {
      calories: formatNutritionValue(formValues.nutrition.calories, 'kcal'),
      proteins: formatNutritionValue(formValues.nutrition.proteins, 'g'),
      carbohydrates: formatNutritionValue(formValues.nutrition.carbohydrates, 'g'),
      fats: formatNutritionValue(formValues.nutrition.fats, 'g'),
    },
    ingredients: formValues.selectedIngredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.name,
      quantity: ingredient.quantity || ingredient.unit || 'a gosto',
      imageUrl:
        'https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=300&q=80',
    })),
    steps: formValues.preparationSteps.map((step, index) => ({
      id: step.id,
      title: `Passo ${index + 1}`,
      description: step.description.trim() || 'Passo em construção.',
      accentColor: STEP_ACCENTS[index % STEP_ACCENTS.length],
    })),
  };
}

function RecipesFlow() {
  const [currentRoute, setCurrentRoute] = React.useState<RecipesRoute>('home');
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<string | null>(null);
  const [collections, setCollections] = React.useState<RecipesHomeCollections>(() =>
    cloneRecipesCollections(),
  );
  const [recipeDetails, setRecipeDetails] = React.useState<Record<string, RecipeDetail>>(() =>
    cloneRecipeDetails(),
  );
  const [feedbackMessage, setFeedbackMessage] = React.useState<string | null>(null);
  const nextRecipeId = React.useRef(100);

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
    (values: RecipeCreateFormValues, status: RecipeStatus) => {
      const recipeId = `recipe-created-${nextRecipeId.current}`;
      nextRecipeId.current += 1;

      const nextListItem = buildRecipeListItem(values, status, recipeId);
      const nextDetail = buildRecipeDetail(values, status, recipeId);

      setCollections((current) => ({
        ...current,
        myPublications:
          status === 'published' ? [nextListItem, ...current.myPublications] : current.myPublications,
        draftRecipes:
          status === 'draft' ? [nextListItem, ...current.draftRecipes] : current.draftRecipes,
      }));
      setRecipeDetails((current) => ({
        ...current,
        [recipeId]: nextDetail,
      }));
      setFeedbackMessage(
        status === 'published'
          ? 'Receita publicada em Minhas publicações.'
          : 'Rascunho salvo com sucesso.',
      );
      setCurrentRoute('home');
      setSelectedRecipeId(null);
    },
    [],
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
