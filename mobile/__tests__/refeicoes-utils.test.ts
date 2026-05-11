import {
  buildWeekCalendar,
  calculateDraftMealTotal,
  createEmptyMealDiaryDay,
  mergeAndDeduplicateRecipes,
  replaceMealInDay,
} from '../src/screens/refeicoes/utils';

describe('refeicoes utils', () => {
  test('buildWeekCalendar starts on monday', () => {
    const week = buildWeekCalendar('2026-05-14', '2026-05-14');

    expect(week[0]?.isoDate).toBe('2026-05-11');
    expect(week[0]?.weekdayLabel).toBe('Seg');
    expect(week[3]?.isoDate).toBe('2026-05-14');
    expect(week[3]?.isSelected).toBe(true);
  });

  test('buildWeekCalendar distinguishes selected day from today', () => {
    const week = buildWeekCalendar('2026-05-15', '2026-05-14');
    const today = week.find((day) => day.isoDate === '2026-05-14');
    const selected = week.find((day) => day.isoDate === '2026-05-15');

    expect(today).toMatchObject({ isToday: true, isSelected: false });
    expect(selected).toMatchObject({ isToday: false, isSelected: true });
  });

  test('calculateDraftMealTotal sums fractional quantities', () => {
    expect(
      calculateDraftMealTotal([
        {
          recipeId: '1',
          recipeName: 'Arroz',
          recipeImageUrl: null,
          authorName: 'Chef 1',
          baseCalories: 203,
          quantity: 1.5,
        },
        {
          recipeId: '2',
          recipeName: 'Feijao',
          recipeImageUrl: null,
          authorName: 'Chef 2',
          baseCalories: 150,
          quantity: 0.5,
        },
      ]),
    ).toBe(379.5);
  });

  test('mergeAndDeduplicateRecipes removes duplicates by id', () => {
    const duplicatedRecipe = {
      id: 'recipe-1',
      nome: 'Arroz branco',
      tempoPreparoMinutos: 20,
      rendimentoPorcoes: 1,
      dificuldade: 'FACIL' as const,
      isColaborativa: false,
      status: 'PUBLICADA' as const,
      avaliacaoMedia: 4,
      autorId: 'user-1',
      autorNome: 'Thais',
      autorUsername: 'thais',
      createdAt: '',
      updatedAt: '',
      midiaPrincipal: null,
      ingredientes: [],
      informacaoNutricional: { id: 'n1', calorias: 203, proteinas: null, carboidratos: null, gorduras: null },
      modoPreparo: [],
      midias: [],
    };

    const merged = mergeAndDeduplicateRecipes([duplicatedRecipe], [duplicatedRecipe]);

    expect(merged).toHaveLength(1);
    expect(merged[0]).toMatchObject({ id: 'recipe-1', calories: 203 });
  });

  test('replaceMealInDay only updates the targeted meal', () => {
    const day = createEmptyMealDiaryDay('2026-05-14');
    const updated = replaceMealInDay(day, {
      type: 'lunch',
      totalCalories: 635,
      items: [],
    });

    expect(updated.meals.find((meal) => meal.type === 'lunch')?.totalCalories).toBe(635);
    expect(updated.meals.find((meal) => meal.type === 'breakfast')?.totalCalories).toBe(0);
    expect(updated.meals.find((meal) => meal.type === 'dinner')?.totalCalories).toBe(0);
  });
});
