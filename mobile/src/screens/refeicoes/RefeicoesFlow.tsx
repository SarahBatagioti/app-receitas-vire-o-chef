import React from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Minus,
  Plus,
  Search,
} from 'lucide-react-native';
import { Path, Svg, SvgXml } from 'react-native-svg';

import cafeDaManhaImage from '../../assets/images/cafe-da-manha.png';
import almocoImage from '../../assets/images/almoco.png';
import cafeDaTardeImage from '../../assets/images/cafe-da-tarde.png';
import jantaImage from '../../assets/images/janta.png';
import { AppButton, AppContainer, AppText } from '../../components/ui';
import {
  getLogoVireOChefXml,
  LOGO_VIRE_O_CHEF_ASPECT_RATIO,
} from '../../assets/images/logoVireOChefXml';
import { useAppTheme } from '../../contexts';
import {
  MealDiaryReplaceItemPayload,
  MealDiaryRecordMeal,
  MealType,
  mealDiaryService,
} from '../../services/mealDiaryService';
import { getErrorMessage } from '../../services/api';
import { RecipeRecord, recipeService } from '../../services/recipeService';
import {
  MealDraftItem,
  MealRecipeListItem,
  MealUiConfig,
  MealsRoute,
} from './types';
import {
  ORDERED_MEAL_TYPES,
  addWeeksToIsoDate,
  buildWeekCalendar,
  calculateDraftMealTotal,
  createDraftItemsFromMeal,
  createEmptyMealDiaryDay,
  formatCalories,
  formatQuantity,
  getMealByType,
  getTodayLocalIsoDate,
  mergeAndDeduplicateRecipes,
  replaceMealInDay,
  upsertDraftItem,
  updateDraftItemQuantity,
} from './utils';

const MEAL_CONFIG: Record<MealType, MealUiConfig> = {
  breakfast: {
    type: 'breakfast',
    label: 'Café da manhã',
    color: '#ED0F0F',
    imageSource: cafeDaManhaImage,
  },
  lunch: {
    type: 'lunch',
    label: 'Almoço',
    color: '#008721',
    imageSource: almocoImage,
  },
  afternoonSnack: {
    type: 'afternoonSnack',
    label: 'Café da tarde',
    color: '#F2AB01',
    imageSource: cafeDaTardeImage,
  },
  dinner: {
    type: 'dinner',
    label: 'Janta',
    color: '#F3571C',
    imageSource: jantaImage,
  },
};

function NotificationBellIcon({ color, size = 26 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2Zm.995-14.901a1 1 0 1 0-1.99 0A5.002 5.002 0 0 0 3 6c0 1.098-.5 6-2 7h14c-1.5-1-2-5.902-2-7a5.002 5.002 0 0 0-4.005-4.901Z"
        fill={color}
      />
    </Svg>
  );
}

function MealsHeader() {
  const { theme, themeMode } = useAppTheme();
  const { width } = useWindowDimensions();
  const isDarkMode = themeMode === 'dark';
  const accentColor = isDarkMode ? theme.colors.text : theme.colors.primary;
  const logoHeight = Math.min(Math.max(width * 0.13, 44), 52);
  const logoWidth = logoHeight * LOGO_VIRE_O_CHEF_ASPECT_RATIO;

  return (
    <AppContainer
      align="center"
      backgroundColor="background"
      direction="row"
      justify="space-between"
      marginBottom="xl"
      style={{ backgroundColor: 'transparent' }}
    >
      <AppContainer
        align="center"
        backgroundColor="background"
        direction="row"
        style={{ backgroundColor: 'transparent', flexShrink: 1 }}
      >
        <SvgXml xml={getLogoVireOChefXml(themeMode)} width={logoWidth} height={logoHeight} />
        <AppText
          color={isDarkMode ? 'text' : 'primary'}
          size={width < 360 ? '4xl' : '5xl'}
          style={{
            flexShrink: 1,
            fontFamily: theme.fonts.secondary.regular,
            lineHeight: theme.fontSizes[width < 360 ? '4xl' : '5xl'] * 1.05,
            marginLeft: theme.spacing.sm,
          }}
        >
          Vire o Chef
        </AppText>
      </AppContainer>

      <NotificationBellIcon color={accentColor} />
    </AppContainer>
  );
}

