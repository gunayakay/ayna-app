import { Container, Text } from '#components/atoms';
import { StyleSheet, useStyles } from '#theme/unistyles';

export default function HistoryScreen() {
  const { styles } = useStyles(stylesheet);

  return (
    <Container style={styles.container}>
      <Text style={styles.title}>History</Text>
      <Text>View your history here.</Text>
    </Container>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  title: {
    marginBottom: theme.spacing[2],
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.lg,
  },
}));
