import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { RippleWrapper, Text } from './atoms';
import { RippleWrapperProps } from './atoms/ripple-wrapper';
import Svg, { SvgComponent } from './atoms/svg';

export interface ButtonProps extends RippleWrapperProps {
  LeftIcon?: SvgComponent;
  RightIcon?: SvgComponent;
  children?: React.ReactNode;
  enableLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'complementary' | 'danger' | 'success' | 'warning';
}

/**
 * Button component with optional left and right icons, label, and variant.
 * @param {ButtonProps} props - The component props.
 * @param {SvgComponent} LeftIcon - The left icon component.
 * @param {SvgComponent} RightIcon - The right icon component.
 * @param {string} label - The label text for the button.
 * @param {StyleProp<ViewStyle>} style - Additional styles to be applied to the button.
 * @param {'primary' | 'secondary' | 'complementary' | 'danger' | 'success' | 'warning'} variant - The variant of the button.
 * @param {boolean} disabled - Whether the button is disabled.
 * @param {ViewProps} rest - Additional View props to be passed to the container.
 * @returns {React.ReactElement} The Button component.
 */
export default function Button({
  children,
  LeftIcon,
  RightIcon,
  style,
  variant = 'primary',
  disabled = false,
  enableLoading = false,
  ...rest
}: ButtonProps) {
  const { styles, theme } = useStyles(stylesheet, { variant: variant });

  const VARIANT_SVG_FILL_COLORS = {
    primary: theme.colors.white,
    secondary: theme.colors.primary,
    complementary: theme.colors.typography.PRIMARY[800],
    danger: theme.colors.white,
    success: theme.colors.white,
    warning: theme.colors.white,
  };

  return (
    <RippleWrapper
      disabled={disabled}
      style={[styles.button, style, disabled && styles.buttonDisabled]}
      {...rest}>
      <View style={styles.container(!!LeftIcon, !!RightIcon)}>
        {LeftIcon && (
          <Svg
            testID="left-icon"
            Icon={LeftIcon}
            width={20}
            height={20}
            fill={VARIANT_SVG_FILL_COLORS[variant]}
          />
        )}
        {enableLoading ? (
          <ActivityIndicator
            size="small"
            color={variant === 'primary' ? theme.colors.white : theme.colors.primary}
          />
        ) : typeof children === 'string' ? (
          <Text style={styles.text(!!LeftIcon, !!RightIcon)}>{children}</Text>
        ) : (
          children
        )}
        {RightIcon && (
          <Svg
            testID="right-icon"
            Icon={RightIcon}
            width={24}
            height={24}
            stroke={VARIANT_SVG_FILL_COLORS[variant]}
            strokeWidth={1.5}
          />
        )}
      </View>
    </RippleWrapper>
  );
}

const stylesheet = createStyleSheet(theme => ({
  button: {
    width: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius['4xl'],
    paddingHorizontal: theme.spacing[4],
    height: 50,
    variants: {
      variant: {
        primary: {
          backgroundColor: theme.colors.primary,
        },
        secondary: {
          backgroundColor: theme.colors.secondary,
        },
        complementary: {
          backgroundColor: theme.colors.white,
          borderWidth: 1,
          borderColor: theme.colors.typography.PRIMARY[200],
        },
        danger: {
          backgroundColor: theme.colors.danger,
        },
        success: {
          backgroundColor: theme.colors.success,
        },
        warning: {
          backgroundColor: theme.colors.warning,
        },
      },
    },
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  container: (hasLeft, hasRight) => ({
    flex: 1,
    flexDirection: 'row',
    justifyContent: hasLeft && hasRight ? 'space-between' : 'center',
    alignItems: 'center',
  }),
  text: (hasLeft, hasRight) => ({
    color: theme.colors.white,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    marginLeft: !hasLeft && !hasRight ? 'auto' : theme.spacing[2],
    marginRight: 'auto',
    variants: {
      variant: {
        secondary: {
          color: theme.colors.white,
        },
        complementary: {
          color: theme.colors.typography.PRIMARY[800],
        },
      },
    },
  }),
}));
