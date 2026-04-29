import { Request, Response } from 'express';
import { LoginUserDto, RegisterUserDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';
import { buildSuccessResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

const authService = new AuthService();

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

  async me(request: Request, response: Response) {
    const authUser = request.authUser;

    if (!authUser) {
      throw new AppError('Token de autenticacao invalido.', 401);
    }

    const user = await authService.getAuthenticatedUser(authUser.id);

    return response.status(200).json({ user });
  }
}
