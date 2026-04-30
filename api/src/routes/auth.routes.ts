import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import {
  validateAuthBootstrapRequest,
  validateCompleteSocialRegisterRequest,
  validateFirebaseVerifyTokenRequest,
  validateForgotPasswordRequest,
  validateLoginUserRequest,
  validateRegisterUserRequest,
  validateResetPasswordRequest,
  validateSocialLoginRequest,
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
  '/forgot-password',
  validateForgotPasswordRequest,
  (request, response, next) =>
    authController.forgotPassword(request, response).catch(next),
);

authRoutes.post(
  '/reset-password',
  validateResetPasswordRequest,
  (request, response, next) =>
    authController.resetPassword(request, response).catch(next),
);

authRoutes.post('/social-login', validateSocialLoginRequest, (request, response, next) =>
  authController.socialLogin(request, response).catch(next),
);

authRoutes.post(
  '/social-complete-register',
  validateCompleteSocialRegisterRequest,
  (request, response, next) =>
    authController.completeSocialRegister(request, response).catch(next),
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
