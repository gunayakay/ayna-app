import { TouchableOpacity } from 'react-native';

import { StyleSheet, useStyles } from '#theme/unistyles';

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

const stylesheet = StyleSheet.create(theme => ({
  linkText: {
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY[800],
    fontSize: theme.fontSizes.md,
    textDecorationLine: 'underline',
    textAlign: 'center',
  },
}));
