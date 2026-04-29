import { Router } from 'express';
import { authRoutes } from './auth.routes';

const router = Router();

router.get('/health', (_request, response) => {
  return response.status(200).json({
    success: true,
    message: 'API operacional.',
  });
});

router.use('/auth', authRoutes);

export { router };
