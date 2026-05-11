import { randomUUID } from 'crypto';
import { Pool, PoolConnection, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { database } from '../config/database';
import { PublicationMediaType } from '../models/publication.model';

type QueryExecutor = Pool | PoolConnection;

export interface PublicationAggregate {
  id: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  recipeId: string | null;
  recipeName: string | null;
  caption: string;
  mediaUrl: string;
  mediaType: PublicationMediaType;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  isLikedByRequester: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PublicationCommentAggregate {
  id: string;
  publicationId: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatarUrl: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export class PublicationRepository {
  async ensureTables(): Promise<void> {
    await this.ensurePublicationsTable();
    await this.ensurePublicationLikesTable();
    await this.ensurePublicationCommentsTable();
    await this.ensureRelationships();
  }

  async createPublication(input: CreatePublicationRepositoryInput, executor?: QueryExecutor): Promise<string> {
    if (!executor) {
      await this.ensureTables();
    }

    const publicationId = randomUUID();
    await getExecutor(executor).execute<ResultSetHeader>(
      `
        INSERT INTO publications (
          id,
          author_id,
          recipe_id,
          caption,
          media_url,
          media_type,
          like_count,
          comment_count,
          share_count
        )
        VALUES (?, ?, ?, ?, ?, ?, 0, 0, 0)
      `,
      [
        publicationId,
        input.authorId,
        input.recipeId ?? null,
        input.caption,
        input.mediaUrl,
        input.mediaType,
      ],
    );

    return publicationId;
  }

  async updatePublication(
    publicationId: string,
    authorId: string,
    input: UpdatePublicationRepositoryInput,
    executor?: QueryExecutor,
  ): Promise<boolean> {
    if (!executor) {
      await this.ensureTables();
    }

    const [result] = await getExecutor(executor).execute<ResultSetHeader>(
      `
        UPDATE publications
        SET caption = ?, recipe_id = ?
        WHERE id = ?
          AND author_id = ?
      `,
      [input.caption, input.recipeId ?? null, publicationId, authorId],
    );

    return result.affectedRows > 0;
  }

  async deletePublicationByIdAndAuthorId(
    publicationId: string,
    authorId: string,
    executor?: QueryExecutor,
  ): Promise<boolean> {
    if (!executor) {
      await this.ensureTables();
    }

    const [result] = await getExecutor(executor).execute<ResultSetHeader>(
      `
        DELETE FROM publications
        WHERE id = ?
          AND author_id = ?
      `,
      [publicationId, authorId],
    );

    return result.affectedRows > 0;
  }

  async findPublicationById(
    publicationId: string,
    requesterId: string,
  ): Promise<PublicationAggregate | null> {
    await this.ensureTables();

    const [rows] = await database.execute<(RowDataPacket & PublicationDatabaseRow)[]>(
      `
        ${basePublicationSelectQuery}
        WHERE p.id = ?
        ORDER BY p.created_at DESC, p.id DESC
      `,
      [requesterId, publicationId],
    );

    return rows[0] ? mapPublicationRow(rows[0]) : null;
  }

  async findPublicationByIdAndAuthorId(
    publicationId: string,
    authorId: string,
    requesterId: string,
  ): Promise<PublicationAggregate | null> {
    await this.ensureTables();

    const [rows] = await database.execute<(RowDataPacket & PublicationDatabaseRow)[]>(
      `
        ${basePublicationSelectQuery}
        WHERE p.id = ?
          AND p.author_id = ?
        ORDER BY p.created_at DESC, p.id DESC
      `,
      [requesterId, publicationId, authorId],
    );

    return rows[0] ? mapPublicationRow(rows[0]) : null;
  }

  async listFeed(input: ListFeedRepositoryInput): Promise<PublicationAggregate[]> {
    await this.ensureTables();

    const conditions: string[] = [];
    const params: Array<string | number | Date> = [input.requesterId];
    const limit = input.limit + 1;

    if (input.username) {
      conditions.push('LOWER(u.username) LIKE ?');
      params.push(`%${input.username.toLowerCase()}%`);
    }

    if (input.cursorCreatedAt && input.cursorId) {
      conditions.push('(p.created_at < ? OR (p.created_at = ? AND p.id < ?))');
      params.push(input.cursorCreatedAt, input.cursorCreatedAt, input.cursorId);
    }

    const [rows] = await database.execute<(RowDataPacket & PublicationDatabaseRow)[]>(
      `
        ${basePublicationSelectQuery}
        ${conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''}
        ORDER BY p.created_at DESC, p.id DESC
        LIMIT ${limit}
      `,
      params,
    );

    return rows.map(mapPublicationRow);
  }

  async listFeedByAuthor(authorId: string, requesterId: string): Promise<PublicationAggregate[]> {
    await this.ensureTables();
    const [rows] = await database.execute<(RowDataPacket & PublicationDatabaseRow)[]>(
      `
        ${basePublicationSelectQuery}
        WHERE p.author_id = ?
        ORDER BY p.created_at DESC, p.id DESC
      `,
      [requesterId, authorId],
    );

    return rows.map(mapPublicationRow);
  }

  async createLike(publicationId: string, userId: string, executor?: QueryExecutor): Promise<boolean> {
    if (!executor) {
      await this.ensureTables();
    }

    const connection = getExecutor(executor);
    const [insertResult] = await connection.execute<ResultSetHeader>(
      `
        INSERT IGNORE INTO publication_likes (publication_id, user_id)
        VALUES (?, ?)
      `,
      [publicationId, userId],
    );

    if (insertResult.affectedRows > 0) {
      await connection.execute<ResultSetHeader>(
        `
          UPDATE publications
          SET like_count = like_count + 1
          WHERE id = ?
        `,
        [publicationId],
      );
      return true;
    }

    return false;
  }

  async deleteLike(publicationId: string, userId: string, executor?: QueryExecutor): Promise<boolean> {
    if (!executor) {
      await this.ensureTables();
    }

    const connection = getExecutor(executor);
    const [deleteResult] = await connection.execute<ResultSetHeader>(
      `
        DELETE FROM publication_likes
        WHERE publication_id = ?
          AND user_id = ?
      `,
      [publicationId, userId],
    );

    if (deleteResult.affectedRows > 0) {
      await connection.execute<ResultSetHeader>(
        `
          UPDATE publications
          SET like_count = GREATEST(like_count - 1, 0)
          WHERE id = ?
        `,
        [publicationId],
      );
      return true;
    }

    return false;
  }

  async incrementShareCount(publicationId: string, executor?: QueryExecutor): Promise<void> {
    if (!executor) {
      await this.ensureTables();
    }

    await getExecutor(executor).execute<ResultSetHeader>(
      `
        UPDATE publications
        SET share_count = share_count + 1
        WHERE id = ?
      `,
      [publicationId],
    );
  }

  async createComment(
    publicationId: string,
    authorId: string,
    content: string,
    executor?: QueryExecutor,
  ): Promise<string> {
    if (!executor) {
      await this.ensureTables();
    }

    const commentId = randomUUID();
    const connection = getExecutor(executor);

    await connection.execute<ResultSetHeader>(
      `
        INSERT INTO publication_comments (
          id,
          publication_id,
          author_id,
          content
        )
        VALUES (?, ?, ?, ?)
      `,
      [commentId, publicationId, authorId, content],
    );

    await connection.execute<ResultSetHeader>(
      `
        UPDATE publications
        SET comment_count = comment_count + 1
        WHERE id = ?
      `,
      [publicationId],
    );

    return commentId;
  }

  async listComments(input: ListCommentsRepositoryInput): Promise<PublicationCommentAggregate[]> {
    await this.ensureTables();
    const params: Array<string | number | Date> = [input.publicationId];
    const conditions = ['pc.publication_id = ?'];
    const limit = input.limit + 1;

    if (input.cursorCreatedAt && input.cursorId) {
      conditions.push('(pc.created_at < ? OR (pc.created_at = ? AND pc.id < ?))');
      params.push(input.cursorCreatedAt, input.cursorCreatedAt, input.cursorId);
    }

    const [rows] = await database.execute<(RowDataPacket & PublicationCommentDatabaseRow)[]>(
      `
        ${baseCommentSelectQuery}
        WHERE ${conditions.join(' AND ')}
        ORDER BY pc.created_at DESC, pc.id DESC
        LIMIT ${limit}
      `,
      params,
    );

    return rows.map(mapCommentRow);
  }

  async findCommentById(commentId: string): Promise<PublicationCommentAggregate | null> {
    await this.ensureTables();

    const [rows] = await database.execute<(RowDataPacket & PublicationCommentDatabaseRow)[]>(
      `
        ${baseCommentSelectQuery}
        WHERE pc.id = ?
        LIMIT 1
      `,
      [commentId],
    );

    return rows[0] ? mapCommentRow(rows[0]) : null;
  }

  private async ensurePublicationsTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS publications (
        id CHAR(36) NOT NULL PRIMARY KEY,
        author_id CHAR(36) NOT NULL,
        recipe_id CHAR(36) NULL,
        caption TEXT NOT NULL,
        media_url VARCHAR(2048) NOT NULL,
        media_type ENUM('IMAGEM') NOT NULL,
        like_count INT UNSIGNED NOT NULL DEFAULT 0,
        comment_count INT UNSIGNED NOT NULL DEFAULT 0,
        share_count INT UNSIGNED NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_publications_author_id (author_id),
        INDEX idx_publications_recipe_id (recipe_id),
        INDEX idx_publications_created_at (created_at)
      )
    `);
  }

  private async ensurePublicationLikesTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS publication_likes (
        publication_id CHAR(36) NOT NULL,
        user_id CHAR(36) NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (publication_id, user_id),
        INDEX idx_publication_likes_user_id (user_id)
      )
    `);
  }

  private async ensurePublicationCommentsTable(): Promise<void> {
    await database.execute(`
      CREATE TABLE IF NOT EXISTS publication_comments (
        id CHAR(36) NOT NULL PRIMARY KEY,
        publication_id CHAR(36) NOT NULL,
        author_id CHAR(36) NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_publication_comments_publication_id (publication_id),
        INDEX idx_publication_comments_author_id (author_id),
        INDEX idx_publication_comments_created_at (created_at)
      )
    `);
  }

  private async ensureRelationships(): Promise<void> {
    await database.execute(`
      ALTER TABLE publications
      ADD CONSTRAINT fk_publications_author
      FOREIGN KEY (author_id) REFERENCES users(id)
      ON DELETE CASCADE
    `).catch(() => undefined);

    await database.execute(`
      ALTER TABLE publications
      ADD CONSTRAINT fk_publications_recipe
      FOREIGN KEY (recipe_id) REFERENCES recipes(id)
      ON DELETE SET NULL
    `).catch(() => undefined);

    await database.execute(`
      ALTER TABLE publication_likes
      ADD CONSTRAINT fk_publication_likes_publication
      FOREIGN KEY (publication_id) REFERENCES publications(id)
      ON DELETE CASCADE
    `).catch(() => undefined);

    await database.execute(`
      ALTER TABLE publication_likes
      ADD CONSTRAINT fk_publication_likes_user
      FOREIGN KEY (user_id) REFERENCES users(id)
      ON DELETE CASCADE
    `).catch(() => undefined);

    await database.execute(`
      ALTER TABLE publication_comments
      ADD CONSTRAINT fk_publication_comments_publication
      FOREIGN KEY (publication_id) REFERENCES publications(id)
      ON DELETE CASCADE
    `).catch(() => undefined);

    await database.execute(`
      ALTER TABLE publication_comments
      ADD CONSTRAINT fk_publication_comments_author
      FOREIGN KEY (author_id) REFERENCES users(id)
      ON DELETE CASCADE
    `).catch(() => undefined);
  }
}

const basePublicationSelectQuery = `
  SELECT
    p.id,
    p.author_id,
    COALESCE(u.username, u.email) AS author_name,
    COALESCE(u.username, u.email) AS author_username,
    NULL AS author_avatar_url,
    p.recipe_id,
    r.name AS recipe_name,
    p.caption,
    p.media_url,
    p.media_type,
    p.like_count,
    p.comment_count,
    p.share_count,
    EXISTS(
      SELECT 1
      FROM publication_likes pl
      WHERE pl.publication_id = p.id
        AND pl.user_id = ?
    ) AS is_liked_by_requester,
    p.created_at,
    p.updated_at
  FROM publications p
  INNER JOIN users u ON u.id = p.author_id
  LEFT JOIN recipes r ON r.id = p.recipe_id
`;

const baseCommentSelectQuery = `
  SELECT
    pc.id,
    pc.publication_id,
    pc.author_id,
    COALESCE(u.username, u.email) AS author_name,
    COALESCE(u.username, u.email) AS author_username,
    NULL AS author_avatar_url,
    pc.content,
    pc.created_at,
    pc.updated_at
  FROM publication_comments pc
  INNER JOIN users u ON u.id = pc.author_id
`;

interface CreatePublicationRepositoryInput {
  authorId: string;
  recipeId: string | null;
  caption: string;
  mediaUrl: string;
  mediaType: PublicationMediaType;
}

interface UpdatePublicationRepositoryInput {
  recipeId: string | null;
  caption: string;
}

interface ListFeedRepositoryInput {
  requesterId: string;
  username: string;
  limit: number;
  cursorCreatedAt: Date | null;
  cursorId: string | null;
}

interface ListCommentsRepositoryInput {
  publicationId: string;
  limit: number;
  cursorCreatedAt: Date | null;
  cursorId: string | null;
}

interface PublicationDatabaseRow {
  id: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar_url: string | null;
  recipe_id: string | null;
  recipe_name: string | null;
  caption: string;
  media_url: string;
  media_type: PublicationMediaType;
  like_count: number;
  comment_count: number;
  share_count: number;
  is_liked_by_requester: number | boolean;
  created_at: Date | string;
  updated_at: Date | string;
}

interface PublicationCommentDatabaseRow {
  id: string;
  publication_id: string;
  author_id: string;
  author_name: string;
  author_username: string;
  author_avatar_url: string | null;
  content: string;
  created_at: Date | string;
  updated_at: Date | string;
}

function getExecutor(executor?: QueryExecutor): QueryExecutor {
  return executor ?? database;
}

function mapPublicationRow(row: PublicationDatabaseRow): PublicationAggregate {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorUsername: row.author_username,
    authorAvatarUrl: row.author_avatar_url,
    recipeId: row.recipe_id,
    recipeName: row.recipe_name,
    caption: row.caption,
    mediaUrl: row.media_url,
    mediaType: row.media_type,
    likeCount: Number(row.like_count ?? 0),
    commentCount: Number(row.comment_count ?? 0),
    shareCount: Number(row.share_count ?? 0),
    isLikedByRequester: Boolean(row.is_liked_by_requester),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function mapCommentRow(row: PublicationCommentDatabaseRow): PublicationCommentAggregate {
  return {
    id: row.id,
    publicationId: row.publication_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorUsername: row.author_username,
    authorAvatarUrl: row.author_avatar_url,
    content: row.content,
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

function toIsoString(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
