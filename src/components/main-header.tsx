import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';

import Constants from 'expo-constants';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Container, Svg, Text } from './atoms';
import { SvgComponent } from './atoms/svg';

export interface MainHeaderProps {
  title?: string;
  mode?: 'centered' | 'left-aligned';
  headerPercentage?: string;
  leftConfig?: {
    Icon?: SvgComponent;
    action?: () => void;
  };
  RightComponent?: () => React.ReactElement;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * MainHeader component with a title, optional left icon and right component.
 * @param {MainHeaderProps} props - The component props.
 * @param {string} title - The title to be displayed on the header.
 * @param {StyleProp<ViewStyle>} containerStyle - Additional style for the container.
 * @param {string} mode - The mode of the header, 'view' or 'edit'.
 * @param {LeftConfig} leftConfig - Configuration for the left icon and action.
 * @param {React.ReactNode} RightComponent - The component to be displayed on the right side.
 * @returns {React.ReactElement} The MainHeader component.
 */
export default function MainHeader({
  title,
  mode = 'left-aligned',
  containerStyle,
  headerPercentage,
  leftConfig,
  RightComponent,
}: MainHeaderProps) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <Container
      testID="main-header-container"
      style={[styles.container(headerPercentage), containerStyle]}>
      {leftConfig?.Icon && leftConfig?.action && (
        <TouchableOpacity
          style={styles.leftButton}
          testID="main-header-left-button"
          onPress={leftConfig.action}>
          <Svg
            Icon={leftConfig.Icon}
            width={22}
            height={22}
            stroke={theme.colors.primary}
            strokeWidth={1.5}
          />
        </TouchableOpacity>
      )}
      <View style={styles.headerTitleWrapper} pointerEvents="auto">
        <Text style={styles.headerTitle(mode)}>{title}</Text>
      </View>
      <View style={styles.rightContainer}>{RightComponent && <RightComponent />}</View>
    </Container>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: (headerPercentage: any) => ({
    position: 'relative',
    height: headerPercentage,
    transform: [{ translateY: Constants.statusBarHeight }],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  }),
  headerTitleWrapper: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingBottom: Constants.statusBarHeight,
    zIndex: 0,
  },
  headerTitle: (mode: 'centered' | 'left-aligned') => ({
    color: theme.colors.white,
    fontFamily: mode === 'centered' ? theme.fontFamily.semiBold : theme.fontFamily.bold,
    fontSize: mode === 'centered' ? theme.fontSizes['2xl-plus'] : theme.fontSizes['4xl'],
    marginHorizontal: mode === 'centered' ? 'auto' : 0,
  }),
  leftButton: {
    position: 'relative',
    zIndex: 1,
    padding: theme.spacing[2],
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    marginBottom: Constants.statusBarHeight,
  },
  rightContainer: {
    paddingBottom: Constants.statusBarHeight,
  },
}));
