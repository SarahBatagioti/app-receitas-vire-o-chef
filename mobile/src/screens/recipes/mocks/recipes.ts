import { RecipeDetail, RecipeListItem, RecipesHomeCollections } from '../types';

export const recipesMock: RecipesHomeCollections = {
  myPublications: [
    {
      id: 'recipe-1',
      title: 'Salada de frutas',
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
      difficulty: 'dificil',
      prepMinutes: 15,
      rating: 3.4,
      servings: 2,
    },
    {
      id: 'recipe-2',
      title: 'Panqueca de quinoa',
      imageUrl:
        'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=900&q=80',
      difficulty: 'facil',
      prepMinutes: 30,
      rating: 3.4,
      servings: 4,
    },
    {
      id: 'recipe-3',
      title: 'Drink de morango',
      imageUrl:
        'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80',
      difficulty: 'intermediario',
      prepMinutes: 15,
      rating: 4.6,
      servings: 2,
    },
  ],
  favoriteRecipes: [
    {
      id: 'recipe-4',
      title: 'Salada de frutas',
      imageUrl:
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80',
      difficulty: 'dificil',
      prepMinutes: 15,
      rating: 3.4,
      servings: 2,
      isFavorite: true,
    },
    {
      id: 'recipe-5',
      title: 'Panqueca de quinoa',
      imageUrl:
        'https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=900&q=80',
      difficulty: 'facil',
      prepMinutes: 30,
      rating: 3.4,
      servings: 4,
      isFavorite: true,
    },
    {
      id: 'recipe-6',
      title: 'Drink de morango',
      imageUrl:
        'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=900&q=80',
      difficulty: 'intermediario',
      prepMinutes: 15,
      rating: 4.6,
      servings: 2,
      isFavorite: true,
    },
  ],
  draftRecipes: [
    {
      id: 'recipe-7',
      title: 'Bolo de banana',
      imageUrl:
        'https://images.unsplash.com/photo-1603532648955-039310d9ed75?auto=format&fit=crop&w=900&q=80',
      difficulty: 'facil',
      prepMinutes: 45,
      rating: 0,
      servings: 8,
      status: 'draft',
      isCollaborative: true,
    },
  ],
};

export function cloneRecipesCollections(): RecipesHomeCollections {
  return {
    myPublications: recipesMock.myPublications.map((recipe) => ({ ...recipe })),
    favoriteRecipes: recipesMock.favoriteRecipes.map((recipe) => ({ ...recipe })),
    draftRecipes: recipesMock.draftRecipes.map((recipe) => ({ ...recipe })),
  };
}

