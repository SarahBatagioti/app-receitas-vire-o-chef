import { Request, Response } from 'express';
import {
  CreateRecipeDto,
  UpdateRecipeDto,
} from '../dtos/recipe.dto';
import { RecipeService } from '../services/recipe.service';
import { buildSuccessResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

const recipeService = new RecipeService();

export class RecipeController {
  async create(request: Request, response: Response) {
    const payload = request.body as CreateRecipeDto;
    const authUser = getAuthenticatedUser(request);
    const createdRecipe = await recipeService.criarReceita(payload, authUser.id);

    return response.status(201).json(buildSuccessResponse(createdRecipe));
  }

  async listMine(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const recipes = await recipeService.listarMinhasReceitas(authUser.id);

    return response.status(200).json(buildSuccessResponse(recipes));
  }

  async getById(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const recipeId = getRecipeId(request);
    const recipe = await recipeService.buscarReceitaPorId(
      recipeId,
      authUser.id,
    );

    return response.status(200).json(buildSuccessResponse(recipe));
  }

  async update(request: Request, response: Response) {
    const payload = request.body as UpdateRecipeDto;
    const authUser = getAuthenticatedUser(request);
    const recipeId = getRecipeId(request);
    const updatedRecipe = await recipeService.atualizarReceita(
      recipeId,
      payload,
      authUser.id,
    );

    return response.status(200).json(buildSuccessResponse(updatedRecipe));
  }

  async delete(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    await recipeService.removerReceita(getRecipeId(request), authUser.id);

    return response.status(200).json(
      buildSuccessResponse({
        message: 'Receita removida com sucesso.',
      }),
    );
  }
}

function getAuthenticatedUser(request: Request) {
  if (!request.authUser) {
    throw new AppError('Token de autenticacao invalido.', 401);
  }

  return request.authUser;
}

function getRecipeId(request: Request): string {
  const { id } = request.params;

  if (typeof id !== 'string') {
    throw new AppError('Identificador da receita invalido.', 422);
  }

  return id;
}
