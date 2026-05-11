import { database } from '../config/database';
import {
  CreatePublicationCommentDto,
  CreatePublicationDto,
  CursorPageDto,
  PublicationCommentDto,
  PublicationFeedItemDto,
  PublicationMediaUploadDto,
  UpdatePublicationDto,
} from '../dtos/publication.dto';
import { UserRepository } from '../repositories/user.repository';
import { RecipeRepository } from '../repositories/recipe.repository';
import {
  PublicationAggregate,
  PublicationCommentAggregate,
  PublicationRepository,
} from '../repositories/publication.repository';
import { AppError } from '../utils/app-error';
import {
  deletePublicationMediaFiles,
  removePublicationMediaDirectoryIfEmpty,
  resolvePublicationMediaAbsolutePath,
} from '../utils/publication-media-storage';
import {
  validateCreatePublicationCommentDto,
  validateCreatePublicationDto,
  validateUpdatePublicationDto,
} from '../validators/publication.validator';

const DEFAULT_LIMIT = 10;

const publicationRepository = new PublicationRepository();
const userRepository = new UserRepository();
const recipeRepository = new RecipeRepository();

export class PublicationService {
  async criarPublicacao(
    dto: Partial<CreatePublicationDto>,
    upload: PublicationMediaUploadDto,
    usuarioId: string,
  ): Promise<PublicationFeedItemDto> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const normalizedDto = validateCreatePublicationDto(dto);
    await this.ensureLinkedRecipeAccessible(normalizedDto.recipeId, usuarioId);
    const connection = await database.getConnection();
    let publicationId: string | null = null;

    try {
      await connection.beginTransaction();

      publicationId = await publicationRepository.createPublication(
        {
          authorId: usuarioId,
          recipeId: normalizedDto.recipeId ?? null,
          caption: normalizedDto.legenda ?? '',
          mediaUrl: upload.arquivo.publicUrl,
          mediaType: upload.arquivo.inferredType,
        },
        connection,
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      await cleanupUploadedPublicationMedia(upload);
      throw error;
    } finally {
      connection.release();
    }

    const createdPublication = await publicationRepository.findPublicationById(publicationId, usuarioId);

    if (!createdPublication) {
      throw new AppError('Falha ao buscar publicacao criada.', 500);
    }

    return mapPublication(createdPublication);
  }

  async atualizarPublicacao(
    publicationId: string,
    dto: Partial<UpdatePublicationDto>,
    usuarioId: string,
  ): Promise<PublicationFeedItemDto> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const currentPublication = await publicationRepository.findPublicationByIdAndAuthorId(
      publicationId,
      usuarioId,
      usuarioId,
    );

    if (!currentPublication) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    const normalizedDto = validateUpdatePublicationDto({
      legenda: dto.legenda ?? currentPublication.caption,
      recipeId: dto.recipeId === undefined ? currentPublication.recipeId : dto.recipeId,
    });

    await this.ensureLinkedRecipeAccessible(normalizedDto.recipeId, usuarioId);

    const updated = await publicationRepository.updatePublication(
      publicationId,
      usuarioId,
      {
        caption: normalizedDto.legenda ?? '',
        recipeId: normalizedDto.recipeId ?? null,
      },
    );

    if (!updated) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    const updatedPublication = await publicationRepository.findPublicationById(publicationId, usuarioId);

