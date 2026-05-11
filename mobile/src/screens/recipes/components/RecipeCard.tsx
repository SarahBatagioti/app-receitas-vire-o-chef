import React from 'react';
import { Image, Pressable, useWindowDimensions } from 'react-native';
import { Clock3, Edit2, Heart, Star, Trash2, UsersRound } from 'lucide-react-native';

import { AppContainer, AppText } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';
import { RecipeDifficulty, RecipeListItem } from '../types';

type RecipeCardProps = {
  recipe: RecipeListItem;
  onPress?: (recipe: RecipeListItem) => void;
  onToggleFavorite?: (recipe: RecipeListItem) => void;
  onEdit?: (recipe: RecipeListItem) => void;
  onDelete?: (recipe: RecipeListItem) => void;
  isOwnRecipe?: boolean;
  isLast?: boolean;
};

const difficultyMeta: Record<
  RecipeDifficulty,
  {
    badgeColor: 'brandGreen' | 'brandOrange' | 'brandRed';
    borderColor: 'brandGreen' | 'brandOrange' | 'brandRed';
    label: string;
  }
> = {
  facil: {
    badgeColor: 'brandGreen',
    borderColor: 'brandGreen',
    label: 'Fácil',
  },
  intermediario: {
    badgeColor: 'brandOrange',
    borderColor: 'brandOrange',
    label: 'Intermediário',
  },
  dificil: {
    badgeColor: 'brandRed',
    borderColor: 'brandRed',
    label: 'Difícil',
  },
};

