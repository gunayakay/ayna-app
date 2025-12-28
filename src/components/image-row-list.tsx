import { useCallback } from 'react';
import { RefreshControl, View } from 'react-native';

import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Item } from '#types/item';

import { Text } from './atoms';
import ImageRow, { ImageRowSkeleton } from './image-row';

export interface ImageRowListProps {
  data: Item[];
  onPress: (item: Item) => void;
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function ImageRowList({
  data,
  onPress,
  refreshing,
  onRefresh,
  isLoading,
}: ImageRowListProps) {
  const { t } = useTranslation();
  const { styles } = useStyles(stylesheet);
  const renderItem = useCallback(({ item }: { item: Item }) => {
    const handlePress = () => {
      onPress(item);
    };
    return <ImageRow {...item} onPress={handlePress} />;
  }, []);
  return (
    <>
      {isLoading ? (
        <ImageRowSkeleton isLoading={isLoading} />
      ) : (
        <View style={styles.container}>
          {data.length > 0 ? (
            <FlashList
              data={data}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              estimatedItemSize={60}
              renderItem={renderItem}
              keyExtractor={(item, idx) => `${item.title}-${idx}`}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {t('screens.campaigns.subscribedBusinessesEmpty')}
              </Text>
            </View>
          )}
        </View>
      )}
    </>
  );
}

const stylesheet = createStyleSheet(theme => ({
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 60,
    paddingHorizontal: theme.spacing[4],
  },
  emptyText: {
    textAlign: 'center',
    color: theme.colors.typography.PRIMARY[800],
  },
  container: {
    flex: 1,
  },
}));
