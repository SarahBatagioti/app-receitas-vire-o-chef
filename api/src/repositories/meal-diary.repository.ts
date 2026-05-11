import { randomUUID } from 'crypto';
import {
  Pool,
  PoolConnection,
  ResultSetHeader,
  RowDataPacket,
} from 'mysql2/promise';
import { database } from '../config/database';
import { MealDiaryReplaceItemDto } from '../dtos/meal-diary.dto';
import { MealEntryModel, MealType } from '../models/meal-entry.model';

const ORDERED_MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'afternoonSnack', 'dinner'];

export class MealDiaryRepository {
  async ensureTables(): Promise<void> {
    if (mealDiaryTablesReady) {
      return;
    }

    if (!mealDiaryTablesSetupPromise) {
      mealDiaryTablesSetupPromise = (async () => {
        await this.ensureMealEntriesTable();
        await this.ensureRelationships();
        mealDiaryTablesReady = true;
      })().catch((error) => {
        mealDiaryTablesSetupPromise = null;
        throw error;
      });
    }

    await mealDiaryTablesSetupPromise;
  }

  async listEntriesByUserAndDate(userId: string, date: string): Promise<MealDiaryEntryAggregate[]> {
    await this.ensureTables();

    const [rows] = await database.execute<(RowDataPacket & MealDiaryEntryRow)[]>(
      `
        SELECT
          me.id,
          me.user_id,
          me.entry_date,
          me.meal_type,
          me.recipe_id,
          me.quantity,
          me.calories_snapshot,
          me.created_at,
          me.updated_at,
          r.name AS recipe_name,
          u.username AS author_username,
          rm.url AS recipe_image_url
        FROM meal_entries me
        INNER JOIN recipes r
          ON r.id = me.recipe_id
        LEFT JOIN users u
          ON u.id = r.author_id
        LEFT JOIN recipe_media rm
          ON rm.recipe_id = r.id
          AND rm.sort_order = (
            SELECT MIN(rm2.sort_order)
            FROM recipe_media rm2
            WHERE rm2.recipe_id = r.id
          )
        WHERE me.user_id = ?
          AND me.entry_date = ?
        ORDER BY
          FIELD(me.meal_type, 'breakfast', 'lunch', 'afternoonSnack', 'dinner'),
          me.created_at ASC,
          me.id ASC
      `,
      [userId, date],
    );

    return rows.map(mapMealDiaryEntryRow);
  }

  async replaceMealEntries(
    userId: string,
    date: string,
    mealType: MealType,
    items: Array<MealDiaryReplaceItemDto & { caloriesSnapshot: number }>,
    executor?: QueryExecutor,
  ): Promise<void> {
    if (!executor) {
      await this.ensureTables();
    }

    const queryExecutor = getExecutor(executor);

    await queryExecutor.execute<ResultSetHeader>(
      `
        DELETE FROM meal_entries
        WHERE user_id = ?
          AND entry_date = ?
          AND meal_type = ?
      `,
      [userId, date, mealType],
    );

    for (const item of items) {
      await queryExecutor.execute<ResultSetHeader>(
        `
          INSERT INTO meal_entries (
            id,
            user_id,
            entry_date,
            meal_type,
            recipe_id,
            quantity,
            calories_snapshot
          )
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          randomUUID(),
          userId,
          date,
          mealType,
          item.recipeId,
          item.quantity,
          item.caloriesSnapshot,
        ],
      );
    }
  }

  private async ensureMealEntriesTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS meal_entries (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        entry_date DATE NOT NULL,
        meal_type ENUM('breakfast', 'lunch', 'afternoonSnack', 'dinner') NOT NULL,
        recipe_id CHAR(36) NOT NULL,
        quantity DECIMAL(10,2) NOT NULL,
        calories_snapshot DECIMAL(10,2) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_meal_entries_user_date (user_id, entry_date),
        INDEX idx_meal_entries_recipe_id (recipe_id),
        INDEX idx_meal_entries_user_date_meal_type (user_id, entry_date, meal_type)
      )
    `);
  }

  private async ensureRelationships(): Promise<void> {
    await ensureForeignKey(
      'meal_entries',
      'fk_meal_entries_user_id',
      'user_id',
      'users',
      'id',
    );
    await ensureForeignKey(
      'meal_entries',
      'fk_meal_entries_recipe_id',
      'recipe_id',
      'recipes',
      'id',
    );
  }
}

export interface MealDiaryEntryAggregate extends MealEntryModel {
  recipeName: string;
  recipeImageUrl: string | null;
  authorName: string;
}

type QueryExecutor = Pool | PoolConnection;

interface MealDiaryEntryRow {
  id: string;
  user_id: string;
  entry_date: Date | string;
  meal_type: MealType;
  recipe_id: string;
  quantity: string | number;
  calories_snapshot: string | number;
  created_at: Date | string;
  updated_at: Date | string;
  recipe_name: string;
  recipe_image_url: string | null;
  author_username: string | null;
}

interface ForeignKeyConstraintRow {
  CONSTRAINT_NAME: string;
}

function getExecutor(executor?: QueryExecutor): QueryExecutor {
  return executor ?? database;
}

function mapMealDiaryEntryRow(row: MealDiaryEntryRow): MealDiaryEntryAggregate {
  return {
    id: row.id,
    userId: row.user_id,
    date: toDateOnly(row.entry_date),
    mealType: row.meal_type,
    recipeId: row.recipe_id,
    quantity: Number(row.quantity),
    caloriesSnapshot: Number(row.calories_snapshot),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
    recipeName: row.recipe_name,
    recipeImageUrl: row.recipe_image_url,
    authorName: row.author_username ?? 'Autor da receita',
  };
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

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function toDateOnly(value: Date | string): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).slice(0, 10);
}

export { ORDERED_MEAL_TYPES };

let mealDiaryTablesSetupPromise: Promise<void> | null = null;
let mealDiaryTablesReady = false;