function MealsWeekCalendar({
  selectedDate,
  onPreviousWeek,
  onNextWeek,
}: {
  selectedDate: string;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
}) {
  const { theme } = useAppTheme();
  const weekDays = buildWeekCalendar(selectedDate);

  return (
    <AppContainer
      align="center"
      backgroundColor="background"
      direction="row"
      justify="space-between"
      marginBottom="xl"
      style={{ backgroundColor: 'transparent' }}
    >
      <Pressable accessibilityLabel="Voltar uma semana" onPress={onPreviousWeek}>
        <ChevronLeft color={theme.colors.primary} size={theme.spacing['2xl']} strokeWidth={2.4} />
      </Pressable>

      <AppContainer
        backgroundColor="background"
        direction="row"
        justify="space-between"
        style={{ backgroundColor: 'transparent', flex: 1, marginHorizontal: theme.spacing.md }}
      >
        {weekDays.map((day) => (
          <View
            key={day.isoDate}
            style={{
              alignItems: 'center',
              flex: 1,
            }}
          >
            <AppText
              color={day.isSelected || day.isToday ? 'primary' : 'text'}
              size="lg"
              style={{ fontWeight: day.isSelected ? theme.fontWeights.semibold : theme.fontWeights.regular }}
            >
              {day.weekdayLabel}
            </AppText>
            <AppText
              color={day.isSelected || day.isToday ? 'primary' : 'text'}
              size="xl"
              style={{ fontWeight: theme.fontWeights.bold }}
            >
              {day.dayNumber}
            </AppText>
            <View
              style={{
                backgroundColor: day.isToday ? theme.colors.primary : 'transparent',
                borderRadius: theme.borderRadius.full,
                height: 6,
                marginTop: 2,
                width: 6,
              }}
            />
          </View>
        ))}
      </AppContainer>

      <Pressable accessibilityLabel="Avancar uma semana" onPress={onNextWeek}>
        <ChevronRight color={theme.colors.primary} size={theme.spacing['2xl']} strokeWidth={2.4} />
      </Pressable>
    </AppContainer>
  );
}

function MealSummaryCard({
  config,
  meal,
  onPressAdd,
}: {
  config: MealUiConfig;
  meal: MealDiaryRecordMeal;
  onPressAdd: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      backgroundColor="surface"
      borderRadius="3xl"
      marginBottom="xl"
      padding="lg"
      shadow="md"
      style={{ minHeight: 102 }}
    >
      <AppContainer align="center" backgroundColor="surface" direction="row">
        <View
          style={{
            alignItems: 'center',
            borderColor: config.color,
            borderRadius: theme.borderRadius.full,
            borderWidth: 8,
            height: 74,
            justifyContent: 'center',
            width: 74,
          }}
        >
          <Image source={config.imageSource} style={{ borderRadius: 999, height: 46, width: 46 }} />
        </View>

        <AppContainer
          backgroundColor="surface"
          justify="center"
          style={{ flex: 1, marginLeft: theme.spacing.lg }}
        >
          <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
            {config.label}
          </AppText>
          <AppText color="text" size="xl" style={{ marginTop: 4 }}>
            {`Total: ${formatCalories(meal.totalCalories)} kcal`}
          </AppText>
        </AppContainer>

        <Pressable
          accessibilityLabel={`Adicionar receita em ${config.label}`}
          onPress={onPressAdd}
          style={{ padding: theme.spacing.xs }}
        >
          <CirclePlus color={theme.colors.text} size={34} strokeWidth={1.7} />
        </Pressable>
      </AppContainer>
    </AppContainer>
  );
}

function MealPortionEditor({
  quantity,
  onDecrease,
  onIncrease,
}: {
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      direction="row"
      justify="center"
      style={{ gap: theme.spacing.xs }}
    >
      <Pressable
        accessibilityLabel="Diminuir quantidade"
        onPress={onDecrease}
        style={{
          alignItems: 'center',
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.full,
          borderWidth: 1,
          height: 30,
          justifyContent: 'center',
          width: 30,
        }}
      >
        <Minus color={theme.colors.text} size={16} strokeWidth={2.3} />
      </Pressable>

      <AppText
        color="text"
        size="md"
        style={{ minWidth: 34, textAlign: 'center', fontWeight: theme.fontWeights.semibold }}
      >
        {formatQuantity(quantity)}
      </AppText>

      <Pressable
        accessibilityLabel="Aumentar quantidade"
        onPress={onIncrease}
        style={{
          alignItems: 'center',
          borderColor: theme.colors.border,
          borderRadius: theme.borderRadius.full,
          borderWidth: 1,
          height: 30,
          justifyContent: 'center',
          width: 30,
        }}
      >
        <Plus color={theme.colors.text} size={16} strokeWidth={2.3} />
      </Pressable>
    </AppContainer>
  );
}

