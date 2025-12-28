import { RefreshControl, View } from 'react-native';

import { FlashList, ListRenderItem } from '@shopify/flash-list';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from './atoms';

export interface ListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  Skeleton: React.ReactNode;
  emptyText: string;
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export default function List<T>({
  data,
  renderItem,
  Skeleton,
  isLoading,
  emptyText,
  refreshing,
  onRefresh,
}: ListProps<T>) {
  const { styles } = useStyles(stylesheet);

  return (
    <>
      {isLoading ? (
        Skeleton
      ) : (
        <View style={styles.container}>
          {data.length > 0 ? (
            <FlashList
              data={data}
              refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
              estimatedItemSize={60}
              renderItem={renderItem}
              keyExtractor={(item, idx) => idx.toString()}
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{emptyText}</Text>
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
