export const appRoutes = {
  home: 'inicio',
  products: 'produtos',
  recipes: 'receitas',
  meals: 'refeicoes',
  profile: 'perfil',
  authWelcome: 'auth-welcome',
} as const;

export type AppRouteKey = keyof typeof appRoutes;
