import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { StyleSheet, useStyles } from '#theme/unistyles';

export interface ProgressCircleProps {
  progress: number; // 0-1
  size?: number;
  strokeWidth?: number;
  color?: string;
  backgroundColor?: string;
  children?: React.ReactNode;
}

export default function ProgressCircle({
  progress,
  size = 80,
  strokeWidth = 8,
  color,
  backgroundColor,
  children,
}: ProgressCircleProps) {
  const { styles, theme } = useStyles(stylesheet);

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - clampedProgress);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} style={styles.svg}>
        {/* Background Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={backgroundColor || theme.colors.background.PRIMARY}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress Circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color || theme.colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  svg: {
    position: 'absolute',
  },
  content: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
