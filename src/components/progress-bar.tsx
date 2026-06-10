import React from 'react';
import { View } from 'react-native';

import { StyleSheet, useStyles } from '#theme/unistyles';

export interface ProgressBarProps {
  progress: number; // 0-1
  height?: number;
  color?: string;
  backgroundColor?: string;
}

export default function ProgressBar({
  progress,
  height = 8,
  color,
  backgroundColor,
}: ProgressBarProps) {
  const { styles, theme } = useStyles(stylesheet);

  const clampedProgress = Math.max(0, Math.min(1, progress));

  return (
    <View
      style={[
        styles.container,
        { height, backgroundColor: backgroundColor || theme.colors.background.PRIMARY },
      ]}>
      <View
        style={[
          styles.fill,
          {
            width: `${clampedProgress * 100}%`,
            backgroundColor: color || theme.colors.primary,
          },
        ]}
      />
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    width: '100%',
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: theme.borderRadius.full,
  },
}));
