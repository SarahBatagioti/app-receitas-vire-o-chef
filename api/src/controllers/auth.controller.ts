import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { buildSuccessResponse } from '../utils/api-response';

const authService = new AuthService();

export class AuthController {
  getStatus(_request: Request, response: Response) {
    return response.status(200).json(
      buildSuccessResponse(authService.getAuthBootstrapStatus()),
    );
  }
}
