import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { StyleSheet, useStyles } from '#theme/unistyles';

import { Text } from '../atoms';

export interface TimeQuickPickProps {
  value: number;
  maxValue: number;
  unit: string;
  onValueChange: (value: number) => void;
}

function generateQuickPicks(maxValue: number, unit: string): number[] {
  if (unit === 'sa') {
    const step = maxValue > 6 ? 2 : 1;
    const picks: number[] = [];
    for (let v = step; v <= maxValue; v += step) {
      picks.push(v);
    }
    return picks.slice(-5);
  }

  // Minutes (dk): quarter intervals rounded to nearest 5
  const quarter = Math.max(5, Math.round(maxValue / 4 / 5) * 5);
  const picks: number[] = [];
  for (let i = 1; i <= 4; i++) {
    const val = quarter * i;
    if (val <= maxValue) picks.push(val);
  }
  if (picks.length === 0 || picks[picks.length - 1] !== maxValue) {
    picks.push(maxValue);
  }
  return picks.slice(0, 5);
}

export default function TimeQuickPick({ value, maxValue, unit, onValueChange }: TimeQuickPickProps) {
  const { styles } = useStyles(stylesheet);
  const picks = generateQuickPicks(maxValue, unit);

  return (
    <View style={styles.container}>
      <View style={styles.picksRow}>
        {picks.map(pick => {
          const isSelected = pick === value;
          return (
            <TouchableOpacity
              key={pick}
              activeOpacity={0.7}
              onPress={() => onValueChange(pick)}
              style={[styles.pickButton, isSelected && styles.pickButtonSelected]}>
              <Text style={[styles.pickText, isSelected && styles.pickTextSelected]}>
                {pick} {unit}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {value > 0 && (
        <Text style={styles.selectedLabel}>
          {value} {unit}
        </Text>
      )}
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    alignItems: 'center',
    gap: theme.spacing[4],
  },
  picksRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing[2],
  },
  pickButton: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.PRIMARY,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  pickButtonSelected: {
    backgroundColor: theme.colors.primaryLightest,
    borderColor: theme.colors.primary,
  },
  pickText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
  },
  pickTextSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
  selectedLabel: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
}));
