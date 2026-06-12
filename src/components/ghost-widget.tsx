import { View } from 'react-native';
import { StyleSheet, useStyles } from '#theme/unistyles';

export interface GhostWidgetProps {
  wide?: boolean;
}

export default function GhostWidget({ wide }: GhostWidgetProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={[styles.card, wide && styles.cardWide]}>
      {/* Placeholder circle */}
      <View style={styles.circle} />
      {/* Placeholder text bar */}
      <View style={styles.textBar} />
      {/* Placeholder progress bar */}
      <View style={styles.progressBar} />
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  card: {
    borderRadius: theme.borderRadius['6xl'],
    padding: theme.spacing[5],
    flex: 1,
    minWidth: '45%',
    borderWidth: 2,
    borderColor: theme.colors.border.PRIMARY,
    borderStyle: 'dashed',
    opacity: 0.5,
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  cardWide: {
    minWidth: '100%',
  },
  circle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.border.PRIMARY,
  },
  textBar: {
    width: '60%',
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.border.PRIMARY,
  },
  progressBar: {
    width: '80%',
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border.PRIMARY,
  },
}));
