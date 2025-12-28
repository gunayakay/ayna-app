import { View } from 'react-native';

import { Path, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { TIME_DATA } from '#constants';

import { Text } from './atoms';
import ControlledCheckbox from './controlled-checkbox';
import ControlledSelectBox, { ControlledSelectBoxProps } from './controlled-selectbox';

type OmittedProps = 'name' | 'data' | 'label';

export interface TimePickerProps<
  T extends Record<string, any>,
  K extends Record<string, any>,
  V extends keyof K,
  M extends keyof K,
> extends Omit<ControlledSelectBoxProps<T, K, V, M>, OmittedProps> {
  title: string;
  startName: Path<T>;
  endName: Path<T>;
  isClosedName: Path<T>;
}

export default function TimePicker<
  T extends Record<string, any>,
  K extends Record<string, any>,
  V extends keyof K,
  M extends keyof K,
>({ title, startName, endName, isClosedName, ...props }: TimePickerProps<T, K, V, M>) {
  const { styles } = useStyles(stylesheet);
  const { t } = useTranslation();
  const { watch } = useFormContext<T>();
  const isClosed = watch(isClosedName);

  return (
    <View style={styles.formWrapper}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.formRow}>
        <ControlledSelectBox
          {...props}
          name={startName}
          data={TIME_DATA as unknown as K[]}
          defaultValue={TIME_DATA[18] as any}
          style={styles.formRowItem}
          label={t('screens.businessOnboarding.openingHoursStart')}
          disabled={isClosed}
        />
        <ControlledSelectBox
          {...props}
          name={endName}
          data={TIME_DATA as unknown as K[]}
          defaultValue={TIME_DATA[42] as any}
          style={styles.formRowItem}
          label={t('screens.businessOnboarding.openingHoursEnd')}
          disabled={isClosed}
        />
      </View>
      <ControlledCheckbox {...props} name={isClosedName} label={t('screens.business.closed')} />
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  title: {
    fontSize: theme.fontSizes.md,
    color: theme.colors.typography.PRIMARY[900],
    fontFamily: theme.fontFamily.medium,
  },
  formWrapper: {
    gap: theme.spacing[3],
  },
  formRow: {
    gap: theme.spacing[4],
    alignItems: 'flex-start',
    flexDirection: 'row',
    width: '100%',
  },
  formRowItem: {
    flex: 1,
  },
}));
