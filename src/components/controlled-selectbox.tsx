import React from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';
import Selectbox, { SelectBoxProps } from './selectbox';

type OmittedProps = 'defaultValue' | 'onChangeText' | 'onValueChange' | 'style';

export interface ControlledSelectBoxProps<
  T extends FieldValues,
  K extends Record<string, any>,
  V extends keyof K,
  M extends keyof K,
> extends Omit<SelectBoxProps<K, V, M>, OmittedProps>,
    UseControllerProps<T> {
  wrapperTestID?: string;
  errorTextTestID?: string;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
}

export default function ControlledSelectBox<
  T extends FieldValues,
  K extends Record<string, any>,
  V extends keyof K,
  M extends keyof K,
>({
  name,
  control,
  rules,
  defaultValue,
  wrapperTestID,
  errorTextTestID,
  displayKey,
  valueKey,
  style,
  disabled,
  ...rest
}: ControlledSelectBoxProps<T, K, V, M>) {
  const {
    field: { ...inputProps },
    fieldState: { error, isTouched },
  } = useController({ name, control, rules, defaultValue });

  const { styles } = useStyles(stylesheet);

  const { ref, value, onChange } = inputProps;

  return (
    <View testID={wrapperTestID} style={style}>
      <Selectbox
        {...rest}
        displayKey={displayKey as string}
        valueKey={valueKey as string}
        ref={ref}
        selected={value}
        onValueChange={onChange}
        hasError={!!error}
        disabled={disabled}
      />
      {error && isTouched && error.message && (
        <Text testID={errorTextTestID} style={styles.error}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing[2],
  },
}));
