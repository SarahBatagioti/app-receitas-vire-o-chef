jest.mock('../src/hooks/useAuth', () => ({
  useAuth: jest.fn(() => ({ user: { id: 'user-1' } })),
}));

jest.mock('../src/services/api', () => ({
  getErrorMessage: jest.fn((error: unknown, fallback: string) =>
    error instanceof Error ? error.message : fallback,
  ),
}));

jest.mock('../src/services/recipeService', () => ({
  recipeService: {
    listMyRecipes: jest.fn(),
    listPublicRecipes: jest.fn(),
    listFavoriteRecipeIds: jest.fn(),
    getRecipeById: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    uploadRecipeMedia: jest.fn(),
    favoriteRecipe: jest.fn(),
    unfavoriteRecipe: jest.fn(),
  },
}));

jest.mock('../src/screens/recipes/RecipeDetailScreen', () => () => null);
jest.mock('../src/screens/recipes/RecipesCreateScreen', () => () => null);
jest.mock('../src/screens/recipes/RecipesHomeScreen', () => () => null);

import { buildRecipesCollections } from '../src/screens/recipes/RecipesFlow';

describe('buildRecipesCollections', () => {
  const publishedRecipe = {
    id: 'recipe-1',
    nome: 'Arroz branco',
    tempoPreparoMinutos: 20,
    rendimentoPorcoes: 2,
    dificuldade: 'FACIL' as const,
    isColaborativa: false,
    status: 'PUBLICADA' as const,
    avaliacaoMedia: 4.7,
    autorId: 'user-1',
    autorNome: 'Thais Andrade',
    autorUsername: 'thais',
    createdAt: '',
    updatedAt: '',
    midiaPrincipal: null,
    ingredientes: [],
    informacaoNutricional: { id: 'nutrition-1', calorias: 203, proteinas: null, carboidratos: null, gorduras: null },
    modoPreparo: [],
    midias: [],
  };

  const draftRecipe = {
    ...publishedRecipe,
    status: 'RASCUNHO' as const,
  };

  test('keeps the recipe only in drafts when a draft version exists', () => {
    const collections = buildRecipesCollections([publishedRecipe, draftRecipe], 'user-1');

    expect(collections.myPublications).toHaveLength(0);
    expect(collections.draftRecipes).toHaveLength(1);
    expect(collections.draftRecipes[0]).toMatchObject({
      id: 'recipe-1',
      status: 'draft',
      title: 'Arroz branco',
    });
  });
});