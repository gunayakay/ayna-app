import React from 'react';
import { View } from 'react-native';

import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';
import { CheckboxProps } from './checkbox';
import SlidingCheckbox from './sliding-checkbox';

export interface ControlledCheckboxProps<T extends FieldValues>
  extends UseControllerProps<T>,
    Omit<CheckboxProps, 'onChange'> {
  wrapperTestID?: string;
  errorTextTestID?: string;
}

/**
 * ControlledCheckbox component with error handling and optional label.
 * @param {ControlledCheckboxProps<T>} props - The component props.
 * @param {string} name - The name of the field in the form state.
 * @param {React.ReactNode} control - The form control object.
 * @param {UseControllerProps<T>} rules - The validation rules for the field.
 * @param {T} defaultValue - The default value for the field.
 * @param {string} wrapperTestID - Test ID for the wrapper.
 * @param {string} errorTextTestID - Test ID for the error text.
 * @param {ViewProps} rest - Additional View props to be passed to the container.
 * @returns {React.ReactElement} The ControlledInput component.
 */
export default function ControlledSlidingCheckbox<T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  wrapperTestID,
  errorTextTestID,
  label,
  ...rest
}: ControlledCheckboxProps<T>) {
  const {
    field: { ...inputProps },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });

  const { styles } = useStyles(stylesheet);

  const { value, onChange } = inputProps;

  return (
    <View testID={wrapperTestID} style={styles.controlledCheckboxWrapper}>
      <View style={styles.switchContainer}>
        <Text style={styles.switchText}>{label}</Text>
        <SlidingCheckbox checked={value} onPress={onChange} onValueChange={onChange} {...rest} />
      </View>
      {error && (
        <Text testID={errorTextTestID} style={styles.error}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  controlledCheckboxWrapper: {
    width: '100%',
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing[2],
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  switchText: {
    marginRight: theme.spacing[2],
  },
}));
