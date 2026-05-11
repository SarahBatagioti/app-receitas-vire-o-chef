import React from 'react';
import { ActivityIndicator, Image, Pressable, ScrollView } from 'react-native';
import {
  CheckCircle2,
  Circle,
  Heart,
  Play,
  Share2,
  Star,
  UserRound,
  Users2,
} from 'lucide-react-native';

import { AppButton, AppContainer, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { RecipeDetail, RecipeDifficulty } from './types';
import { RecipesTopBar } from './components';

type RecipeDetailScreenProps = {
  recipe: RecipeDetail | null;
  onBack: () => void;
  isLoading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  onToggleFavorite?: (recipeId: string) => void;
  onEdit?: (recipeId: string) => void;
};

const difficultyMeta: Record<
  RecipeDifficulty,
  { color: 'brandGreen' | 'brandOrange' | 'brandRed'; label: string }
> = {
  facil: { color: 'brandGreen', label: 'Facil' },
  intermediario: { color: 'brandOrange', label: 'Intermediario' },
  dificil: { color: 'brandRed', label: 'Dificil' },
};

function SectionTitle({ title }: { title: string }) {
  const { theme } = useAppTheme();

  return (
    <AppContainer align="center" direction="row" marginBottom="lg" marginTop="xl">
      <AppContainer
        backgroundColor="text"
        style={{ flex: 1, height: 1, marginRight: theme.spacing.md, opacity: 0.7 }}
      />
      <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.bold }}>
        {title}
      </AppText>
      <AppContainer
        backgroundColor="text"
        style={{ flex: 1, height: 1, marginLeft: theme.spacing.md, opacity: 0.7 }}
      />
    </AppContainer>
  );
}

function PrimaryPill({
  label,
  color,
}: {
  label: string;
  color: 'brandGreen' | 'brandYellow' | 'brandOrange' | 'brandRed';
}) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      backgroundColor={color}
      borderRadius="full"
      paddingHorizontal="md"
      paddingVertical="sm"
      style={{ marginBottom: theme.spacing.sm, marginRight: theme.spacing.sm }}
    >
      <AppText color="textInverse" size="md" style={{ fontWeight: theme.fontWeights.bold }}>
        {label}
      </AppText>
    </AppContainer>
  );
}

function SecondaryPill({
  label,
  color,
  icon,
}: {
  label: string;
  color: 'primary' | 'success';
  icon?: React.ReactNode;
}) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      borderRadius="full"
      direction="row"
      paddingHorizontal="md"
      paddingVertical="sm"
      shadow="sm"
      style={{ marginBottom: theme.spacing.sm, marginRight: theme.spacing.sm }}
    >
      {icon ? <AppContainer style={{ marginRight: theme.spacing.xs }}>{icon}</AppContainer> : null}
      <AppText color={color} size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
        {label}
      </AppText>
    </AppContainer>
  );
}

function NutritionCard({
  title,
  value,
  accentColor,
}: {
  title: string;
  value: string;
  accentColor: 'brandGreen' | 'brandYellow' | 'brandOrange' | 'brandRed';
}) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      shadow="sm"
      style={{
        marginBottom: theme.spacing.md,
        overflow: 'hidden',
        width: '48%',
      }}
    >
      <AppContainer backgroundColor="surface" direction="row">
        <AppContainer
          backgroundColor={accentColor}
          style={{
            borderBottomRightRadius: theme.borderRadius.full,
            borderTopRightRadius: theme.borderRadius.full,
            minHeight: theme.spacing['6xl'] + theme.spacing.md,
            width: theme.spacing.lg,
          }}
        />
        <AppContainer backgroundColor="surface" padding="lg" style={{ flex: 1 }}>
          <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.bold }}>
            {title}
          </AppText>
          <AppText color="text" size="md" marginTop="xs">
            {value}
          </AppText>
        </AppContainer>
      </AppContainer>
    </AppContainer>
  );
}

