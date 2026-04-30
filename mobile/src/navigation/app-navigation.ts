export const appRoutes = {
  access: 'access',
  login: 'login',
  register: 'register',
  forgotPassword: 'forgot-password',
  completeSocialRegister: 'complete-social-register',
  home: 'inicio',
  products: 'produtos',
  recipes: 'receitas',
  meals: 'refeicoes',
  profile: 'perfil',
  authWelcome: 'auth-welcome',
} as const;

export type AppRouteKey = keyof typeof appRoutes;
