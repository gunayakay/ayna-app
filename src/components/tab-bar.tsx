import React from 'react';
import { View } from 'react-native';

import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StyleSheet, useStyles } from '#theme/unistyles';

import TabBarItem from './tab-bar-item';

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const wrapperStyle = {
    height: theme.spacing[12] + insets.bottom + 2 * theme.spacing[2],
    paddingTop: theme.spacing[2],
    paddingBottom: insets.bottom > 0 ? insets.bottom : theme.spacing[2],
    paddingHorizontal: insets.left + insets.right + theme.spacing[2],
  };

  return (
    <View style={[styles.container, wrapperStyle]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TabBarItem
            key={route.key}
            name={route.name}
            isFocused={isFocused}
            options={options}
            onPress={onPress}
          />
        );
      })}
      {/* <View style={[styles.button]} /> */}
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.white,
    flexDirection: 'row',
    borderTopLeftRadius: theme.borderRadius['4xl'],
    borderTopRightRadius: theme.borderRadius['4xl'],
    elevation: 20,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  // button: {
  //   width: theme.spacing[20],
  //   height: theme.spacing[20],
  //   backgroundColor: theme.colors.primary,
  //   borderRadius: theme.borderRadius.full,
  //   position: 'absolute',
  //   top: 0,
  //   transform: [{ translateX: '50%' }],
  // },
}));
