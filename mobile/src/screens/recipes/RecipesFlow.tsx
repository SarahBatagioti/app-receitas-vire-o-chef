import React from 'react';

import { getRecipeDetailById } from './mocks/recipes';
import RecipeDetailScreen from './RecipeDetailScreen';
import RecipesCreateScreen from './RecipesCreateScreen';
import RecipesHomeScreen from './RecipesHomeScreen';
import { RecipeListItem, RecipesRoute } from './types';

function RecipesFlow() {
  const [currentRoute, setCurrentRoute] = React.useState<RecipesRoute>('home');
  const [selectedRecipeId, setSelectedRecipeId] = React.useState<string | null>(null);

  const selectedRecipeDetail = selectedRecipeId ? getRecipeDetailById(selectedRecipeId) : undefined;

  const handleGoHome = React.useCallback(() => {
    setCurrentRoute('home');
    setSelectedRecipeId(null);
  }, []);

  const handleOpenCreate = React.useCallback(() => {
    setCurrentRoute('create');
  }, []);

  const handleOpenRecipe = React.useCallback((recipe: RecipeListItem) => {
    setSelectedRecipeId(recipe.id);
    setCurrentRoute('detail');
  }, []);

  if (currentRoute === 'create') {
    return <RecipesCreateScreen onBack={handleGoHome} />;
  }

  if (currentRoute === 'detail' && selectedRecipeDetail) {
    return <RecipeDetailScreen onBack={handleGoHome} recipe={selectedRecipeDetail} />;
  }

  return <RecipesHomeScreen onAddRecipe={handleOpenCreate} onOpenRecipe={handleOpenRecipe} />;
}

export default RecipesFlow;
