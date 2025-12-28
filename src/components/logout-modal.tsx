import { View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Button, Modal } from '#components';
import { Text } from '#components/atoms';

export type ProfileModalProps = {
  title: string;
  modalVisible: boolean;
  closeModal: () => void;
  onPress: () => void;
};

export default function ProfileModal({
  title,
  modalVisible,
  closeModal,
  onPress,
}: ProfileModalProps) {
  const { t } = useTranslation();
  const { styles } = useStyles(stylesheet);
  return (
    <Modal title={title} modalVisible={modalVisible} closeModal={closeModal}>
      <Text style={styles.modalMessage}>{t('screens.account.logoutModalDescription')}</Text>
      <View style={styles.buttonWrapper}>
        <Button onPress={onPress}>
          <Text style={styles.buttonText}>{t('screens.account.logoutModalButton')}</Text>
        </Button>
      </View>
    </Modal>
  );
}

const stylesheet = createStyleSheet(theme => ({
  modalMessage: {
    textAlign: 'center',
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY[500],
  },
  buttonWrapper: {
    flexDirection: 'row',
    marginTop: 'auto',
  },
  button(button: 'login' | 'register') {
    return {
      width: '50%',
      borderRadius: theme.borderRadius['2xl'],
      backgroundColor: button === 'login' ? theme.colors.primary : theme.colors.secondary,
    };
  },
  buttonText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.white,
  },
}));
