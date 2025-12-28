import React, { forwardRef, memo, useCallback, useImperativeHandle, useRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
  View,
} from 'react-native';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FlashList } from '@shopify/flash-list';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Check, DownArrowIcon } from '#assets/svg';

import { Svg, Text, TextInput } from './atoms';
import { TextInputHandle } from './atoms/text-input';
import BottomSheet from './bottom-sheet';

type OmittedProps = 'value' | 'onChangeText' | 'onBlur';

export interface SelectBoxProps<T extends Record<string, any>, K extends keyof T, V extends keyof T>
  extends Omit<TextInputProps, OmittedProps> {
  data: T[];
  multiple?: boolean;
  displayKey?: K;
  valueKey?: V;
  label: string;
  hasSection?: boolean;
  hasError?: boolean;
  selected?: T | T[];
  snapPoints?: string[];
  onValueChange: (value: T | T[]) => void;
  onBlur?: () => void;
  disabled?: boolean;
}

const MemoizedListItem = memo(
  <T extends Record<string, any>, K extends keyof T>({
    item,
    displayKey,
    isSelected,
    onSelect,
  }: {
    item: T;
    displayKey: K;
    isSelected: boolean;
    onSelect: () => void;
  }) => {
    const { styles, theme } = useStyles(stylesheet);

    return (
      <TouchableOpacity onPress={onSelect} style={styles.listItem}>
        {isSelected && <Svg Icon={Check} width={24} height={24} fill={theme.colors.primary} />}
        <Text style={styles.listItemText(isSelected)}>{item[displayKey]}</Text>
      </TouchableOpacity>
    );
  }
);

MemoizedListItem.displayName = 'MemoizedListItem';

const SelectBox = forwardRef(
  <T extends Record<string, any>, K extends keyof T, V extends keyof T>(
    {
      data,
      displayKey = 'name' as K,
      valueKey = 'id' as V,
      selected,
      label,
      snapPoints = ['50%'],
      onValueChange,
      onBlur,
      multiple = false,
      hasSection = false,
      hasError = false,
      disabled = false,
      ...rest
    }: SelectBoxProps<T, K, V>,
    ref: React.Ref<TextInputHandle>
  ) => {
    const { styles, theme } = useStyles(stylesheet);
    const { bottom } = useSafeAreaInsets();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const inputRef = useRef<any>(null);
    const selectedString = JSON.stringify(selected);

    useImperativeHandle(ref, () => ({
      focus: () => {
        inputRef.current?.focus();
        bottomSheetRef.current?.present();
      },
      blur: () => {
        inputRef.current?.blur();
        bottomSheetRef.current?.dismiss();
        onBlur?.();
      },
    }));

    const handleOpenBottomSheet = useCallback(() => {
      if (disabled) return;
      bottomSheetRef.current?.present();
    }, [disabled]);

    const handleCloseBottomSheet = useCallback(() => {
      bottomSheetRef.current?.dismiss();
    }, []);

    const handleMultipleSelect = useCallback(
      (item: T, isSelected: boolean) => {
        const newSelected = isSelected
          ? (selected as T[])?.filter(selectedItem => selectedItem[valueKey] !== item[valueKey])
          : [...(selected as T[]), item];
        onValueChange(newSelected);
      },
      [selected, valueKey, onValueChange]
    );

    const handleSingleSelect = useCallback(
      (item: T) => {
        onValueChange(item);
        handleCloseBottomSheet();
        onBlur?.();
      },
      [onValueChange, handleCloseBottomSheet, onBlur]
    );

    const handleItemChange = useCallback(
      (item: T, isSelected: boolean) => {
        if (multiple) {
          handleMultipleSelect(item, isSelected);
        } else {
          handleSingleSelect(item);
        }
      },
      [multiple, handleMultipleSelect, handleSingleSelect]
    );

    const isItemSelected = useCallback(
      (item: T) => {
        if (multiple) {
          return (selected as T[])?.some(selectedItem => selectedItem[valueKey] === item[valueKey]);
        }
        return (selected as T)?.[valueKey] === item[valueKey];
      },
      [multiple, selected, valueKey]
    );

    const renderListItem = useCallback(
      (item: T) => {
        const isSelected = isItemSelected(item);
        return (
          <MemoizedListItem
            item={item}
            displayKey={displayKey as string}
            isSelected={isSelected}
            onSelect={() => handleItemChange(item, isSelected)}
          />
        );
      },
      [selectedString, isItemSelected, handleItemChange]
    );

    const renderSectionHeader = useCallback(
      (item: string) => (
        <View style={styles.sectionTitleWrapper}>
          <Text style={styles.sectionTitle}>{item}</Text>
        </View>
      ),
      []
    );

    const renderItem = useCallback(
      ({ item }: { item: T }) =>
        hasSection && typeof item === 'string' ? renderSectionHeader(item) : renderListItem(item),
      [hasSection, renderListItem, renderSectionHeader]
    );

    const getSelectedText = useCallback(() => {
      if (multiple) {
        return (selected as T[])?.map(item => item[displayKey]).join(', ');
      }
      return (selected as T)?.[displayKey] || '';
    }, [multiple, selected, displayKey]);

    return (
      <View>
        <View style={styles.textInputWrapper}>
          {Platform.OS === 'ios' && (
            <Pressable style={styles.textInputFocuser} onPress={handleOpenBottomSheet} />
          )}
          <Pressable
            onPress={disabled ? undefined : handleOpenBottomSheet}
            style={styles.disableInput(disabled)}>
            <TextInput
              ref={inputRef}
              label={label}
              value={getSelectedText()}
              onChangeText={() => {}}
              onBlur={onBlur}
              editable={false}
              hasError={hasError}
              {...rest}
            />
          </Pressable>
          <Svg
            style={styles.downArrowIcon}
            Icon={DownArrowIcon}
            width={24}
            height={24}
            stroke={theme.colors.typography.PRIMARY[400]}
            strokeWidth={1.5}
          />
        </View>
        <BottomSheet
          bottomInset={0}
          snapPoints={snapPoints}
          enableDynamicSizing={false}
          enablePanDownToClose
          ref={bottomSheetRef}
          onDismiss={handleCloseBottomSheet}>
          <View style={[styles.listContainer, { paddingBottom: bottom }]}>
            <FlashList
              renderScrollComponent={ScrollView}
              data={data}
              renderItem={renderItem}
              estimatedItemSize={56}
              extraData={selected}
              keyExtractor={item => item[valueKey].toString()}
            />
          </View>
        </BottomSheet>
      </View>
    );
  }
);

const stylesheet = createStyleSheet(theme => ({
  textInputWrapper: {
    position: 'relative',
  },
  textInputFocuser: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 99,
  },
  downArrowIcon: {
    position: 'absolute',
    right: theme.spacing[4],
    top: '50%',
    transform: [{ translateY: -12 }],
  },
  sectionTitleWrapper: {
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY[800],
  },
  listContainer: {
    flex: 1,
  },
  listItem: {
    height: theme.spacing[14],
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.typography.PRIMARY[200],
  },
  listItemText: (isChecked: boolean) => ({
    fontSize: theme.fontSizes.base,
    color: isChecked ? theme.colors.primary : theme.colors.typography.PRIMARY[800],
  }),
  disableInput: (disabled: boolean) => ({
    opacity: disabled ? 0.5 : 1,
  }),
}));

SelectBox.displayName = 'SelectBox';

export default memo(SelectBox);
