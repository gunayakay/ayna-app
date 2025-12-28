import React, { ForwardedRef, forwardRef, memo } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Camera, Gallery } from '#assets/svg';

import { Svg, Text } from './atoms';
import BottomSheet from './bottom-sheet';
import Row from './row';

interface ImagePickerUploadSheetProps {
  galleryPress: () => void;
  cameraPress: () => void;
}

const ImagePickerUploadSheet = forwardRef(
  (
    { galleryPress, cameraPress }: ImagePickerUploadSheetProps,
    ref: ForwardedRef<BottomSheetModal>
  ) => {
    const { styles, theme } = useStyles(stylesheet);
    const { t } = useTranslation();
    const { bottom } = useSafeAreaInsets();

    return (
      <BottomSheet
        enableDismissOnClose
        enablePanDownToClose
        enableDynamicSizing
        disableView
        ref={ref}
        bottomInset={0}
        snapPoints={[]}>
        <View style={[styles.container, { paddingBottom: bottom }]}>
          <Row style={styles.buttonContainer}>
            <TouchableOpacity onPress={galleryPress} style={styles.button}>
              <Svg
                Icon={Gallery}
                width={36}
                height={36}
                stroke={theme.colors.primary}
                strokeWidth={1.5}
              />
              <Text style={styles.buttonText}>{t('screens.account.photoUploadModalGallery')}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={cameraPress} style={styles.button}>
              <Svg
                Icon={Camera}
                width={36}
                height={36}
                stroke={theme.colors.primary}
                strokeWidth={1.5}
              />
              <Text style={styles.buttonText}>{t('screens.account.photoUploadModalCamera')}</Text>
            </TouchableOpacity>
          </Row>
        </View>
      </BottomSheet>
    );
  }
);

ImagePickerUploadSheet.displayName = 'ImagePickerUploadSheet';

export default memo(ImagePickerUploadSheet);

const stylesheet = createStyleSheet(theme => ({
  container: {
    padding: theme.spacing[4],
    justifyContent: 'center',
    flex: 1,
    gap: theme.spacing[6],
    borderRadius: theme.borderRadius['4xl'],
  },
  description: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY[800],
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing[4],
    paddingHorizontal: theme.spacing[9],
  },
  button: {
    flex: 1,
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  buttonText: {
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY[800],
    fontSize: theme.fontSizes.base,
  },
}));
