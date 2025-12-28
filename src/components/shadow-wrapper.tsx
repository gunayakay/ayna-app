import { StyleProp, View, ViewStyle } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';

export interface ShadowWrapperProps {
  children: React.ReactNode;
  title?: string;
  style?: StyleProp<ViewStyle>;
}
export default function ShadowWrapper({ children, title, style }: ShadowWrapperProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={[styles.shadowContainer, style]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {children}
    </View>
  );
}
const stylesheet = createStyleSheet(theme => ({
  title: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY[400],
  },
  shadowContainer: {
    gap: theme.spacing[1],
    padding: theme.spacing[4],
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['4xl'],
    elevation: 6,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
}));
