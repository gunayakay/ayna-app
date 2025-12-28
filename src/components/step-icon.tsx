import React from 'react';
import { Platform, View } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { TickIcon } from '#assets/svg';
import { Svg, Text } from '#components/atoms';

export interface StepIconProps {
  number: number;
  isLast: boolean;
  isActive: boolean;
  isCompleted: boolean;
}

export default function StepIcon({ number, isLast, isActive, isCompleted }: StepIconProps) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <>
      <View style={styles.stepContainer(isActive || isCompleted)}>
        {isCompleted && !isActive ? (
          <Svg Icon={TickIcon} width={13} stroke={theme.colors.white} strokeWidth={1.5} />
        ) : (
          <Text style={styles.stepNumber}>{number}</Text>
        )}
      </View>
      {!isLast && <View style={styles.stepLine} />}
    </>
  );
}

const stylesheet = createStyleSheet(theme => ({
  stepContainer: (isActive: boolean) => ({
    width: theme.spacing[8],
    height: theme.spacing[8],
    borderRadius: theme.borderRadius.full,
    backgroundColor: isActive ? theme.colors.secondary : theme.colors.typography.PRIMARY[300],
    justifyContent: 'center',
    paddingTop: Platform.OS === 'ios' ? 0 : 3,
    alignItems: 'center',
  }),
  stepNumber: {
    color: theme.colors.white,
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSizes.xl,
  },
  stepLine: {
    flex: 1,
    height: theme.spacing[0.5],
    backgroundColor: theme.colors.typography.PRIMARY[800],
    marginHorizontal: theme.spacing[1.5],
    borderRadius: theme.borderRadius.lg,
  },
}));
