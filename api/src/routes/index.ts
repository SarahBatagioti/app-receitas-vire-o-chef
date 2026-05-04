import { Router } from 'express';
import { authRoutes } from './auth.routes';
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

export { router };
