import React from 'react';
import { View, TouchableOpacity } from 'react-native';

import { StyleSheet, useStyles } from '#theme/unistyles';

import { Text } from './atoms';

export interface StepperProps {
  value: number;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  maxLabel?: string;
  onValueChange?: (value: number) => void;
}

/**
 * Stepper component - PRD'deki özel tasarım
 * Düzen: [(-)] [Değer / Max] [(+)]
 */
export default function Stepper({
  value,
  min = 0,
  max = 100,
  step = 1,
  unit = '',
  maxLabel,
  onValueChange,
}: StepperProps) {
  const { styles, theme } = useStyles(stylesheet);

  const handleDecrement = () => {
    const newValue = Math.max(min, value - step);
    onValueChange?.(newValue);
  };

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step);
    onValueChange?.(newValue);
  };

  const isMinReached = value <= min;
  const isMaxReached = value >= max;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleDecrement}
        disabled={isMinReached}
        style={[styles.button, isMinReached && styles.buttonDisabled]}>
        <Text style={[styles.buttonText, isMinReached && styles.buttonTextDisabled]}>−</Text>
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        <Text style={styles.value}>
          {value}
          {unit && ` ${unit}`}
        </Text>
        {maxLabel && (
          <Text style={styles.maxLabel}>
            / {max} {maxLabel}
          </Text>
        )}
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handleIncrement}
        disabled={isMaxReached}
        style={[styles.button, isMaxReached && styles.buttonDisabled]}>
        <Text style={[styles.buttonText, isMaxReached && styles.buttonTextDisabled]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing[4],
  },
  button: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontSize: 28,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 32,
  },
  buttonTextDisabled: {
    color: theme.colors.typography.TERTIARY,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing[1],
  },
  value: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  maxLabel: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
}));