    if (!updatedPublication) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    return mapPublication(updatedPublication);
  }

  async removerPublicacao(publicationId: string, usuarioId: string): Promise<void> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const publication = await publicationRepository.findPublicationByIdAndAuthorId(
      publicationId,
      usuarioId,
      usuarioId,
    );

    if (!publication) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    const deleted = await publicationRepository.deletePublicationByIdAndAuthorId(publicationId, usuarioId);

    if (!deleted) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    await cleanupPersistedPublicationMedia(publication.id, publication.mediaUrl);
  }

  async listarFeedPublico(
    usuarioId: string,
    rawCursor: string,
    rawLimit: number,
    username: string,
  ): Promise<CursorPageDto<PublicationFeedItemDto>> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const { createdAt, id } = decodeCursor(rawCursor);
    const limit = normalizeLimit(rawLimit);
    const publications = await publicationRepository.listFeed({
      requesterId: usuarioId,
      username,
      limit,
      cursorCreatedAt: createdAt,
      cursorId: id,
    });

    return buildCursorPage(publications, limit, mapPublication);
  }

  async listarMinhasPublicacoes(usuarioId: string): Promise<PublicationFeedItemDto[]> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const items = await publicationRepository.listFeedByAuthor(usuarioId, usuarioId);
    return items.map(mapPublication);
  }

  async curtirPublicacao(publicationId: string, usuarioId: string): Promise<PublicationFeedItemDto> {
    await this.ensurePublicationExists(publicationId, usuarioId);
    await publicationRepository.createLike(publicationId, usuarioId);
    const publication = await publicationRepository.findPublicationById(publicationId, usuarioId);

    if (!publication) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    return mapPublication(publication);
  }

  async descurtirPublicacao(publicationId: string, usuarioId: string): Promise<PublicationFeedItemDto> {
    await this.ensurePublicationExists(publicationId, usuarioId);
    await publicationRepository.deleteLike(publicationId, usuarioId);
    const publication = await publicationRepository.findPublicationById(publicationId, usuarioId);

    if (!publication) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    return mapPublication(publication);
  }

  async registrarCompartilhamento(publicationId: string, usuarioId: string): Promise<PublicationFeedItemDto> {
    await this.ensurePublicationExists(publicationId, usuarioId);
    await publicationRepository.incrementShareCount(publicationId);
    const publication = await publicationRepository.findPublicationById(publicationId, usuarioId);

    if (!publication) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    return mapPublication(publication);
  }

  async listarComentarios(
    publicationId: string,
    usuarioId: string,
    rawCursor: string,
    rawLimit: number,
  ): Promise<CursorPageDto<PublicationCommentDto>> {
    await this.ensurePublicationExists(publicationId, usuarioId);

    const { createdAt, id } = decodeCursor(rawCursor);
    const limit = normalizeLimit(rawLimit);
    const comments = await publicationRepository.listComments({
      publicationId,
      limit,
      cursorCreatedAt: createdAt,
      cursorId: id,
    });

    return buildCursorPage(comments, limit, mapComment);
  }

  async comentarPublicacao(
    publicationId: string,
    dto: Partial<CreatePublicationCommentDto>,
    usuarioId: string,
  ): Promise<PublicationCommentDto> {
    await this.ensurePublicationExists(publicationId, usuarioId);
    const normalizedDto = validateCreatePublicationCommentDto(dto);
    const connection = await database.getConnection();
    let commentId = '';

    try {
      await connection.beginTransaction();
      commentId = await publicationRepository.createComment(
        publicationId,
        usuarioId,
        normalizedDto.conteudo!,
        connection,
      );
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const comment = await publicationRepository.findCommentById(commentId);

    if (!comment) {
      throw new AppError('Falha ao buscar comentario criado.', 500);
    }

    return mapComment(comment);
  }

  private async ensureInfrastructure(): Promise<void> {
    await userRepository.ensureUsersTable();
    await recipeRepository.ensureTables();
    await publicationRepository.ensureTables();
  }

  private async ensureUserExists(usuarioId: string): Promise<void> {
    const user = await userRepository.findById(usuarioId);

    if (!user) {
      throw new AppError('Usuario autor nao encontrado.', 404);
    }
  }

  private async ensureLinkedRecipeAccessible(recipeId: string | null | undefined, usuarioId: string): Promise<void> {
    if (!recipeId) {
      return;
    }

    const recipe = await recipeRepository.findRecipeByIdAndAuthorId(recipeId, usuarioId);

    if (!recipe || recipe.status !== 'PUBLICADA') {
      throw new AppError('Receita vinculada invalida.', 422, [
        'Selecione uma receita publicada da sua autoria para vincular.',
      ]);
    }
  }

  private async ensurePublicationExists(publicationId: string, usuarioId: string): Promise<PublicationAggregate> {
    await this.ensureInfrastructure();
    await this.ensureUserExists(usuarioId);

    const publication = await publicationRepository.findPublicationById(publicationId, usuarioId);

    if (!publication) {
      throw new AppError('Publicacao nao encontrada.', 404);
    }

    return publication;
  }
}

