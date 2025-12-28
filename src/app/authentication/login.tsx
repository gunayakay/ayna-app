import { Container, Text, TextInput } from '../../components/atoms';
import { StyleSheet, useStyles } from '../../theme/unistyles';

export default function LoginScreen() {
  const { styles } = useStyles(stylesheet);

  return (
    <Container style={styles.container}>
      <Text style={styles.title}>Log in</Text>
      <TextInput label="Email" placeholder="you@example.com" />
      <TextInput label="Password" placeholder="••••••••" secureTextEntry />
    </Container>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    gap: theme.spacing[4],
    backgroundColor: theme.colors.white,
  },
  title: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    textAlign: 'center',
  },
}));
