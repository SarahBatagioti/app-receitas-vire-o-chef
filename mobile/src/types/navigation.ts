export type ScreenKey =
  | 'inicio'
  | 'produtos'
  | 'receitas'
  | 'refeicoes'
  | 'perfil';

export type AuthScreenKey =
  | 'access'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'complete-social-register';

export type AppScreenKey = ScreenKey | AuthScreenKey;
