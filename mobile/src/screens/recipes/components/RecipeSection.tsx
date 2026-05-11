import React from 'react';
import { ScrollView } from 'react-native';

import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeListItem } from '../types';
import RecipeCard from './RecipeCard';

type RecipeSectionProps = {
  title: string;
  recipes: RecipeListItem[];
  onRecipePress?: (recipe: RecipeListItem) => void;
  onToggleFavorite?: (recipe: RecipeListItem) => void;
};

function RecipeSection({ title, recipes, onRecipePress, onToggleFavorite }: RecipeSectionProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer marginBottom="4xl">
      <AppText
        color="text"
        size="xl"
        style={{
          fontWeight: theme.fontWeights.bold,
          marginBottom: theme.spacing.lg,
        }}
      >
        {title}
      </AppText>

      {recipes.length ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingLeft: theme.spacing.lg,
            paddingRight: theme.spacing.lg,
          }}
          style={{
            marginHorizontal: -theme.spacing.lg,
          }}
        >
          {recipes.map((recipe, index) => (
            <RecipeCard
              key={recipe.id}
              isLast={index === recipes.length - 1}
              onPress={onRecipePress}
              onToggleFavorite={onToggleFavorite}
              recipe={recipe}
            />
          ))}
        </ScrollView>
      ) : (
        <AppContainer
          backgroundColor="surface"
          borderRadius="3xl"
          padding="lg"
          shadow="sm"
        >
          <AppText color="textSecondary">Nenhuma receita encontrada.</AppText>
        </AppContainer>
      )}
    </AppContainer>
  );
}

export default RecipeSection;
