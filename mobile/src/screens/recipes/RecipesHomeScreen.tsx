import React from 'react';
import { ScrollView } from 'react-native';

import { AppButton, AppContainer, AppHeader, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { RecipeListItem, RecipesHomeCollections } from './types';
import { RecipeSearchBar, RecipeSection } from './components';

type RecipesHomeScreenProps = {
  collections: RecipesHomeCollections;
  feedbackMessage?: string | null;
  isLoading?: boolean;
  loadError?: string | null;
  onAddRecipe: () => void;
  onOpenRecipe: (recipe: RecipeListItem) => void;
  onToggleFavorite: (recipe: RecipeListItem) => void;
  onRetryLoad?: () => void;
};

function RecipesHomeScreen({
  collections,
  feedbackMessage,
  isLoading = false,
  loadError,
  onAddRecipe,
  onOpenRecipe,
  onToggleFavorite,
  onRetryLoad,
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

        {isLoading ? (
          <AppContainer backgroundColor="surface" borderRadius="3xl" marginBottom="xl" padding="lg" shadow="sm">
            <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
              Carregando receitas...
            </AppText>
            <AppText color="textSecondary" marginTop="xs" size="md">
              Buscando suas publicacoes e rascunhos mais recentes.
            </AppText>
          </AppContainer>
        ) : null}

        {loadError ? (
          <AppContainer backgroundColor="surface" borderRadius="3xl" marginBottom="xl" padding="lg" shadow="sm">
            <AppText color="error" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
              Nao foi possivel carregar suas receitas.
            </AppText>
            <AppText color="textSecondary" marginTop="xs" size="md">
              {loadError}
            </AppText>
            {onRetryLoad ? (
              <AppButton
                label="Tentar novamente"
                onPress={onRetryLoad}
                size="md"
                style={{ alignSelf: 'flex-start', marginTop: theme.spacing.md }}
              />
            ) : null}
          </AppContainer>
        ) : null}

        <RecipeSection
          onRecipePress={onOpenRecipe}
          onToggleFavorite={onToggleFavorite}
          recipes={myPublications}
          title="Minhas publicações"
        />

        <RecipeSection
          onRecipePress={onOpenRecipe}
          onToggleFavorite={onToggleFavorite}
          recipes={favoriteRecipes}
          title="Favoritos"
        />

        {draftRecipes.length ? (
          <RecipeSection
            onRecipePress={onOpenRecipe}
            onToggleFavorite={onToggleFavorite}
            recipes={draftRecipes}
            title="Rascunhos"
          />
        ) : null}
      </AppContainer>
    </ScrollView>
  );
}

export default RecipesHomeScreen;
