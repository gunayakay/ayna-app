import React from 'react';
import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import Svg, { SvgComponent } from './atoms/svg';

interface LinkProps extends TouchableOpacityProps {
  textStyle?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
  fillColor?: string;
  text: string;
  Icon?: SvgComponent;
  mode?: 'row' | 'column';
  size?: number;
}

/**
 * Link component with a text and optional onPress handler.
 * @param {LinkProps} props - The component props.
 * @param {string} text - The text to be displayed on the link.
 * @param {number} size - The size of the icon.
 * @param {string} fillColor - The color of the icon.
 * @param {TouchableOpacityProps} rest - Additional TouchableOpacity props to be passed to the container.
 * @returns {React.ReactElement} The Link component.
 */
export default function Link({
  text,
  Icon,
  size = 20,
  textStyle,
  fillColor,
  mode = 'row',
  containerStyle,
  ...rest
}: LinkProps) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <TouchableOpacity style={[styles.container(mode), containerStyle]} {...rest}>
      {Icon && (
        <Svg Icon={Icon} width={size} height={size} fill={fillColor ?? theme.colors.primary} />
      )}
      <Text style={[styles.link, textStyle]}>{text}</Text>
    </TouchableOpacity>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: (mode: 'row' | 'column') => ({
    flexDirection: mode,
    alignItems: 'center',
    gap: theme.spacing[2],
  }),
  link: {
    color: theme.colors.white,
    fontSize: theme.fontSizes.xl,
    textDecorationLine: 'underline',
  },
}));
