import React from 'react';
import { Image, Pressable, ScrollView } from 'react-native';
import {
  CheckCircle2,
  Circle,
  Heart,
  Share2,
  Star,
  UserPlus2,
} from 'lucide-react-native';

import { AppButton, AppContainer, AppText } from '../../components/ui';
import { useAppTheme } from '../../contexts';
import { RecipeDetail, RecipeDifficulty } from './types';
import { RecipesTopBar } from './components';

type RecipeDetailScreenProps = {
  recipe: RecipeDetail;
  onBack: () => void;
};

const difficultyMeta: Record<RecipeDifficulty, { color: 'brandGreen' | 'brandOrange' | 'brandRed'; label: string }> = {
  facil: { color: 'brandGreen', label: 'Fácil' },
  intermediario: { color: 'brandOrange', label: 'Intermediário' },
  dificil: { color: 'brandRed', label: 'Difícil' },
};

function SectionTitle({ title }: { title: string }) {
  const { theme } = useAppTheme();

  return (
    <AppContainer align="center" direction="row" marginBottom="lg" marginTop="xl">
      <AppContainer
        backgroundColor="text"
        style={{ flex: 1, height: 1, marginRight: theme.spacing.md, opacity: 0.7 }}
      />
      <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
        {title}
      </AppText>
      <AppContainer
        backgroundColor="text"
        style={{ flex: 1, height: 1, marginLeft: theme.spacing.md, opacity: 0.7 }}
      />
    </AppContainer>
  );
}

function DetailPill({
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
      style={{ marginRight: theme.spacing.sm }}
    >
      <AppText color="textInverse" size="lg" style={{ fontWeight: theme.fontWeights.bold }}>
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
      <AppContainer direction="row">
        <AppContainer
          backgroundColor={accentColor}
          style={{
            borderBottomRightRadius: theme.borderRadius.full,
            borderTopRightRadius: theme.borderRadius.full,
            minHeight: theme.spacing['6xl'] + theme.spacing.md,
            width: theme.spacing.lg,
          }}
        />
        <AppContainer padding="lg" style={{ flex: 1 }}>
          <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
            {title}
          </AppText>
          <AppText color="text" size="lg" marginTop="xs">
            {value}
          </AppText>
        </AppContainer>
      </AppContainer>
    </AppContainer>
  );
}

function IngredientRow({ recipeIngredient }: { recipeIngredient: RecipeDetail['ingredients'][number] }) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      borderRadius="3xl"
      direction="row"
      padding="md"
      shadow="sm"
      marginBottom="md"
    >
      <Image
        resizeMode="cover"
        source={{ uri: recipeIngredient.imageUrl }}
        style={{
          borderRadius: theme.borderRadius.full,
          height: theme.spacing['5xl'],
          marginRight: theme.spacing.md,
          width: theme.spacing['5xl'],
        }}
      />
      <AppContainer style={{ flex: 1 }}>
        <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.semibold }}>
          {recipeIngredient.name}
        </AppText>
        <AppText color="textSecondary" size="lg">
          {recipeIngredient.quantity}
        </AppText>
      </AppContainer>
      {recipeIngredient.checked ? (
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
      <AppContainer direction="row">
        <AppContainer
          backgroundColor={step.accentColor}
          style={{
            borderBottomRightRadius: theme.borderRadius.full,
            borderTopRightRadius: theme.borderRadius.full,
            width: theme.spacing.lg,
          }}
        />
        <AppContainer padding="lg" style={{ flex: 1 }}>
          <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
            {step.title}
          </AppText>
          <AppText color="text" lineHeight="relaxed" size="xl" marginTop="sm">
            {step.description}
          </AppText>
        </AppContainer>
      </AppContainer>
    </AppContainer>
  );
}

