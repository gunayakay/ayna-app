import React from 'react';
import { View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { StyleSheet, useStyles } from '#theme/unistyles';

import TextInput from './atoms/text-input';

export default function SearchInput({
  search,
  handleSearch,
}: {
  search: string;
  handleSearch: (search: string) => void;
}) {
  const { t } = useTranslation();
  const { styles } = useStyles(stylesheet);
  return (
    <View style={styles.searchContainer}>
      <TextInput
        value={search}
        onChangeText={handleSearch}
        hasError={false}
        label={t('screens.filter.search')}
      />
    </View>
  );
}

const stylesheet = StyleSheet.create(() => ({
  searchContainer: {
    width: '100%',
  },
}));
