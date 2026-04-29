import { randomUUID } from 'crypto';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { database } from '../config/database';
import { UserModel } from '../models/user.model';

export class UserRepository {
  async ensureUsersTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) NOT NULL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        username VARCHAR(100) NOT NULL UNIQUE,
        provider VARCHAR(50) NOT NULL,
        is_social_account BOOLEAN NOT NULL DEFAULT FALSE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    await this.ensureUsersTable();

    const [rows] = await database.execute<(RowDataPacket & UserDatabaseRow)[]>(
      `
        SELECT
          id,
          email,
          password_hash,
          username,
          provider,
          is_social_account,
          created_at,
          updated_at
        FROM users
        WHERE email = ?
        LIMIT 1
      `,
      [email],
    );

    if (!rows.length) {
      return null;
    }

    return mapUserRow(rows[0]);
  }

  async findById(id: string): Promise<UserModel | null> {
    await this.ensureUsersTable();

    const [rows] = await database.execute<(RowDataPacket & UserDatabaseRow)[]>(
      `
        SELECT
          id,
          email,
          password_hash,
          username,
          provider,
          is_social_account,
          created_at,
          updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `,
      [id],
    );

    if (!rows.length) {
      return null;
    }

    return mapUserRow(rows[0]);
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    await this.ensureUsersTable();

    const [rows] = await database.execute<(RowDataPacket & UserDatabaseRow)[]>(
      `
        SELECT
          id,
          email,
          password_hash,
          username,
          provider,
          is_social_account,
          created_at,
          updated_at
        FROM users
        WHERE username = ?
        LIMIT 1
      `,
      [username],
    );

    if (!rows.length) {
      return null;
    }

    return mapUserRow(rows[0]);
  }

  async create(input: CreateUserRepositoryInput): Promise<UserModel> {
    await this.ensureUsersTable();

    const id = randomUUID();

    await database.execute<ResultSetHeader>(
      `
        INSERT INTO users (
          id,
          email,
          password_hash,
          username,
          provider,
          is_social_account
        )
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        input.email,
        input.passwordHash,
        input.username,
        input.provider,
        input.isSocialAccount,
      ],
    );

    const createdUser = await this.findByEmail(input.email);

    if (!createdUser) {
      throw new Error('Falha ao buscar usuario criado.');
    }

    return createdUser;
  }
}

interface UserDatabaseRow {
  id: string;
  email: string;
  password_hash: string;
  username: string;
  provider: 'local';
  is_social_account: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface CreateUserRepositoryInput {
  email: string;
  passwordHash: string;
  username: string;
  provider: 'local';
  isSocialAccount: boolean;
}

function mapUserRow(row: UserDatabaseRow): UserModel {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    username: row.username,
    provider: row.provider,
    isSocialAccount: Boolean(row.is_social_account),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
