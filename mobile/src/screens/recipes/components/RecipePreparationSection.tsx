import React from 'react';
import { Alert, Pressable } from 'react-native';
import { CirclePlus, ImagePlus, Trash2 } from 'lucide-react-native';

import { AppContainer, AppInput, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeCreateStep } from '../types';

type RecipePreparationSectionProps = {
  steps: RecipeCreateStep[];
  onAddStep: () => void;
  onChangeStepDescription: (stepId: string, value: string) => void;
  onChangeStepFile: (stepId: string, nextFileName?: string) => void;
  onRemoveStep: (stepId: string) => void;
};

function RecipePreparationSection({
  steps,
  onAddStep,
  onChangeStepDescription,
  onChangeStepFile,
  onRemoveStep,
}: RecipePreparationSectionProps) {
  const { theme } = useAppTheme();

  const handleFilePress = (step: RecipeCreateStep, index: number) => {
    const nextFileName = `passo-${index + 1}-anexo.jpg`;
    const replacementFileName = `passo-${index + 1}-anexo-atualizado.png`;

    if (!step.fileName) {
      Alert.alert('Arquivo do passo', 'Deseja adicionar um arquivo mockado a este passo?', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Adicionar', onPress: () => onChangeStepFile(step.id, nextFileName) },
      ]);
      return;
    }

    Alert.alert('Arquivo do passo', step.fileName, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover arquivo', style: 'destructive', onPress: () => onChangeStepFile(step.id) },
      { text: 'Trocar arquivo', onPress: () => onChangeStepFile(step.id, replacementFileName) },
    ]);
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
        Modo de preparo:
      </AppText>

      {steps.map((step, index) => (
        <AppContainer key={step.id} marginBottom="lg">
          <AppContainer
            align="center"
            direction="row"
            justify="space-between"
            marginBottom="sm"
          >
            <AppText
              color="primary"
              size="md"
              style={{ fontWeight: theme.fontWeights.bold }}
            >
              {`Passo ${index + 1}:`}
            </AppText>

            {steps.length > 1 ? (
              <Pressable onPress={() => onRemoveStep(step.id)}>
                <AppContainer align="center" direction="row">
                  <Trash2 color={theme.colors.primary} size={theme.spacing.lg} strokeWidth={2} />
                  <AppText
                    color="primary"
                    size="md"
                    style={{ marginLeft: theme.spacing.xs }}
                  >
                    Remover
                  </AppText>
                </AppContainer>
              </Pressable>
            ) : null}
          </AppContainer>

          <AppInput
            borderColor="surface"
            fullWidth
            inputStyle={{ fontSize: theme.fontSizes.md }}
            onChangeText={(value) => onChangeStepDescription(step.id, value)}
            placeholder="Escreva aqui..."
            rightIcon={
              <Pressable
                accessibilityLabel={`Editar arquivo do passo ${index + 1}`}
                onPress={() => handleFilePress(step, index)}
              >
                <ImagePlus color={theme.colors.success} size={theme.spacing['2xl']} strokeWidth={2} />
              </Pressable>
            }
            size="md"
            style={{ marginBottom: 0 }}
            value={step.description}
          />

          {step.fileName ? (
            <AppText
              color="success"
              size="md"
              style={{ marginTop: theme.spacing.sm }}
            >
              {step.fileName}
            </AppText>
          ) : null}
        </AppContainer>
      ))}

      <Pressable onPress={onAddStep}>
        <AppContainer
          align="center"
          backgroundColor="surface"
          borderRadius="3xl"
          direction="row"
          paddingHorizontal="lg"
          paddingVertical="md"
          style={{ minHeight: theme.spacing['6xl'] }}
        >
          <CirclePlus color={theme.colors.success} size={theme.spacing['2xl']} strokeWidth={2} />
          <AppText
            color="textSecondary"
            size="md"
            style={{ marginLeft: theme.spacing.md }}
          >
            Adicionar próximo passo
          </AppText>
        </AppContainer>
      </Pressable>
    </AppContainer>
  );
}

export default RecipePreparationSection;
