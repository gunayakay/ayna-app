import React from 'react';
import { View } from 'react-native';

import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

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

const stylesheet = createStyleSheet(() => ({
  searchContainer: {
    width: '100%',
  },
}));
