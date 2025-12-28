import { forwardRef, memo, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import DatePickerRN from 'react-native-date-picker';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { TextInput } from './atoms';
import { TextInputHandle, TextInputProps } from './atoms/text-input';

interface IDatePickerProps extends Omit<TextInputProps, 'onChange' | 'onChangeText'> {
  date: Date;
  onChange: (value: Date) => void;
  label: string;
  hasError?: boolean;
}

const DatePicker = forwardRef<TextInputHandle, IDatePickerProps>(
  ({ date = new Date(), onChange, label, hasError, ...rest }, ref) => {
    const { styles } = useStyles(stylesheet);
    const [openDatePicker, setOpenDatePicker] = useState(false);
    const inputRef = useRef<TextInputHandle>(null);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        setOpenDatePicker(true);
      },
      blur: () => {
        inputRef.current?.blur();
      },
    }));

    const handleOpenDatePicker = useCallback(() => {
      setOpenDatePicker(true);
    }, []);

    const handleChange = useCallback(
      (selectedDate: Date) => {
        onChange(selectedDate);
        setOpenDatePicker(false);
      },
      [onChange]
    );

    const handleCancel = useCallback(() => {
      setOpenDatePicker(false);
    }, []);

    const getSelectedText = useCallback(() => {
      return date.toLocaleString('tr-TR');
    }, [date]);

    return (
      <>
        <View style={styles.textInputWrapper}>
          {Platform.OS === 'ios' && (
            <Pressable style={styles.textInputFocuser} onPress={handleOpenDatePicker} />
          )}
          <Pressable onPress={handleOpenDatePicker}>
            <TextInput
              {...rest}
              ref={inputRef}
              label={label}
              value={getSelectedText()}
              onChangeText={() => {}}
              editable={false}
              hasError={hasError}
            />
          </Pressable>
        </View>
        <DatePickerRN
          modal
          mode="datetime"
          locale="tr-TR"
          open={openDatePicker}
          minimumDate={new Date()}
          date={date}
          onConfirm={handleChange}
          onCancel={handleCancel}
          title=" "
          confirmText="Onayla"
          cancelText="İptal Et"
        />
      </>
    );
  }
);

const stylesheet = createStyleSheet(() => ({
  textInputWrapper: {
    position: 'relative',
  },
  textInputFocuser: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
}));

export default memo(DatePicker);
