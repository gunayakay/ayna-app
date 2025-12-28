import { TouchableOpacity, View } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Close } from '#assets/svg';
import { Svg, Text } from '#components/atoms';

export interface ModalHeaderProps {
  title: string;
  onPress: () => void;
}

export default function ModalHeader({ title, onPress }: ModalHeaderProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={styles.modalCloseHeader}>
      <TouchableOpacity onPress={onPress}>
        <Svg Icon={Close} width={24} height={24} strokeWidth={1.5} />
      </TouchableOpacity>
      <View style={styles.titleWrapper} pointerEvents="none">
        <Text style={styles.modalTitle}>{title}</Text>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  modalCloseHeader: {
    justifyContent: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.typography.PRIMARY[200],
    paddingBottom: theme.spacing[3],
  },
  titleWrapper: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: -theme.spacing[1],
  },
  modalTitle: {
    textAlign: 'center',
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY[800],
  },
}));
