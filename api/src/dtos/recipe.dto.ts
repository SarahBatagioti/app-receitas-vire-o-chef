import {
  RecipeDifficulty,
  RecipeStatus,
} from '../models/recipe.model';

export interface RecipeIngredientInputDto {
  nome: string;
  quantidade?: string | null;
  unidade?: string | null;
}

export interface RecipeNutritionInputDto {
  calorias?: number | null;
  proteinas?: number | null;
  carboidratos?: number | null;
  gorduras?: number | null;
}

export interface RecipePreparationStepInputDto {
  ordem: number;
  descricao: string;
}

export interface CreateRecipeDto {
  nome: string;
  tempoPreparoMinutos?: number;
  rendimentoPorcoes?: number;
  dificuldade?: RecipeDifficulty;
  isColaborativa?: boolean;
  status?: RecipeStatus;
  ingredientes?: RecipeIngredientInputDto[];
  informacaoNutricional?: RecipeNutritionInputDto | null;
  modoPreparo?: RecipePreparationStepInputDto[];
}

export interface UpdateRecipeDto {
  nome: string;
  tempoPreparoMinutos?: number | null;
  rendimentoPorcoes?: number | null;
  dificuldade?: RecipeDifficulty | null;
  isColaborativa?: boolean;
  status?: RecipeStatus;
  ingredientes?: RecipeIngredientInputDto[];
  informacaoNutricional?: RecipeNutritionInputDto | null;
  modoPreparo?: RecipePreparationStepInputDto[];
}

export interface RecipeIngredientDto {
  id: string;
  nome: string;
  quantidade: string | null;
  unidade: string | null;
}

export interface RecipeNutritionDto {
  id: string;
  calorias: number | null;
  proteinas: number | null;
  carboidratos: number | null;
  gorduras: number | null;
}

export interface RecipePreparationStepDto {
  id: string;
  ordem: number;
  descricao: string;
}

export interface RecipeSummaryDto {
  id: string;
  nome: string;
  tempoPreparoMinutos: number | null;
  rendimentoPorcoes: number | null;
  dificuldade: RecipeDifficulty | null;
  isColaborativa: boolean;
  status: RecipeStatus;
  avaliacaoMedia: number;
  autorId: string;
  createdAt: string;
  updatedAt: string;
}

export interface RecipeDetailsDto extends RecipeSummaryDto {
  ingredientes: RecipeIngredientDto[];
  informacaoNutricional: RecipeNutritionDto | null;
  modoPreparo: RecipePreparationStepDto[];
}
