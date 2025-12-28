import { View } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';

export interface InformationRowProps {
  title: string;
  value: string;
  makeValueLabel?: boolean;
}

export default function InformationRow({
  title,
  value,
  makeValueLabel = false,
}: InformationRowProps) {
  const { styles } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}:</Text>
      <View style={styles.valueContainer(makeValueLabel)}>
        <Text style={styles.value(makeValueLabel)}>{value}</Text>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    flexDirection: 'row',
    gap: theme.spacing[1],
    alignItems: 'center',
  },

  title: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.bold,
  },
  valueContainer: (makeValueLabel: boolean) => ({
    paddingHorizontal: makeValueLabel ? theme.spacing[3] : 0,
    paddingVertical: makeValueLabel ? theme.spacing[1] : 0,
    borderRadius: theme.borderRadius.full,
    backgroundColor: makeValueLabel ? theme.colors.secondaryLightest : 'transparent',
  }),
  value: (makeValueLabel: boolean) => ({
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: makeValueLabel ? theme.colors.secondary : theme.colors.typography.PRIMARY[800],
  }),
}));
