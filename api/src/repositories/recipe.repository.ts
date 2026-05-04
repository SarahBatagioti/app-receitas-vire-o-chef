import { RowDataPacket } from 'mysql2/promise';
import { database } from '../config/database';

export class RecipeRepository {
  async ensureTables(): Promise<void> {
    await this.ensureRecipesTable();
    await this.ensureRecipeIngredientsTable();
    await this.ensureRecipeNutritionTable();
    await this.ensureRecipePreparationStepsTable();
    await this.ensureRecipeMediaTable();
    await this.ensureRelationships();
  }

  private async ensureRecipesTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS recipes (
        id CHAR(36) NOT NULL PRIMARY KEY,
        author_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        preparation_time_minutes INT UNSIGNED NOT NULL,
        yield_portions INT UNSIGNED NOT NULL,
        difficulty ENUM('FACIL', 'INTERMEDIARIO', 'DIFICIL') NOT NULL,
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
  }
}

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
