import React from 'react';
import { Pressable } from 'react-native';
import { Search, X } from 'lucide-react-native';

import { AppContainer, AppInput, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeCreateIngredient } from '../types';

type RecipeIngredientsSectionProps = {
  availableIngredients: RecipeCreateIngredient[];
  selectedIngredients: RecipeCreateIngredient[];
  onSelectIngredient: (ingredient: RecipeCreateIngredient) => void;
  onRemoveIngredient: (ingredientId: string) => void;
};

function RecipeIngredientsSection({
  availableIngredients,
  selectedIngredients,
  onSelectIngredient,
  onRemoveIngredient,
}: RecipeIngredientsSectionProps) {
  const { theme } = useAppTheme();
  const [searchValue, setSearchValue] = React.useState('');
  const filteredIngredients = availableIngredients.filter((ingredient) => {
    const normalizedSearch = searchValue.trim().toLowerCase();
    const matchesSearch = normalizedSearch.length
      ? ingredient.name.toLowerCase().includes(normalizedSearch)
      : false;
    const isSelected = selectedIngredients.some((selected) => selected.id === ingredient.id);

    return matchesSearch && !isSelected;
  });
  const showSuggestions = searchValue.trim().length > 0 && availableIngredients.length > 0;

  const handleSelectIngredient = (ingredient: RecipeCreateIngredient) => {
    onSelectIngredient(ingredient);
    setSearchValue('');
  };

  return (
    <AppContainer marginBottom="4xl">
      <AppText
        color="text"
        size="md"
        style={{
          fontWeight: theme.fontWeights.bold,
          marginBottom: theme.spacing.md,
        }}
      >
        Ingredientes:
      </AppText>

      <AppInput
        borderColor="surface"
        fullWidth
        inputStyle={{ fontSize: theme.fontSizes.md }}
        leftIcon={<Search color={theme.colors.primary} size={theme.spacing['2xl']} strokeWidth={2} />}
        onChangeText={setSearchValue}
        placeholder="Pesquisar..."
        size="md"
        style={{ marginBottom: 0 }}
        value={searchValue}
      />

      {showSuggestions ? (
        <AppContainer
          backgroundColor="surface"
          borderRadius="3xl"
          marginTop="sm"
          paddingVertical="sm"
          shadow="sm"
        >
          {filteredIngredients.slice(0, 5).map((ingredient, index) => (
            <Pressable key={ingredient.id} onPress={() => handleSelectIngredient(ingredient)}>
              <AppContainer
                paddingHorizontal="lg"
                paddingVertical="md"
                style={{
                  borderBottomColor:
                    index === Math.min(filteredIngredients.length, 5) - 1
                      ? 'transparent'
                      : theme.colors.border,
                  borderBottomWidth:
                    index === Math.min(filteredIngredients.length, 5) - 1 ? 0 : 1,
                }}
              >
                <AppText color="text" size="md">
                  {ingredient.name}
                </AppText>
              </AppContainer>
            </Pressable>
          ))}
        </AppContainer>
      ) : null}

      {selectedIngredients.length ? (
        <AppContainer
          direction="row"
          marginTop="md"
          style={{
            columnGap: theme.spacing.sm,
            flexWrap: 'wrap',
            rowGap: theme.spacing.sm,
          }}
        >
          {selectedIngredients.map((ingredient) => (
            <Pressable key={ingredient.id} onPress={() => onRemoveIngredient(ingredient.id)}>
              <AppContainer
                align="center"
                backgroundColor="brandGreen"
                borderRadius="full"
                direction="row"
                paddingHorizontal="md"
                paddingVertical="sm"
              >
                <X color={theme.colors.textInverse} size={theme.spacing.md} strokeWidth={2.4} />
                <AppText
                  color="textInverse"
                  size="md"
                  style={{
                    fontWeight: theme.fontWeights.semibold,
                    marginLeft: theme.spacing.sm,
                  }}
                >
                  {ingredient.name}
                </AppText>
              </AppContainer>
            </Pressable>
          ))}
        </AppContainer>
      ) : null}
    </AppContainer>
  );
}

export default RecipeIngredientsSection;
