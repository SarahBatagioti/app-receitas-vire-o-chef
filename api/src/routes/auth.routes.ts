import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validateAuthBootstrapRequest } from '../validators/auth.validator';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.get('/status', validateAuthBootstrapRequest, (request, response) =>
  authController.getStatus(request, response),
);

export { authRoutes };
