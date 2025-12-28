import React, { useCallback, useRef } from 'react';
import { TouchableOpacity, View } from 'react-native';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import { useTranslation } from 'react-i18next';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Gallery } from '#assets/svg';
import { launchCamera, launchGallery, show } from '#lib';
import { isBase64String, removeAppPath } from '#utils';

import { Image, Svg } from './atoms';
import ImagePickerUploadSheet from './image-picker-upload-sheet';

export interface ImagePickerInputProps {
  value: string | null;
  onChange: (value?: string | null) => void;
  onBlur?: () => void;
  allowEditing?: boolean;
  hasError?: boolean;
  variant?: 'normal' | 'dashed' | 'dashedVertical';
  disabled?: boolean;
}

export default function ImagePickerInput({
  value = '',
  onChange,
  onBlur,
  hasError = false,
  variant = 'normal',
  allowEditing = true,
  disabled = false,
}: ImagePickerInputProps) {
  const { styles, theme } = useStyles(stylesheet, { variant });
  const { t } = useTranslation();
  const photoUploadSheetRef = useRef<BottomSheetModal>(null);
  const [status, requestPermission] = ImagePicker.useCameraPermissions();

  const openPhotoUploadSheet = () => {
    photoUploadSheetRef.current?.present();
  };

  const pickImageFromGallery = useCallback(async () => {
    try {
      const result = await launchGallery({
        mediaTypes: ['images'],
        allowsEditing: allowEditing,
        aspect: variant === 'dashedVertical' ? [1, 2] : [1, 1],
      });

      if (!result.canceled) {
        onChange(result.assets[0].base64);
      } else {
        onBlur?.();
      }
    } catch (error) {
      // TODO: handle error in crashlytics
    } finally {
      photoUploadSheetRef.current?.dismiss();
    }
  }, []);

  const takePhoto = useCallback(async () => {
    try {
      if (!status?.granted) {
        const permissionResult = await requestPermission();
        if (!permissionResult.granted) {
          show({ type: 'danger', content: t('errors.CAMERA_PERMISSION_DENIED') });
          return;
        }
      }

      const result = await launchCamera({
        mediaTypes: ['images'],
        allowsEditing: allowEditing,
        aspect: variant === 'dashedVertical' ? [1, 1] : [1, 1],
      });
      if (!result.canceled) {
        onChange(result.assets[0].base64);
      } else {
        onBlur?.();
      }
    } catch (error) {
      // TODO: handle error in crashlytics
    } finally {
      photoUploadSheetRef.current?.dismiss();
    }
  }, [status]);

  const imageValue = value
    ? isBase64String(value)
      ? `data:image/jpeg;base64,${value}`
      : process.env.EXPO_PUBLIC_IMAGE_URL + removeAppPath(value ?? '')
    : null;

  return (
    <TouchableOpacity
      disabled={disabled}
      style={[styles.imagePickerContainer(!!imageValue), hasError && styles.errorBorder]}
      onPress={openPhotoUploadSheet}>
      {!imageValue ? (
        <Svg
          Icon={Gallery}
          width={variant === 'normal' ? theme.spacing[8] : theme.spacing[11]}
          height={variant === 'normal' ? theme.spacing[8] : theme.spacing[11]}
          stroke={theme.colors.typography.PRIMARY[800]}
          strokeWidth={variant === 'normal' ? 1.5 : 1.2}
        />
      ) : (
        <>
          {!disabled && (
            <View style={styles.imageActiveEditButton}>
              <Svg
                Icon={Gallery}
                width={theme.spacing[4]}
                height={theme.spacing[4]}
                stroke={theme.colors.white}
                strokeWidth={2}
              />
            </View>
          )}
          <Image source={{ uri: imageValue }} style={styles.image} />
        </>
      )}
      <ImagePickerUploadSheet
        ref={photoUploadSheetRef}
        galleryPress={pickImageFromGallery}
        cameraPress={takePhoto}
      />
    </TouchableOpacity>
  );
}

const stylesheet = createStyleSheet(theme => ({
  imagePickerContainer: (hasUploadedImage: boolean) => ({
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.typography.PRIMARY[300],
    borderRadius: theme.borderRadius.full,
    width: theme.spacing[18],
    height: theme.spacing[18],
    variants: {
      variant: {
        normal: {
          borderColor: theme.colors.typography.PRIMARY[100],
          borderWidth: 1,
        },
        dashed: {
          width: theme.spacing[20],
          height: theme.spacing[20],
          borderRadius: theme.borderRadius.xl,
          borderColor: theme.colors.typography.PRIMARY[800],
          borderWidth: !hasUploadedImage ? 1.5 : 0,
          borderDashOffset: 100,
          borderStyle: 'dashed',
          backgroundColor: 'transparent',
        },
        dashedVertical: {
          width: theme.spacing[20],
          height: theme.spacing[20],
          borderRadius: theme.borderRadius.xl,
          borderColor: theme.colors.typography.PRIMARY[800],
          borderWidth: !hasUploadedImage ? 1.5 : 0,
          borderDashOffset: 100,
          borderStyle: 'dashed',
          backgroundColor: 'transparent',
        },
      },
    },
  }),
  image: {
    borderRadius: theme.borderRadius.full,
    width: '100%',
    height: '100%',
    contentFit: 'cover',
    zIndex: 1,
    variants: {
      variant: {
        normal: {},
        dashed: {
          borderRadius: theme.borderRadius.xl,
        },
        dashedVertical: {
          borderRadius: theme.borderRadius.xl,
        },
      },
    },
  },
  imageActiveEditButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: theme.spacing[6],
    height: theme.spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    variants: {
      variant: {
        normal: {},
        dashed: {
          top: -theme.spacing[6] / 2,
          right: -theme.spacing[6] / 2,
          backgroundColor: theme.colors.secondary,
        },
        dashedVertical: {
          backgroundColor: theme.colors.secondary,
          top: -theme.spacing[6] / 2,
          right: -theme.spacing[6] / 2,
        },
      },
    },
  },
  errorBorder: {
    borderColor: theme.colors.danger,
    borderWidth: 2,
  },
}));
