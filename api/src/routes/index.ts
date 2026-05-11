import { Router } from 'express';
import { authRoutes } from './auth.routes';
import { mealDiaryRoutes } from './meal-diary.routes';
import { publicationRoutes } from './publication.routes';
import { recipeRoutes } from './recipe.routes';

const router = Router();

router.get('/health', (_request, response) => {
  return response.status(200).json({
    success: true,
    message: 'API operacional.',
  });
});

router.use('/auth', authRoutes);
router.use('/receitas', recipeRoutes);
router.use('/refeicoes', mealDiaryRoutes);
router.use('/publicacoes', publicationRoutes);

export { router };
