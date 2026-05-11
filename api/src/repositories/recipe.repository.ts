import { randomUUID } from 'crypto';
import {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { database } from '../config/database';
import {
  RecipeIngredientInputDto,
  RecipeNutritionInputDto,
  RecipePreparationStepInputDto,
} from '../dtos/recipe.dto';
import { RecipeIngredientModel } from '../models/recipe-ingredient.model';
import { RecipeMediaModel, RecipeMediaType } from '../models/recipe-media.model';
import { RecipeNutritionModel } from '../models/recipe-nutrition.model';
import { RecipePreparationStepModel } from '../models/recipe-preparation-step.model';
import { RecipeDifficulty, RecipeModel, RecipeStatus } from '../models/recipe.model';

export class RecipeRepository {
  async ensureTables(): Promise<void> {
    if (recipeTablesReady) {
      return;
    }

    if (!recipeTablesSetupPromise) {
      recipeTablesSetupPromise = (async () => {
        await this.ensureRecipesTable();
        await this.ensureRecipeIngredientsTable();
        await this.ensureRecipeNutritionTable();
        await this.ensureRecipePreparationStepsTable();
        await this.ensureRecipeMediaTable();
        await this.ensureFavoriteRecipesTable();
        await this.ensureRelationships();
        recipeTablesReady = true;
      })().catch((error) => {
        recipeTablesSetupPromise = null;
        throw error;
      });
    }

    await recipeTablesSetupPromise;
  }

  async createRecipe(
    input: CreateRecipeRepositoryInput,
    executor?: QueryExecutor,
  ): Promise<string> {
    if (!executor) {
      await this.ensureTables();
    }

    const recipeId = randomUUID();

    await getExecutor(executor).execute<ResultSetHeader>(
      `
        INSERT INTO recipes (
          id,
          author_id,
          name,
          preparation_time_minutes,
          yield_portions,
          difficulty,
          is_collaborative,
          status,
          average_rating
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0.00)
      `,
      [
        recipeId,
        input.usuarioId,
        input.nome,
        input.tempoPreparoMinutos ?? null,
        input.rendimentoPorcoes ?? null,
        input.dificuldade ?? null,
        input.isColaborativa,
        input.status,
      ],
    );

    return recipeId;
  }

  async updateRecipe(
    recipeId: string,
    authorId: string,
    input: UpdateRecipeRepositoryInput,
    executor?: QueryExecutor,
  ): Promise<void> {
    if (!executor) {
      await this.ensureTables();
    }

    await getExecutor(executor).execute<ResultSetHeader>(
      `
        UPDATE recipes
        SET
          name = ?,
          preparation_time_minutes = ?,
          yield_portions = ?,
          difficulty = ?,
          is_collaborative = ?,
          status = ?
        WHERE id = ?
          AND author_id = ?
      `,
      [
        input.nome,
        input.tempoPreparoMinutos ?? null,
        input.rendimentoPorcoes ?? null,
        input.dificuldade ?? null,
        input.isColaborativa,
        input.status,
        recipeId,
        authorId,
      ],
    );
  }

  async replaceRecipeIngredients(
    recipeId: string,
    ingredients: RecipeIngredientInputDto[],
    executor?: QueryExecutor,
  ): Promise<void> {
    if (!executor) {
      await this.ensureTables();
    }

    const queryExecutor = getExecutor(executor);

    await queryExecutor.execute<ResultSetHeader>(
      `
        DELETE FROM recipe_ingredients
        WHERE recipe_id = ?
      `,
      [recipeId],
    );

    for (const ingredient of ingredients) {
      await queryExecutor.execute<ResultSetHeader>(
        `
          INSERT INTO recipe_ingredients (
            id,
            recipe_id,
            name,
            quantity,
            unit
          )
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          recipeId,
          ingredient.nome,
          ingredient.quantidade ?? null,
          ingredient.unidade ?? null,
        ],
      );
    }
  }

  async replaceRecipeNutrition(
    recipeId: string,
    nutrition: RecipeNutritionInputDto | null,
    executor?: QueryExecutor,
  ): Promise<void> {
    if (!executor) {
      await this.ensureTables();
    }

    const queryExecutor = getExecutor(executor);

    await queryExecutor.execute<ResultSetHeader>(
      `
        DELETE FROM recipe_nutrition
        WHERE recipe_id = ?
      `,
      [recipeId],
    );

    if (!nutrition) {
      return;
    }

    await queryExecutor.execute<ResultSetHeader>(
      `
        INSERT INTO recipe_nutrition (
          id,
          recipe_id,
          calories,
          proteins,
          carbohydrates,
          fats
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        randomUUID(),
        recipeId,
        nutrition.calorias ?? null,
        nutrition.proteinas ?? null,
        nutrition.carboidratos ?? null,
        nutrition.gorduras ?? null,
      ],
    );
  }

  async replaceRecipePreparationSteps(
    recipeId: string,
    steps: RecipePreparationStepInputDto[],
    executor?: QueryExecutor,
  ): Promise<void> {
    if (!executor) {
      await this.ensureTables();
    }

    const queryExecutor = getExecutor(executor);

    await queryExecutor.execute<ResultSetHeader>(
      `
        DELETE FROM recipe_preparation_steps
        WHERE recipe_id = ?
      `,
      [recipeId],
    );

    for (const step of steps) {
      await queryExecutor.execute<ResultSetHeader>(
        `
          INSERT INTO recipe_preparation_steps (
            id,
            recipe_id,
            sort_order,
            description
          )
          VALUES (?, ?, ?, ?)
        `,
        [
          randomUUID(),
          recipeId,
          step.ordem,
          step.descricao,
        ],
      );
    }
  }

  async createRecipeMedia(
    recipeId: string,
    media: CreateRecipeMediaRepositoryInput[],
    executor?: QueryExecutor,
  ): Promise<void> {
    if (!executor) {
      await this.ensureTables();
    }

    const queryExecutor = getExecutor(executor);

    for (const item of media) {
      await queryExecutor.execute<ResultSetHeader>(
        `
          INSERT INTO recipe_media (
            id,
            recipe_id,
            url,
            type,
            file_name,
            mime_type,
            size,
            sort_order
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          recipeId,
          item.url,
          item.tipo,
          item.nomeArquivo,
          item.mimeType,
          item.tamanho,
          item.ordem,
        ],
      );
    }
  }

  async deleteRecipeMediaByIdAndRecipeId(
    mediaId: string,
    recipeId: string,
    executor?: QueryExecutor,
  ): Promise<boolean> {
    if (!executor) {
      await this.ensureTables();
    }

    const [result] = await getExecutor(executor).execute<ResultSetHeader>(
      `
        DELETE FROM recipe_media
        WHERE id = ?
          AND recipe_id = ?
      `,
      [mediaId, recipeId],
    );

    return result.affectedRows > 0;
  }

  async listFavoriteRecipeIdsByUserId(userId: string): Promise<string[]> {
    await this.ensureTables();

    const [rows] = await database.execute<
      (RowDataPacket & FavoriteRecipeDatabaseRow)[]
    >(
      `
        SELECT recipe_id
        FROM favorite_recipes
        WHERE user_id = ?
        ORDER BY created_at DESC
      `,
      [userId],
    );

    return rows.map((row) => row.recipe_id);
  }

  async createFavoriteRecipe(
    userId: string,
    recipeId: string,
    executor?: QueryExecutor,
  ): Promise<void> {
    if (!executor) {
      await this.ensureTables();
    }

    await getExecutor(executor).execute<ResultSetHeader>(
      `
        INSERT IGNORE INTO favorite_recipes (
          user_id,
          recipe_id
        )
        VALUES (?, ?)
      `,
      [userId, recipeId],
    );
  }

  async deleteFavoriteRecipe(
    userId: string,
    recipeId: string,
    executor?: QueryExecutor,
  ): Promise<boolean> {
    if (!executor) {
      await this.ensureTables();
    }

    const [result] = await getExecutor(executor).execute<ResultSetHeader>(
      `
        DELETE FROM favorite_recipes
        WHERE user_id = ?
          AND recipe_id = ?
      `,
      [userId, recipeId],
    );

    return result.affectedRows > 0;
  }

  async listRecipesByAuthorId(authorId: string): Promise<RecipeAggregate[]> {
    await this.ensureTables();

    const [rows] = await database.execute<(RowDataPacket & RecipeDatabaseRow)[]>(
      `
        ${baseSelectQuery}
        WHERE r.author_id = ?
        ORDER BY r.updated_at DESC, r.created_at DESC
      `,
      [authorId],
    );

    return this.buildRecipeAggregates(rows);
  }

  async listPublishedRecipes(): Promise<RecipeAggregate[]> {
    await this.ensureTables();

    const [rows] = await database.execute<(RowDataPacket & RecipeDatabaseRow)[]>(
      `
        ${baseSelectQuery}
        WHERE r.status = 'PUBLICADA'
        ORDER BY r.updated_at DESC, r.created_at DESC
      `,
    );

    return this.buildRecipeAggregates(rows);
  }

  async findRecipeByIdAndAuthorId(
    recipeId: string,
    authorId: string,
  ): Promise<RecipeAggregate | null> {
    await this.ensureTables();

    const [rows] = await database.execute<(RowDataPacket & RecipeDatabaseRow)[]>(
      `
        ${baseSelectQuery}
        WHERE r.id = ?
          AND r.author_id = ?
      `,
      [recipeId, authorId],
    );

    if (!rows.length) {
      return null;
    }

    return this.buildRecipeAggregates(rows)[0] ?? null;
  }

  async findPublishedRecipeById(recipeId: string): Promise<RecipeAggregate | null> {
    await this.ensureTables();

    const [rows] = await database.execute<(RowDataPacket & RecipeDatabaseRow)[]>(
      `
        ${baseSelectQuery}
        WHERE r.id = ?
          AND r.status = 'PUBLICADA'
      `,
      [recipeId],
    );

    if (!rows.length) {
      return null;
    }

    return this.buildRecipeAggregates(rows)[0] ?? null;
  }

  async deleteRecipeByIdAndAuthorId(
    recipeId: string,
    authorId: string,
  ): Promise<boolean> {
    await this.ensureTables();

    const [result] = await database.execute<ResultSetHeader>(
      `
        DELETE FROM recipes
        WHERE id = ?
          AND author_id = ?
      `,
      [recipeId, authorId],
    );

    return result.affectedRows > 0;
  }

  private async ensureRecipesTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        author_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        preparation_time_minutes INT UNSIGNED NULL,
        yield_portions INT UNSIGNED NULL,
        difficulty ENUM('FACIL', 'INTERMEDIARIO', 'DIFICIL') NULL,
        is_collaborative BOOLEAN NOT NULL DEFAULT FALSE,
        status ENUM('PUBLICADA', 'RASCUNHO') NOT NULL DEFAULT 'RASCUNHO',
        average_rating DECIMAL(3,2) NOT NULL DEFAULT 0.00,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_recipes_author_id (author_id),
        INDEX idx_recipes_status (status),
        INDEX idx_recipes_is_collaborative (is_collaborative)
      )
    `);

    await database.execute(`
      ALTER TABLE recipes
      MODIFY COLUMN preparation_time_minutes INT UNSIGNED NULL,
      MODIFY COLUMN yield_portions INT UNSIGNED NULL,
      MODIFY COLUMN difficulty ENUM('FACIL', 'INTERMEDIARIO', 'DIFICIL') NULL
    `);
  }

  private async ensureRecipeIngredientsTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS recipe_ingredients (
        id CHAR(36) NOT NULL PRIMARY KEY,
        recipe_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        quantity VARCHAR(100) NULL,
        unit VARCHAR(50) NULL,
        INDEX idx_recipe_ingredients_recipe_id (recipe_id)
      )
    `);
  }

  private async ensureRecipeNutritionTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS recipe_nutrition (
        id CHAR(36) NOT NULL PRIMARY KEY,
        recipe_id CHAR(36) NOT NULL,
        calories DECIMAL(10,2) NULL,
        proteins DECIMAL(10,2) NULL,
        carbohydrates DECIMAL(10,2) NULL,
        fats DECIMAL(10,2) NULL,
        UNIQUE KEY uk_recipe_nutrition_recipe_id (recipe_id)
      )
    `);
  }

  private async ensureRecipePreparationStepsTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS recipe_preparation_steps (
        id CHAR(36) NOT NULL PRIMARY KEY,
        recipe_id CHAR(36) NOT NULL,
        sort_order INT UNSIGNED NOT NULL,
        description TEXT NOT NULL,
        INDEX idx_recipe_preparation_steps_recipe_id (recipe_id),
        UNIQUE KEY uk_recipe_preparation_steps_recipe_id_sort_order (recipe_id, sort_order)
      )
    `);
  }

  private async ensureRecipeMediaTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS recipe_media (
        id CHAR(36) NOT NULL PRIMARY KEY,
        recipe_id CHAR(36) NOT NULL,
        url VARCHAR(2048) NOT NULL,
        type ENUM('IMAGEM', 'VIDEO') NOT NULL,
        file_name VARCHAR(255) NULL,
        mime_type VARCHAR(100) NULL,
        size BIGINT UNSIGNED NULL,
        sort_order INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_recipe_media_recipe_id (recipe_id),
        INDEX idx_recipe_media_type (type),
        UNIQUE KEY uk_recipe_media_recipe_id_sort_order (recipe_id, sort_order)
      )
    `);
  }

  private async ensureFavoriteRecipesTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS favorite_recipes (
        user_id CHAR(36) NOT NULL,
        recipe_id CHAR(36) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, recipe_id),
        INDEX idx_favorite_recipes_recipe_id (recipe_id)
      )
    `);
  }

  private async ensureRelationships(): Promise<void> {
    await ensureForeignKey(
      'recipes',
      'fk_recipes_author_id',
      'author_id',
      'users',
      'id',
    );

    await ensureForeignKey(
      'recipe_ingredients',
      'fk_recipe_ingredients_recipe_id',
      'recipe_id',
      'recipes',
      'id',
    );

    await ensureForeignKey(
      'recipe_nutrition',
      'fk_recipe_nutrition_recipe_id',
      'recipe_id',
      'recipes',
      'id',
    );

    await ensureForeignKey(
      'recipe_preparation_steps',
      'fk_recipe_preparation_steps_recipe_id',
      'recipe_id',
      'recipes',
      'id',
    );

    await ensureForeignKey(
      'recipe_media',
      'fk_recipe_media_recipe_id',
      'recipe_id',
      'recipes',
      'id',
    );

    await ensureForeignKey(
      'favorite_recipes',
      'fk_favorite_recipes_user_id',
      'user_id',
      'users',
      'id',
    );

    await ensureForeignKey(
      'favorite_recipes',
      'fk_favorite_recipes_recipe_id',
      'recipe_id',
      'recipes',
      'id',
    );
  }

  private buildRecipeAggregates(
    rows: RecipeDatabaseRow[],
  ): RecipeAggregate[] {
    const recipeMap = new Map<string, RecipeAggregate>();

    for (const row of rows) {
      const existingRecipe = recipeMap.get(row.recipe_id);

      if (!existingRecipe) {
        recipeMap.set(row.recipe_id, {
          ...mapRecipeRow(row),
          ingredients: [],
          nutrition: row.nutrition_id ? mapRecipeNutritionRow(row) : null,
          preparationSteps: [],
          media: [],
        });
      }

      const recipe = recipeMap.get(row.recipe_id)!;

      if (
        row.ingredient_id &&
        !recipe.ingredients.some((ingredient) => ingredient.id === row.ingredient_id)
      ) {
        recipe.ingredients.push(mapRecipeIngredientRow(row));
      }

      if (
        row.preparation_step_id &&
        !recipe.preparationSteps.some((step) => step.id === row.preparation_step_id)
      ) {
        recipe.preparationSteps.push(mapRecipePreparationStepRow(row));
      }

      if (
        row.media_id &&
        !recipe.media.some((media) => media.id === row.media_id)
      ) {
        recipe.media.push(mapRecipeMediaRow(row));
      }
    }

    for (const recipe of recipeMap.values()) {
      recipe.preparationSteps.sort((left, right) => left.order - right.order);
      recipe.media.sort((left, right) => left.order - right.order);
    }

    return Array.from(recipeMap.values());
  }
}

export interface RecipeAggregate extends RecipeModel {
  ingredients: RecipeIngredientModel[];
  nutrition: RecipeNutritionModel | null;
  preparationSteps: RecipePreparationStepModel[];
  media: RecipeMediaModel[];
}

const baseSelectQuery = `
  SELECT
    r.id AS recipe_id,
    r.author_id,
    u.username AS author_username,
    r.name,
    r.preparation_time_minutes,
    r.yield_portions,
    r.difficulty,
    r.is_collaborative,
    r.status,
    r.average_rating,
    r.created_at,
    r.updated_at,
    ri.id AS ingredient_id,
    ri.name AS ingredient_name,
    ri.quantity AS ingredient_quantity,
    ri.unit AS ingredient_unit,
    rn.id AS nutrition_id,
    rn.calories AS nutrition_calories,
    rn.proteins AS nutrition_proteins,
    rn.carbohydrates AS nutrition_carbohydrates,
    rn.fats AS nutrition_fats,
    rps.id AS preparation_step_id,
    rps.sort_order AS preparation_step_order,
    rps.description AS preparation_step_description,
    rm.id AS media_id,
    rm.url AS media_url,
    rm.type AS media_type,
    rm.file_name AS media_file_name,
    rm.mime_type AS media_mime_type,
    rm.size AS media_size,
    rm.sort_order AS media_sort_order,
    rm.created_at AS media_created_at
  FROM recipes r
  LEFT JOIN users u
    ON u.id = r.author_id
  LEFT JOIN recipe_ingredients ri
    ON ri.recipe_id = r.id
  LEFT JOIN recipe_nutrition rn
    ON rn.recipe_id = r.id
  LEFT JOIN recipe_preparation_steps rps
    ON rps.recipe_id = r.id
  LEFT JOIN recipe_media rm
    ON rm.recipe_id = r.id
