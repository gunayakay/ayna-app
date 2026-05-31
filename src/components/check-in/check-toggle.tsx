import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '../atoms';
import Svg from '../atoms/svg';
import { Check } from '#assets/svg';

export interface CheckToggleProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
}

export default function CheckToggle({ checked, onToggle }: CheckToggleProps) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => onToggle(!checked)}
        style={[styles.circle, checked && styles.circleChecked]}>
        <Svg
          Icon={Check}
          width={32}
          height={32}
          stroke={checked ? theme.colors.white : theme.colors.typography.TERTIARY}
          strokeWidth={2.5}
        />
      </TouchableOpacity>
      <Text style={[styles.label, checked && styles.labelChecked]}>
        {checked ? 'Tamamlandı!' : 'Yaptım'}
      </Text>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  circle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: theme.colors.border.PRIMARY,
    backgroundColor: theme.colors.background.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleChecked: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  label: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
  },
  labelChecked: {
    color: theme.colors.success,
    fontFamily: theme.fontFamily.bold,
  },
}));
