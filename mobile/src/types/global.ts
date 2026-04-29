/**
 * Tipos globais do aplicativo
 * Define tipos reutilizáveis para todo o projeto
 */

import { Theme, ThemeMode } from '../styles/themes';
import { SpacingKey, BorderRadiusKey, ShadowKey } from '../styles/spacing';
import { FontSizeKey } from '../styles/fontSizes';
import { ColorKey } from '../styles/colors';
import { FontWeight } from '../styles/fonts';

/**
 * Props de espaçamento reutilizáveis
 */
export interface SpacingProps {
  margin?: SpacingKey;
  marginHorizontal?: SpacingKey;
  marginVertical?: SpacingKey;
  marginTop?: SpacingKey;
  marginBottom?: SpacingKey;
  marginLeft?: SpacingKey;
  marginRight?: SpacingKey;
  padding?: SpacingKey;
  paddingHorizontal?: SpacingKey;
  paddingVertical?: SpacingKey;
  paddingTop?: SpacingKey;
  paddingBottom?: SpacingKey;
  paddingLeft?: SpacingKey;
  paddingRight?: SpacingKey;
}

/**
 * Props de tipografia reutilizáveis
 */
export interface TypographyProps {
  size?: FontSizeKey;
  weight?: FontWeight;
  color?: ColorKey;
}

/**
 * Props de estilos de container reutilizáveis
 */
export interface ContainerStyleProps {
  borderRadius?: BorderRadiusKey;
  shadow?: ShadowKey;
  backgroundColor?: ColorKey;
}

/**
 * Props de layout reutilizáveis
 */
export interface LayoutProps {
  direction?: 'row' | 'column';
  justify?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  align?: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline';
  flex?: boolean | number;
}

/**
 * Propriedades comuns de componentes do aplicativo
 */
export interface CommonComponentProps extends SpacingProps {
  /**
   * Se o componente está desativado
   */
  disabled?: boolean;
}

/**
 * Interface para estado de carregamento assíncrono
 */
export interface AsyncState<T> {
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: T;
  error?: Error;
  isLoading: boolean;
  isError: boolean;
}

/**
 * Interface para validação de formulários
 */
export interface FormFieldError {
  field: string;
  message: string;
  type: 'required' | 'invalid' | 'custom';
}

/**
 * Interface para dados de tema customizado
 */
export interface CustomThemeConfig {
  primaryColor?: string;
  fontSizeMultiplier?: number;
  fontFamily?: string;
}

/**
 * Interface para resposta de API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Interface para paginação
 */
export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Utilitário para extrair uma key do tipo Theme
 */
export type ThemeValue<K extends keyof Theme> = Theme[K];

/**
 * Utilitário para criar tipos de componentes com tema
 */
export type ThemedComponent<Props = {}> = React.FC<Props & { theme?: Partial<Theme> }>;
