import Busboy from '@fastify/busboy';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { env } from '../config/env';
import { buildErrorResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import {
  buildPublicationMediaPublicUrl,
  buildSafePublicationMediaFileName,
  deletePublicationMediaFiles,
  ensurePublicationMediaDirectory,
  getAllowedPublicationMediaMimeTypes,
  getPublicationMediaAbsolutePath,
  getPublicationMediaTypeByMimeType,
  removePublicationMediaDirectoryIfEmpty,
} from '../utils/publication-media-storage';
import { PublicationMediaUploadDto, UploadedPublicationMediaFileDto } from '../dtos/publication.dto';

export function uploadPublicationMediaFile(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const publicationId = randomUUID();
  const rawContentType = request.headers['content-type'];
  const contentType = Array.isArray(rawContentType) ? rawContentType[0] : rawContentType;

  if (!contentType?.includes('multipart/form-data')) {
    return response.status(415).json(buildErrorResponse('Content-Type invalido.', [
      'Envie a requisicao como multipart/form-data.',
    ]));
  }

  const busboy = new Busboy({
    headers: {
      ...request.headers,
      'content-type': contentType,
    },
    limits: {
      files: 1,
      fileSize: env.upload.maxFileSizeBytes,
      fields: 30,
      parts: 31,
    },
  });

  const fields: Record<string, string[]> = {};
  const savedFiles: UploadedPublicationMediaFileDto[] = [];
  const pendingWrites: Promise<void>[] = [];
  let failure: AppError | null = null;

  const registerFailure = (error: unknown) => {
    if (!failure) {
      failure = error instanceof AppError ? error : new AppError('Falha ao processar upload.', 400);
    }
  };

  busboy.on('field', (fieldName, value, fieldNameTruncated, valueTruncated) => {
    if (fieldNameTruncated || valueTruncated) {
      registerFailure(new AppError('Campo de upload excedeu o limite permitido.', 422));
      return;
    }

    if (!fields[fieldName]) {
      fields[fieldName] = [];
    }

    fields[fieldName].push(value);
  });

  busboy.on('file', (fieldName, file, fileName, _encoding, mimeType) => {
    if (!fileName || failure) {
      file.resume();
      return;
    }

    const inferredType = getPublicationMediaTypeByMimeType(mimeType);
    const generatedFileName = buildSafePublicationMediaFileName(mimeType);

    if (!inferredType || !generatedFileName) {
      registerFailure(
        new AppError('Tipo de midia invalido.', 422, [
          `Tipos aceitos: ${getAllowedPublicationMediaMimeTypes().join(', ')}.`,
        ]),
      );
      file.resume();
      return;
    }

    const absolutePath = getPublicationMediaAbsolutePath(publicationId, generatedFileName);
    const publicUrl = buildPublicationMediaPublicUrl(publicationId, generatedFileName);
    const writePromise = ensurePublicationMediaDirectory(publicationId)
      .then(() => pipeline(file, createWriteStream(absolutePath)))
      .then(() => {
        if (file.truncated) {
          throw new AppError('Arquivo excedeu o limite de tamanho permitido.', 413, [
            `O limite atual por arquivo e ${env.upload.maxFileSizeBytes} bytes.`,
          ]);
        }

        savedFiles.push({
          fieldName,
          fileName: generatedFileName,
          mimeType,
          size: file.bytesRead,
          absolutePath,
          publicUrl,
          inferredType,
        });
      })
      .catch(async (error) => {
        registerFailure(error);
        await deletePublicationMediaFiles([{ absolutePath }]);
      });

    pendingWrites.push(writePromise);
  });

  busboy.on('filesLimit', () => {
    registerFailure(new AppError('Quantidade de arquivos excedeu o limite permitido.', 422));
  });
  busboy.on('fieldsLimit', () => {
    registerFailure(new AppError('Quantidade de campos excedeu o limite permitido.', 422));
  });
  busboy.on('partsLimit', () => {
    registerFailure(new AppError('Quantidade de partes excedeu o limite permitido.', 422));
  });
  busboy.on('error', (error) => {
    registerFailure(error);
  });
  busboy.on('finish', () => {
    void finalizeUpload();
  });

  request.pipe(busboy);

  async function finalizeUpload() {
    await Promise.allSettled(pendingWrites);

    if (failure) {
      await deletePublicationMediaFiles(savedFiles);
      await removePublicationMediaDirectoryIfEmpty(publicationId);

      return response
        .status(failure.statusCode)
        .json(buildErrorResponse(failure.message, failure.details));
    }

    if (savedFiles.length !== 1) {
      return response.status(422).json(buildErrorResponse('Envie exatamente uma imagem.', [
        'A publicacao precisa ter uma foto.',
      ]));
    }

    request.publicationMediaUpload = {
      arquivo: savedFiles[0],
      campos: fields,
    } satisfies PublicationMediaUploadDto;

    return next();
  }
}
