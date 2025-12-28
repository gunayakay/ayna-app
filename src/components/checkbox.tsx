import React from 'react';
import { Pressable, StyleProp, View, ViewStyle } from 'react-native';

import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Check } from '#assets/svg';

import { RippleWrapper, Svg, Text } from './atoms';
import { RippleWrapperProps } from './atoms/ripple-wrapper';

export interface CheckboxProps extends Omit<RippleWrapperProps, 'onPress'> {
  onChange: (checked: boolean) => void;
  checked?: boolean;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  containerTestID?: string;
  hasError?: boolean;
  springDuration?: number;
  label?: string;
  disableLabelFocus?: boolean;
  reverse?: boolean;
}
const ANIMATION_DURATION = 350;

/**
 * Checkbox component with animated ripple effect and optional label.
 * @param {CheckboxProps} props - The component props.
 * @param {boolean} checked - Whether the checkbox is checked.
 * @param {React.ReactNode} children - The child elements to be rendered inside the checkbox.
 * @param {StyleProp<ViewStyle>} containerStyle - Additional style for the container.
 * @param {string} containerTestID - Test ID for the container.
 * @param {boolean} disabled - Whether the checkbox is disabled.
 * @param {boolean} reverse - Whether the checkbox is reversed.
 * @param {boolean} hasError - Whether the checkbox has an error.
 * @param {boolean} disableLabelFocus - Whether the label should not be focusable.
 * @param {number} springDuration - The duration of the spring animation.
 * @param {string} label - The label text for the checkbox.
 * @param {Function} onChange - Callback function when the checkbox state changes.
 * @param {ViewProps} rest - Additional View props to be passed to the container.
 * @returns {React.ReactElement} The Checkbox component.
 */
export default function Checkbox({
  checked = false,
  children,
  containerStyle,
  containerTestID,
  disabled = false,
  reverse = false,
  hasError = false,
  disableLabelFocus = false,
  label,
  onChange,
  springDuration = ANIMATION_DURATION,
  ...rest
}: CheckboxProps) {
  const scale = useSharedValue(1);

  const { styles, theme } = useStyles(stylesheet);

  const handlePress = () => {
    if (disabled) return;
    onChange(!checked);
    scale.value = withSequence(
      withTiming(0.8, { duration: (2 * springDuration) / 7 }),
      withTiming(1.1, { duration: (3 * springDuration) / 7 }),
      withTiming(1, { duration: (2 * springDuration) / 7 })
    );
  };

  const animatedCheckboxStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      backgroundColor: withTiming(
        checked ? theme.colors.primary : hasError ? theme.colors.dangerLighter : theme.colors.white,
        {
          duration: springDuration / 7,
        }
      ),
    };
  });

  return (
    <View style={[styles.container(disabled), containerStyle]} testID={containerTestID}>
      <Pressable
        style={styles.pressableLabel(reverse)}
        onPress={handlePress}
        disabled={disableLabelFocus || disabled}>
        {children}
        {label && <Text style={styles.label}>{label}</Text>}
      </Pressable>
      <RippleWrapper
        rippleColor={theme.colors.primaryLighter}
        rippleDuration={350}
        style={styles.rippleContainer}
        disabled={disabled}
        onPress={handlePress}
        {...rest}>
        <View style={styles.wrapper}>
          <Animated.View style={[styles.innerContainer(hasError), animatedCheckboxStyle]}>
            <Animated.View style={[styles.checkContainer, animatedCheckboxStyle]}>
              <Svg
                Icon={Check}
                width={24}
                height={24}
                fill={hasError ? theme.colors.dangerLighter : theme.colors.white}
              />
            </Animated.View>
          </Animated.View>
        </View>
      </RippleWrapper>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: disabled => ({
    flexDirection: 'row-reverse',
    justifyContent: 'flex-end',
    gap: theme.spacing[1],
    opacity: disabled ? 0.5 : 1,
  }),
  rippleContainer: {
    width: 20,
    height: 20,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  wrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerContainer: hasError => ({
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: hasError ? theme.colors.danger : theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
  }),
  pressableLabel: reverse => ({
    flex: reverse ? 0 : 1,
    flexWrap: 'wrap',
  }),
  checkContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: theme.spacing[1],
    fontSize: theme.fontSizes.md,
    color: theme.colors.typography.PRIMARY[800],
  },
}));