function MealRecipeListItemCard({
  recipe,
  selectedDraft,
  onAdd,
  onChangeQuantity,
}: {
  recipe: MealRecipeListItem;
  selectedDraft: MealDraftItem | undefined;
  onAdd: () => void;
  onChangeQuantity: (nextQuantity: number) => void;
}) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      align="center"
      backgroundColor="surface"
      borderRadius="3xl"
      direction="row"
      justify="space-between"
      marginBottom="lg"
      padding="lg"
      shadow="sm"
    >
      <AppContainer
        align="center"
        backgroundColor="surface"
        direction="row"
        style={{ flex: 1, marginRight: theme.spacing.md }}
      >
        {recipe.imageUrl ? (
          <Image
            source={{ uri: recipe.imageUrl }}
            style={{ borderRadius: theme.borderRadius.full, height: 52, width: 52 }}
          />
        ) : (
          <View
            style={{
              alignItems: 'center',
              backgroundColor: theme.colors.surfaceSecondary,
              borderRadius: 999,
              height: 52,
              justifyContent: 'center',
              width: 52,
            }}
          >
            <AppText color="textSecondary" size="sm" style={{ fontWeight: theme.fontWeights.bold }}>
              {recipe.title.slice(0, 1).toUpperCase()}
            </AppText>
          </View>
        )}

        <View style={{ flex: 1, marginLeft: theme.spacing.md }}>
          <AppText color="text" size="lg" style={{ fontWeight: theme.fontWeights.bold }}>
            {recipe.title}
          </AppText>
          <AppText color="textSecondary" size="md">
            {`${formatCalories(recipe.calories)} kcal, ${recipe.servings} porção${recipe.servings > 1 ? 'es' : ''}`}
          </AppText>
          <AppText color="brandYellow" size="md" style={{ fontWeight: theme.fontWeights.semibold }}>
            {`Por ${recipe.authorName}`}
          </AppText>
        </View>
      </AppContainer>

      {selectedDraft ? (
        <MealPortionEditor
          quantity={selectedDraft.quantity}
          onDecrease={() => onChangeQuantity(selectedDraft.quantity - 0.5)}
          onIncrease={() => onChangeQuantity(selectedDraft.quantity + 0.5)}
        />
      ) : (
        <Pressable accessibilityLabel={`Adicionar ${recipe.title}`} onPress={onAdd}>
          <CirclePlus color={theme.colors.text} size={32} strokeWidth={1.7} />
        </Pressable>
      )}
    </AppContainer>
  );
}

function SearchInput({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (value: string) => void;
}) {
  const { theme } = useAppTheme();

  return (
    <View
      style={{
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius['3xl'],
        borderWidth: 1,
        flexDirection: 'row',
        marginBottom: theme.spacing['2xl'],
        paddingHorizontal: theme.spacing.lg,
      }}
    >
      <Search color={theme.colors.primary} size={theme.spacing['2xl']} strokeWidth={2} />
      <TextInput
        onChangeText={onChangeText}
        placeholder="Pesquisar receitas..."
        placeholderTextColor={theme.colors.textTertiary}
        style={{
          color: theme.colors.text,
          flex: 1,
          fontFamily: theme.fonts.primary.regular,
          fontSize: theme.fontSizes.lg,
          paddingVertical: theme.spacing.lg,
          paddingLeft: theme.spacing.md,
        }}
        value={value}
      />
    </View>
  );
}

