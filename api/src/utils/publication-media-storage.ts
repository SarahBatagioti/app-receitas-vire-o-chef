import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { PublicationMediaType } from '../models/publication.model';

const PUBLICATION_MEDIA_MIME_MAP: Record<string, { extension: string; type: PublicationMediaType }> = {
  'image/jpeg': { extension: '.jpg', type: 'IMAGEM' },
  'image/png': { extension: '.png', type: 'IMAGEM' },
  'image/webp': { extension: '.webp', type: 'IMAGEM' },
};

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');
const PUBLICATION_UPLOADS_ROOT = path.join(UPLOADS_ROOT, 'publicacoes');

export function getAllowedPublicationMediaMimeTypes(): string[] {
  return Object.keys(PUBLICATION_MEDIA_MIME_MAP);
}

export function getPublicationMediaTypeByMimeType(mimeType: string): PublicationMediaType | null {
  return PUBLICATION_MEDIA_MIME_MAP[mimeType]?.type ?? null;
}

export function buildSafePublicationMediaFileName(mimeType: string): string | null {
  const config = PUBLICATION_MEDIA_MIME_MAP[mimeType];

  if (!config) {
    return null;
  }

  return `${randomUUID()}${config.extension}`;
}

export function getPublicationMediaDirectory(publicationId: string): string {
  return path.join(PUBLICATION_UPLOADS_ROOT, publicationId);
}

export function getPublicationMediaAbsolutePath(publicationId: string, fileName: string): string {
  return path.join(getPublicationMediaDirectory(publicationId), fileName);
}

export function buildPublicationMediaPublicUrl(publicationId: string, fileName: string): string {
  return `/uploads/publicacoes/${publicationId}/${fileName}`;
}

export async function ensurePublicationMediaDirectory(publicationId: string): Promise<void> {
  await fs.mkdir(getPublicationMediaDirectory(publicationId), { recursive: true });
}

export async function deletePublicationMediaFiles(
  files: Array<{ absolutePath: string }>,
): Promise<void> {
  await Promise.all(files.map(async (file) => {
    try {
      await fs.unlink(file.absolutePath);
    } catch (error) {
      if (!isMissingFileError(error)) {
        console.warn('Falha ao remover arquivo de publicacao.', error);
      }
    }
  }));
}

export async function removePublicationMediaDirectoryIfEmpty(publicationId: string): Promise<void> {
  const directory = getPublicationMediaDirectory(publicationId);

  try {
    const items = await fs.readdir(directory);

    if (items.length === 0) {
      await fs.rmdir(directory);
    }
  } catch (error) {
    if (!isMissingFileError(error)) {
      console.warn('Falha ao verificar diretorio de publicacao.', error);
    }
  }
}

export function resolvePublicationMediaAbsolutePath(
  publicationId: string,
  fileName: string,
): string {
  return getPublicationMediaAbsolutePath(publicationId, fileName);
}

function isMissingFileError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && error.code === 'ENOENT';
}
