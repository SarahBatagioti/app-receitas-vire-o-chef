import { Router } from 'express';
import { RecipeController } from '../controllers/recipe.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { uploadRecipeMediaFiles } from '../middlewares/recipe-media-upload.middleware';
import {
  validateCreateRecipeRequest,
  validateRecipeIdParam,
  validateRecipeMediaIdParam,
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

recipeRoutes.get('/publicadas', (request, response, next) =>
  recipeController.listPublished(request, response).catch(next),
);

recipeRoutes.get('/:id', validateRecipeIdParam, (request, response, next) =>
  recipeController.getById(request, response).catch(next),
);

recipeRoutes.post(
  '/:id/midias',
  validateRecipeIdParam,
  uploadRecipeMediaFiles,
  (request, response, next) =>
    recipeController.addMedia(request, response).catch(next),
);

recipeRoutes.get('/:id/midias', validateRecipeIdParam, (request, response, next) =>
  recipeController.listMedia(request, response).catch(next),
);

recipeRoutes.delete(
  '/:id/midias/:midiaId',
  validateRecipeIdParam,
  validateRecipeMediaIdParam,
  (request, response, next) =>
    recipeController.deleteMedia(request, response).catch(next),
);

recipeRoutes.put('/:id', validateRecipeIdParam, validateUpdateRecipeRequest, (request, response, next) =>
  recipeController.update(request, response).catch(next),
);

recipeRoutes.delete('/:id', validateRecipeIdParam, (request, response, next) =>
  recipeController.delete(request, response).catch(next),
);

export { recipeRoutes };