`;

let recipeTablesSetupPromise: Promise<void> | null = null;
let recipeTablesReady = false;

async function ensureForeignKey(
  tableName: string,
  constraintName: string,
  columnName: string,
  referencedTableName: string,
  referencedColumnName: string,
): Promise<void> {
  const [rows] = await database.execute<(RowDataPacket & ForeignKeyConstraintRow)[]>(
    `
      SELECT CONSTRAINT_NAME
      FROM INFORMATION_SCHEMA.REFERENTIAL_CONSTRAINTS
      WHERE CONSTRAINT_SCHEMA = DATABASE()
        AND CONSTRAINT_NAME = ?
      LIMIT 1
    `,
    [constraintName],
  );

  if (!rows.length) {
    await database.execute(`
      ALTER TABLE ${tableName}
      ADD CONSTRAINT ${constraintName}
      FOREIGN KEY (${columnName})
      REFERENCES ${referencedTableName} (${referencedColumnName})
      ON DELETE CASCADE
      ON UPDATE CASCADE
    `);
  }
}

interface ForeignKeyConstraintRow {
  CONSTRAINT_NAME: string;
}

interface FavoriteRecipeDatabaseRow {
  recipe_id: string;
}

type QueryExecutor = Pool | PoolConnection;

interface CreateRecipeRepositoryInput {
  nome: string;
  tempoPreparoMinutos?: number;
  rendimentoPorcoes?: number;
  dificuldade?: RecipeDifficulty;
  isColaborativa: boolean;
  status: RecipeStatus;
  usuarioId: string;
}

interface UpdateRecipeRepositoryInput {
  nome: string;
  tempoPreparoMinutos?: number;
  rendimentoPorcoes?: number;
  dificuldade?: RecipeDifficulty;
  isColaborativa: boolean;
  status: RecipeStatus;
}

interface CreateRecipeMediaRepositoryInput {
  url: string;
  tipo: RecipeMediaType;
  nomeArquivo: string;
  mimeType: string;
  tamanho: number;
  ordem: number;
}

interface RecipeDatabaseRow {
  recipe_id: string;
  author_id: string;
  author_username: string | null;
  name: string;
  preparation_time_minutes: number | null;
  yield_portions: number | null;
  difficulty: RecipeDifficulty | null;
  is_collaborative: number | boolean;
  status: RecipeStatus;
  average_rating: string | number;
  created_at: Date | string;
  updated_at: Date | string;
  ingredient_id: string | null;
  ingredient_name: string | null;
  ingredient_quantity: string | null;
  ingredient_unit: string | null;
  nutrition_id: string | null;
  nutrition_calories: string | number | null;
  nutrition_proteins: string | number | null;
  nutrition_carbohydrates: string | number | null;
  nutrition_fats: string | number | null;
  preparation_step_id: string | null;
  preparation_step_order: number | null;
  preparation_step_description: string | null;
  media_id: string | null;
  media_url: string | null;
  media_type: RecipeMediaType | null;
  media_file_name: string | null;
  media_mime_type: string | null;
  media_size: string | number | null;
  media_sort_order: number | null;
  media_created_at: Date | string | null;
}

function getExecutor(executor?: QueryExecutor): QueryExecutor {
  return executor ?? database;
}

function mapRecipeRow(row: RecipeDatabaseRow): RecipeModel {
  return {
    id: row.recipe_id,
    authorId: row.author_id,
    authorName: row.author_username ?? row.author_id,
    authorUsername: row.author_username,
    name: row.name,
    preparationTimeMinutes: row.preparation_time_minutes,
    yieldPortions: row.yield_portions,
    difficulty: row.difficulty,
    isCollaborative: Boolean(row.is_collaborative),
    status: row.status,
    averageRating: Number(row.average_rating),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapRecipeIngredientRow(
  row: RecipeDatabaseRow,
): RecipeIngredientModel {
  return {
    id: row.ingredient_id!,
    recipeId: row.recipe_id,
    name: row.ingredient_name!,
    quantity: row.ingredient_quantity,
    unit: row.ingredient_unit,
  };
}

function mapRecipeNutritionRow(
  row: RecipeDatabaseRow,
): RecipeNutritionModel {
  return {
    id: row.nutrition_id!,
    recipeId: row.recipe_id,
    calories: toNullableNumber(row.nutrition_calories),
    proteins: toNullableNumber(row.nutrition_proteins),
    carbohydrates: toNullableNumber(row.nutrition_carbohydrates),
    fats: toNullableNumber(row.nutrition_fats),
  };
}

function mapRecipePreparationStepRow(
  row: RecipeDatabaseRow,
): RecipePreparationStepModel {
  return {
    id: row.preparation_step_id!,
    recipeId: row.recipe_id,
    order: row.preparation_step_order!,
    description: row.preparation_step_description!,
  };
}

function mapRecipeMediaRow(
  row: RecipeDatabaseRow,
): RecipeMediaModel {
  return {
    id: row.media_id!,
    recipeId: row.recipe_id,
    url: row.media_url!,
    type: row.media_type!,
    fileName: row.media_file_name,
    mimeType: row.media_mime_type,
    size: toNullableNumber(row.media_size),
    order: row.media_sort_order!,
    createdAt: toIsoString(row.media_created_at!),
  };
}

function toNullableNumber(value: string | number | null): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
