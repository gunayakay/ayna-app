import { TouchableOpacity, View } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Close } from '#assets/svg';

import { Svg, Text } from './atoms';

export interface BottomSheetHeaderProps {
  title: string;
  handleClose: () => void;
}

export default function BottomSheetHeader({ title, handleClose }: BottomSheetHeaderProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.bottomSheetHeader}>
      <TouchableOpacity onPress={handleClose}>
        <Svg Icon={Close} width={24} height={24} strokeWidth={1.5} />
      </TouchableOpacity>
      <View style={styles.titleWrapper} pointerEvents="none">
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  bottomSheetHeader: {
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
  title: {
    textAlign: 'center',
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY[800],
  },
}));
