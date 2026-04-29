import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import {
  validateAuthBootstrapRequest,
  validateFirebaseVerifyTokenRequest,
  validateLoginUserRequest,
  validateRegisterUserRequest,
} from '../validators/auth.validator';

const authRoutes = Router();
const authController = new AuthController();

authRoutes.post('/register', validateRegisterUserRequest, (request, response, next) =>
  authController.register(request, response).catch(next),
);

authRoutes.post('/login', validateLoginUserRequest, (request, response, next) =>
  authController.login(request, response).catch(next),
);

authRoutes.post(
  '/firebase/verify-token',
  validateFirebaseVerifyTokenRequest,
  (request, response, next) =>
    authController.verifyFirebaseToken(request, response).catch(next),
);

authRoutes.get('/me', authenticateJwt, (request, response, next) =>
  authController.me(request, response).catch(next),
);

authRoutes.get('/status', validateAuthBootstrapRequest, (request, response) =>
  authController.getStatus(request, response),
);

export { authRoutes };
