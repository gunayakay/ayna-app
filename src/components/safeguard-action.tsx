import { TouchableOpacity } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { RightArrow } from '#assets/svg';
import { Svg, Text } from '#components/atoms';

export interface SafeguardActionProps {
  title: string;
  onPress: () => void;
}

export default function SafeguardAction({ title, onPress }: SafeguardActionProps) {
  const { styles, theme } = useStyles(stylesheet);
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Svg
        Icon={RightArrow}
        width={theme.spacing[5]}
        height={theme.spacing[5]}
        stroke={theme.colors.typography.PRIMARY[800]}
      />
    </TouchableOpacity>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    flexDirection: 'row',
    paddingVertical: theme.spacing[4],
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.typography.PRIMARY[200],
  },
  title: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY[800],
  },
}));
