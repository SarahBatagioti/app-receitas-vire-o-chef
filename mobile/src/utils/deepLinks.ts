const APP_SCHEME = 'vireochef';
const WEB_HOST = 'vireochef.app';

function normalizePathSegments(url: URL): string[] {
  const hostSegments = url.protocol === `${APP_SCHEME}:` ? [url.hostname] : [];
  const pathSegments = url.pathname.split('/').filter(Boolean);

  return [...hostSegments, ...pathSegments];
}

export function buildRecipeDeepLink(recipeId: string): string {
  return `${APP_SCHEME}://receitas/${recipeId}`;
}

export function buildRecipeWebUrl(recipeId: string): string {
  return `https://${WEB_HOST}/receitas/${recipeId}`;
}

export function buildPublicationWebUrl(publicationId: string): string {
  return `https://${WEB_HOST}/publicacoes/${publicationId}`;
}

export function extractRecipeIdFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const segments = normalizePathSegments(parsedUrl);

    if (parsedUrl.protocol === 'https:' && parsedUrl.hostname !== WEB_HOST) {
      return null;
    }

    if (parsedUrl.protocol !== 'https:' && parsedUrl.protocol !== `${APP_SCHEME}:`) {
      return null;
    }

    if (segments[0] !== 'receitas') {
      return null;
    }

    return segments[1] || null;
  } catch {
    return null;
  }
}
