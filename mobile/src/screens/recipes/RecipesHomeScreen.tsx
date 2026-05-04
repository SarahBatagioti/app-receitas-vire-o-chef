import React from 'react';
import { ScrollView } from 'react-native';

import { AppContainer, AppHeader, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { RecipeListItem, RecipesHomeCollections } from './types';
import { RecipeSearchBar, RecipeSection } from './components';

type RecipesHomeScreenProps = {
  collections: RecipesHomeCollections;
  feedbackMessage?: string | null;
  onAddRecipe: () => void;
  onOpenRecipe: (recipe: RecipeListItem) => void;
};

function RecipesHomeScreen({
  collections,
  feedbackMessage,
  onAddRecipe,
  onOpenRecipe,
}: RecipesHomeScreenProps) {
  const { theme } = useAppTheme();
  const [searchValue, setSearchValue] = React.useState('');

  const normalizedSearch = searchValue.trim().toLowerCase();
  const myPublications = collections.myPublications.filter((recipe) =>
    recipe.title.toLowerCase().includes(normalizedSearch),
  );
  const favoriteRecipes = collections.favoriteRecipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(normalizedSearch),
  );
  const draftRecipes = collections.draftRecipes.filter((recipe) =>
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

        {feedbackMessage ? (
          <AppContainer
            backgroundColor="success"
            borderRadius="3xl"
            padding="md"
            marginBottom="xl"
          >
            <AppText color="textInverse" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
              {feedbackMessage}
            </AppText>
          </AppContainer>
        ) : null}

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

        {draftRecipes.length ? (
          <RecipeSection
            onRecipePress={onOpenRecipe}
            recipes={draftRecipes}
            title="Rascunhos"
          />
        ) : null}
      </AppContainer>
    </ScrollView>
  );
}

export default RecipesHomeScreen;
