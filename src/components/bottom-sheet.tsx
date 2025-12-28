import React, { forwardRef, memo, useCallback } from 'react';
import { Platform } from 'react-native';

import {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

export interface Props extends BottomSheetModalProps {
  children: React.ReactNode;
  disableView?: boolean;
  insertBeforeScrollView?: React.ReactNode;
  enableCloseOnBackdropPress?: boolean;
}

const BottomSheet = forwardRef<BottomSheetModal, Props>(
  (
    {
      children,
      keyboardBehavior = 'interactive',
      keyboardBlurBehavior = 'restore',
      android_keyboardInputMode = 'adjustPan',
      detached = false,
      snapPoints = ['25%'],
      disableView = false,
      insertBeforeScrollView,
      enableCloseOnBackdropPress = true,
      ...rest
    },
    ref
  ) => {
    const { bottom } = useSafeAreaInsets();
    const { styles, theme } = useStyles(stylesheet);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior={enableCloseOnBackdropPress ? 'close' : 'none'}
        />
      ),
      [enableCloseOnBackdropPress]
    );

    return (
      <BottomSheetModal
        ref={ref}
        stackBehavior="replace"
        enablePanDownToClose
        handleStyle={detached ? styles.indicator : undefined}
        backdropComponent={renderBackdrop}
        bottomInset={Platform.select({
          ios: bottom > 0 ? bottom : theme.spacing[4] + bottom,
          android: bottom + theme.spacing[4],
        })}
        detached={detached}
        snapPoints={snapPoints}
        keyboardBehavior={keyboardBehavior}
        keyboardBlurBehavior={keyboardBlurBehavior}
        android_keyboardInputMode={android_keyboardInputMode}
        backgroundStyle={{
          borderRadius: theme.borderRadius['4xl'],
        }}
        style={{
          marginHorizontal: detached ? theme.spacing[4] : theme.spacing[0],
        }}
        {...rest}>
        {!disableView ? (
          <BottomSheetView style={styles.bottomSheetView}>{children}</BottomSheetView>
        ) : (
          <>
            {insertBeforeScrollView}
            <BottomSheetScrollView style={styles.bottomSheetScrollView}>
              {children}
            </BottomSheetScrollView>
          </>
        )}
      </BottomSheetModal>
    );
  }
);

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
  },
  bottomSheetView: {
    flex: 1,
  },
  bottomSheetScrollView: {},
  sheetContainer: {
    marginHorizontal: theme.spacing[4],
  },
  sheetContainerList: {
    marginHorizontal: 0,
  },
  indicator: {
    display: 'none',
  },
}));

BottomSheet.displayName = 'BottomSheet';

export default memo(BottomSheet);
