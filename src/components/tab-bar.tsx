import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StyleSheet, useStyles } from '#theme/unistyles';
import { PlusIcon } from '#assets/svg';
import { addGoalSheetRef } from '#/utils';
import Svg from './atoms/svg';

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

  const handleAddPress = () => {
    addGoalSheetRef.open();
  };

  const midPoint = Math.floor(state.routes.length / 2);

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
          <React.Fragment key={route.key}>
            <TabBarItem
              name={route.name}
              isFocused={isFocused}
              options={options}
              onPress={onPress}
            />
            {index === midPoint - 1 && (
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleAddPress}
                style={styles.addButton}>
                <Svg
                  Icon={PlusIcon}
                  width={28}
                  height={28}
                  stroke={theme.colors.primaryDarker}
                  strokeWidth={2.5}
                />
              </TouchableOpacity>
            )}
          </React.Fragment>
        );
      })}
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
  addButton: {
    width: 56,
    height: 56,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: -20,
    left: '50%',
    marginLeft: -28,
    elevation: 8,
    shadowColor: theme.colors.black,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
}));
