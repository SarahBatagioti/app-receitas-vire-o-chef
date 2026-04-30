import { Request, Response } from 'express';
import {
  CompleteSocialRegisterDto,
  ForgotPasswordDto,
  LoginUserDto,
  RegisterUserDto,
  ResetPasswordDto,
  SocialLoginDto,
} from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';
import { FirebaseAuthService } from '../services/firebase-auth.service';
import { VerifyFirebaseTokenDto } from '../types/firebase';
import { buildSuccessResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

const authService = new AuthService();
const firebaseAuthService = new FirebaseAuthService();

export class AuthController {
  getStatus(_request: Request, response: Response) {
    return response.status(200).json(
      buildSuccessResponse(authService.getAuthBootstrapStatus()),
    );
  }

  async register(request: Request, response: Response) {
    const payload = request.body as RegisterUserDto;
    const createdUser = await authService.registerUser(payload);

    return response.status(201).json(buildSuccessResponse(createdUser));
  }

  async login(request: Request, response: Response) {
    const payload = request.body as LoginUserDto;
    const authenticatedUser = await authService.loginUser(payload);

    return response.status(200).json(authenticatedUser);
  }

  async forgotPassword(request: Request, response: Response) {
    const payload = request.body as ForgotPasswordDto;
    const forgotPasswordResponse = await authService.forgotPassword(payload);

    return response.status(200).json(forgotPasswordResponse);
  }

  async resetPassword(request: Request, response: Response) {
    const payload = request.body as ResetPasswordDto;
    const resetPasswordResponse = await authService.resetPassword(payload);

    return response.status(200).json(resetPasswordResponse);
  }

  async socialLogin(request: Request, response: Response) {
    const payload = request.body as SocialLoginDto;
    const socialLoginResponse = await authService.socialLogin(payload);

    return response.status(200).json(socialLoginResponse);
  }

  async completeSocialRegister(request: Request, response: Response) {
    const payload = request.body as CompleteSocialRegisterDto;
    const socialRegisterResponse = await authService.completeSocialRegister(payload);

    return response.status(200).json(socialRegisterResponse);
  }

  async me(request: Request, response: Response) {
    const authUser = request.authUser;

    if (!authUser) {
      throw new AppError('Token de autenticacao invalido.', 401);
    }

    const user = await authService.getAuthenticatedUser(authUser.id);

    return response.status(200).json({ user });
  }

  async verifyFirebaseToken(request: Request, response: Response) {
    const payload = request.body as VerifyFirebaseTokenDto;
    const identity = await firebaseAuthService.verifyToken(payload.token);

    return response.status(200).json(buildSuccessResponse(identity));
  }
}