function RecipeCard({ 
  recipe, 
  onPress, 
  onToggleFavorite, 
  onEdit,
  onDelete,
  isOwnRecipe = false,
  isLast = false 
}: RecipeCardProps) {
  const { theme } = useAppTheme();
  const { width } = useWindowDimensions();
  const cardWidth = Math.min(width * 0.41, theme.spacing['7xl'] * 2.85);
  const imageHeight = theme.spacing['6xl'] * 2;
  const infoMeta = difficultyMeta[recipe.difficulty];
  const heartColor = recipe.isFavorite ? theme.colors.primary : theme.colors.textInverse;
  const heartFill = recipe.isFavorite ? theme.colors.primary : 'transparent';

  return (
    <Pressable
      onPress={() => onPress?.(recipe)}
      style={{ marginRight: isLast ? 0 : theme.spacing.md }}
    >
      <AppContainer
        backgroundColor="surface"
        borderRadius="3xl"
        shadow="sm"
        style={{
          borderColor: theme.colors[infoMeta.borderColor],
          borderWidth: 1.5,
          overflow: 'visible',
          width: cardWidth,
        }}
      >
        <AppContainer
          backgroundColor="surface"
          style={{
            borderTopLeftRadius: theme.borderRadius['3xl'],
            borderTopRightRadius: theme.borderRadius['3xl'],
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {recipe.imageUrl ? (
            <Image
              resizeMode="cover"
              source={{ uri: recipe.imageUrl }}
              style={{
                height: imageHeight,
                width: '100%',
              }}
            />
          ) : (
            <AppContainer
              align="center"
              backgroundColor="surfaceSecondary"
              justify="center"
              style={{
                height: imageHeight,
                width: '100%',
              }}
            >
              <AppText color="textSecondary" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
                Sem midia principal
              </AppText>
            </AppContainer>
          )}
        </AppContainer>

        {isOwnRecipe ? (
          <AppContainer
            align="center"
            direction="row"
            backgroundColor="transparent"
            style={{
              gap: theme.spacing.xs,
              position: 'absolute',
              right: theme.spacing.sm,
              top: theme.spacing.sm,
              zIndex: 4,
            }}
          >
            <Pressable
              accessibilityLabel={`Editar ${recipe.title}`}
              onPress={(event) => {
                event.stopPropagation();
                onEdit?.(recipe);
              }}
              style={{
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.full,
                height: theme.spacing['4xl'],
                justifyContent: 'center',
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.16,
                shadowRadius: 10,
                width: theme.spacing['4xl'],
              }}
            >
              <Edit2
                color={theme.colors.brandGreen}
                size={theme.spacing.lg}
                strokeWidth={2}
              />
            </Pressable>

            <Pressable
              accessibilityLabel={`Deletar ${recipe.title}`}
              onPress={(event) => {
                event.stopPropagation();
                onDelete?.(recipe);
              }}
              style={{
                alignItems: 'center',
                backgroundColor: theme.colors.surface,
                borderRadius: theme.borderRadius.full,
                height: theme.spacing['4xl'],
                justifyContent: 'center',
                shadowColor: theme.colors.shadow,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.16,
                shadowRadius: 10,
                width: theme.spacing['4xl'],
              }}
            >
              <Trash2
                color={theme.colors.error}
                size={theme.spacing.lg}
                strokeWidth={2}
              />
            </Pressable>
          </AppContainer>
        ) : (
          <Pressable
            accessibilityLabel={
              recipe.isFavorite
                ? `Remover ${recipe.title} dos favoritos`
                : `Adicionar ${recipe.title} aos favoritos`
            }
            onPress={(event) => {
              event.stopPropagation();
              onToggleFavorite?.(recipe);
            }}
            style={{
              alignItems: 'center',
              backgroundColor: 'transparent',
              height: theme.spacing['4xl'],
              justifyContent: 'center',
              position: 'absolute',
              right: theme.spacing.sm,
              top: theme.spacing.sm,
              width: theme.spacing['4xl'],
              zIndex: 4,
            }}
          >
            <Heart
              color={heartColor}
              fill={heartFill}
              size={theme.spacing.xl}
              strokeWidth={1.8}
            />
          </Pressable>
        )}

        <AppContainer
          backgroundColor={infoMeta.badgeColor}
          borderRadius="full"
          paddingHorizontal="md"
          paddingVertical="xs"
          style={{
            left: theme.spacing.sm,
            position: 'absolute',
            top: imageHeight - theme.spacing.md,
            elevation: 4,
            zIndex: 5,
          }}
        >
          <AppText color="textInverse" size="sm" weight="bold">
            {infoMeta.label}
          </AppText>
        </AppContainer>

        <AppContainer
          backgroundColor="surface"
          paddingHorizontal="md"
          paddingVertical="md"
          style={{
            borderBottomLeftRadius: theme.borderRadius['3xl'],
            borderBottomRightRadius: theme.borderRadius['3xl'],
            paddingTop: theme.spacing.lg + theme.spacing.sm,
          }}
        >
          <AppText
            color="text"
            numberOfLines={2}
            size="xl"
            style={{
              fontWeight: theme.fontWeights.bold,
              lineHeight: theme.fontSizes.xl * 1.05,
              minHeight: theme.spacing['5xl'],
            }}
          >
            {recipe.title}
          </AppText>

          <AppContainer
            backgroundColor="surface"
            align="center"
            direction="row"
            justify="space-between"
            marginTop="sm"
          >
            <AppContainer
              backgroundColor="surface"
              align="center"
              direction="row"
              style={{ gap: theme.spacing.xs }}
            >
              <Clock3 color={theme.colors.text} size={theme.spacing.md + theme.spacing.xs} />
              <AppText size="sm">{`${recipe.prepMinutes} min`}</AppText>
            </AppContainer>

            {/* Rating Stars - Comentado
            <AppContainer
              backgroundColor="surface"
              align="center"
              direction="row"
              style={{ gap: theme.spacing.xs }}
            >
              <Star
                color={theme.colors.brandYellow}
                fill={theme.colors.brandYellow}
                size={theme.spacing.md + theme.spacing.xs}
              />
              <AppText size="sm">{recipe.rating.toFixed(1).replace('.', ',')}</AppText>
            </AppContainer>
            */}

            <AppContainer
              backgroundColor="surface"
              align="center"
              direction="row"
              style={{ gap: theme.spacing.xs }}
            >
              <UsersRound color={theme.colors.text} size={theme.spacing.md + theme.spacing.xs} />
              <AppText size="sm">{recipe.servings}</AppText>
            </AppContainer>
          </AppContainer>
        </AppContainer>
      </AppContainer>
    </Pressable>
  );
}

export default RecipeCard;
