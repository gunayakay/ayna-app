import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, TouchableOpacity, TextInput } from 'react-native';

import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet, useStyles } from '#theme/unistyles';

import { Text } from './atoms';
import Svg from './atoms/svg';
import BottomSheet from './bottom-sheet';
import Button from './button';
import Stepper from './stepper';
import TimeQuickPick from './check-in/time-quick-pick';
import CheckToggle from './check-in/check-toggle';
import ConfrontationView from './check-in/confrontation-view';
import { RightArrow } from '#assets/svg';

export type InputMode = 'time' | 'count' | 'check';

export interface CheckInSheetProps {
  title: string;
  icon: string;
  goalId?: string;
  inputMode?: InputMode;
  unit?: string;
  step?: number;
  maxValue: number;
  maxLabel?: string;
  initialValue?: number;
  onUpdate?: (value: number) => void;
  onSkip?: () => void;
}

type ViewState = 'checkin' | 'confrontation';

const CheckInSheet = forwardRef<BottomSheetModal, CheckInSheetProps>(
  (
    {
      title,
      icon,
      goalId,
      inputMode = 'count',
      unit,
      step = 1,
      maxValue,
      maxLabel,
      initialValue = 0,
      onUpdate,
      onSkip,
    },
    ref
  ) => {
    const { styles, theme } = useStyles(stylesheet);
    const [value, setValue] = useState(initialValue);
    const [viewState, setViewState] = useState<ViewState>('checkin');

    // Dynamic snap points based on view state and input mode
    const snapPoints = useMemo(() => {
      if (viewState === 'confrontation') return ['85%'];
      if (inputMode === 'check') return ['40%'];
      return ['50%'];
    }, [viewState, inputMode]);

    // Reset state when sheet closes
    const handleSheetChange = useCallback(
      (index: number) => {
        if (index === -1) {
          setViewState('checkin');
          setValue(initialValue);
        }
      },
      [initialValue]
    );

    const handleUpdate = () => {
      onUpdate?.(value);
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleShowConfrontation = () => {
      setViewState('confrontation');
      // Snap to new height after state change
      setTimeout(() => {
        if (ref && 'current' in ref && ref.current) {
          ref.current.snapToIndex(0);
        }
      }, 50);
      onSkip?.();
    };

    const handleConfrontationSave = () => {
      setViewState('checkin');
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
    };

    const handleConfrontationBack = () => {
      setViewState('checkin');
      setTimeout(() => {
        if (ref && 'current' in ref && ref.current) {
          ref.current.snapToIndex(0);
        }
      }, 50);
    };

    return (
      <BottomSheet
        ref={ref}
        snapPoints={snapPoints}
        enablePanDownToClose
        enableCloseOnBackdropPress
        disableView
        onChange={handleSheetChange}>
        {viewState === 'checkin' ? (
          <View style={styles.container}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{icon}</Text>
            </View>

            {/* Title */}
            <Text style={styles.title}>{title}</Text>

            {/* Dynamic Input */}
            <View style={styles.inputContainer}>
              {inputMode === 'check' ? (
                <CheckToggle checked={value >= 1} onToggle={checked => setValue(checked ? 1 : 0)} />
              ) : (
                <>
                  <Text style={styles.askq}>Bugün ne kadar yaptın?</Text>
                  <View style={styles.amountField}>
                    <TextInput
                      style={styles.amountInput}
                      keyboardType="number-pad"
                      value={value > 0 ? String(value) : ''}
                      placeholder="0"
                      placeholderTextColor={theme.colors.typography.TERTIARY}
                      onChangeText={t => {
                        const n = parseInt(t.replace(/[^0-9]/g, '') || '0', 10);
                        setValue(Number.isNaN(n) ? 0 : n);
                      }}
                      maxLength={5}
                      selectTextOnFocus
                    />
                    <Text style={styles.amountUnit}>{unit ?? maxLabel ?? ''}</Text>
                  </View>
                  <View style={styles.chipRow}>
                    {(inputMode === 'time' ? [15, 30] : [step || 1]).map(q => (
                      <TouchableOpacity
                        key={q}
                        activeOpacity={0.7}
                        style={styles.chip}
                        onPress={() => setValue(value + q)}>
                        <Text style={styles.chipText}>+{q}</Text>
                      </TouchableOpacity>
                    ))}
                    {maxValue > 0 && (
                      <TouchableOpacity
                        activeOpacity={0.7}
                        style={[styles.chip, styles.chipDone]}
                        onPress={() => setValue(maxValue)}>
                        <Text style={[styles.chipText, styles.chipTextDone]}>
                          ✓ Tamamladım
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </View>

            {/* Update Button */}
            <Button onPress={handleUpdate} style={styles.updateButton}>
              Kaydet
            </Button>

            {/* Secondary Action */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleShowConfrontation}
              style={styles.skipButton}>
              <Text style={styles.skipText}>Bugün zorlanıyorum...</Text>
              <Svg
                Icon={RightArrow}
                width={16}
                height={16}
                stroke={theme.colors.typography.SECONDARY}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>
        ) : (
          <ConfrontationView
            goalId={goalId || 'unknown'}
            onSave={handleConfrontationSave}
            onBack={handleConfrontationBack}
          />
        )}
      </BottomSheet>
    );
  }
);

const stylesheet = StyleSheet.create(theme => ({
  container: {
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLightest,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[6],
  },
  inputContainer: {
    marginBottom: theme.spacing[8],
    width: '100%',
    alignItems: 'center',
  },
  askq: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[3],
  },
  amountField: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    gap: theme.spacing[2],
    minWidth: 140,
    paddingBottom: theme.spacing[2],
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primaryLight,
  },
  amountInput: {
    fontSize: 44,
    fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
    minWidth: 70,
    padding: 0,
  },
  amountUnit: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: theme.spacing[2],
    marginTop: theme.spacing[5],
  },
  chip: {
    backgroundColor: theme.colors.primaryLightest,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
  },
  chipDone: {
    backgroundColor: 'rgba(54,179,126,0.14)',
  },
  chipText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryDarker,
  },
  chipTextDone: {
    color: '#1f8a5f',
  },
  updateButton: {
    backgroundColor: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[3],
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[5],
    backgroundColor: theme.colors.background.PRIMARY,
    borderRadius: theme.borderRadius.full,
  },
  skipText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
  },
}));

CheckInSheet.displayName = 'CheckInSheet';

export default CheckInSheet;
