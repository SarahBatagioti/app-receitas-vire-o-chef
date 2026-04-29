import React from 'react';
import { AppContainer, AppText } from '../components/ui';

type ScreenCardProps = {
  title: string;
  subtitle: string;
};

/**
 * Componente ScreenCard
 * Card reutilizável para exibir telas com título e subtítulo
 * Utiliza componentes globais e tema para consistência visual
 */
function ScreenCard({ title, subtitle }: ScreenCardProps) {
  return (
    <AppContainer
      padding="3xl"
      borderRadius="3xl"
      backgroundColor="surface"
      shadow="md"
      direction="column"
      justify="center"
    >
      <AppText
        size="3xl"
        weight="bold"
        marginBottom="sm"
        color="text"
      >
        {title}
      </AppText>
      <AppText
        size="md"
        color="textSecondary"
        lineHeight="relaxed"
      >
        {subtitle}
      </AppText>
    </AppContainer>
  );
}

export default ScreenCard;
