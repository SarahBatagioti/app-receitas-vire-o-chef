/**
 * Estilos globais e compostos do aplicativo
 * Define padrões de estilos comuns reutilizáveis
 */

import { StyleSheet } from 'react-native';
import { Theme } from './themes';

/**
 * Cria estilos compostos com base no tema
 */
export const createGlobalStyles = (theme: Theme) => {
  return StyleSheet.create({
    // Containers
    flexCenter: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },

    flexBetween: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    rowBetween: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },

    column: {
      flexDirection: 'column',
    },

    // Texto padrão
    baseText: {
      fontSize: theme.fontSizes.base,
      color: theme.colors.text,
      fontWeight: theme.fontWeights.regular,
      fontFamily: theme.fonts.primary.regular,
    },

    smallText: {
      fontSize: theme.fontSizes.sm,
      color: theme.colors.textSecondary,
      fontWeight: theme.fontWeights.regular,
      fontFamily: theme.fonts.primary.regular,
    },

    // Espaçamento padrão
    screenPadding: {
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },

    screenMargin: {
      marginHorizontal: theme.spacing.lg,
      marginVertical: theme.spacing.md,
    },

    // Divisores
    divider: {
      height: 1,
      backgroundColor: theme.colors.divider,
      marginVertical: theme.spacing.md,
    },

    // Estados
    disabled: {
      opacity: 0.5,
    },
  });
};

export type GlobalStyles = ReturnType<typeof createGlobalStyles>;
