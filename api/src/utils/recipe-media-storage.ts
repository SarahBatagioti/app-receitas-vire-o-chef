import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { RecipeMediaType } from '../models/recipe-media.model';

const RECIPE_MEDIA_MIME_MAP: Record<string, { extension: string; type: RecipeMediaType }> = {
  'image/jpeg': { extension: '.jpg', type: 'IMAGEM' },
  'image/png': { extension: '.png', type: 'IMAGEM' },
  'image/webp': { extension: '.webp', type: 'IMAGEM' },
  'video/mp4': { extension: '.mp4', type: 'VIDEO' },
  'video/quicktime': { extension: '.mov', type: 'VIDEO' },
};

const UPLOADS_ROOT = path.resolve(process.cwd(), 'uploads');
const RECIPE_UPLOADS_ROOT = path.join(UPLOADS_ROOT, 'receitas');

export interface StoredRecipeMediaFile {
  fieldName: string;
  fileName: string;
  mimeType: string;
  size: number;
  absolutePath: string;
  publicUrl: string;
  inferredType: RecipeMediaType;
}

export function getAllowedRecipeMediaMimeTypes(): string[] {
  return Object.keys(RECIPE_MEDIA_MIME_MAP);
}

export function getRecipeMediaTypeByMimeType(mimeType: string): RecipeMediaType | null {
  return RECIPE_MEDIA_MIME_MAP[mimeType]?.type ?? null;
}

export function buildSafeRecipeMediaFileName(mimeType: string): string | null {
  const config = RECIPE_MEDIA_MIME_MAP[mimeType];

  if (!config) {
    return null;
  }

  return `${randomUUID()}${config.extension}`;
}

export function getRecipeMediaDirectory(recipeId: string): string {
  return path.join(RECIPE_UPLOADS_ROOT, recipeId);
}

export function getRecipeMediaAbsolutePath(recipeId: string, fileName: string): string {
  return path.join(getRecipeMediaDirectory(recipeId), fileName);
}

export function buildRecipeMediaPublicUrl(recipeId: string, fileName: string): string {
  return `/uploads/receitas/${recipeId}/${fileName}`;
}

export async function ensureRecipeMediaDirectory(recipeId: string): Promise<void> {
  await fs.mkdir(getRecipeMediaDirectory(recipeId), { recursive: true });
}

export async function deleteRecipeMediaFiles(
  files: Array<Pick<StoredRecipeMediaFile, 'absolutePath'> | { absolutePath: string }>,
): Promise<void> {
  await Promise.all(files.map(async (file) => {
    try {
      await fs.unlink(file.absolutePath);
    } catch (error) {
      if (!isMissingFileError(error)) {
        console.warn('Falha ao remover arquivo de midia.', error);
      }
    }
  }));
}

export async function removeRecipeMediaDirectoryIfEmpty(recipeId: string): Promise<void> {
  const directory = getRecipeMediaDirectory(recipeId);

  try {
    const items = await fs.readdir(directory);

    if (items.length === 0) {
      await fs.rmdir(directory);
    }
  } catch (error) {
    if (!isMissingFileError(error)) {
      console.warn('Falha ao verificar diretorio de midias da receita.', error);
    }
  }
}

export function resolveRecipeMediaAbsolutePath(
  recipeId: string,
  fileName: string | null,
  url: string,
): string {
  const resolvedFileName = fileName ?? path.basename(url);
  return getRecipeMediaAbsolutePath(recipeId, resolvedFileName);
}

function isMissingFileError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}
