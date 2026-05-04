import React from 'react';
import { Alert, ScrollView } from 'react-native';

import { AppContainer } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { recipesMock } from './mocks/recipes';
import { RecipeListItem } from './types';
import { RecipeSearchBar, RecipeSection } from './components';

function RecipesHomeScreen() {
  const { theme } = useAppTheme();
  const [searchValue, setSearchValue] = React.useState('');

  const normalizedSearch = searchValue.trim().toLowerCase();
  const myPublications = recipesMock.myPublications.filter((recipe) =>
    recipe.title.toLowerCase().includes(normalizedSearch),
  );
  const favoriteRecipes = recipesMock.favoriteRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(normalizedSearch),
  );

  const handleAddRecipe = () => {
    Alert.alert('Receitas', 'O cadastro completo da receita será implementado na próxima etapa.');
  };

  const handleOpenRecipe = (recipe: RecipeListItem) => {
    Alert.alert('Receita', `A visualização de "${recipe.title}" será implementada na próxima etapa.`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{
        paddingBottom: theme.spacing['7xl'] + theme.spacing['4xl'],
      }}
      showsVerticalScrollIndicator={false}
    >
      <AppContainer>
        <RecipeSearchBar
          onAddRecipe={handleAddRecipe}
          onChangeText={setSearchValue}
          value={searchValue}
        />

        <RecipeSection
          onRecipePress={handleOpenRecipe}
          recipes={myPublications}
          title="Minhas publicações"
        />

        <RecipeSection
          onRecipePress={handleOpenRecipe}
          recipes={favoriteRecipes}
          title="Favoritos"
        />
      </AppContainer>
    </ScrollView>
  );
}

export default RecipesHomeScreen;
