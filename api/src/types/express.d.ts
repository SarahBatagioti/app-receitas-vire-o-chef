import { AuthenticatedUserDto } from '../dtos/auth.dto';
import { RecipeMediaUploadDto } from '../dtos/recipe.dto';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthenticatedUserDto;
      recipeMediaUpload?: RecipeMediaUploadDto;
    }
  }
}

export {};
