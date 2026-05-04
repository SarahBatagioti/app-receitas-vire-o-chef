import React from 'react';
import { ScrollView } from 'react-native';

import { AppButton, AppContainer, AppInput, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import {
  RecipeCollaborativeSwitch,
  RecipeDifficultyField,
  RecipeIngredientsSection,
  RecipeMediaSection,
  RecipeNutritionSection,
  RecipePreparationSection,
  RecipesTopBar,
} from './components';
import { recipeIngredientsCatalogMock } from './mocks/ingredients';
import {
  RecipeCreateFormValues,
  RecipeCreateValidationErrors,
  RecipeStatus,
} from './types';

type RecipesCreateScreenProps = {
  onBack: () => void;
  onSubmitRecipe: (values: RecipeCreateFormValues, status: RecipeStatus) => void;
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
  preparationSteps: [
    {
      id: 'step-create-1',
      description: '',
    },
  ],
  media: [],
};

function RecipesCreateScreen({ onBack, onSubmitRecipe }: RecipesCreateScreenProps) {
  const { theme } = useAppTheme();
  const [formValues, setFormValues] = React.useState<RecipeCreateFormValues>(initialFormValues);
  const [validationErrors, setValidationErrors] = React.useState<RecipeCreateValidationErrors>({});
  const nextPreparationStepId = React.useRef(2);

  const updateField = <Key extends keyof RecipeCreateFormValues>(
    field: Key,
    value: RecipeCreateFormValues[Key],
  ) => {
    if (field === 'title' || field === 'prepMinutes' || field === 'servings') {
      setValidationErrors((current) => ({
        ...current,
        [field]: undefined,
        submit: undefined,
      }));
    }

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
    setValidationErrors((current) => ({
      ...current,
      selectedIngredients: undefined,
      submit: undefined,
    }));
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    setFormValues((current) => ({
      ...current,
      selectedIngredients: current.selectedIngredients.filter(
        (ingredient) => ingredient.id !== ingredientId,
      ),
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

  const handleAddPreparationStep = () => {
    const newStepId = `step-create-${nextPreparationStepId.current}`;
    nextPreparationStepId.current += 1;

    setFormValues((current) => ({
      ...current,
      preparationSteps: [
        ...current.preparationSteps,
        {
          id: newStepId,
          description: '',
        },
      ],
    }));
  };

  const handleChangePreparationStepDescription = (stepId: string, value: string) => {
    setFormValues((current) => ({
      ...current,
      preparationSteps: current.preparationSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              description: value,
            }
          : step,
      ),
    }));
    setValidationErrors((current) => ({
      ...current,
      preparationSteps: undefined,
      submit: undefined,
    }));
  };

  const handleChangePreparationStepFile = (stepId: string, nextFileName?: string) => {
    setFormValues((current) => ({
      ...current,
      preparationSteps: current.preparationSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              fileName: nextFileName,
            }
          : step,
      ),
    }));
  };

  const handleRemovePreparationStep = (stepId: string) => {
    setFormValues((current) => {
      if (current.preparationSteps.length <= 1) {
        return current;
      }

      return {
        ...current,
        preparationSteps: current.preparationSteps.filter((step) => step.id !== stepId),
      };
    });
  };

  const handleAddMedia = (type: 'image' | 'video') => {
    const timestamp = Date.now();
    const nextMedia = {
      id: `media-create-${timestamp}`,
      type,
      fileName:
        type === 'image'
          ? `receita-imagem-${formValues.media.length + 1}.jpg`
          : `receita-video-${formValues.media.length + 1}.mp4`,
    } as const;

    setFormValues((current) => ({
      ...current,
      media: [...current.media, nextMedia],
    }));
  };

  const handleRemoveMedia = (mediaId: string) => {
    setFormValues((current) => ({
      ...current,
      media: current.media.filter((item) => item.id !== mediaId),
    }));
  };

  const validateForPublish = (): RecipeCreateValidationErrors => {
    const errors: RecipeCreateValidationErrors = {};

    if (!formValues.title.trim()) {
      errors.title = 'Informe o nome da receita.';
    }

    if (!formValues.prepMinutes.trim()) {
      errors.prepMinutes = 'Informe o tempo de preparo.';
    }

    if (!formValues.servings.trim()) {
      errors.servings = 'Informe o rendimento.';
    }

    if (!formValues.selectedIngredients.length) {
      errors.selectedIngredients = 'Selecione pelo menos 1 ingrediente.';
    }

    if (!formValues.preparationSteps.some((step) => step.description.trim())) {
      errors.preparationSteps = 'Adicione pelo menos 1 passo com descrição.';
    }

    if (Object.keys(errors).length) {
      errors.submit = 'Preencha os campos obrigatórios para postar a receita.';
    }

    return errors;
  };

  const handlePublishRecipe = () => {
    const errors = validateForPublish();

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    onSubmitRecipe(formValues, 'published');
  };

  const handleSaveDraft = () => {
    setValidationErrors({});
    onSubmitRecipe(formValues, 'draft');
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
          error={validationErrors.title}
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
              error={validationErrors.prepMinutes}
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
              error={validationErrors.servings}
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
        error={validationErrors.selectedIngredients}
        onRemoveIngredient={handleRemoveIngredient}
        onSelectIngredient={(ingredient) => handleSelectIngredient(ingredient.id)}
        selectedIngredients={formValues.selectedIngredients}
      />

      <RecipeNutritionSection
        onChange={handleNutritionChange}
        values={formValues.nutrition}
      />

      <RecipePreparationSection
        error={validationErrors.preparationSteps}
        onAddStep={handleAddPreparationStep}
        onChangeStepDescription={handleChangePreparationStepDescription}
        onChangeStepFile={handleChangePreparationStepFile}
        onRemoveStep={handleRemovePreparationStep}
        steps={formValues.preparationSteps}
      />

      <RecipeMediaSection
        media={formValues.media}
        onAddMedia={handleAddMedia}
        onRemoveMedia={handleRemoveMedia}
      />

      {validationErrors.submit ? (
        <AppContainer
          backgroundColor="error"
          borderRadius="3xl"
          padding="md"
          marginBottom="xl"
        >
          <AppText color="textInverse" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
            {validationErrors.submit}
          </AppText>
        </AppContainer>
      ) : null}

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
          onPress={handleSaveDraft}
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
        onPress={handlePublishRecipe}
      />
    </ScrollView>
  );
}

export default RecipesCreateScreen;
