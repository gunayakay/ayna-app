import React, { useCallback } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { FlashList, FlashListProps } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';

interface Props<T> extends FlashListProps<T> {
  isFetchingNextPage: boolean;
  loadNextPageData: () => void;
}

export default function PaginatedList<T>({
  loadNextPageData,
  isFetchingNextPage,
  estimatedItemSize = 450,
  onEndReachedThreshold = 0.2,
  data,
  renderItem,
  refreshControl,
  contentContainerStyle,
  keyExtractor,
}: Props<T>) {
  const { styles, theme } = useStyles(stylesheet);
  const { t } = useTranslation();
  const renderLoading = useCallback(
    () => (
      <View style={styles.loading}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    ),
    []
  );

  const renderFooter = useCallback(
    () => (
      <View style={styles.footer}>
        <Text>{t('general.listEmpty')}</Text>
      </View>
    ),
    []
  );
  return (
    <FlashList
      estimatedItemSize={estimatedItemSize}
      onEndReachedThreshold={onEndReachedThreshold}
      onEndReached={loadNextPageData}
      ListFooterComponent={isFetchingNextPage ? renderLoading : renderFooter}
      data={data}
      renderItem={renderItem}
      refreshControl={refreshControl}
      keyExtractor={keyExtractor}
      contentContainerStyle={contentContainerStyle}
    />
  );
}

const stylesheet = createStyleSheet(theme => ({
  loading: {
    padding: theme.spacing[4],
  },
  footer: {
    padding: theme.spacing[4],
  },
}));
