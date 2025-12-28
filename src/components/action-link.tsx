import { TouchableOpacity } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';

export interface ActionLinkProps {
  text: string;
  onPress: () => void;
}

export default function ActionLink({ text, onPress }: ActionLinkProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.linkText}>{text}</Text>
    </TouchableOpacity>
  );
}

const stylesheet = createStyleSheet(theme => ({
  linkText: {
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY[800],
    fontSize: theme.fontSizes.md,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
}));
