import React from 'react';
import { View } from 'react-native';

import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';
import ImagePickerInput from './image-picker-input';

export interface ControlledImagePickerInputProps<T extends FieldValues>
  extends UseControllerProps<T> {
  wrapperTestID?: string;
  variant?: 'normal' | 'dashed' | 'dashedVertical';
  allowEditing?: boolean;
  disabled?: boolean;
}

export default function ControlledImagePickerInput<T extends FieldValues>({
  name,
  control,
  rules,
  wrapperTestID = 'image-picker-wrapper',
  variant = 'normal',
  allowEditing = true,
  disabled = false,
}: ControlledImagePickerInputProps<T>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ name, control, rules });
  const { styles } = useStyles(stylesheet, { variant });

  const hasError = !!(error && error.message);

  return (
    <View testID={wrapperTestID} style={styles.controlledWrapper}>
      <ImagePickerInput
        disabled={disabled}
        hasError={hasError}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        variant={variant}
        allowEditing={allowEditing}
      />
      {hasError && <Text style={styles.error}>{error.message}</Text>}
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  controlledWrapper: {
    flex: 1,
    alignItems: 'center',
    variants: {
      variant: {
        normal: {},
        dashed: {
          alignItems: 'flex-start',
        },
        dashedVertical: {
          flex: 0,
          alignItems: 'flex-start',
        },
      },
    },
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing[1],
  },
  errorBorder: {
    borderRadius: theme.borderRadius.full,
    borderColor: theme.colors.danger,
    borderWidth: 2,
  },
}));
