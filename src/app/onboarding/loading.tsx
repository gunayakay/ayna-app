import React, { useEffect } from 'react';
import { View, Image, Animated, Easing } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';
import { onboardingStorage } from '#/utils';

export default function LoadingScreen() {
  const { styles } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  // Pulse animation for the logo
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Start pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Mark onboarding as complete and navigate to home
    const timeout = setTimeout(async () => {
      await onboardingStorage.markOnboardingCompleted();
      router.replace('/(tabs)/home');
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            { transform: [{ scale: pulseAnim }] },
          ]}>
          <Image
            source={require('#assets/img/ayna-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Text style={styles.title}>Ayna parlatılıyor...</Text>
        <Text style={styles.subtitle}>Gerçekler analiz ediliyor.</Text>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  logoContainer: {
    width: 120,
    height: 120,
    marginBottom: 32,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 28,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
  },
}));
