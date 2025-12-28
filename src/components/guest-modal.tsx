import { createRef, forwardRef, useCallback, useImperativeHandle } from 'react';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Button } from '#components';
import { ROUTES } from '#constants';
import { useModal } from '#hooks';

import { Text } from './atoms';
import Modal from './modal';

export type GuestModalProps = {
  hideModal: () => void;
  showModal: () => void;
};

const modalRef = createRef<GuestModalProps>();

const RootGuestModal = forwardRef<GuestModalProps, {}>((_, ref) => {
  const { styles } = useStyles(stylesheet);
  const { t } = useTranslation();
  const { isOpen, openModal, closeModal } = useModal();

  useImperativeHandle(ref, () => ({
    hideModal: closeModal,
    showModal: openModal,
  }));

  const handleRegister = useCallback(() => {
    router.replace(ROUTES.AUTHENTICATION_REGISTER_FIRST);
    closeModal();
  }, []);

  return (
    <Modal
      title={t('screens.authentication.guestModalTitle')}
      modalVisible={isOpen}
      closeModal={closeModal}>
      <Text style={styles.modalDescription}>
        {t('screens.authentication.guestModalDescription')}
      </Text>
      <Button onPress={handleRegister}>{t('screens.authentication.guestModalButton')}</Button>
    </Modal>
  );
});

export default function GuestModal() {
  return <RootGuestModal ref={modalRef} />;
}

GuestModal.show = function () {
  modalRef.current?.showModal();
};

GuestModal.hide = function () {
  modalRef.current?.hideModal();
};

const stylesheet = createStyleSheet(theme => ({
  modalDescription: {
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY[500],
    textAlign: 'center',
  },
}));
