import { AuthenticatedUserDto } from '../dtos/auth.dto';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUserDto;
    }
  }
}

export {};
