import { randomUUID } from 'crypto';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { database } from '../config/database';
import { PasswordResetTokenModel } from '../models/password-reset-token.model';

export class PasswordResetRepository {
  async ensureTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id CHAR(36) NOT NULL PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        token_hash VARCHAR(255) NOT NULL,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_password_reset_user_id (user_id),
        INDEX idx_password_reset_token_hash (token_hash)
      )
    `);
  }

  async create(input: CreatePasswordResetTokenInput): Promise<void> {
    await this.ensureTable();

    await database.execute<ResultSetHeader>(
      `
        INSERT INTO password_reset_tokens (
          id,
          user_id,
          token_hash,
          expires_at,
          used_at
        )
        VALUES (?, ?, ?, ?, NULL)
      `,
      [
        randomUUID(),
        input.userId,
        input.tokenHash,
        input.expiresAt,
      ],
    );
  }

  async invalidateActiveTokensByUserId(userId: string): Promise<void> {
    await this.ensureTable();

    await database.execute<ResultSetHeader>(
      `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE user_id = ?
          AND used_at IS NULL
      `,
      [userId],
    );
  }

  async findValidByTokenHash(
    tokenHash: string,
  ): Promise<PasswordResetTokenModel | null> {
    await this.ensureTable();

    const [rows] = await database.execute<(RowDataPacket & PasswordResetTokenRow)[]>(
      `
        SELECT
          id,
          user_id,
          token_hash,
          expires_at,
          used_at,
          created_at
        FROM password_reset_tokens
        WHERE token_hash = ?
          AND used_at IS NULL
          AND expires_at > CURRENT_TIMESTAMP
        LIMIT 1
      `,
      [tokenHash],
    );

    if (!rows.length) {
      return null;
    }

    return mapPasswordResetToken(rows[0]);
  }

  async markAsUsed(id: string): Promise<void> {
    await this.ensureTable();

    await database.execute<ResultSetHeader>(
      `
        UPDATE password_reset_tokens
        SET used_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
      [id],
    );
  }
}

interface CreatePasswordResetTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: string;
}

interface PasswordResetTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date | string;
  used_at: Date | string | null;
  created_at: Date | string;
}

function mapPasswordResetToken(row: PasswordResetTokenRow): PasswordResetTokenModel {
  return {
    id: row.id,
    userId: row.user_id,
    tokenHash: row.token_hash,
    expiresAt: toIsoString(row.expires_at),
    usedAt: row.used_at ? toIsoString(row.used_at) : null,
    createdAt: toIsoString(row.created_at),
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
