import { StyleProp, View, ViewStyle } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface RowProps {
  children: React.ReactNode;
  gap?: number;
  justifyContent?:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly';
  style?: StyleProp<ViewStyle>;
}

export default function Row({ children, gap = 8, style, justifyContent }: RowProps) {
  const { styles } = useStyles(stylesheet);
  return <View style={[styles.container(gap), { justifyContent }, style]}>{children}</View>;
}

const stylesheet = createStyleSheet(() => ({
  container: (gap: number) => ({
    flexDirection: 'row',
    alignItems: 'center',
    gap: gap,
  }),
}));
