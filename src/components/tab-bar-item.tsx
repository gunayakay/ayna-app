import React, { useEffect } from 'react';
import { ActivityIndicator, View, ViewStyle } from 'react-native';

import { BottomTabNavigationOptions } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Home, HomeFilled, User, UserFilled, Clock, Chart } from '#assets/svg';
import { ROUTES } from '#constants';
import { StyleSheet, useStyles } from '#theme/unistyles';

import { RippleWrapper, Svg, Text } from './atoms';
import { RippleWrapperProps } from './atoms/ripple-wrapper';
import { SvgComponent } from './atoms/svg';

interface TabBarItemProps extends RippleWrapperProps {
  name: string;
  isFocused: boolean;
  isLoading?: boolean;
  options: BottomTabNavigationOptions;
}

const ICONS: Record<string, SvgComponent> = {
  [ROUTES.HOME]: Home,
  [ROUTES.ACCOUNT]: User,
  [ROUTES.HISTORY]: Clock,
  [ROUTES.ANALYTICS]: Chart,
};

const ACTIVE_ICONS: Record<string, SvgComponent> = {
  [ROUTES.HOME]: HomeFilled,
  [ROUTES.ACCOUNT]: UserFilled,
  [ROUTES.HISTORY]: Clock,
  [ROUTES.ANALYTICS]: Chart,
};

// Bu ikonların "filled" varyantı yok; odakta dolgu yerine primary kontur kullan.
const OUTLINE_ONLY = new Set<string>([ROUTES.HISTORY, ROUTES.ANALYTICS]);

const LABELS: Record<string, string> = {
  [ROUTES.HOME]: 'Ana Sayfa',
  [ROUTES.ACCOUNT]: 'Profil',
  [ROUTES.HISTORY]: 'Geçmiş',
  [ROUTES.ANALYTICS]: 'İstatistik',
};

const AnimatedText = Animated.createAnimatedComponent(Text);

export default function TabBarItem({
  options,
  isFocused,
  name,
  onPress,
  isLoading = false,
  ...rest
}: TabBarItemProps) {
  const { styles, theme } = useStyles(stylesheet);
  const animatedFocus = useSharedValue(isFocused);

  useEffect(() => {
    animatedFocus.value = !isFocused;
  }, [isFocused]);

  const animatedFocusStyle = useAnimatedStyle(() => ({
    color: withTiming(
      animatedFocus.value ? theme.colors.typography.PRIMARY : theme.colors.primary,
      { duration: 200 }
    ),
  }));

  return (
    <RippleWrapper
      {...rest}
      rippleColor="rgba(0, 0, 0, 0.2)"
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      accessibilityLabel={options.tabBarAccessibilityLabel ?? LABELS[name]}
      onPress={onPress}
      disabled={isLoading}
      style={[styles.container, options.tabBarItemStyle as ViewStyle]}>
      <View style={styles.innerContainer}>
        {isLoading ? (
          <View style={styles.loadingWrapper}>
            <ActivityIndicator size="small" />
          </View>
        ) : (
          <Svg
            Icon={isFocused ? ACTIVE_ICONS[name] : ICONS[name]}
            width={24}
            height={24}
            fill={!OUTLINE_ONLY.has(name) && isFocused ? theme.colors.primary : 'transparent'}
            stroke={isFocused ? theme.colors.primary : theme.colors.typography.SECONDARY}
            strokeWidth={OUTLINE_ONLY.has(name) ? 1.5 : isFocused ? 0 : 1.5}
          />
        )}
      </View>
    </RippleWrapper>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    borderRadius: theme.borderRadius['4xl'],
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 2,
    borderRadius: theme.borderRadius['6xl'],
  },
  text: {
    textAlign: 'center',
    fontFamily: theme.fontFamily.medium,
    fontSize: theme.fontSizes.sm,
    flexShrink: 1,
  },
  loadingWrapper: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
