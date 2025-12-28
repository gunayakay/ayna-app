import React from 'react';
import { View } from 'react-native';

import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text, TextInput } from './atoms';
import { TextInputProps } from './atoms/text-input';

export interface ControlledInputProps<T extends FieldValues>
  extends Omit<TextInputProps, 'defaultValue' | 'onChangeText'>,
    UseControllerProps<T> {
  wrapperTestID?: string;
  errorTextTestID?: string;
  helperText?: string;
}

/**
 * ControlledInput component with error handling and optional label.
 * @param {ControlledInputProps<T>} props - The component props.
 * @param {string} name - The name of the field in the form state.
 * @param {React.ReactNode} control - The form control object.
 * @param {UseControllerProps<T>} rules - The validation rules for the field.
 * @param {T} defaultValue - The default value for the field.
 * @param {string} wrapperTestID - Test ID for the wrapper.
 * @param {string} errorTextTestID - Test ID for the error text.
 * @param {ViewProps} rest - Additional View props to be passed to the container.
 * @returns {React.ReactElement} The ControlledInput component.
 */
export default function ControlledInput<T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  wrapperTestID,
  errorTextTestID,
  helperText,
  ...rest
}: ControlledInputProps<T>) {
  const {
    field: { ...inputProps },
    fieldState: { error, isTouched },
  } = useController({ name, control, rules, defaultValue });
  const { styles } = useStyles(stylesheet);

  const { ref, value, onChange, onBlur } = inputProps;

  return (
    <View testID={wrapperTestID} style={styles.controlledInputWrapper}>
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
        hasError={!!error}
        {...rest}
      />
      {helperText && !error && <Text style={styles.helperText}>{helperText}</Text>}

      {error && isTouched && error.message && (
        <Text testID={errorTextTestID} style={styles.error}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  helperText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.light,
    marginLeft: theme.spacing[2],
    marginTop: theme.spacing[1],
    flex: 1,
  },
  controlledInputWrapper: {
    width: '100%',
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing[2],
  },
}));
