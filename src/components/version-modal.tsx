import { createRef, forwardRef, useCallback, useImperativeHandle } from 'react';
import { Linking, Platform } from 'react-native';

import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Button } from '#components';
import { useModal } from '#hooks';

import { Text } from './atoms';
import Modal from './modal';

export type VersionModalProps = {
  hideModal: () => void;
  showModal: () => void;
};

const modalRef = createRef<VersionModalProps>();

const RootVersionModal = forwardRef<VersionModalProps, {}>((_, ref) => {
  const { styles } = useStyles(stylesheet);
  const { t } = useTranslation();
  const { isOpen, openModal, closeModal } = useModal();

  useImperativeHandle(ref, () => ({
    hideModal: closeModal,
    showModal: openModal,
  }));

  const handleUpdate = useCallback(() => {
    Linking.openURL(
      Platform.select({
        ios: 'https://apps.apple.com/tr/app/buum-e/id6741210920?l=tr',
        android: 'https://play.google.com/store/apps/details?id=com.buume&hl=tr',
        default: 'https://buum-e.com',
      })
    );
    closeModal();
  }, []);

  return (
    <Modal title={t('general.versionModalTitle')} modalVisible={isOpen} closeModal={closeModal}>
      <Text style={styles.modalDescription}>{t('general.versionModalDescription')}</Text>
      <Button onPress={handleUpdate}>{t('general.versionModalButton')}</Button>
    </Modal>
  );
});

export default function VersionModal() {
  return <RootVersionModal ref={modalRef} />;
}

VersionModal.show = function () {
  modalRef.current?.showModal();
};

VersionModal.hide = function () {
  modalRef.current?.hideModal();
};

const stylesheet = createStyleSheet(theme => ({
  modalDescription: {
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY[500],
    textAlign: 'center',
  },
}));
