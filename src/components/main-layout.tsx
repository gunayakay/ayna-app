import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import Constants from 'expo-constants';
import { StyleSheet, useStyles } from '#theme/unistyles';

export interface MainLayoutProps {
  children: React.ReactNode;
  statusBarColor?: string;
  enableMargin?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * MainLayout component with a header and a container for the main content.
 * @param {MainLayoutProps} props - The component props.
 * @param {React.ReactNode} children - The content to be displayed inside the container.
 * @returns {React.ReactElement} The MainLayout component.
 */
export default function MainLayout({
  children,
  statusBarColor = 'transparent',
  enableMargin = false,
  style,
}: MainLayoutProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={[styles.container]}>
      <View style={styles.customStatusBar(statusBarColor)} />
      <View
        style={[
          statusBarColor === 'transparent' ? styles.container : styles.iosMargin,
          enableMargin ? styles.iosMargin : {},
          style,
        ]}>
        {children}
      </View>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
  },
  iosMargin: {
    flex: 1,
    marginTop: Constants.statusBarHeight,
  },
  customStatusBar: (statusBarColor?: string) => ({
    position: 'absolute',
    zIndex: 10,
    top: 0,
    width: '100%',
    height: Constants.statusBarHeight,
    backgroundColor: statusBarColor ?? theme.colors.primary,
  }),
}));
