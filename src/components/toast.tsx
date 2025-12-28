import React from 'react';
import { TouchableOpacity, View } from 'react-native';

import { ToastConfigParams } from 'react-native-toast-message';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Cross } from '#assets/svg';
import { hide } from '#lib';

import { Svg, Text } from './atoms';

interface BaseToastProps {
  variant?: 'success' | 'danger' | 'warning';
  content?: string;
}

export interface ToastProps extends ToastConfigParams<BaseToastProps> {}

/**
 * Toast component with a variant and content.
 * @param {ToastProps} props - The component props.
 * @param {BaseToastProps} props.props - The properties for the Toast component.
 * @param {string} props.props.variant - The variant of the Toast.
 * @param {string} props.props.content - The content of the Toast.
 * @returns {React.ReactElement} The Toast component.
 */
export default function Toast({ props: { variant = 'success', content } }: ToastProps) {
  const { styles, theme } = useStyles(stylesheet, { variant: variant });

  return (
    <View style={styles.container}>
      <View style={styles.contentWrapper}>
        {content && <Text style={styles.content}>{content}</Text>}
        <TouchableOpacity testID="close-button" onPress={() => hide()}>
          <Svg width={24} height={24} Icon={Cross} fill={theme.colors.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export const toastConfig = {
  success: ({ props, ...rest }: ToastProps) => {
    return <Toast props={{ ...props, variant: 'success' }} {...rest} />;
  },
  danger: ({ props, ...rest }: ToastProps) => {
    return <Toast props={{ ...props, variant: 'danger' }} {...rest} />;
  },
  warning: ({ props, ...rest }: ToastProps) => {
    return <Toast props={{ ...props, variant: 'warning' }} {...rest} />;
  },
};

const stylesheet = createStyleSheet(theme => ({
  container: {
    width: '95%',
    marginTop: theme.spacing[5],
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius['4xl'],
    backgroundColor: theme.colors.primary,
    position: 'relative',
    zIndex: 1000,
    variants: {
      variant: {
        success: {
          backgroundColor: theme.colors.success,
        },
        danger: {
          backgroundColor: theme.colors.danger,
        },
        warning: {
          backgroundColor: theme.colors.warning,
        },
      },
    },
  },
  contentWrapper: {
    flex: 1,
    width: '100%',
    gap: theme.spacing[2],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    color: theme.colors.white,
    fontSize: theme.fontSizes.base,
  },
}));
