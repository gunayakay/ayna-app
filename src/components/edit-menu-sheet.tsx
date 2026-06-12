import React, { forwardRef } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, useStyles } from '#theme/unistyles';

import { Text } from './atoms';
import BottomSheet from './bottom-sheet';
import Button from './button';

export interface EditMenuSheetProps {
  heading: string;
  children: React.ReactNode;
  onSave: () => void;
  saveDisabled?: boolean;
  saveLabel?: string;
  deleteLabel: string;
  deleteTitle: string;
  deleteMessage: string;
  onDelete: () => void;
  snapPoints?: (string | number)[];
}

/**
 * İç sayfaların sağ üst "⋯" menüsünden açılan ortak düzenle/sil sayfası.
 * Alanları (children) çağıran ekran verir; bu kabuk başlık + Kaydet + Sil sağlar.
 */
const EditMenuSheet = forwardRef<BottomSheetModal, EditMenuSheetProps>(
  (
    {
      heading,
      children,
      onSave,
      saveDisabled = false,
      saveLabel = 'Kaydet',
      deleteLabel,
      deleteTitle,
      deleteMessage,
      onDelete,
      snapPoints = ['62%'],
    },
    ref
  ) => {
    const { styles } = useStyles(stylesheet);

    const confirmDelete = () => {
      Alert.alert(deleteTitle, deleteMessage, [
        { text: 'Vazgeç', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: onDelete },
      ]);
    };

    return (
      <BottomSheet ref={ref} snapPoints={snapPoints} enablePanDownToClose enableCloseOnBackdropPress disableView>
        <View style={styles.container}>
          <Text style={styles.heading}>{heading}</Text>

          <View style={styles.body}>{children}</View>

          <Button onPress={onSave} disabled={saveDisabled} style={styles.saveBtn}>
            {saveLabel}
          </Button>

          <TouchableOpacity activeOpacity={0.7} onPress={confirmDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>{deleteLabel}</Text>
          </TouchableOpacity>
        </View>
      </BottomSheet>
    );
  }
);

const stylesheet = StyleSheet.create(theme => ({
  container: {
    padding: theme.spacing[5],
  },
  heading: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[5],
  },
  body: {
    marginBottom: theme.spacing[6],
  },
  saveBtn: {
    backgroundColor: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[2],
  },
  deleteBtn: {
    height: 48,
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.bold,
    color: '#FF3B30',
  },
}));

EditMenuSheet.displayName = 'EditMenuSheet';

export default EditMenuSheet;
