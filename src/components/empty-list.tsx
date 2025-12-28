import { View } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';
import Button from './button';

export interface EmptyListProps {
  title: string;
  onPress?: () => void;
  buttonText?: string;
}

export default function EmptyList({ title, onPress, buttonText }: EmptyListProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {onPress && buttonText && (
        <Button style={styles.button} onPress={onPress}>
          {buttonText}
        </Button>
      )}
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
  },
  title: {
    textAlign: 'center',
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY[800],
  },
  button: {
    marginTop: theme.spacing[4],
  },
}));
