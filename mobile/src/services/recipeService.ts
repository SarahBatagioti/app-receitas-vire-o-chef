import { buildServerUrl, api } from './api';

export type RecipeApiDifficulty = 'FACIL' | 'INTERMEDIARIO' | 'DIFICIL';
export type RecipeApiStatus = 'PUBLICADA' | 'RASCUNHO';
export type RecipeApiMediaType = 'IMAGEM' | 'VIDEO';

export interface CreateRecipePayload {
  nome: string;
  tempoPreparoMinutos?: number;
  rendimentoPorcoes?: number;
  dificuldade?: RecipeApiDifficulty;
  isColaborativa: boolean;
  status: RecipeApiStatus;
  ingredientes?: Array<{
    nome: string;
    quantidade?: string;
    unidade?: string;
  }>;
  informacaoNutricional?: {
    calorias?: number;
    proteinas?: number;
    carboidratos?: number;
    gorduras?: number;
  } | null;
  modoPreparo?: Array<{
    ordem: number;
    descricao: string;
  }>;
}

export interface UploadRecipeMediaPayload {
  uri: string;
  name: string;
  type: string;
  mediaType: 'image' | 'video';
}

export interface RecipeRecord {
  id: string;
  nome: string;
  tempoPreparoMinutos: number | null;
  rendimentoPorcoes: number | null;
  dificuldade: RecipeApiDifficulty | null;
  isColaborativa: boolean;
  status: RecipeApiStatus;
  avaliacaoMedia: number;
  autorId: string;
  autorNome: string;
  autorUsername: string | null;
  createdAt: string;
  updatedAt: string;
  midiaPrincipal: RecipeMediaRecord | null;
  ingredientes: RecipeIngredientRecord[];
  informacaoNutricional: RecipeNutritionRecord | null;
  modoPreparo: RecipePreparationStepRecord[];
  midias: RecipeMediaRecord[];
}

export interface RecipeMediaRecord {
  id: string;
  url: string;
  tipo: RecipeApiMediaType;
  nomeArquivo: string | null;
  mimeType: string | null;
  tamanho: number | null;
  ordem: number;
  createdAt: string;
}

export interface RecipeIngredientRecord {
  id: string;
  nome: string;
  quantidade: string | null;
  unidade: string | null;
}

export interface RecipeNutritionRecord {
  id: string;
  calorias: number | null;
  proteinas: number | null;
  carboidratos: number | null;
  gorduras: number | null;
}

export interface RecipePreparationStepRecord {
  id: string;
  ordem: number;
  descricao: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function readNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsedValue = Number(value.replace(',', '.'));
    return Number.isFinite(parsedValue) ? parsedValue : null;
  }

  return null;
}

function readBoolean(value: unknown): boolean {
  return Boolean(value);
}

function extractDataPayload(
  payload: unknown,
  invalidResponseMessage = 'Resposta invalida recebida da API.',
): unknown {
  if (!isRecord(payload)) {
    throw new Error(invalidResponseMessage);
  }

  const nestedData = payload.data;

  if (nestedData !== undefined) {
    return nestedData;
  }

  return payload;
}

function normalizeRecipeMedia(payload: unknown): RecipeMediaRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload.id);
  const url = readString(payload.url);
  const tipo = payload.tipo;

  if (!id || !url || (tipo !== 'IMAGEM' && tipo !== 'VIDEO')) {
    return null;
  }

  return {
    id,
    url: resolveRecipeMediaUrl(url),
    tipo,
    nomeArquivo: readString(payload.nomeArquivo) ?? null,
    mimeType: readString(payload.mimeType) ?? null,
    tamanho: readNumber(payload.tamanho),
    ordem: readNumber(payload.ordem) ?? 0,
    createdAt: readString(payload.createdAt) ?? '',
  };
}

function normalizeRecipeIngredient(payload: unknown): RecipeIngredientRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload.id);
  const nome = readString(payload.nome);

  if (!id || !nome) {
    return null;
  }

  return {
    id,
    nome,
    quantidade: readString(payload.quantidade) ?? null,
    unidade: readString(payload.unidade) ?? null,
  };
}

function normalizeRecipeNutrition(payload: unknown): RecipeNutritionRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload.id);

  if (!id) {
    return null;
  }

  return {
    id,
    calorias: readNumber(payload.calorias),
    proteinas: readNumber(payload.proteinas),
    carboidratos: readNumber(payload.carboidratos),
    gorduras: readNumber(payload.gorduras),
  };
}

function normalizeRecipePreparationStep(payload: unknown): RecipePreparationStepRecord | null {
  if (!isRecord(payload)) {
    return null;
  }

  const id = readString(payload.id);
  const descricao = readString(payload.descricao);
  const ordem = readNumber(payload.ordem);

  if (!id || !descricao || ordem === null) {
    return null;
  }

  return {
    id,
    ordem,
    descricao,
  };
}

