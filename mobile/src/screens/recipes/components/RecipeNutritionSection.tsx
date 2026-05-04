import React from 'react';

import { AppContainer, AppInput, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeCreateNutrition } from '../types';

type NutritionFieldKey = keyof RecipeCreateNutrition;

type NutritionFieldConfig = {
  key: NutritionFieldKey;
  label: string;
  placeholder: string;
};

type RecipeNutritionSectionProps = {
  values: RecipeCreateNutrition;
  onChange: (field: NutritionFieldKey, value: string) => void;
};

const nutritionFields: NutritionFieldConfig[] = [
  { key: 'calories', label: 'Calorias', placeholder: '120' },
  { key: 'proteins', label: 'Proteínas', placeholder: '3g' },
  { key: 'carbohydrates', label: 'Carboidratos', placeholder: '120g' },
  { key: 'fats', label: 'Gorduras', placeholder: '3g' },
];

function RecipeNutritionSection({ values, onChange }: RecipeNutritionSectionProps) {
  const { theme } = useAppTheme();

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
        Informação nutricional:
      </AppText>

      <AppContainer
        direction="row"
        justify="space-between"
        style={{ flexWrap: 'wrap' }}
      >
        {nutritionFields.map((field) => (
          <AppContainer
            key={field.key}
            align="center"
            direction="row"
            style={{
              marginBottom: theme.spacing.md,
              width: '47%',
            }}
          >
            <AppInput
              borderColor="surface"
              fullWidth
              inputStyle={{ fontSize: theme.fontSizes.md }}
              inputType="number"
              onChangeText={(value) => onChange(field.key, value)}
              placeholder={field.placeholder}
              size="md"
              style={{
                flex: 1,
                marginBottom: 0,
                marginRight: theme.spacing.sm,
              }}
              value={values[field.key]}
            />
            <AppText
              color="text"
              size="md"
              style={{
                flexShrink: 1,
                fontWeight: theme.fontWeights.bold,
              }}
            >
              {field.label}
            </AppText>
          </AppContainer>
        ))}
      </AppContainer>
    </AppContainer>
  );
}

export default RecipeNutritionSection;