export const recipeDetailsMock: Record<string, RecipeDetail> = {
  'recipe-1': {
    ...recipesMock.myPublications[0],
    primaryMedia: {
      id: 'recipe-1-media-1',
      type: 'image',
      url: recipesMock.myPublications[0].imageUrl ?? '',
      fileName: 'salada-de-frutas.jpg',
    },
    media: [
      {
        id: 'recipe-1-media-1',
        type: 'image',
        url: recipesMock.myPublications[0].imageUrl ?? '',
        fileName: 'salada-de-frutas.jpg',
      },
    ],
    reviewsCount: 1250,
    commentsCount: 2548,
    author: {
      name: 'Sarah Batagioti',
      subtitle: 'Autora da receita',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
    nutrition: {
      calories: '120 kcal',
      proteins: '10 g',
      carbohydrates: '18 g',
      fats: '28 g',
    },
    ingredients: [
      {
        id: 'ingredient-1',
        name: 'Biscoite maisena',
        quantity: '1 pacote',
        imageUrl:
          'https://images.unsplash.com/photo-1589367920969-ab8e050bbb04?auto=format&fit=crop&w=300&q=80',
        checked: true,
      },
      {
        id: 'ingredient-2',
        name: 'Leite condensado',
        quantity: '1 lata',
        imageUrl:
          'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=300&q=80',
      },
      {
        id: 'ingredient-3',
        name: 'Creme de leite',
        quantity: '1 caixa',
        imageUrl:
          'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=300&q=80',
      },
    ],
    steps: [
      {
        id: 'step-1',
        title: 'Passo 1',
        description:
          'Em uma panela, coloque o leite condensado, o leite e a farinha misturada no leite reservado.',
        accentColor: 'brandGreen',
      },
      {
        id: 'step-2',
        title: 'Passo 2',
        description: 'Mexa até engrossar sem parar e reserve para esfriar.',
        accentColor: 'brandYellow',
      },
      {
        id: 'step-3',
        title: 'Passo 3',
        description: 'Finalize com o creme de leite e monte a receita em camadas.',
        accentColor: 'brandOrange',
      },
    ],
  },
  'recipe-2': {
    ...recipesMock.myPublications[1],
    primaryMedia: {
      id: 'recipe-2-media-1',
      type: 'image',
      url: recipesMock.myPublications[1].imageUrl ?? '',
      fileName: 'panqueca-de-quinoa.jpg',
    },
    media: [
      {
        id: 'recipe-2-media-1',
        type: 'image',
        url: recipesMock.myPublications[1].imageUrl ?? '',
        fileName: 'panqueca-de-quinoa.jpg',
      },
    ],
    reviewsCount: 860,
    commentsCount: 418,
    author: {
      name: 'Sarah Batagioti',
      subtitle: 'Autora da receita',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
    nutrition: {
      calories: '180 kcal',
      proteins: '12 g',
      carbohydrates: '20 g',
      fats: '9 g',
    },
    ingredients: [
      {
        id: 'ingredient-4',
        name: 'Quinoa cozida',
        quantity: '2 xicaras',
        imageUrl:
          'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=300&q=80',
        checked: true,
      },
      {
        id: 'ingredient-5',
        name: 'Ovos',
        quantity: '2 unidades',
        imageUrl:
          'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=300&q=80',
      },
      {
        id: 'ingredient-6',
        name: 'Cebolinha',
        quantity: 'a gosto',
        imageUrl:
          'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=300&q=80',
      },
    ],
    steps: [
      {
        id: 'step-4',
        title: 'Passo 1',
        description: 'Misture todos os ingredientes até formar uma massa uniforme.',
        accentColor: 'brandGreen',
      },
      {
        id: 'step-5',
        title: 'Passo 2',
        description: 'Molde pequenos discos e doure dos dois lados na frigideira.',
        accentColor: 'brandYellow',
      },
    ],
  },
  'recipe-3': {
    ...recipesMock.myPublications[2],
    primaryMedia: {
      id: 'recipe-3-media-1',
      type: 'image',
      url: recipesMock.myPublications[2].imageUrl ?? '',
      fileName: 'drink-de-morango.jpg',
    },
    media: [
      {
        id: 'recipe-3-media-1',
        type: 'image',
        url: recipesMock.myPublications[2].imageUrl ?? '',
        fileName: 'drink-de-morango.jpg',
      },
    ],
    reviewsCount: 430,
    commentsCount: 96,
    author: {
      name: 'Sarah Batagioti',
      subtitle: 'Autora da receita',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
    nutrition: {
      calories: '95 kcal',
      proteins: '1 g',
      carbohydrates: '17 g',
      fats: '2 g',
    },
    ingredients: [
      {
        id: 'ingredient-7',
        name: 'Morango',
        quantity: '8 unidades',
        imageUrl:
          'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=300&q=80',
        checked: true,
      },
      {
        id: 'ingredient-8',
        name: 'Agua com gas',
        quantity: '200 ml',
        imageUrl:
          'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=300&q=80',
      },
    ],
    steps: [
      {
        id: 'step-6',
        title: 'Passo 1',
        description: 'Macere os morangos com gelo e adicione os demais ingredientes.',
        accentColor: 'brandOrange',
      },
    ],
  },
  'recipe-7': {
    ...recipesMock.draftRecipes[0],
    primaryMedia: {
      id: 'recipe-7-media-1',
      type: 'image',
      url: recipesMock.draftRecipes[0].imageUrl ?? '',
      fileName: 'bolo-de-banana.jpg',
    },
    media: [
      {
        id: 'recipe-7-media-1',
        type: 'image',
        url: recipesMock.draftRecipes[0].imageUrl ?? '',
        fileName: 'bolo-de-banana.jpg',
      },
    ],
    reviewsCount: 0,
    commentsCount: 0,
    author: {
      name: 'Sarah Batagioti',
      subtitle: 'Autora da receita',
      avatarUrl:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
    },
    nutrition: {
      calories: '0 kcal',
      proteins: '0 g',
      carbohydrates: '0 g',
      fats: '0 g',
    },
    ingredients: [
      {
        id: 'ingredient-9',
        name: 'Banana',
        quantity: '4 unidades',
        imageUrl:
          'https://images.unsplash.com/photo-1574226516831-e1dff420e37f?auto=format&fit=crop&w=300&q=80',
      },
    ],
    steps: [
      {
        id: 'step-7',
        title: 'Passo 1',
        description: 'Rascunho em construção.',
        accentColor: 'brandGreen',
      },
    ],
  },
};

const allRecipes = [
  ...recipesMock.myPublications,
  ...recipesMock.favoriteRecipes,
  ...recipesMock.draftRecipes,
];

export function getRecipeById(recipeId: string): RecipeListItem | undefined {
  return allRecipes.find((recipe) => recipe.id === recipeId);
}

export function getRecipeDetailById(recipeId: string): RecipeDetail | undefined {
  return recipeDetailsMock[recipeId];
}

export function cloneRecipeDetails(): Record<string, RecipeDetail> {
  return Object.fromEntries(
    Object.entries(recipeDetailsMock).map(([recipeId, recipe]) => [
      recipeId,
      {
        ...recipe,
        author: { ...recipe.author },
        nutrition: { ...recipe.nutrition },
        ingredients: recipe.ingredients.map((ingredient) => ({ ...ingredient })),
        media: recipe.media.map((item) => ({ ...item })),
        steps: recipe.steps.map((step) => ({ ...step })),
      },
    ]),
  );
}
