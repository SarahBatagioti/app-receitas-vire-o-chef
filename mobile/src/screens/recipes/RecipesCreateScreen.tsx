import React from 'react';
import { ScrollView } from 'react-native';

import { AppButton, AppContainer, AppInput, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import {
  RecipeCollaborativeSwitch,
  RecipeDifficultyField,
  RecipeIngredientsSection,
  RecipeNutritionSection,
  RecipesTopBar,
} from './components';
import { recipeIngredientsCatalogMock } from './mocks/ingredients';
import { RecipeCreateFormValues } from './types';

type RecipesCreateScreenProps = {
  onBack: () => void;
};

const initialFormValues: RecipeCreateFormValues = {
  title: 'Pavê de Morango da Thaís',
  prepMinutes: '120',
  servings: '3',
  difficulty: 'intermediario',
  isCollaborative: true,
  selectedIngredients: [
    { id: 'ingredient-create-1', name: 'Leite condensado', unit: 'lata' },
    { id: 'ingredient-create-2', name: 'Creme de leite', unit: 'caixa' },
    { id: 'ingredient-create-3', name: 'Leite', unit: 'ml' },
    { id: 'ingredient-create-4', name: 'Gema de ovo', unit: 'unidade' },
    { id: 'ingredient-create-5', name: 'Farinha de trigo', unit: 'g' },
  ],
  nutrition: {
    calories: '120',
    proteins: '3',
    carbohydrates: '120',
    fats: '3',
  },
};

function RecipesCreateScreen({ onBack }: RecipesCreateScreenProps) {
  const { theme } = useAppTheme();
  const [formValues, setFormValues] = React.useState<RecipeCreateFormValues>(initialFormValues);

  const updateField = <Key extends keyof RecipeCreateFormValues>(
    field: Key,
    value: RecipeCreateFormValues[Key],
  ) => {
    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSelectIngredient = (ingredientId: string) => {
    const ingredientToAdd = recipeIngredientsCatalogMock.find(
      (ingredient) => ingredient.id === ingredientId,
    );

    if (!ingredientToAdd) {
      return;
    }

    setFormValues((current) => {
      if (current.selectedIngredients.some((ingredient) => ingredient.id === ingredientId)) {
        return current;
      }

      return {
        ...current,
        selectedIngredients: [...current.selectedIngredients, ingredientToAdd],
      };
    });
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setFormValues((current) => ({
      ...current,
      selectedIngredients: current.selectedIngredients.filter((ingredient) => ingredient.id !== ingredientId),
    }));
  };

  const handleNutritionChange = (
    field: keyof RecipeCreateFormValues['nutrition'],
    value: string,
  ) => {
    setFormValues((current) => ({
      ...current,
      nutrition: {
        ...current.nutrition,
        [field]: value,
      },
    }));
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] + theme.spacing['3xl'] }}
      showsVerticalScrollIndicator={false}
    >
      <RecipesTopBar onBack={onBack} title="Cadastrar receita" />

      <AppContainer marginBottom="2xl">
        <AppText
          color="text"
          size="md"
          style={{ fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing.md }}
        >
          Nome da receita:
        </AppText>
        <AppInput
          borderColor="surface"
          fullWidth
          inputStyle={{ fontSize: theme.fontSizes.md }}
          onChangeText={(value) => updateField('title', value)}
          placeholder="Digite o nome da receita"
          size="md"
          style={{ marginBottom: 0 }}
          value={formValues.title}
        />
      </AppContainer>

      <AppContainer align="flex-start" direction="row" justify="space-between" marginBottom="2xl">
        <AppContainer style={{ width: '45%' }}>
          <AppText
            color="text"
            size="md"
            style={{ fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing.md }}
          >
            Tempo de preparo:
          </AppText>
          <AppContainer align="center" direction="row">
            <AppInput
              borderColor="surface"
              fullWidth
              inputStyle={{ fontSize: theme.fontSizes.md }}
              inputType="number"
              onChangeText={(value) => updateField('prepMinutes', value)}
              placeholder="0"
              size="md"
              style={{ flex: 1, marginBottom: 0 }}
              value={formValues.prepMinutes}
            />
            <AppText
              color="text"
              size="md"
              style={{ fontWeight: theme.fontWeights.bold, marginLeft: theme.spacing.md }}
            >
              Min
            </AppText>
          </AppContainer>
        </AppContainer>

        <AppContainer style={{ width: '45%' }}>
          <AppText
            color="text"
            size="md"
            style={{ fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing.md }}
          >
            Qual o rendimento?
          </AppText>
          <AppContainer align="center" direction="row">
            <AppInput
              borderColor="surface"
              fullWidth
              inputStyle={{ fontSize: theme.fontSizes.md }}
              inputType="number"
              onChangeText={(value) => updateField('servings', value)}
              placeholder="0"
              size="md"
              style={{ flex: 1, marginBottom: 0 }}
              value={formValues.servings}
            />
            <AppText
              color="text"
              size="md"
              style={{ fontWeight: theme.fontWeights.bold, marginLeft: theme.spacing.md }}
            >
              porções
            </AppText>
          </AppContainer>
        </AppContainer>
      </AppContainer>

      <AppContainer marginBottom="lg">
        <RecipeDifficultyField
          onChange={(value) => updateField('difficulty', value)}
          value={formValues.difficulty}
        />
      </AppContainer>

      <RecipeCollaborativeSwitch
        onValueChange={(value) => updateField('isCollaborative', value)}
        value={formValues.isCollaborative}
      />

      <RecipeIngredientsSection
        availableIngredients={recipeIngredientsCatalogMock}
        onRemoveIngredient={handleRemoveIngredient}
        onSelectIngredient={(ingredient) => handleSelectIngredient(ingredient.id)}
        selectedIngredients={formValues.selectedIngredients}
      />

      <RecipeNutritionSection
        onChange={handleNutritionChange}
        values={formValues.nutrition}
      />

      <AppContainer marginBottom="5xl">
        <AppText
          color="textSecondary"
          size="md"
          lineHeight="relaxed"
        >
          O modo de preparo e as mídias serão adicionados na próxima etapa.
        </AppText>
      </AppContainer>

      {formValues.isCollaborative ? (
        <AppButton
          fullWidth
          label="Postar rascunho"
          size="lg"
          style={{
            marginBottom: theme.spacing.lg,
            minHeight: theme.spacing['7xl'],
          }}
          textStyle={{ fontSize: theme.fontSizes.md }}
          onPress={() => undefined}
        />
      ) : null}

      <AppButton
        fullWidth
        label="Postar receita"
        size="lg"
        variant={formValues.isCollaborative ? 'outline' : 'primary'}
        style={{
          minHeight: theme.spacing['7xl'],
        }}
        textStyle={{ fontSize: theme.fontSizes.md }}
        onPress={() => undefined}
      />
    </ScrollView>
  );
}

export default RecipesCreateScreen;
