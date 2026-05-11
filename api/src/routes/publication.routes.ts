import { Router } from 'express';
import { PublicationController } from '../controllers/publication.controller';
import { authenticateJwt } from '../middlewares/auth.middleware';
import { uploadPublicationMediaFile } from '../middlewares/publication-media-upload.middleware';
import {
  validateCreateCommentRequest,
  validateCreatePublicationRequest,
  validateCursorPaginationQuery,
  validatePublicationIdParam,
  validateUpdatePublicationRequest,
} from '../validators/publication.validator';

const publicationRoutes = Router();
const publicationController = new PublicationController();

publicationRoutes.use(authenticateJwt);

publicationRoutes.get('/', validateCursorPaginationQuery, (request, response, next) =>
  publicationController.listFeed(request, response).catch(next),
);

publicationRoutes.get('/minhas', (request, response, next) =>
  publicationController.listMine(request, response).catch(next),
);

publicationRoutes.post('/', uploadPublicationMediaFile, validateCreatePublicationRequest, (request, response, next) =>
  publicationController.create(request, response).catch(next),
);

publicationRoutes.patch('/:id', validatePublicationIdParam, validateUpdatePublicationRequest, (request, response, next) =>
  publicationController.update(request, response).catch(next),
);

publicationRoutes.delete('/:id', validatePublicationIdParam, (request, response, next) =>
  publicationController.delete(request, response).catch(next),
);

publicationRoutes.post('/:id/curtidas', validatePublicationIdParam, (request, response, next) =>
  publicationController.like(request, response).catch(next),
);

publicationRoutes.delete('/:id/curtidas', validatePublicationIdParam, (request, response, next) =>
  publicationController.unlike(request, response).catch(next),
);

publicationRoutes.post('/:id/compartilhamentos', validatePublicationIdParam, (request, response, next) =>
  publicationController.share(request, response).catch(next),
);

publicationRoutes.get('/:id/comentarios', validatePublicationIdParam, validateCursorPaginationQuery, (request, response, next) =>
  publicationController.listComments(request, response).catch(next),
);

publicationRoutes.post('/:id/comentarios', validatePublicationIdParam, validateCreateCommentRequest, (request, response, next) =>
  publicationController.createComment(request, response).catch(next),
);

export { publicationRoutes };
