import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { StyleSheet, useStyles } from '#theme/unistyles';
import { PlusIcon } from '#assets/svg';
import { addGoalSheetRef } from '#/utils';
import Svg from './atoms/svg';

import TabBarItem from './tab-bar-item';

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const handleAddPress = () => {
    addGoalSheetRef.open();
  };

  const midPoint = Math.floor(state.routes.length / 2);

  return (
    <View
      style={[styles.wrapper, { bottom: (insets.bottom || 12) }]}
      pointerEvents="box-none">
      <View style={styles.shadow}>
        <BlurView intensity={32} tint="light" style={styles.pill}>
          <View style={styles.tint} pointerEvents="none" />
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
                {index === midPoint - 1 && <View style={styles.fabSlot} />}
              </React.Fragment>
            );
          })}
        </BlurView>
      </View>

      {/* Kalkık gradient FAB (+) — pill'in dışında, kırpılmaz */}
      <TouchableOpacity activeOpacity={0.85} onPress={handleAddPress} style={styles.fab}>
        <LinearGradient
          colors={['#FFB463', '#F0860F']}
          start={{ x: 0.25, y: 0 }}
          end={{ x: 0.8, y: 1 }}
          style={styles.fabFill}>
          <Svg
            Icon={PlusIcon}
            width={28}
            height={28}
            stroke={theme.colors.typography.PRIMARY}
            strokeWidth={2.6}
          />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  wrapper: {
    position: 'absolute',
    left: theme.spacing[4],
    right: theme.spacing[4],
  },
  shadow: {
    borderRadius: 33,
    shadowColor: 'rgba(120,90,40,1)',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
    backgroundColor: 'rgba(255,255,255,0.001)',
  },
  pill: {
    height: 66,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderRadius: 33,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  tint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  fabSlot: {
    width: 64,
  },
  fab: {
    position: 'absolute',
    top: -16,
    left: '50%',
    marginLeft: -28,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#F0860F',
    shadowOpacity: 0.55,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 7 },
    elevation: 10,
  },
  fabFill: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
}));