function mapPublication(publication: PublicationAggregate): PublicationFeedItemDto {
  return {
    id: publication.id,
    legenda: publication.caption,
    mediaUrl: publication.mediaUrl,
    mediaType: publication.mediaType,
    likeCount: publication.likeCount,
    commentCount: publication.commentCount,
    shareCount: publication.shareCount,
    isLikedByRequester: publication.isLikedByRequester,
    createdAt: publication.createdAt,
    updatedAt: publication.updatedAt,
    autor: {
      id: publication.authorId,
      nome: publication.authorName,
      username: publication.authorUsername,
      avatarUrl: publication.authorAvatarUrl,
    },
    receita: publication.recipeId && publication.recipeName
      ? {
          id: publication.recipeId,
          nome: publication.recipeName,
        }
      : null,
  };
}

function mapComment(comment: PublicationCommentAggregate): PublicationCommentDto {
  return {
    id: comment.id,
    conteudo: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    autor: {
      id: comment.authorId,
      nome: comment.authorName,
      username: comment.authorUsername,
      avatarUrl: comment.authorAvatarUrl,
    },
  };
}

function buildCursorPage<TInput, TOutput>(
  items: TInput[],
  limit: number,
  mapper: (item: TInput) => TOutput,
): CursorPageDto<TOutput> {
  const hasMore = items.length > limit;
  const slicedItems = hasMore ? items.slice(0, limit) : items;
  const lastItem = slicedItems[slicedItems.length - 1] as { createdAt: string; id: string } | undefined;

  return {
    items: slicedItems.map(mapper),
    nextCursor: hasMore && lastItem ? encodeCursor(lastItem.createdAt, lastItem.id) : null,
    hasMore,
  };
}

function normalizeLimit(limit: number): number {
  if (!Number.isFinite(limit) || limit <= 0) {
    return DEFAULT_LIMIT;
  }

  return Math.min(Math.trunc(limit), 20);
}

function encodeCursor(createdAt: string, id: string): string {
  return Buffer.from(`${createdAt}__${id}`).toString('base64');
}

function decodeCursor(cursor: string): { createdAt: Date | null; id: string | null } {
  if (!cursor) {
    return { createdAt: null, id: null };
  }

  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const [createdAtRaw, id] = decoded.split('__');
    const createdAt = createdAtRaw ? new Date(createdAtRaw) : null;

    if (!createdAt || Number.isNaN(createdAt.getTime()) || !id) {
      return { createdAt: null, id: null };
    }

    return { createdAt, id };
  } catch {
    return { createdAt: null, id: null };
  }
}

async function cleanupUploadedPublicationMedia(upload: PublicationMediaUploadDto): Promise<void> {
  await deletePublicationMediaFiles([{ absolutePath: upload.arquivo.absolutePath }]);
}

async function cleanupPersistedPublicationMedia(publicationId: string, mediaUrl: string): Promise<void> {
  const fileName = mediaUrl.split('/').pop();

  if (!fileName) {
    return;
  }

  await deletePublicationMediaFiles([
    { absolutePath: resolvePublicationMediaAbsolutePath(publicationId, fileName) },
  ]);
  await removePublicationMediaDirectoryIfEmpty(publicationId);
}
