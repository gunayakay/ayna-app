import { View, TouchableOpacity } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';

export interface EmptyListProps {
  icon?: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  buttonText?: string;
}

export default function EmptyList({ icon, title, subtitle, onPress, buttonText }: EmptyListProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={styles.container}>
      {icon && <Text style={styles.icon}>{icon}</Text>}
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {onPress && buttonText && (
        <TouchableOpacity style={styles.button} activeOpacity={0.8} onPress={onPress}>
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing[8],
  },
  icon: {
    fontSize: 96,
    marginBottom: theme.spacing[6],
  },
  title: {
    textAlign: 'center',
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    marginTop: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  },
  button: {
    marginTop: theme.spacing[8],
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },
}));
