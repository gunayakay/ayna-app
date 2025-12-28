import React, { forwardRef } from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

interface TextProps extends RNTextProps {
  children?: React.ReactNode;
}

/**
 * Text component with default styles applied.
 * @param {TextProps} props - The component props.
 * @param {React.ReactNode} children - The child elements to be rendered inside the text.
 * @param {StyleProp<TextStyle>} style - Additional styles to be applied to the text.
 * @param {RNTextProps} rest - Additional Text props to be passed to the container.
 * @returns {React.ReactElement} The Text component.
 */
const Text = forwardRef<RNText, TextProps>(({ children, style, ...rest }, ref) => {
  const { styles } = useStyles(stylesheet);

  return (
    <RNText ref={ref} {...rest} style={[styles.text, style]}>
      {children}
    </RNText>
  );
});

const stylesheet = createStyleSheet(theme => ({
  text: {
    fontFamily: theme.fontFamily.PRIMARY,
    color: theme.colors.typography.PRIMARY[600],
    fontSize: theme.fontSizes.base,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
}));

Text.displayName = 'Text';

export default Text;