function MealRecipeSearchScreen({
  config,
  searchValue,
  onChangeSearchValue,
  filteredRecipes,
  draftItems,
  onBack,
  onAddRecipe,
  onChangeQuantity,
  onSave,
  isSaving,
}: {
  config: MealUiConfig;
  searchValue: string;
  onChangeSearchValue: (value: string) => void;
  filteredRecipes: MealRecipeListItem[];
  draftItems: MealDraftItem[];
  onBack: () => void;
  onAddRecipe: (recipe: MealRecipeListItem) => void;
  onChangeQuantity: (recipeId: string, quantity: number) => void;
  onSave: () => void;
  isSaving: boolean;
}) {
  const { theme } = useAppTheme();
  const draftTotal = calculateDraftMealTotal(draftItems);

  return (
    <AppContainer flex backgroundColor="background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] * 2 }}
        showsVerticalScrollIndicator={false}
      >
        <AppContainer
          align="center"
          backgroundColor="background"
          direction="row"
          marginBottom="2xl"
          style={{ backgroundColor: 'transparent' }}
        >
          <Pressable
            accessibilityLabel="Voltar para refeições"
            onPress={onBack}
            style={{ marginRight: theme.spacing.md }}
          >
            <ChevronLeft color={theme.colors.primary} size={theme.spacing['2xl']} strokeWidth={2.4} />
          </Pressable>

          <View
            style={{
              alignItems: 'center',
              borderColor: config.color,
              borderRadius: theme.borderRadius.full,
              borderWidth: 8,
              height: 66,
              justifyContent: 'center',
              width: 66,
            }}
          >
            <Image source={config.imageSource} style={{ borderRadius: 999, height: 40, width: 40 }} />
          </View>

          <View style={{ flex: 1, marginLeft: theme.spacing.lg }}>
            <AppText color="text" size="xl" style={{ fontWeight: theme.fontWeights.bold }}>
              {config.label}
            </AppText>
            <AppText color="text" size="xl">{`Total: ${formatCalories(draftTotal)} kcal`}</AppText>
          </View>
        </AppContainer>

        <SearchInput onChangeText={onChangeSearchValue} value={searchValue} />

        <AppText
          color="text"
          size="xl"
          style={{ fontWeight: theme.fontWeights.bold, marginBottom: theme.spacing.lg }}
        >
          Receitas disponíveis
        </AppText>

        {filteredRecipes.length ? (
          filteredRecipes.map((recipe) => {
            const selectedDraft = draftItems.find((item) => item.recipeId === recipe.id);

            return (
              <MealRecipeListItemCard
                key={recipe.id}
                onAdd={() => onAddRecipe(recipe)}
                onChangeQuantity={(nextQuantity) => onChangeQuantity(recipe.id, nextQuantity)}
                recipe={recipe}
                selectedDraft={selectedDraft}
              />
            );
          })
        ) : (
          <AppContainer align="center" backgroundColor="background" padding="xl">
            <AppText color="textSecondary" size="md">
              Nenhuma receita encontrada.
            </AppText>
          </AppContainer>
        )}
      </ScrollView>

      <View
        style={{
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          paddingBottom: theme.spacing.xl,
          paddingTop: theme.spacing.md,
        }}
      >
        <AppButton
          label="Salvar refeição"
          loading={isSaving}
          onPress={onSave}
          style={{ minHeight: theme.spacing['6xl'] }}
        />
      </View>
    </AppContainer>
  );
}

