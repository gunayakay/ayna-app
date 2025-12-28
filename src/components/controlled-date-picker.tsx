import { View } from 'react-native';

import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';
import DatePicker from './date-picker';

export interface ControlledDatePickerProps<T extends FieldValues> extends UseControllerProps<T> {
  label: string;
}

export default function ControlledDatePicker<T extends FieldValues>({
  name,
  control,
  rules,
  defaultValue,
  label,
}: ControlledDatePickerProps<T>) {
  const { styles } = useStyles(stylesheet);
  const {
    field: { ...inputProps },
    fieldState: { error },
  } = useController({ name, control, rules, defaultValue });

  const { ref, value, onChange } = inputProps;

  return (
    <View>
      <DatePicker label={label} ref={ref} date={value} onChange={onChange} hasError={!!error} />
      {error && error.message && <Text style={styles.error}>{error.message}</Text>}
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
