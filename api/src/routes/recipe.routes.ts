import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import {
  validateCreateRecipeRequest,
  validateRecipeIdParam,
  validateUpdateRecipeRequest,
} from '../validators/recipe.validator';

const recipeRoutes = Router();
const recipeController = new RecipeController();

recipeRoutes.use(authenticateJwt);

recipeRoutes.post('/', validateCreateRecipeRequest, (request, response, next) =>
  recipeController.create(request, response).catch(next),
);

recipeRoutes.get('/minhas', (request, response, next) =>
  recipeController.listMine(request, response).catch(next),
);

recipeRoutes.get('/:id', validateRecipeIdParam, (request, response, next) =>
  recipeController.getById(request, response).catch(next),
);

recipeRoutes.put('/:id', validateRecipeIdParam, validateUpdateRecipeRequest, (request, response, next) =>
  recipeController.update(request, response).catch(next),
);

recipeRoutes.delete('/:id', validateRecipeIdParam, (request, response, next) =>
  recipeController.delete(request, response).catch(next),
);

export { recipeRoutes };
