import React from 'react';
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface ContainerProps extends ViewProps {
  style?: StyleProp<ViewStyle>;
}

/**
 * A wrapper around the View component that applies the default styles to the container.
 * @param {ContainerProps} props - The props for the Container component.
 * @returns {React.ReactNode} - The Container component.
 */
export default function Container({
  children,
  style,
  testID = 'container',
  ...props
}: ContainerProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={[styles.container, style]} {...props} testID={testID}>
      {children}
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    paddingHorizontal: theme.spacing[4],
  },
}));
