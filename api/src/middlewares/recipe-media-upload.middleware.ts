import Busboy from '@fastify/busboy';
import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { buildErrorResponse } from '../utils/api-response';
import { AppError } from '../utils/app-error';
import {
  buildRecipeMediaPublicUrl,
  buildSafeRecipeMediaFileName,
  deleteRecipeMediaFiles,
  ensureRecipeMediaDirectory,
  getAllowedRecipeMediaMimeTypes,
  getRecipeMediaAbsolutePath,
  getRecipeMediaTypeByMimeType,
  removeRecipeMediaDirectoryIfEmpty,
} from '../utils/recipe-media-storage';
import { RecipeMediaUploadDto, UploadedRecipeMediaFileDto } from '../dtos/recipe.dto';

export function uploadRecipeMediaFiles(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  const recipeId = request.params.id;

  if (typeof recipeId !== 'string') {
    return response
      .status(422)
      .json(buildErrorResponse('Identificador da receita invalido.', [
        'Informe um id de receita valido.',
      ]));
  }

  const rawContentType = request.headers['content-type'];
  const contentType = Array.isArray(rawContentType)
    ? rawContentType[0]
    : rawContentType;

  if (!contentType?.includes('multipart/form-data')) {
    return response
      .status(415)
      .json(buildErrorResponse('Content-Type invalido.', [
        'Envie a requisicao como multipart/form-data.',
      ]));
  }

  const normalizedRecipeId = recipeId.trim();

  const busboy = new Busboy({
    headers: {
      ...request.headers,
      'content-type': contentType,
    },
    limits: {
      files: env.upload.maxFiles,
      fileSize: env.upload.maxFileSizeBytes,
      fields: 50,
      parts: env.upload.maxFiles + 50,
    },
  });

  const fields: Record<string, string[]> = {};
  const savedFiles: UploadedRecipeMediaFileDto[] = [];
  const pendingWrites: Promise<void>[] = [];
  let failure: AppError | null = null;

  const registerFailure = (error: unknown) => {
    if (failure) {
      return;
    }

    failure = error instanceof AppError
      ? error
      : new AppError('Falha ao processar upload de midia.', 400);
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
    if (!fileName) {
      file.resume();
      return;
    }

    if (failure) {
      file.resume();
      return;
    }

    const inferredType = getRecipeMediaTypeByMimeType(mimeType);
    const generatedFileName = buildSafeRecipeMediaFileName(mimeType);

    if (!inferredType || !generatedFileName) {
      registerFailure(
        new AppError('Tipo de midia invalido.', 422, [
          `Tipos aceitos: ${getAllowedRecipeMediaMimeTypes().join(', ')}.`,
        ]),
      );
      file.resume();
      return;
    }

    const absolutePath = getRecipeMediaAbsolutePath(normalizedRecipeId, generatedFileName);
    const publicUrl = buildRecipeMediaPublicUrl(normalizedRecipeId, generatedFileName);

    const writePromise = ensureRecipeMediaDirectory(normalizedRecipeId)
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
        await deleteRecipeMediaFiles([{ absolutePath }]);
      });

    pendingWrites.push(writePromise);
  });

  busboy.on('filesLimit', () => {
    registerFailure(new AppError('Quantidade de arquivos excedeu o limite permitido.', 422, [
      `O limite atual e de ${env.upload.maxFiles} arquivos por requisicao.`,
    ]));
  });

  busboy.on('fieldsLimit', () => {
    registerFailure(new AppError('Quantidade de campos excedeu o limite permitido.', 422));
  });

  busboy.on('partsLimit', () => {
    registerFailure(new AppError('Quantidade de partes multipart excedeu o limite permitido.', 422));
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
      await deleteRecipeMediaFiles(savedFiles);
      await removeRecipeMediaDirectoryIfEmpty(normalizedRecipeId);

      return response
        .status(failure.statusCode)
        .json(buildErrorResponse(failure.message, failure.details));
    }

    if (savedFiles.length === 0) {
      return response
        .status(422)
        .json(buildErrorResponse('Nenhum arquivo enviado.', [
          'Envie ao menos um arquivo de imagem ou video.',
        ]));
    }

    request.recipeMediaUpload = {
      arquivos: savedFiles,
      campos: fields,
    } satisfies RecipeMediaUploadDto;

    return next();
  }
}
