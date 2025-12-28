import React, { useEffect } from 'react';
import { View } from 'react-native';

import { UseQueryResult } from '@tanstack/react-query';
import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { ISelectOption } from '#types/select';
import { normalizePlainText, Result } from '#utils';

import { Text } from './atoms';
import LoadingText from './loading-text';
import Selectbox, { SelectBoxProps } from './selectbox';

type OmittedProps = 'defaultValue' | 'onChangeText' | 'onValueChange' | 'data';

export interface ControlledRemoteSelectBoxProps<
  T extends FieldValues,
  K extends Record<string, any>,
  V extends keyof K,
  M extends keyof K,
> extends Omit<SelectBoxProps<K, V, M>, OmittedProps>,
    UseControllerProps<T> {
  wrapperTestID?: string;
  errorTextTestID?: string;
  useFetchQuery: () => UseQueryResult<Result<ISelectOption[]>, Error>;
  setValueFromValue?: string;
}

export default function ControlledRemoteSelectBox<
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
  useFetchQuery,
  displayKey = 'name' as V,
  valueKey = 'id' as M,
  setValueFromValue,
  ...rest
}: ControlledRemoteSelectBoxProps<T, K, V, M>) {
  const {
    field: { ...inputProps },
    fieldState: { error, isTouched },
  } = useController({ name, control, rules, defaultValue });
  const fetchQuery = useFetchQuery();

  const { styles } = useStyles(stylesheet);

  const { ref, value, onChange, onBlur } = inputProps;

  const selectedValue = rest.multiple
    ? value
    : fetchQuery.data?.value && fetchQuery.data.value.length > 0
      ? fetchQuery.data.value.find(item => item.id === value?.id)
      : undefined;

  useEffect(() => {
    if (setValueFromValue && fetchQuery.isSuccess) {
      const selectedOption = fetchQuery.data?.value?.find(item => {
        return normalizePlainText(item.name) === normalizePlainText(setValueFromValue);
      });

      onChange(selectedOption);
    }
  }, [setValueFromValue, fetchQuery.isSuccess]);

  return (
    <View testID={wrapperTestID} style={styles.controlledInputWrapper}>
      {fetchQuery.isLoading ? (
        <LoadingText />
      ) : (
        <Selectbox
          {...rest}
          data={fetchQuery.data?.value ?? []}
          displayKey={displayKey as string}
          valueKey={valueKey as string}
          ref={ref}
          selected={selectedValue}
          onValueChange={onChange}
          onBlur={onBlur}
          hasError={!!error}
        />
      )}

      {error && isTouched && error.message && (
        <Text testID={errorTextTestID} style={styles.error}>
          {error.message}
        </Text>
      )}
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  controlledInputWrapper: {
    width: '100%',
  },
  error: {
    color: theme.colors.danger,
    fontSize: theme.fontSizes.sm,
    marginTop: theme.spacing[2],
  },
}));
