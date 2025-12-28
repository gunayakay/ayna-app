import { useEffect } from 'react';
import { View } from 'react-native';

import { Portal } from '@gorhom/portal';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Image } from './atoms';

const LOADING_LOGO_PATH = require('src/assets/img/ayna-logo.png');
const ANIMATION_DURATION = 2000;

export default function Loading() {
  const { styles } = useStyles(stylesheet);
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: ANIMATION_DURATION, easing: Easing.inOut(Easing.quad) }),
      -1
    );
  }, []);

  return (
    <Portal name="Loading">
      <View style={styles.container}>
        <Animated.View style={[styles.logoWrapper, animatedStyle]}>
          <Image source={LOADING_LOGO_PATH} style={styles.logo} />
        </Animated.View>
      </View>
    </Portal>
  );
}

const stylesheet = createStyleSheet(() => ({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255 255 255 / 0.3)',
  },
  logoWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: 150,
  },
  logo: {
    width: '100%',
    height: '100%',
    contentFit: 'contain',
  },
}));
