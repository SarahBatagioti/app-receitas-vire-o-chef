import React from 'react';
import { Modal, Pressable } from 'react-native';
import { AppButton, AppContainer } from '../../../components/ui';
import { useAppTheme } from '../../../contexts';

type PublicationOptionsMenuProps = {
  visible: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
};

function PublicationOptionsMenu({
  visible,
  onClose,
  onEdit,
  onDelete,
}: PublicationOptionsMenuProps) {
  const { theme } = useAppTheme();

  return (
    <Modal animationType="fade" transparent visible={visible}>
      <Pressable
        onPress={onClose}
        style={{
          backgroundColor: theme.colors.overlay,
          flex: 1,
          justifyContent: 'flex-end',
          padding: theme.spacing.lg,
        }}
      >
        <AppContainer
          backgroundColor="surface"
          borderRadius="3xl"
          padding="lg"
          style={{ gap: theme.spacing.md }}
        >
          <AppButton label="Editar publicação" onPress={onEdit} />
          <AppButton
            backgroundColor="error"
            label="Apagar publicação"
            onPress={onDelete}
          />
          <AppButton label="Cancelar" onPress={onClose} variant="secondary" />
        </AppContainer>
      </Pressable>
    </Modal>
  );
}

export default PublicationOptionsMenu;
