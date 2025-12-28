import React from 'react';
import { ActivityIndicator, View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';

export default function LoadingText() {
  const { styles } = useStyles(stylesheet);
  const { t } = useTranslation();
  return (
    <View style={styles.loadingWrapper}>
      <ActivityIndicator />
      <Text>{t('forms.loading')}</Text>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  loadingWrapper: {
    width: '100%',
    padding: theme.spacing[4],
    flexDirection: 'row',
    gap: theme.spacing[2],
    alignItems: 'center',
  },
}));