function RecipeDetailScreen({ recipe, onBack }: RecipeDetailScreenProps) {
  const { theme } = useAppTheme();
  const difficulty = difficultyMeta[recipe.difficulty];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] + theme.spacing['4xl'] }}
      showsVerticalScrollIndicator={false}
    >
      <RecipesTopBar onBack={onBack} title={recipe.title} />

      <AppContainer marginBottom="2xl" style={{ position: 'relative' }}>
        <Image
          resizeMode="cover"
          source={{ uri: recipe.imageUrl }}
          style={{
            borderRadius: theme.borderRadius['3xl'],
            height: theme.spacing['7xl'] * 2.6,
            width: '100%',
          }}
        />

        <AppContainer
          align="center"
          direction="row"
          justify="center"
          style={{
            bottom: theme.spacing.md,
            left: 0,
            position: 'absolute',
            right: 0,
          }}
        >
          {[0, 1, 2, 3].map((dotIndex) => (
            <AppContainer
              key={dotIndex}
              backgroundColor={dotIndex === 0 ? 'primary' : 'surface'}
              borderRadius="full"
              style={{
                height: theme.spacing.sm,
                marginHorizontal: theme.spacing.xs,
                width: theme.spacing.sm,
              }}
            />
          ))}
        </AppContainer>
      </AppContainer>

      <AppContainer align="center" direction="row" justify="space-between" marginBottom="sm">
        <AppText color="text" size="4xl" style={{ flex: 1, fontWeight: theme.fontWeights.bold }}>
          {recipe.title}
        </AppText>
        <AppContainer align="center" direction="row">
          <Pressable
            accessibilityLabel="Favoritar receita"
            style={{ marginRight: theme.spacing.lg }}
          >
            <Heart
              color={theme.colors.primary}
              fill={theme.colors.primary}
              size={theme.spacing['4xl']}
              strokeWidth={1.8}
            />
          </Pressable>
          <Pressable accessibilityLabel="Compartilhar receita">
            <Share2 color={theme.colors.primary} size={theme.spacing['4xl']} strokeWidth={2} />
          </Pressable>
        </AppContainer>
      </AppContainer>

      <AppContainer align="center" direction="row" marginBottom="sm">
        {[0, 1, 2, 3].map((starIndex) => (
          <Star
            key={starIndex}
            color={theme.colors.brandYellow}
            fill={theme.colors.brandYellow}
            size={theme.spacing.xl}
            strokeWidth={2}
          />
        ))}
        <Star color={theme.colors.brandYellow} size={theme.spacing.xl} strokeWidth={2} />
        <AppText color="text" size="xl" style={{ marginLeft: theme.spacing.sm }}>
          {recipe.rating.toFixed(1).replace('.', ',')}
        </AppText>
      </AppContainer>

      <AppContainer align="center" direction="row" marginBottom="lg">
        <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.semibold }}>
          {`${recipe.reviewsCount} avaliações`}
        </AppText>
        <AppText color="primary" size="xl" style={{ marginHorizontal: theme.spacing.md }}>
          •
        </AppText>
        <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.semibold }}>
          {`${recipe.commentsCount} comentários`}
        </AppText>
      </AppContainer>

      <AppContainer
        align="center"
        backgroundColor="surface"
        borderRadius="3xl"
        direction="row"
        padding="md"
        shadow="sm"
        marginBottom="lg"
      >
        <Image
          resizeMode="cover"
          source={{ uri: recipe.author.avatarUrl }}
          style={{
            borderRadius: theme.borderRadius.full,
            height: theme.spacing['5xl'],
            marginRight: theme.spacing.md,
            width: theme.spacing['5xl'],
          }}
        />
        <AppContainer style={{ flex: 1 }}>
          <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.semibold }}>
            {`Por ${recipe.author.name}`}
          </AppText>
          <AppText color="textSecondary" size="lg">
            {`${recipe.author.followers} seguidores`}
          </AppText>
        </AppContainer>
        <UserPlus2 color={theme.colors.text} size={theme.spacing['3xl']} strokeWidth={2.2} />
      </AppContainer>

      <AppContainer direction="row" marginBottom="md">
        <DetailPill color="brandGreen" label={`${recipe.prepMinutes} min`} />
        <DetailPill color="brandYellow" label={`${recipe.servings} porções`} />
        <DetailPill color={difficulty.color} label={difficulty.label} />
      </AppContainer>

      <SectionTitle title="Informação nutricional" />

      <AppContainer
        direction="row"
        justify="space-between"
        style={{ flexWrap: 'wrap' }}
      >
        <NutritionCard accentColor="brandRed" title="Calorias" value={recipe.nutrition.calories} />
        <NutritionCard accentColor="brandGreen" title="Proteínas" value={recipe.nutrition.proteins} />
        <NutritionCard
          accentColor="brandYellow"
          title="Carboidratos"
          value={recipe.nutrition.carbohydrates}
        />
        <NutritionCard accentColor="brandOrange" title="Gorduras" value={recipe.nutrition.fats} />
      </AppContainer>

      <SectionTitle title="Ingredientes" />

      {recipe.ingredients.map((ingredient) => (
        <IngredientRow key={ingredient.id} recipeIngredient={ingredient} />
      ))}

      <SectionTitle title="Modo de preparo" />

      <AppContainer direction="row" marginBottom="2xl">
        <AppButton
          fullWidth
          label="Iniciar modo chef"
          size="lg"
          style={{ flex: 1, marginRight: theme.spacing.md }}
        />
        <AppButton
          fullWidth
          label="Iniciar temporizador"
          size="lg"
          variant="outline"
          style={{ flex: 1 }}
        />
      </AppContainer>

      {recipe.steps.map((step) => (
        <StepCard key={step.id} step={step} />
      ))}

      <AppContainer
        align="center"
        backgroundColor="surface"
        borderRadius="3xl"
        paddingVertical="3xl"
        shadow="sm"
        style={{
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <AppContainer
          backgroundColor="brandGreen"
          borderRadius="full"
          style={{
            height: theme.spacing['7xl'] * 1.3,
            left: -theme.spacing['4xl'],
            position: 'absolute',
            top: -theme.spacing['4xl'],
            width: theme.spacing['7xl'] * 1.3,
            opacity: 0.92,
          }}
        />
        <AppContainer
          backgroundColor="brandOrange"
          borderRadius="full"
          style={{
            height: theme.spacing['7xl'] * 1.4,
            position: 'absolute',
            right: -theme.spacing['4xl'],
            top: -theme.spacing['4xl'],
            width: theme.spacing['7xl'] * 1.4,
            opacity: 0.92,
          }}
        />
        <AppContainer
          backgroundColor="brandYellow"
          borderRadius="full"
          style={{
            bottom: -theme.spacing['4xl'],
            height: theme.spacing['7xl'] * 1.5,
            left: -theme.spacing.lg,
            position: 'absolute',
            width: theme.spacing['7xl'] * 1.6,
            opacity: 0.92,
          }}
        />

        <AppContainer
          align="center"
          backgroundColor="surface"
          borderRadius="full"
          paddingHorizontal="2xl"
          paddingVertical="3xl"
          style={{ zIndex: 2 }}
        >
          <AppText color="text" size="2xl" style={{ fontWeight: theme.fontWeights.bold }}>
            Avalie esta receita
          </AppText>
          <AppContainer align="center" direction="row" justify="center" marginTop="md">
            {[0, 1, 2, 3, 4].map((starIndex) => (
              <Star
                key={starIndex}
                color={theme.colors.text}
                size={theme.spacing['3xl']}
                strokeWidth={1.8}
                style={{ marginHorizontal: theme.spacing.xs }}
              />
            ))}
          </AppContainer>
        </AppContainer>
      </AppContainer>
    </ScrollView>
  );
}

export default RecipeDetailScreen;