function normalizeRecipeRecord(
  payload: unknown,
  invalidResponseMessage = 'Resposta invalida recebida da API.',
): RecipeRecord {
  const extractedPayload = extractDataPayload(payload, invalidResponseMessage);

  if (!isRecord(extractedPayload)) {
    throw new Error(invalidResponseMessage);
  }

  const recipePayload = extractedPayload;
  const id = readString(recipePayload.id);
  const nome = readString(recipePayload.nome);
  const status = recipePayload.status;

  if (!id || !nome || (status !== 'PUBLICADA' && status !== 'RASCUNHO')) {
    throw new Error(invalidResponseMessage);
  }

  const dificuldade = recipePayload.dificuldade;
  const normalizedDifficulty =
    dificuldade === 'FACIL' || dificuldade === 'INTERMEDIARIO' || dificuldade === 'DIFICIL'
      ? dificuldade
      : null;

  const ingredientes = Array.isArray(recipePayload.ingredientes)
    ? recipePayload.ingredientes
        .map(normalizeRecipeIngredient)
        .filter((ingredient): ingredient is RecipeIngredientRecord => Boolean(ingredient))
    : [];

  const modoPreparo = Array.isArray(recipePayload.modoPreparo)
    ? recipePayload.modoPreparo
        .map(normalizeRecipePreparationStep)
        .filter((step): step is RecipePreparationStepRecord => Boolean(step))
    : [];

  const midias = Array.isArray(recipePayload.midias)
    ? recipePayload.midias
        .map(normalizeRecipeMedia)
        .filter((media): media is RecipeMediaRecord => Boolean(media))
    : [];

  return {
    id,
    nome,
    tempoPreparoMinutos: readNumber(recipePayload.tempoPreparoMinutos),
    rendimentoPorcoes: readNumber(recipePayload.rendimentoPorcoes),
    dificuldade: normalizedDifficulty,
    isColaborativa: readBoolean(recipePayload.isColaborativa),
    status,
    avaliacaoMedia: readNumber(recipePayload.avaliacaoMedia) ?? 0,
    autorId: readString(recipePayload.autorId) ?? '',
    autorNome: readString(recipePayload.autorNome) ?? readString(recipePayload.autorUsername) ?? '',
    autorUsername: readString(recipePayload.autorUsername) ?? null,
    createdAt: readString(recipePayload.createdAt) ?? '',
    updatedAt: readString(recipePayload.updatedAt) ?? '',
    midiaPrincipal: normalizeRecipeMedia(recipePayload.midiaPrincipal),
    ingredientes,
    informacaoNutricional: normalizeRecipeNutrition(recipePayload.informacaoNutricional),
    modoPreparo,
    midias,
  };
}

function normalizeRecipeRecords(
  payload: unknown,
  invalidResponseMessage = 'Resposta invalida recebida da API.',
): RecipeRecord[] {
  const extractedPayload = extractDataPayload(payload, invalidResponseMessage);

  if (!Array.isArray(extractedPayload)) {
    throw new Error(invalidResponseMessage);
  }

  return extractedPayload.map((item) => normalizeRecipeRecord(item, invalidResponseMessage));
}

function resolveRecipeMediaUrl(url: string): string {
  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  return buildServerUrl(url.startsWith('/') ? url : `/${url}`);
}

class RecipeService {
  async listMyRecipes(): Promise<RecipeRecord[]> {
    const response = await api.get<unknown>('/receitas/minhas', true);
    return normalizeRecipeRecords(response, 'Resposta invalida recebida ao listar receitas.');
  }

  async listPublicRecipes(): Promise<RecipeRecord[]> {
    const response = await api.get<unknown>('/receitas/publicadas', true);
    return normalizeRecipeRecords(response, 'Resposta invalida recebida ao listar receitas publicas.');
  }

  async getRecipeById(recipeId: string): Promise<RecipeRecord> {
    const response = await api.get<unknown>(`/receitas/${recipeId}`, true);
    return normalizeRecipeRecord(response, 'Resposta invalida recebida ao buscar a receita.');
  }

  async createRecipe(payload: CreateRecipePayload): Promise<RecipeRecord> {
    const response = await api.post<unknown, CreateRecipePayload>('/receitas', payload, true);
    return normalizeRecipeRecord(response, 'Resposta invalida recebida ao cadastrar receita.');
  }

  async uploadRecipeMedia(
    recipeId: string,
    media: UploadRecipeMediaPayload[],
  ): Promise<RecipeMediaRecord[]> {
    const formData = new FormData();

    media.forEach((item) => {
      formData.append('arquivos', {
        uri: item.uri,
        name: item.name,
        type: item.type,
      } as unknown as Blob);
      formData.append('tipos[]', item.mediaType === 'image' ? 'IMAGEM' : 'VIDEO');
    });

    const response = await api.post<unknown, FormData>(
      `/receitas/${recipeId}/midias`,
      formData,
      true,
    );
    const payload = extractDataPayload(
      response,
      'Resposta invalida recebida ao enviar as midias.',
    );

    if (!Array.isArray(payload)) {
      throw new Error('Resposta invalida recebida ao enviar as midias.');
    }

    return payload
      .map(normalizeRecipeMedia)
      .filter((item): item is RecipeMediaRecord => Boolean(item));
  }

  async listFavoriteRecipeIds(): Promise<string[]> {
    const response = await api.get<unknown>('/receitas/favoritas/ids', true);
    const payload = extractDataPayload(
      response,
      'Resposta invalida recebida ao listar favoritos.',
    );

    if (!Array.isArray(payload)) {
      throw new Error('Resposta invalida recebida ao listar favoritos.');
    }

    return payload.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );
  }

  async favoriteRecipe(recipeId: string): Promise<void> {
    await api.post<unknown, Record<string, never>>(
      `/receitas/${recipeId}/favorito`,
      {},
      true,
    );
  }

  async unfavoriteRecipe(recipeId: string): Promise<void> {
    await api.delete<unknown>(`/receitas/${recipeId}/favorito`, true);
  }
}

export const recipeService = new RecipeService();
