import { Request, Response } from 'express';
import {
  CreatePublicationCommentDto,
  CreatePublicationDto,
  UpdatePublicationDto,
} from '../dtos/publication.dto';
import { PublicationService } from '../services/publication.service';
import { buildSuccessResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';

const publicationService = new PublicationService();

export class PublicationController {
  async create(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const createdPublication = await publicationService.criarPublicacao(
      request.body as CreatePublicationDto,
      getPublicationMediaUpload(request),
      authUser.id,
    );

    return response.status(201).json(buildSuccessResponse(createdPublication));
  }

  async update(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const publication = await publicationService.atualizarPublicacao(
      getPublicationId(request),
      request.body as UpdatePublicationDto,
      authUser.id,
    );

    return response.status(200).json(buildSuccessResponse(publication));
  }

  async delete(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    await publicationService.removerPublicacao(getPublicationId(request), authUser.id);

    return response.status(200).json(buildSuccessResponse({ message: 'Publicacao removida com sucesso.' }));
  }

  async listFeed(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const feed = await publicationService.listarFeedPublico(
      authUser.id,
      String(request.query.cursor ?? ''),
      Number(request.query.limit ?? 10),
      String(request.query.username ?? ''),
    );

    return response.status(200).json(buildSuccessResponse(feed));
  }

  async listMine(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const publications = await publicationService.listarMinhasPublicacoes(authUser.id);

    return response.status(200).json(buildSuccessResponse(publications));
  }

  async like(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const publication = await publicationService.curtirPublicacao(getPublicationId(request), authUser.id);

    return response.status(200).json(buildSuccessResponse(publication));
  }

  async unlike(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const publication = await publicationService.descurtirPublicacao(getPublicationId(request), authUser.id);

    return response.status(200).json(buildSuccessResponse(publication));
  }

  async share(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const publication = await publicationService.registrarCompartilhamento(getPublicationId(request), authUser.id);

    return response.status(200).json(buildSuccessResponse(publication));
  }

  async listComments(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const comments = await publicationService.listarComentarios(
      getPublicationId(request),
      authUser.id,
      String(request.query.cursor ?? ''),
      Number(request.query.limit ?? 10),
    );

    return response.status(200).json(buildSuccessResponse(comments));
  }

  async createComment(request: Request, response: Response) {
    const authUser = getAuthenticatedUser(request);
    const comment = await publicationService.comentarPublicacao(
      getPublicationId(request),
      request.body as CreatePublicationCommentDto,
      authUser.id,
    );

    return response.status(201).json(buildSuccessResponse(comment));
  }
}

function getAuthenticatedUser(request: Request) {
  if (!request.authUser) {
    throw new AppError('Token de autenticacao invalido.', 401);
  }

  return request.authUser;
}

function getPublicationId(request: Request): string {
  const { id } = request.params;

  if (typeof id !== 'string') {
    throw new AppError('Identificador da publicacao invalido.', 422);
  }

  return id;
}

function getPublicationMediaUpload(request: Request) {
  if (!request.publicationMediaUpload) {
    throw new AppError('Nenhuma imagem enviada.', 422);
  }

  return request.publicationMediaUpload;
}
