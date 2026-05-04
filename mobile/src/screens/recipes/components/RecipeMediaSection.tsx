import React from 'react';
import { Pressable } from 'react-native';
import { ImagePlus, Play, Trash2 } from 'lucide-react-native';

import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeCreateMedia } from '../types';

type RecipeMediaSectionProps = {
  error?: string | null;
  isUploading?: boolean;
  media: RecipeCreateMedia[];
  onAddMedia: () => void | Promise<void>;
  onRemoveMedia: (mediaId: string) => void;
};

function RecipeMediaSection({
  error,
  isUploading = false,
  media,
  onAddMedia,
  onRemoveMedia,
}: RecipeMediaSectionProps) {
  const { theme } = useAppTheme();

  const handlePressAddMedia = () => {
    try {
      const result = onAddMedia();

      if (result && typeof result === 'object' && 'catch' in result && typeof result.catch === 'function') {
        result.catch(() => {
          // O tratamento visivel acontece no handler da tela.
        });
      }
    } catch {
      // O tratamento visivel acontece no handler da tela.
    }
  };

  return (
    <AppContainer marginBottom="5xl">
      <AppText
        color="text"
        size="md"
        style={{
          fontWeight: theme.fontWeights.bold,
          marginBottom: theme.spacing.md,
        }}
      >
        Adicionar midias:
      </AppText>

      <Pressable disabled={isUploading} onPress={handlePressAddMedia}>
        <AppContainer
          align="center"
          backgroundColor="surface"
          borderRadius="3xl"
          direction="row"
          paddingHorizontal="lg"
          paddingVertical="md"
          style={{
            minHeight: theme.spacing['6xl'],
            opacity: isUploading ? 0.65 : 1,
          }}
        >
          <ImagePlus color={theme.colors.success} size={theme.spacing['2xl']} strokeWidth={2} />
          <AppText color="textSecondary" size="md" style={{ marginLeft: theme.spacing.md }}>
            {isUploading ? 'Upload em andamento...' : 'Adicionar foto e/ou video'}
          </AppText>
        </AppContainer>
      </Pressable>

      {error ? (
        <AppText color="error" size="md" marginTop="sm">
          {error}
        </AppText>
      ) : null}

      {media.length ? (
        <AppContainer marginTop="md">
          {media.map((item) => (
            <AppContainer
              key={item.id}
              align="center"
              backgroundColor="surface"
              borderRadius="3xl"
              direction="row"
              justify="space-between"
              marginBottom="sm"
              padding="md"
              shadow="sm"
            >
              <AppContainer align="center" direction="row" style={{ flex: 1 }}>
                <AppContainer
                  align="center"
                  backgroundColor={item.type === 'image' ? 'success' : 'primary'}
                  borderRadius="xl"
                  justify="center"
                  style={{
                    height: theme.spacing['5xl'],
                    marginRight: theme.spacing.md,
                    width: theme.spacing['5xl'],
                  }}
                >
                  {item.type === 'image' ? (
                    <ImagePlus
                      color={theme.colors.textInverse}
                      size={theme.spacing.xl}
                      strokeWidth={2}
                    />
                  ) : (
                    <Play
                      color={theme.colors.textInverse}
                      fill={theme.colors.textInverse}
                      size={theme.spacing.xl}
                      strokeWidth={1.8}
                    />
                  )}
                </AppContainer>

                <AppContainer style={{ flex: 1 }}>
                  <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
                    {item.type === 'image' ? 'Imagem selecionada' : 'Video selecionado'}
                  </AppText>
                  <AppText color="textSecondary" size="md">
                    {item.fileName}
                  </AppText>
                </AppContainer>
              </AppContainer>

              <Pressable disabled={isUploading} onPress={() => onRemoveMedia(item.id)}>
                <Trash2 color={theme.colors.primary} size={theme.spacing.xl} strokeWidth={2} />
              </Pressable>
            </AppContainer>
          ))}
        </AppContainer>
      ) : null}
    </AppContainer>
  );
}

export default RecipeMediaSection;
