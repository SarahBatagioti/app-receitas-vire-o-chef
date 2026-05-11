import React from 'react';
import { Image } from 'react-native';
import { AppContainer } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type PublicationMediaProps = {
  uri: string;
};

function PublicationMedia({ uri }: PublicationMediaProps) {
  const { theme } = useAppTheme();

  return (
    <AppContainer
      backgroundColor="surfaceSecondary"
      borderRadius="3xl"
      style={{
        aspectRatio: 1.02,
        overflow: 'hidden',
      }}
    >
      <Image
        resizeMode="cover"
        source={{ uri }}
        style={{
          borderRadius: theme.borderRadius['3xl'],
          height: '100%',
          width: '100%',
        }}
      />
    </AppContainer>
  );
}

export default PublicationMedia;