function IngredientAvatar({ label }: { label: string }) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surfaceSecondary"
      borderRadius="full"
      justify="center"
      style={{
        height: theme.spacing['5xl'],
        marginRight: theme.spacing.md,
        width: theme.spacing['5xl'],
      }}
    >
      <AppText color="textSecondary" size="md" style={{ fontWeight: theme.fontWeights.bold }}>
        {label.slice(0, 1).toUpperCase()}
      </AppText>
    </AppContainer>
  );
}

function IngredientRow({ ingredient }: { ingredient: RecipeDetail['ingredients'][number] }) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      borderRadius="3xl"
      direction="row"
      marginBottom="md"
      padding="md"
      shadow="sm"
    >
      {ingredient.imageUrl ? (
        <Image
          resizeMode="cover"
          source={{ uri: ingredient.imageUrl }}
          style={{
            borderRadius: theme.borderRadius.full,
            height: theme.spacing['5xl'],
            marginRight: theme.spacing.md,
            width: theme.spacing['5xl'],
          }}
        />
      ) : (
        <IngredientAvatar label={ingredient.name} />
      )}
      <AppContainer backgroundColor="surface" style={{ flex: 1 }}>
        <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
          {ingredient.name}
        </AppText>
        <AppText color="textSecondary" size="md">
          {ingredient.quantity}
        </AppText>
      </AppContainer>
      {ingredient.checked ? (
        <CheckCircle2 color={theme.colors.success} size={theme.spacing['3xl']} strokeWidth={2.2} />
      ) : (
        <Circle color={theme.colors.text} size={theme.spacing['3xl']} strokeWidth={2} />
      )}
    </AppContainer>
  );
}

function StepCard({ step }: { step: RecipeDetail['steps'][number] }) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      shadow="sm"
      style={{
        marginBottom: theme.spacing['2xl'],
        overflow: 'hidden',
      }}
    >
      <AppContainer backgroundColor="surface" direction="row">
        <AppContainer
          backgroundColor={step.accentColor}
          style={{
            borderBottomRightRadius: theme.borderRadius.full,
            borderTopRightRadius: theme.borderRadius.full,
            width: theme.spacing.lg,
          }}
        />
        <AppContainer backgroundColor="surface" padding="lg" style={{ flex: 1 }}>
          <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.bold }}>
            {step.title}
          </AppText>
          <AppText color="text" lineHeight="relaxed" marginTop="sm" size="md">
            {step.description}
          </AppText>
        </AppContainer>
      </AppContainer>
    </AppContainer>
  );
}

/* function RatingStars({ rating }: { rating: number }) {
  const { theme } = useAppTheme();
  const filledStars = Math.max(0, Math.min(5, Math.floor(rating)));

  return (
    <AppContainer align="center" direction="row" marginBottom="sm">
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const isFilled = starIndex < filledStars;

        return (
          <Star
            key={starIndex}
            color={theme.colors.brandYellow}
            fill={isFilled ? theme.colors.brandYellow : 'transparent'}
            size={theme.spacing.xl}
            strokeWidth={2}
          />
        );
      })}
      <AppText color="text" size="md" style={{ marginLeft: theme.spacing.sm }}>
        {recipeRatingLabel(rating)}
      </AppText>
    </AppContainer>
  );
} */

function recipeRatingLabel(rating: number) {
  return rating.toFixed(1).replace('.', ',');
}

function StateCard({
  title,
  description,
  actionLabel,
  onAction,
  loading = false,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  loading?: boolean;
}) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      borderRadius="3xl"
      justify="center"
      paddingVertical="3xl"
      shadow="sm"
      style={{
        minHeight: theme.spacing['7xl'] * 2.3,
      }}
    >
      {loading ? <ActivityIndicator color={theme.colors.primary} size="large" /> : null}
      <AppText color="text" marginTop={loading ? 'lg' : undefined} size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
        {title}
      </AppText>
      <AppText
        color="textSecondary"
        lineHeight="relaxed"
        marginTop="sm"
        size="md"
        style={{ maxWidth: '80%', textAlign: 'center' }}
      >
        {description}
      </AppText>
      {actionLabel && onAction ? (
        <AppButton
          label={actionLabel}
          onPress={onAction}
          size="md"
          style={{ marginTop: theme.spacing.lg }}
        />
      ) : null}
    </AppContainer>
  );
}

