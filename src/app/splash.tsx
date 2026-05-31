import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

export default function SplashScreen() {
  const { styles, theme } = useStyles(stylesheet);

  // Animation values
  const backgroundColorAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const screenScale = useRef(new Animated.Value(1)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animationSequence = Animated.sequence([
      // 1. Initial state - show logo
      Animated.delay(500),

      // 2. Shrink logo and change background to orange
      Animated.parallel([
        Animated.timing(backgroundColorAnim, {
          toValue: 1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(logoScale, {
          toValue: 0.1,
          duration: 400,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]),

      // 3. Hold briefly
      Animated.delay(400),

      // 4. "Open" from center - scale up and fade out
      Animated.parallel([
        Animated.timing(screenScale, {
          toValue: 8,
          duration: 500,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(screenOpacity, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
    ]);

    animationSequence.start(() => {
      router.replace('/onboarding/welcome');
    });
  }, []);

  const backgroundColor = backgroundColorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.colors.background.PRIMARY, theme.colors.primary],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor,
          transform: [{ scale: screenScale }],
          opacity: screenOpacity,
        },
      ]}>
      <StatusBar barStyle="dark-content" />
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: logoScale }],
          },
        ]}>
        <Image
          source={require('#assets/img/ayna-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    width: 100,
    height: 100,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
}));
