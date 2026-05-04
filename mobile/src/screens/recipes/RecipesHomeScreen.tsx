import React from 'react';
import { ScrollView } from 'react-native';

import { AppContainer, AppHeader } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { recipesMock } from './mocks/recipes';
import { RecipeListItem } from './types';
import { RecipeSearchBar, RecipeSection } from './components';

type RecipesHomeScreenProps = {
  onAddRecipe: () => void;
  onOpenRecipe: (recipe: RecipeListItem) => void;
};

function RecipesHomeScreen({ onAddRecipe, onOpenRecipe }: RecipesHomeScreenProps) {
  const { theme } = useAppTheme();
  const [searchValue, setSearchValue] = React.useState('');

  const normalizedSearch = searchValue.trim().toLowerCase();
  const myPublications = recipesMock.myPublications.filter((recipe) =>
    recipe.title.toLowerCase().includes(normalizedSearch),
  );
  const favoriteRecipes = recipesMock.favoriteRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(normalizedSearch),
  );

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingBottom: theme.spacing['7xl'] + theme.spacing['4xl'],
      }}
      showsVerticalScrollIndicator={false}
    >
      <AppContainer>
        <AppHeader />
        <AppContainer marginBottom="2xl" />

        <RecipeSearchBar
          onAddRecipe={onAddRecipe}
          onChangeText={setSearchValue}
          value={searchValue}
        />

        <RecipeSection
          onRecipePress={onOpenRecipe}
          recipes={myPublications}
          title="Minhas publicações"
        />

        <RecipeSection
          onRecipePress={onOpenRecipe}
          recipes={favoriteRecipes}
          title="Favoritos"
        />
      </AppContainer>
    </ScrollView>
  );
}

export default RecipesHomeScreen;