function AuthorAvatar({
  avatarUrl,
}: {
  avatarUrl?: string | null;
}) {
  const { theme } = useAppTheme();

  if (avatarUrl) {
    return (
      <Image
        resizeMode="cover"
        source={{ uri: avatarUrl }}
        style={{
          borderRadius: theme.borderRadius.full,
          height: theme.spacing['5xl'],
          marginRight: theme.spacing.md,
          width: theme.spacing['5xl'],
        }}
      />
    );
  }

  return (
    <AppContainer
      align="center"
      backgroundColor="surfaceSecondary"
      borderRadius="full"
      justify="center"
      style={{
        height: theme.spacing['5xl'],
        marginRight: theme.spacing.md,
        width: theme.spacing['5xl'],
      }}
    >
      <UserRound color={theme.colors.textSecondary} size={theme.spacing['2xl']} strokeWidth={2} />
    </AppContainer>
  );
}

function PrimaryMedia({ recipe }: { recipe: RecipeDetail }) {
  const { theme } = useAppTheme();
  const media = recipe.primaryMedia;

  if (!media) {
    return (
      <StateCard
        description="Esta receita ainda nao possui imagem ou video enviados."
        title="Nenhuma midia disponivel"
      />
    );
  }

  if (media.type === 'image') {
    return (
      <Image
        resizeMode="cover"
        source={{ uri: media.url }}
        style={{
          borderRadius: theme.borderRadius['3xl'],
          height: theme.spacing['7xl'] * 2.6,
          width: '100%',
        }}
      />
    );
  }

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      borderRadius="3xl"
      justify="center"
      padding="xl"
      shadow="sm"
      style={{
        height: theme.spacing['7xl'] * 2.6,
      }}
    >
      <AppContainer
        align="center"
        backgroundColor="primary"
        borderRadius="full"
        justify="center"
        style={{
          height: theme.spacing['6xl'],
          marginBottom: theme.spacing.lg,
          width: theme.spacing['6xl'],
        }}
      >
        <Play
          color={theme.colors.textInverse}
          fill={theme.colors.textInverse}
          size={theme.spacing['3xl']}
          strokeWidth={1.8}
        />
      </AppContainer>
      <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
        Video principal
      </AppText>
      <AppText color="textSecondary" marginTop="sm" size="md" style={{ textAlign: 'center' }}>
        {media.fileName}
      </AppText>
    </AppContainer>
  );
}

function GalleryMediaCard({ mediaItem }: { mediaItem: RecipeDetail['media'][number] }) {
  const { theme } = useAppTheme();

  if (mediaItem.type === 'image') {
    return (
      <AppContainer
        backgroundColor="surface"
        borderRadius="3xl"
        marginBottom="md"
        padding="sm"
        shadow="sm"
      >
        <Image
          resizeMode="cover"
          source={{ uri: mediaItem.url }}
          style={{
            borderRadius: theme.borderRadius['2xl'],
            height: theme.spacing['7xl'] * 2,
            width: '100%',
          }}
        />
        <AppText
          color="text"
          size="md"
          style={{ fontWeight: theme.fontWeights.semibold, marginTop: theme.spacing.md }}
        >
          {mediaItem.fileName}
        </AppText>
      </AppContainer>
    );
  }

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      direction="row"
      marginBottom="md"
      padding="lg"
      shadow="sm"
    >
      <AppContainer
        align="center"
        backgroundColor="primary"
        borderRadius="xl"
        justify="center"
        style={{
          height: theme.spacing['6xl'],
          marginRight: theme.spacing.md,
          width: theme.spacing['6xl'],
        }}
      >
        <Play
          color={theme.colors.textInverse}
          fill={theme.colors.textInverse}
          size={theme.spacing['2xl']}
          strokeWidth={1.8}
        />
      </AppContainer>
      <AppContainer style={{ flex: 1 }}>
        <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
          Video enviado
        </AppText>
        <AppText color="textSecondary" marginTop="xs" size="md">
          {mediaItem.fileName}
        </AppText>
      </AppContainer>
    </AppContainer>
  );
}

