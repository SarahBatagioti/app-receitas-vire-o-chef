import { randomUUID } from 'crypto';
import { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { database } from '../config/database';
import { AuthProvider, UserModel } from '../models/user.model';

export class UserRepository {
  async ensureUsersTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) NOT NULL PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NULL,
        username VARCHAR(100) NULL UNIQUE,
        provider VARCHAR(50) NOT NULL,
        firebase_uid VARCHAR(128) NULL,
        is_social_account BOOLEAN NOT NULL DEFAULT FALSE,
        is_registration_completed BOOLEAN NOT NULL DEFAULT TRUE,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    await database.execute(`
      ALTER TABLE users
      MODIFY COLUMN password_hash VARCHAR(255) NULL,
      MODIFY COLUMN username VARCHAR(100) NULL
    `);

    await ensureColumn('users', 'firebase_uid', 'VARCHAR(128) NULL');
    await ensureColumn(
      'users',
      'is_registration_completed',
      'BOOLEAN NOT NULL DEFAULT TRUE',
    );
  }

  async findByEmail(email: string): Promise<UserModel | null> {
    await this.ensureUsersTable();

    const [rows] = await database.execute<(RowDataPacket & UserDatabaseRow)[]>(
      `${baseSelectQuery} WHERE email = ? LIMIT 1`,
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
      `${baseSelectQuery} WHERE id = ? LIMIT 1`,
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
      `${baseSelectQuery} WHERE username = ? LIMIT 1`,
      [username],
    );

    if (!rows.length) {
      return null;
    }

    return mapUserRow(rows[0]);
  }

  async findByFirebaseUid(firebaseUid: string): Promise<UserModel | null> {
    await this.ensureUsersTable();

    const [rows] = await database.execute<(RowDataPacket & UserDatabaseRow)[]>(
      `${baseSelectQuery} WHERE firebase_uid = ? LIMIT 1`,
      [firebaseUid],
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
          firebase_uid,
          is_social_account,
          is_registration_completed
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        id,
        input.email,
        input.passwordHash,
        input.username,
        input.provider,
        input.firebaseUid,
        input.isSocialAccount,
        input.isRegistrationCompleted,
      ],
    );

    const createdUser = await this.findByEmail(input.email);

    if (!createdUser) {
      throw new Error('Falha ao buscar usuario criado.');
    }

    return createdUser;
  }

  async updatePasswordById(userId: string, passwordHash: string): Promise<void> {
    await this.ensureUsersTable();

    await database.execute<ResultSetHeader>(
      `
        UPDATE users
        SET password_hash = ?
        WHERE id = ?
      `,
      [passwordHash, userId],
    );
  }

  async completeSocialRegistration(
    userId: string,
    input: CompleteSocialRegistrationInput,
  ): Promise<UserModel> {
    await this.ensureUsersTable();

    await database.execute<ResultSetHeader>(
      `
        UPDATE users
        SET
          password_hash = ?,
          username = ?,
          provider = ?,
          firebase_uid = ?,
          is_social_account = ?,
          is_registration_completed = TRUE
        WHERE id = ?
      `,
      [
        input.passwordHash,
        input.username,
        input.provider,
        input.firebaseUid,
        input.isSocialAccount,
        userId,
      ],
    );

    const updatedUser = await this.findById(userId);

    if (!updatedUser) {
      throw new Error('Falha ao buscar usuario atualizado.');
    }

    return updatedUser;
  }
}

const baseSelectQuery = `
  SELECT
    id,
    email,
    password_hash,
    username,
    provider,
    firebase_uid,
    is_social_account,
    is_registration_completed,
    created_at,
    updated_at
  FROM users
`;

interface UserDatabaseRow {
  id: string;
  email: string;
  password_hash: string | null;
  username: string | null;
  provider: AuthProvider;
  firebase_uid: string | null;
  is_social_account: number | boolean;
  is_registration_completed: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface CreateUserRepositoryInput {
  email: string;
  passwordHash: string | null;
  username: string | null;
  provider: AuthProvider;
  firebaseUid: string | null;
  isSocialAccount: boolean;
  isRegistrationCompleted: boolean;
}

interface CompleteSocialRegistrationInput {
  passwordHash: string;
  username: string;
  provider: 'google' | 'facebook';
  firebaseUid: string;
  isSocialAccount: boolean;
}

function mapUserRow(row: UserDatabaseRow): UserModel {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    username: row.username,
    provider: row.provider,
    firebaseUid: row.firebase_uid,
    isSocialAccount: Boolean(row.is_social_account),
    isRegistrationCompleted: Boolean(row.is_registration_completed),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

async function ensureColumn(
  tableName: string,
  columnName: string,
  definition: string,
): Promise<void> {
  const [rows] = await database.execute<RowDataPacket[]>(
    `
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND COLUMN_NAME = ?
      LIMIT 1
    `,
    [tableName, columnName],
  );

  if (!rows.length) {
    await database.execute(
      `ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`,
    );
  }
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
