import React, { useCallback, useState } from 'react';
import { LayoutChangeEvent, StyleProp, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

const RIPPLE_DURATION = 500;
const RIPPLE_COLOR = 'rgba(255, 255, 255, 0.5)';

export interface RippleWrapperProps extends ViewProps {
  disabled?: boolean;
  rippleColor?: string;
  rippleDuration?: number;
  innerFlowStyle?: StyleProp<ViewStyle>;
  onPress: () => void;
}

/**
 * RippleWrapper component that adds a ripple effect to its children when pressed.
 *
 * @component
 * @param {RippleWrapperProps} props - The component props.
 * @param {React.ReactNode} children - The child elements to wrap with the ripple effect.
 * @param {ViewStyle} style - Additional styles to apply to the container.
 * @param {boolean} [disabled=false] - Whether the ripple effect is disabled. Defaults to false.
 * @param {string} rippleColor - Custom color for the ripple effect. Defaults to a semi-transparent white.
 * @param {number} [rippleDuration=500] - Duration of the ripple animation in milliseconds. Defaults to 500.
 * @param {() => void} onPress - Callback function to be called when the wrapper is pressed.
 * @param {StyleProp<ViewStyle>} style - Additional styles to apply to the container.
 * @param {ViewProps} rest - Additional View props to be passed to the container.
 *
 * @returns {React.ReactElement} A wrapper component with ripple effect functionality.
 */
export default function RippleWrapper({
  style,
  children,
  disabled = false,
  innerFlowStyle,
  rippleColor,
  rippleDuration = RIPPLE_DURATION,
  onPress,
  ...rest
}: RippleWrapperProps) {
  const [radius, setRadius] = useState(-1);
  const scale = useSharedValue(0);
  const positionX = useSharedValue(0);
  const positionY = useSharedValue(0);
  const opacity = useSharedValue(0);

  const { styles } = useStyles(stylesheet);

  const handleRadius = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setRadius(Math.sqrt(width ** 2 + height ** 2));
  }, []);

  const animatedRippleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      top: positionY.value - radius,
      left: positionX.value - radius,
      opacity: opacity.value,
    };
  });

  const handleTap = Gesture.Tap()
    .enabled(!disabled)
    .onBegin(payload => {
      positionX.value = payload.x;
      positionY.value = payload.y;
      opacity.value = 1;
      scale.value = 0;
      scale.value = withTiming(1, {
        duration: rippleDuration,
        easing: Easing.ease,
      });
    })
    .onStart(() => {
      runOnJS(onPress)();
    })
    .onFinalize(() => {
      opacity.value = withTiming(0, { duration: rippleDuration });
    });

  return (
    <View style={[styles.container, style]} {...rest} onLayout={handleRadius}>
      <GestureDetector gesture={handleTap}>
        <View style={[styles.normalContainerFlow, innerFlowStyle]}>
          <View style={styles.innerContainer}>
            <Animated.View
              style={[
                animatedRippleStyle,
                styles.ripple(rippleColor),
                { width: radius * 2, height: radius * 2 },
              ]}
            />
          </View>
          {children}
        </View>
      </GestureDetector>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  normalContainerFlow: {
    flex: 1,
  },
  innerContainer: { ...StyleSheet.absoluteFillObject },
  ripple: (rippleColor?: string) => ({
    backgroundColor: rippleColor ?? RIPPLE_COLOR,
    borderRadius: theme.borderRadius.full,
  }),
}));