function RecipeDetailScreen({
  recipe,
  onBack,
  isLoading = false,
  errorMessage,
  onRetry,
  onToggleFavorite,
  onEdit,
}: RecipeDetailScreenProps) {
  const { theme } = useAppTheme();

  if (isLoading || errorMessage || !recipe) {
    const title = recipe?.title ?? 'Detalhes da receita';

    return (
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] + theme.spacing['4xl'] }}
        showsVerticalScrollIndicator={false}
      >
        <RecipesTopBar onBack={onBack} title={title} titleSize="2xl" />

        {isLoading ? (
          <StateCard
            description="Buscando os dados completos da receita no backend."
            loading
            title="Carregando receita"
          />
        ) : errorMessage ? (
          <StateCard
            actionLabel="Tentar novamente"
            description={errorMessage}
            onAction={onRetry}
            title="Nao foi possivel abrir a receita"
          />
        ) : (
          <StateCard
            description="Selecione uma receita novamente para carregar os detalhes."
            title="Receita indisponivel"
          />
        )}
      </ScrollView>
    );
  }

  const difficulty = difficultyMeta[recipe.difficulty];
  const statusLabel = recipe.status === 'draft' ? 'Rascunho' : 'Publicada';
  const galleryMedia = recipe.media.filter((mediaItem) => mediaItem.id !== recipe.primaryMedia?.id);
  const hasEngagementMeta = recipe.reviewsCount > 0 || recipe.commentsCount > 0;
  const favoriteColor = recipe.isFavorite ? theme.colors.primary : theme.colors.surface;
  const favoriteFill = recipe.isFavorite ? theme.colors.primary : 'transparent';

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] + theme.spacing['4xl'] }}
      showsVerticalScrollIndicator={false}
    >
      <RecipesTopBar onBack={onBack} title={recipe.title} titleSize="2xl" />

      <AppContainer marginBottom="2xl" style={{ position: 'relative' }}>
        <PrimaryMedia recipe={recipe} />
      </AppContainer>

      <AppContainer align="center" direction="row" justify="space-between" marginBottom="sm">
        <AppText color="text" size="2xl" style={{ flex: 1, fontWeight: theme.fontWeights.bold }}>
          {recipe.title}
        </AppText>
        <AppContainer align="center" direction="row">
          <Pressable
            accessibilityLabel={
              recipe.isFavorite ? 'Remover receita dos favoritos' : 'Adicionar receita aos favoritos'
            }
            onPress={() => onToggleFavorite?.(recipe.id)}
            style={{ marginRight: theme.spacing.lg }}
          >
            <Heart
              color={favoriteColor}
              fill={favoriteFill}
              size={theme.spacing['4xl']}
              strokeWidth={1.8}
            />
          </Pressable>
          <Pressable accessibilityLabel="Compartilhar receita">
            <Share2 color={theme.colors.primary} size={theme.spacing['4xl']} strokeWidth={2} />
          </Pressable>
        </AppContainer>
      </AppContainer>

      {/* <RatingStars rating={recipe.rating} /> */}

      {hasEngagementMeta ? (
        <AppContainer align="center" direction="row" marginBottom="lg">
          {recipe.reviewsCount > 0 ? (
            <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
              {`${recipe.reviewsCount} avaliacoes`}
            </AppText>
          ) : null}
          {recipe.reviewsCount > 0 && recipe.commentsCount > 0 ? (
            <AppText color="primary" size="md" style={{ marginHorizontal: theme.spacing.md }}>
              |
            </AppText>
          ) : null}
          {recipe.commentsCount > 0 ? (
            <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
              {`${recipe.commentsCount} comentarios`}
            </AppText>
          ) : null}
        </AppContainer>
      ) : null}

      <AppContainer
        align="center"
        backgroundColor="surface"
        borderRadius="3xl"
        direction="row"
        marginBottom="lg"
        padding="md"
        shadow="sm"
      >
        <AuthorAvatar avatarUrl={recipe.author.avatarUrl} />
        <AppContainer backgroundColor="surface" style={{ flex: 1 }}>
          <AppText color="text" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
            {`Por ${recipe.author.name}`}
          </AppText>
          {recipe.author.subtitle ? (
            <AppText color="textSecondary" size="md">
              {recipe.author.subtitle}
            </AppText>
          ) : null}
        </AppContainer>
      </AppContainer>

      <AppContainer direction="row" marginBottom="xs" style={{ flexWrap: 'wrap' }}>
        <PrimaryPill color="brandGreen" label={`${recipe.prepMinutes} min`} />
        <PrimaryPill color="brandYellow" label={`${recipe.servings} porções`} />
        <PrimaryPill color={difficulty.color} label={difficulty.label} />
      </AppContainer>

      <AppContainer direction="row" marginBottom="md" style={{ flexWrap: 'wrap' }}>
        <SecondaryPill color="primary" label={statusLabel} />
        {recipe.isCollaborative ? (
          <SecondaryPill
            color="success"
            icon={
              <Users2
                color={theme.colors.success}
                size={theme.spacing.md + theme.spacing.xs}
                strokeWidth={2}
              />
            }
            label="Receita colaborativa"
          />
        ) : null}
      </AppContainer>

      {galleryMedia.length ? (
        <>
          <SectionTitle title="Galeria de midias" />
          {galleryMedia.map((mediaItem) => (
            <GalleryMediaCard key={mediaItem.id} mediaItem={mediaItem} />
          ))}
        </>
      ) : null}

      <SectionTitle title="Informacao nutricional" />

      <AppContainer direction="row" justify="space-between" style={{ flexWrap: 'wrap' }}>
        <NutritionCard accentColor="brandRed" title="Calorias" value={recipe.nutrition.calories} />
        <NutritionCard accentColor="brandGreen" title="Proteinas" value={recipe.nutrition.proteins} />
        <NutritionCard
          accentColor="brandYellow"
          title="Carboidratos"
          value={recipe.nutrition.carbohydrates}
        />
        <NutritionCard accentColor="brandOrange" title="Gorduras" value={recipe.nutrition.fats} />
      </AppContainer>

      <SectionTitle title="Ingredientes" />

      {recipe.ingredients.length ? (
        recipe.ingredients.map((ingredient) => (
          <IngredientRow key={ingredient.id} ingredient={ingredient} />
        ))
      ) : (
        <StateCard
          description="Nenhum ingrediente foi informado para esta receita."
          title="Ingredientes indisponiveis"
        />
      )}

      <SectionTitle title="Modo de preparo" />

      {/* <AppContainer direction="row" marginBottom="2xl">
        <AppButton
          fullWidth
          label="Iniciar modo chef"
          size="lg"
          style={{ flex: 1, marginRight: theme.spacing.md }}
          textStyle={{ fontSize: theme.fontSizes.md }}
        />
        <AppButton
          fullWidth
          label="Iniciar temporizador"
          size="lg"
          style={{ flex: 1 }}
          textStyle={{ fontSize: theme.fontSizes.md }}
          variant="outline"
        />
      </AppContainer> */}

      {recipe.steps.length ? (
        recipe.steps.map((step) => <StepCard key={step.id} step={step} />)
      ) : (
        <StateCard
          description="O backend ainda nao retornou etapas para esta receita."
          title="Modo de preparo indisponivel"
        />
      )}
    </ScrollView>
  );
}

export default RecipeDetailScreen;
