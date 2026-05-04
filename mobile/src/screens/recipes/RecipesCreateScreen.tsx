import React from 'react';
import { ScrollView } from 'react-native';
import { Asset, launchImageLibrary } from 'react-native-image-picker';

import { AppButton, AppContainer, AppInput, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { getErrorMessage } from '../../services/api';
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
  RecipeCreateMedia,
  RecipeCreateStepAttachment,
  RecipeCreateValidationErrors,
  RecipeStatus,
} from './types';

type SubmitRecipeOptions = {
  onUploadStart?: () => void;
};

type RecipesCreateScreenProps = {
  onBack: () => void;
  onSubmitRecipe: (
    values: RecipeCreateFormValues,
    status: RecipeStatus,
    options?: SubmitRecipeOptions,
  ) => Promise<void>;
};

type SubmissionPhase = 'creating' | 'uploading' | null;

const initialFormValues: RecipeCreateFormValues = {
  title: 'Pave de Morango da Thais',
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

const MAX_MEDIA_SELECTION = 10;

function inferMediaType(mimeType?: string): RecipeCreateMedia['type'] | null {
  if (!mimeType) {
    return null;
  }

  if (mimeType.startsWith('image/')) {
    return 'image';
  }

  if (mimeType.startsWith('video/')) {
    return 'video';
  }

  return null;
}

function buildFallbackFileName(
  mediaType: RecipeCreateMedia['type'],
  mimeType: string,
  order: number,
): string {
  const extension = mimeType.split('/')[1]?.toLowerCase() || (mediaType === 'image' ? 'jpg' : 'mp4');
  return `receita-${mediaType}-${order}.${extension}`;
}

function normalizeSelectedAsset(asset: Asset, order: number): RecipeCreateMedia | null {
  const mediaType = inferMediaType(asset.type);

  if (!asset.uri || !asset.type || !mediaType) {
    return null;
  }

  return {
    id: `media-create-${Date.now()}-${order}-${Math.round(Math.random() * 1000)}`,
    type: mediaType,
    fileName:
      asset.fileName?.trim() || buildFallbackFileName(mediaType, asset.type, order + 1),
    mimeType: asset.type,
    uri: asset.uri,
    fileSize: asset.fileSize,
  };
}

function RecipesCreateScreen({ onBack, onSubmitRecipe }: RecipesCreateScreenProps) {
  const { theme } = useAppTheme();
  const [formValues, setFormValues] = React.useState<RecipeCreateFormValues>(initialFormValues);
  const [validationErrors, setValidationErrors] = React.useState<RecipeCreateValidationErrors>({});
  const [submissionError, setSubmissionError] = React.useState<string | null>(null);
  const [mediaSelectionError, setMediaSelectionError] = React.useState<string | null>(null);
  const [stepMediaSelectionError, setStepMediaSelectionError] = React.useState<string | null>(null);
  const [submitIntent, setSubmitIntent] = React.useState<RecipeStatus | null>(null);
  const [submissionPhase, setSubmissionPhase] = React.useState<SubmissionPhase>(null);
  const nextPreparationStepId = React.useRef(2);
  const isSubmitting = submitIntent !== null;

  const clearSubmitFeedback = () => {
    setSubmissionError(null);
    setMediaSelectionError(null);
    setStepMediaSelectionError(null);
    setValidationErrors((current) => ({
      ...current,
      submit: undefined,
    }));
  };

  const updateField = <Key extends keyof RecipeCreateFormValues>(
    field: Key,
    value: RecipeCreateFormValues[Key],
  ) => {
    clearSubmitFeedback();

    if (field === 'title' || field === 'prepMinutes' || field === 'servings') {
      setValidationErrors((current) => ({
        ...current,
        [field]: undefined,
      }));
    }

    setFormValues((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSelectIngredient = (ingredientId: string) => {
    clearSubmitFeedback();

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
    }));
  };

  const handleRemoveIngredient = (ingredientId: string) => {
    clearSubmitFeedback();
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
    clearSubmitFeedback();
    setFormValues((current) => ({
      ...current,
      nutrition: {
        ...current.nutrition,
        [field]: value,
      },
    }));
  };

  const handleAddPreparationStep = () => {
    clearSubmitFeedback();
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
    clearSubmitFeedback();
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
    }));
  };

  const handleChangePreparationStepFile = (
    stepId: string,
    nextAttachment?: RecipeCreateStepAttachment,
  ) => {
    clearSubmitFeedback();
    setFormValues((current) => ({
      ...current,
      preparationSteps: current.preparationSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              attachment: nextAttachment,
            }
          : step,
      ),
    }));
  };

  const handleRemovePreparationStep = (stepId: string) => {
    clearSubmitFeedback();
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

  const handleAddMedia = async () => {
    clearSubmitFeedback();

    try {
      const availableSlots = Math.max(0, MAX_MEDIA_SELECTION - formValues.media.length);

      if (availableSlots === 0) {
        setMediaSelectionError(`Voce pode adicionar ate ${MAX_MEDIA_SELECTION} midias por receita.`);
        return;
      }

      const response = await launchImageLibrary({
        assetRepresentationMode: 'current',
        includeBase64: false,
        mediaType: 'mixed',
        quality: 1,
        selectionLimit: availableSlots,
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        setMediaSelectionError('Nao foi possivel selecionar as midias no dispositivo.');
        return;
      }

      const selectedAssets = response.assets ?? [];

      if (!selectedAssets.length) {
        setMediaSelectionError('Selecione ao menos uma imagem ou video valido.');
        return;
      }

      const normalizedAssets = selectedAssets
        .map((asset, index) => normalizeSelectedAsset(asset, formValues.media.length + index))
        .filter((item): item is RecipeCreateMedia => Boolean(item));

      if (!normalizedAssets.length) {
        setMediaSelectionError('So sao permitidos arquivos de imagem e video com uri valida.');
        return;
      }

      if (normalizedAssets.length !== selectedAssets.length) {
        setMediaSelectionError('Alguns arquivos foram ignorados porque nao sao imagens ou videos validos.');
      }

      setFormValues((current) => ({
        ...current,
        media: [...current.media, ...normalizedAssets],
      }));
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Nao foi possivel abrir o seletor de midias no dispositivo.',
      );
      const rebuildHint =
        message.includes('launchImageLibrary') || message.includes('null')
          ? ' Se voce acabou de instalar a biblioteca, gere um novo build do app.'
          : '';

      setMediaSelectionError(`${message}${rebuildHint}`);
    }
  };

  const handleSelectPreparationStepMedia = async (stepId: string) => {
    clearSubmitFeedback();

    try {
      const response = await launchImageLibrary({
        assetRepresentationMode: 'current',
        includeBase64: false,
        mediaType: 'mixed',
        quality: 1,
        selectionLimit: 1,
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        setStepMediaSelectionError('Nao foi possivel selecionar a midia deste passo.');
        return;
      }

      const selectedAsset = response.assets?.[0];
      const normalizedAsset = selectedAsset ? normalizeSelectedAsset(selectedAsset, 0) : null;

      if (!normalizedAsset) {
        setStepMediaSelectionError('Selecione uma imagem ou video valido para o passo.');
        return;
      }

      handleChangePreparationStepFile(stepId, {
        fileName: normalizedAsset.fileName,
        fileSize: normalizedAsset.fileSize,
        mimeType: normalizedAsset.mimeType,
        type: normalizedAsset.type,
        uri: normalizedAsset.uri,
      });
    } catch (error) {
      const message = getErrorMessage(
        error,
        'Nao foi possivel abrir o seletor de midias do passo.',
      );
      const rebuildHint =
        message.includes('launchImageLibrary') || message.includes('null')
          ? ' Se voce acabou de instalar a biblioteca, gere um novo build do app.'
          : '';

      setStepMediaSelectionError(`${message}${rebuildHint}`);
    }
  };

  const handleRemoveMedia = (mediaId: string) => {
    clearSubmitFeedback();
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
    } else if (Number(formValues.prepMinutes) <= 0) {
      errors.prepMinutes = 'Informe um tempo de preparo positivo.';
    }

    if (!formValues.servings.trim()) {
      errors.servings = 'Informe o rendimento.';
    } else if (Number(formValues.servings) <= 0) {
      errors.servings = 'Informe um rendimento positivo.';
    }

    if (!formValues.selectedIngredients.length) {
      errors.selectedIngredients = 'Selecione pelo menos 1 ingrediente.';
    }

    if (!formValues.preparationSteps.some((step) => step.description.trim())) {
      errors.preparationSteps = 'Adicione pelo menos 1 passo com descricao.';
    }

    if (Object.keys(errors).length) {
      errors.submit = 'Preencha os campos obrigatorios para postar a receita.';
    }

    return errors;
  };

  const validateForDraft = (): RecipeCreateValidationErrors => {
    const errors: RecipeCreateValidationErrors = {};

    if (!formValues.title.trim()) {
      errors.title = 'Informe o nome da receita.';
      errors.submit = 'Informe ao menos o nome da receita para salvar como rascunho.';
    }

    return errors;
  };

  const handleSubmit = async (status: RecipeStatus) => {
    if (isSubmitting) {
      return;
    }

    const errors = status === 'published' ? validateForPublish() : validateForDraft();

    if (Object.keys(errors).length) {
      setValidationErrors(errors);
      setSubmissionError(null);
      return;
    }

    setValidationErrors({});
    setSubmissionError(null);
    setSubmitIntent(status);
    setSubmissionPhase('creating');

    try {
      await onSubmitRecipe(formValues, status, {
        onUploadStart: () => {
          setSubmissionPhase('uploading');
        },
      });
    } catch (error) {
      setSubmissionError(
        getErrorMessage(error, 'Nao foi possivel salvar a receita no momento.'),
      );
    } finally {
      setSubmitIntent(null);
      setSubmissionPhase(null);
    }
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
              porcoes
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
        error={stepMediaSelectionError ?? validationErrors.preparationSteps}
        onAddStep={handleAddPreparationStep}
        onChangeStepDescription={handleChangePreparationStepDescription}
        onChangeStepFile={handleChangePreparationStepFile}
        onSelectStepMedia={handleSelectPreparationStepMedia}
        onRemoveStep={handleRemovePreparationStep}
        steps={formValues.preparationSteps}
      />

      <RecipeMediaSection
        error={mediaSelectionError}
        isUploading={submissionPhase === 'uploading'}
        media={formValues.media}
        onAddMedia={handleAddMedia}
        onRemoveMedia={handleRemoveMedia}
      />

      {submissionPhase ? (
        <AppContainer
          backgroundColor="surface"
          borderRadius="3xl"
          marginBottom="xl"
          padding="md"
          shadow="sm"
        >
          <AppText color="primary" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
            {submissionPhase === 'creating'
              ? 'Criando receita...'
              : 'Receita criada. Enviando midias...'}
          </AppText>
        </AppContainer>
      ) : null}

      {submissionError || validationErrors.submit ? (
        <AppContainer
          backgroundColor="error"
          borderRadius="3xl"
          padding="md"
          marginBottom="xl"
        >
          <AppText color="textInverse" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
            {submissionError ?? validationErrors.submit}
          </AppText>
        </AppContainer>
      ) : null}

      {formValues.isCollaborative ? (
        <AppButton
          disabled={isSubmitting}
          fullWidth
          label="Postar rascunho"
          loading={submitIntent === 'draft'}
          size="lg"
          style={{
            marginBottom: theme.spacing.lg,
            minHeight: theme.spacing['7xl'],
          }}
          textStyle={{ fontSize: theme.fontSizes.md }}
          onPress={() => {
            handleSubmit('draft');
          }}
        />
      ) : null}

      <AppButton
        disabled={isSubmitting}
        fullWidth
        label="Postar receita"
        loading={submitIntent === 'published'}
        size="lg"
        variant={formValues.isCollaborative ? 'outline' : 'primary'}
        style={{
          minHeight: theme.spacing['7xl'],
        }}
        textStyle={{ fontSize: theme.fontSizes.md }}
        onPress={() => {
          handleSubmit('published');
        }}
      />
    </ScrollView>
  );
}

export default RecipesCreateScreen;
