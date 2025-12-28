import { Modal as RNModal, View } from 'react-native';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import ModalHeader from './modal-header';

export interface ModalProps {
  children: React.ReactNode;
  title: string;
  modalVisible: boolean;
  closeModal: () => void;
}

export default function Modal({ children, title, modalVisible, closeModal }: ModalProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <RNModal
      animationType="fade"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}>
      <GestureHandlerRootView>
        <View style={styles.modalWrapper}>
          <View style={styles.modalView}>
            <ModalHeader title={title} onPress={closeModal} />
            <View style={styles.modalContent}>{children}</View>
          </View>
        </View>
      </GestureHandlerRootView>
    </RNModal>
  );
}

const stylesheet = createStyleSheet(theme => ({
  modalWrapper: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    backgroundColor: theme.colors.white,
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    borderRadius: theme.borderRadius['4xl'],
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalContent: {
    alignItems: 'center',
    paddingVertical: theme.spacing[4],
    gap: theme.spacing[6],
  },
}));
