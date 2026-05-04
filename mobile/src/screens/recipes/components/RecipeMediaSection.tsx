import React from 'react';
import { Alert, Pressable } from 'react-native';
import { ImagePlus, Play, Trash2 } from 'lucide-react-native';

import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeCreateMedia } from '../types';

type RecipeMediaSectionProps = {
  media: RecipeCreateMedia[];
  onAddMedia: (type: RecipeCreateMedia['type']) => void;
  onRemoveMedia: (mediaId: string) => void;
};

function RecipeMediaSection({ media, onAddMedia, onRemoveMedia }: RecipeMediaSectionProps) {
  const { theme } = useAppTheme();

  const handleAddMedia = () => {
    Alert.alert('Adicionar mídia', 'Escolha o tipo de mídia mockada para esta etapa.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Imagem', onPress: () => onAddMedia('image') },
      { text: 'Vídeo', onPress: () => onAddMedia('video') },
    ]);
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
        Adicionar mídias:
      </AppText>

      <Pressable onPress={handleAddMedia}>
        <AppContainer
          align="center"
          backgroundColor="surface"
          borderRadius="3xl"
          direction="row"
          paddingHorizontal="lg"
          paddingVertical="md"
          style={{ minHeight: theme.spacing['6xl'] }}
        >
          <ImagePlus color={theme.colors.success} size={theme.spacing['2xl']} strokeWidth={2} />
          <AppText
            color="textSecondary"
            size="md"
            style={{ marginLeft: theme.spacing.md }}
          >
            Adicionar foto e/ou vídeo
          </AppText>
        </AppContainer>
      </Pressable>

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
              padding="md"
              shadow="sm"
              marginBottom="sm"
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
                    <ImagePlus color={theme.colors.textInverse} size={theme.spacing.xl} strokeWidth={2} />
                  ) : (
                    <Play color={theme.colors.textInverse} fill={theme.colors.textInverse} size={theme.spacing.xl} strokeWidth={1.8} />
                  )}
                </AppContainer>

                <AppContainer style={{ flex: 1 }}>
                  <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
                    {item.type === 'image' ? 'Imagem adicionada' : 'Vídeo adicionado'}
                  </AppText>
                  <AppText color="textSecondary" size="md">
                    {item.fileName}
                  </AppText>
                </AppContainer>
              </AppContainer>

              <Pressable onPress={() => onRemoveMedia(item.id)}>
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