function RefeicoesFlow() {
  const { theme, themeMode } = useAppTheme();
  const today = React.useMemo(() => getTodayLocalIsoDate(), []);
  const [route, setRoute] = React.useState<MealsRoute>('home');
  const [selectedDate, setSelectedDate] = React.useState(today);
  const [selectedMealType, setSelectedMealType] = React.useState<MealType>('breakfast');
  const [dayDiary, setDayDiary] = React.useState(() => createEmptyMealDiaryDay(today));
  const [availableRecipes, setAvailableRecipes] = React.useState<MealRecipeListItem[]>([]);
  const [draftItems, setDraftItems] = React.useState<MealDraftItem[]>([]);
  const [searchValue, setSearchValue] = React.useState('');
  const [isDiaryLoading, setIsDiaryLoading] = React.useState(true);
  const [isRecipesLoading, setIsRecipesLoading] = React.useState(true);
  const [isSavingMeal, setIsSavingMeal] = React.useState(false);
  const [screenError, setScreenError] = React.useState<string | null>(null);
  const [recipesError, setRecipesError] = React.useState<string | null>(null);

  const loadDiaryByDate = React.useCallback(async (date: string) => {
    setIsDiaryLoading(true);
    setScreenError(null);

    try {
      const diary = await mealDiaryService.getDiaryByDate(date);
      setDayDiary(diary);
    } catch (error) {
      setDayDiary(createEmptyMealDiaryDay(date));
      setScreenError(getErrorMessage(error, 'Não foi possível carregar o diário de refeições.'));
    } finally {
      setIsDiaryLoading(false);
    }
  }, []);

  const loadRecipes = React.useCallback(async () => {
    setIsRecipesLoading(true);
    setRecipesError(null);

    try {
      const [myRecipes, publicRecipes] = await Promise.all([
        recipeService.listMyRecipes(),
        recipeService.listPublicRecipes(),
      ]);

      setAvailableRecipes(mergeAndDeduplicateRecipes(myRecipes, publicRecipes));
    } catch (error) {
      setAvailableRecipes([]);
      setRecipesError(getErrorMessage(error, 'Não foi possível carregar as receitas cadastradas.'));
    } finally {
      setIsRecipesLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadRecipes().catch(() => undefined);
  }, [loadRecipes]);

  React.useEffect(() => {
    loadDiaryByDate(selectedDate).catch(() => undefined);
  }, [loadDiaryByDate, selectedDate]);

  const filteredRecipes = React.useMemo(() => {
    const normalizedQuery = searchValue.trim().toLowerCase();

    if (!normalizedQuery) {
      return availableRecipes;
    }

    return availableRecipes.filter((recipe) => recipe.title.toLowerCase().includes(normalizedQuery));
  }, [availableRecipes, searchValue]);

  const handleOpenMealSearch = React.useCallback(
    (mealType: MealType) => {
      setSelectedMealType(mealType);
      setDraftItems(createDraftItemsFromMeal(getMealByType(dayDiary, mealType)));
      setSearchValue('');
      setRoute('search');
    },
    [dayDiary],
  );

  const handleSaveMeal = React.useCallback(async () => {
    setIsSavingMeal(true);
    setScreenError(null);

    try {
      const payload: MealDiaryReplaceItemPayload[] = draftItems.map((item) => ({
        recipeId: item.recipeId,
        quantity: item.quantity,
      }));

      const updatedMeal = await mealDiaryService.replaceMeal(selectedDate, selectedMealType, payload);

      setDayDiary((currentDay) => replaceMealInDay(currentDay, updatedMeal));
      setRoute('home');
    } catch (error) {
      setScreenError(getErrorMessage(error, 'Não foi possível salvar a refeição.'));
    } finally {
      setIsSavingMeal(false);
    }
  }, [draftItems, selectedDate, selectedMealType]);

  const selectedConfig = MEAL_CONFIG[selectedMealType];
  const isBusy = isDiaryLoading || (route === 'search' && isRecipesLoading);

  if (route === 'search') {
    return (
      <MealRecipeSearchScreen
        config={selectedConfig}
        draftItems={draftItems}
        filteredRecipes={filteredRecipes}
        isSaving={isSavingMeal}
        onAddRecipe={(recipe) => setDraftItems((current) => upsertDraftItem(current, recipe))}
        onBack={() => setRoute('home')}
        onChangeQuantity={(recipeId, quantity) =>
          setDraftItems((current) => updateDraftItemQuantity(current, recipeId, quantity))
        }
        onChangeSearchValue={setSearchValue}
        onSave={handleSaveMeal}
        searchValue={searchValue}
      />
    );
  }

  return (
    <AppContainer flex backgroundColor="background">
      <ScrollView
        contentContainerStyle={{ paddingBottom: theme.spacing['7xl'] * 2 }}
        showsVerticalScrollIndicator={false}
      >
        <MealsHeader />
        <MealsWeekCalendar
          onNextWeek={() => setSelectedDate((current) => addWeeksToIsoDate(current, 1))}
          onPreviousWeek={() => setSelectedDate((current) => addWeeksToIsoDate(current, -1))}
          selectedDate={selectedDate}
        />

        {screenError ? (
          <AppContainer
            backgroundColor={themeMode === 'dark' ? 'surfaceSecondary' : 'surface'}
            borderRadius="2xl"
            marginBottom="lg"
            padding="md"
          >
            <AppText color="error" size="md">
              {screenError}
            </AppText>
          </AppContainer>
        ) : null}

        {recipesError ? (
          <AppContainer
            backgroundColor={themeMode === 'dark' ? 'surfaceSecondary' : 'surface'}
            borderRadius="2xl"
            marginBottom="lg"
            padding="md"
          >
            <AppText color="warning" size="md">
              {recipesError}
            </AppText>
          </AppContainer>
        ) : null}

        {isBusy ? (
          <AppContainer align="center" backgroundColor="background" padding="xl">
            <ActivityIndicator color={theme.colors.primary} size="large" />
          </AppContainer>
        ) : (
          ORDERED_MEAL_TYPES.map((mealType) => (
            <MealSummaryCard
              key={mealType}
              config={MEAL_CONFIG[mealType]}
              meal={getMealByType(dayDiary, mealType)}
              onPressAdd={() => handleOpenMealSearch(mealType)}
            />
          ))
        )}
      </ScrollView>
    </AppContainer>
  );
}

export default RefeicoesFlow;
