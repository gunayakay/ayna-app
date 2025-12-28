import React from 'react';
import { Pressable } from 'react-native';

import Animated, {
  Easing,
  useAnimatedStyle,
  useDerivedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface SlidingCheckboxProps {
  checked: boolean;
  onPress: () => void;
  onValueChange?: (value: boolean) => void;
}

export default function SlidingCheckbox({ checked, onPress, onValueChange }: SlidingCheckboxProps) {
  const { styles, theme } = useStyles(stylesheet);
  const progress = useDerivedValue(() => checked, [checked]);

  const animatedIndicatorStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(progress.value ? 20 : 0, {
          duration: 300,
          easing: Easing.inOut(Easing.quad),
        }),
      },
    ],
    backgroundColor: theme.colors.white,
  }));

  const animatedIndicatorOpacityStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: withTiming(progress.value ? 20 : 0, {
          duration: 300,
          easing: Easing.inOut(Easing.quad),
        }),
      },
      {
        scale: withSequence(
          withTiming(2, {
            duration: 100,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(2, {
            duration: 100,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1, {
            duration: 100,
            easing: Easing.inOut(Easing.quad),
          })
        ),
      },
    ],
    backgroundColor: theme.colors.primaryLighter,
    opacity: withSequence(
      withTiming(1, {
        duration: 150,
        easing: Easing.inOut(Easing.quad),
      }),
      withTiming(0, {
        duration: 150,
        easing: Easing.inOut(Easing.quad),
      })
    ),
  }));

  const animatedContainerStyle = useAnimatedStyle(() => ({
    backgroundColor: withTiming(
      progress.value ? theme.colors.primary : theme.colors.typography.PRIMARY[300],
      {
        duration: 100,
        easing: Easing.inOut(Easing.quad),
      }
    ),
  }));

  const handlePress = () => {
    onPress();
    onValueChange?.(!checked);
  };

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <Animated.View
          style={[styles.sliderIndicator, styles.frontSliderIndicator, animatedIndicatorStyle]}
        />
        <Animated.View style={[styles.sliderIndicator, animatedIndicatorOpacityStyle]} />
      </Animated.View>
    </Pressable>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    marginLeft: 10,
    aspectRatio: 2,
    height: 20,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.typography.PRIMARY[500],
    position: 'relative',
  },
  sliderIndicator: {
    position: 'absolute',
    top: 2,
    left: 2,
    backgroundColor: theme.colors.typography.PRIMARY[100],
    height: '80%',
    aspectRatio: 1,
    elevation: 15,
    shadowColor: theme.colors.white,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    borderRadius: theme.borderRadius.full,
  },
  frontSliderIndicator: {
    zIndex: 10,
    backgroundColor: 'red',
  },
  containerChecked: {
    backgroundColor: theme.colors.primaryLighter,
  },
  sliderIndicatorChecked: {
    backgroundColor: theme.colors.primary,
  },
}));
