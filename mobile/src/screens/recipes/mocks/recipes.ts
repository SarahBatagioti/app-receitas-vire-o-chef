import { RecipesHomeCollections } from '../types';

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
    },
  ],
};
