import React from 'react';
import { Modal, Pressable } from 'react-native';
import { Check, ChevronDown } from 'lucide-react-native';

import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeDifficulty } from '../types';

type RecipeDifficultyFieldProps = {
  value: RecipeDifficulty;
  onChange: (value: RecipeDifficulty) => void;
};

const difficultyOptions: Array<{ value: RecipeDifficulty; label: string }> = [
  { value: 'facil', label: 'Fácil' },
  { value: 'intermediario', label: 'Intermediário' },
  { value: 'dificil', label: 'Difícil' },
];

function RecipeDifficultyField({ value, onChange }: RecipeDifficultyFieldProps) {
  const { theme } = useAppTheme();
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption = difficultyOptions.find((option) => option.value === value) ?? difficultyOptions[1];

  const handleSelect = (selectedValue: RecipeDifficulty) => {
    onChange(selectedValue);
    setIsOpen(false);
  };

  return (
    <>
      <AppText
        color="text"
        size="md"
        style={{
          fontWeight: theme.fontWeights.bold,
          marginBottom: theme.spacing.md,
        }}
      >
        Nível de dificuldade:
      </AppText>

      <Pressable onPress={() => setIsOpen(true)}>
        <AppContainer
          align="center"
          backgroundColor="surface"
          borderRadius="3xl"
          direction="row"
          justify="space-between"
          paddingHorizontal="lg"
          style={{
            borderColor: theme.colors.surface,
            borderWidth: 1,
            minHeight: theme.spacing['6xl'],
          }}
        >
          <AppText color="textSecondary" size="md">
            {selectedOption.label}
          </AppText>
          <ChevronDown color={theme.colors.text} size={theme.spacing['2xl']} strokeWidth={2.4} />
        </AppContainer>
      </Pressable>

      <Modal
        animationType="fade"
        transparent
        visible={isOpen}
        onRequestClose={() => setIsOpen(false)}
      >
        <Pressable
          onPress={() => setIsOpen(false)}
          style={{
            alignItems: 'center',
            backgroundColor: theme.colors.overlay,
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.lg,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              width: '100%',
            }}
          >
            <AppContainer
              backgroundColor="surface"
              borderRadius="3xl"
              padding="lg"
              shadow="md"
            >
              <AppText
                color="text"
                size="md"
                style={{
                  fontWeight: theme.fontWeights.bold,
                  marginBottom: theme.spacing.md,
                }}
              >
                Nível de dificuldade
              </AppText>

              {difficultyOptions.map((option, index) => (
                <Pressable key={option.value} onPress={() => handleSelect(option.value)}>
                  <AppContainer
                    align="center"
                    backgroundColor="surface"
                    direction="row"
                    justify="space-between"
                    paddingVertical="md"
                    style={{
                      borderBottomColor:
                        index === difficultyOptions.length - 1 ? 'transparent' : theme.colors.border,
                      borderBottomWidth: index === difficultyOptions.length - 1 ? 0 : 1,
                    }}
                  >
                    <AppText color="text" size="md">
                      {option.label}
                    </AppText>
                    {value === option.value ? (
                      <Check color={theme.colors.primary} size={theme.spacing.xl} strokeWidth={2.5} />
                    ) : null}
                  </AppContainer>
                </Pressable>
              ))}
            </AppContainer>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default RecipeDifficultyField;
