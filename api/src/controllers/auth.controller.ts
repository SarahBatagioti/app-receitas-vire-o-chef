import { Request, Response } from 'express';
import { RegisterUserDto } from '../dtos/auth.dto';
import { AuthService } from '../services/auth.service';
import { buildSuccessResponse } from '../utils/api-response';

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
}
