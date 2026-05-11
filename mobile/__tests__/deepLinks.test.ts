import {
  buildRecipeDeepLink,
  buildRecipeWebUrl,
  extractRecipeIdFromUrl,
} from '../src/utils/deepLinks';

describe('deepLinks', () => {
  test('extracts recipe id from app scheme links', () => {
    expect(extractRecipeIdFromUrl(buildRecipeDeepLink('recipe-123'))).toBe('recipe-123');
  });

  test('extracts recipe id from website links', () => {
    expect(extractRecipeIdFromUrl(buildRecipeWebUrl('recipe-123'))).toBe('recipe-123');
  });

  test('ignores unsupported urls', () => {
    expect(extractRecipeIdFromUrl('https://example.com/receitas/recipe-123')).toBeNull();
    expect(extractRecipeIdFromUrl('vireochef://publicacoes/pub-123')).toBeNull();
  });
});
