import React from 'react';
import { Pressable } from 'react-native';
import { CirclePlus, ImagePlus, Play, Trash2 } from 'lucide-react-native';

import { AppContainer, AppInput, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeCreateStep } from '../types';

type RecipePreparationSectionProps = {
  error?: string;
  steps: RecipeCreateStep[];
  onAddStep: () => void;
  onChangeStepDescription: (stepId: string, value: string) => void;
  onChangeStepFile: (stepId: string, nextAttachment?: RecipeCreateStep['attachment']) => void;
  onSelectStepMedia: (stepId: string) => void | Promise<void>;
  onRemoveStep: (stepId: string) => void;
};

function RecipePreparationSection({
  error,
  steps,
  onAddStep,
  onChangeStepDescription,
  onChangeStepFile,
  onSelectStepMedia,
  onRemoveStep,
}: RecipePreparationSectionProps) {
  const { theme } = useAppTheme();

  const handleSelectStepMedia = (stepId: string) => {
    try {
      const result = onSelectStepMedia(stepId);

      if (result && typeof result === 'object' && 'catch' in result && typeof result.catch === 'function') {
        result.catch(() => {
          // O feedback visivel fica concentrado na tela.
        });
      }
    } catch {
      // O feedback visivel fica concentrado na tela.
    }
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
                onPress={() => handleSelectStepMedia(step.id)}
              >
                {step.attachment?.type === 'video' ? (
                  <Play color={theme.colors.success} size={theme.spacing['2xl']} strokeWidth={2} />
                ) : (
                  <ImagePlus color={theme.colors.success} size={theme.spacing['2xl']} strokeWidth={2} />
                )}
              </Pressable>
            }
            size="md"
            style={{ marginBottom: 0 }}
            value={step.description}
          />

          {step.attachment ? (
            <AppContainer align="center" direction="row" justify="space-between" marginTop="sm">
              <AppText
                color="success"
                size="md"
                style={{ flex: 1, marginRight: theme.spacing.md }}
              >
                {step.attachment.fileName}
              </AppText>

              <Pressable onPress={() => onChangeStepFile(step.id)}>
                <AppText color="primary" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
                  Remover arquivo
                </AppText>
              </Pressable>
            </AppContainer>
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
            Adicionar proximo passo
          </AppText>
        </AppContainer>
      </Pressable>

      {error ? (
        <AppText color="error" size="md" style={{ marginTop: theme.spacing.sm }}>
          {error}
        </AppText>
      ) : null}
    </AppContainer>
  );
}

export default RecipePreparationSection;
