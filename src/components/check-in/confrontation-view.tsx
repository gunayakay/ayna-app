import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { StyleSheet, useStyles } from '#theme/unistyles';

import { Text } from '../atoms';
import Svg from '../atoms/svg';
import Button from '../button';
import { BackArrow } from '#assets/svg';
import { goalStorage } from '#/utils';

const REASONS = [
  { id: 'no-time', label: 'Zamanım yoktu', icon: '⏳' },
  { id: 'tired', label: 'Yorgunum', icon: '🔋' },
  { id: 'forgot', label: 'Unuttum', icon: '🧠' },
  { id: 'low-mood', label: 'Modum düşük', icon: '📉' },
  { id: 'other', label: 'Diğer', icon: '🤷' },
];

export interface ConfrontationViewProps {
  goalId: string;
  onSave: () => void;
  onBack: () => void;
}

export default function ConfrontationView({ goalId, onSave, onBack }: ConfrontationViewProps) {
  const { styles, theme } = useStyles(stylesheet);

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId) ? prev.filter(id => id !== reasonId) : [...prev, reasonId]
    );
  };

  const handleSave = async () => {
    if (selectedReasons.length === 0) return;

    await goalStorage.saveConfrontationLog({
      goalId,
      reasons: selectedReasons,
      notes,
      date: new Date().toISOString(),
    });

    onSave();
  };

  return (
    <View style={styles.container}>
      {/* Header with back arrow */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onBack}
        style={styles.backButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Svg Icon={BackArrow} width={24} height={24} stroke={theme.colors.typography.PRIMARY} />
      </TouchableOpacity>

      {/* Icon */}
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>🤔</Text>
      </View>

      {/* Title */}
      <Text style={styles.title}>Seni ne durdurdu?</Text>
      <Text style={styles.subtitle}>Dürüst ol, bu aramızda kalacak.</Text>

      {/* Reason Chips */}
      <View style={styles.chipsContainer}>
        {REASONS.map(reason => {
          const isSelected = selectedReasons.includes(reason.id);
          return (
            <TouchableOpacity
              key={reason.id}
              activeOpacity={0.7}
              onPress={() => toggleReason(reason.id)}
              style={[styles.chip, isSelected && styles.chipSelected]}>
              <Text style={styles.chipIcon}>{reason.icon}</Text>
              <Text style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}>
                {reason.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Notes Input */}
      <View style={styles.notesContainer}>
        <BottomSheetTextInput
          style={styles.notesInput}
          placeholder="Eklemek istediğin bir şey var mı?"
          placeholderTextColor={theme.colors.typography.SECONDARY}
          multiline
          numberOfLines={4}
          value={notes}
          onChangeText={setNotes}
          textAlignVertical="top"
        />
      </View>

      {/* Save Button */}
      <View style={styles.footer}>
        <Button onPress={handleSave} disabled={selectedReasons.length === 0}>
          Kaydet
        </Button>
      </View>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  backButton: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
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
    textAlign: 'center',
    marginBottom: theme.spacing[1],
  },
  subtitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
    marginBottom: theme.spacing[6],
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    justifyContent: 'center',
    marginBottom: theme.spacing[5],
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    gap: theme.spacing[1],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: theme.colors.primaryLightest,
    borderColor: theme.colors.primary,
  },
  chipIcon: {
    fontSize: 16,
  },
  chipLabel: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
  },
  chipLabelSelected: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
  notesContainer: {
    width: '100%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[4],
    marginBottom: theme.spacing[5],
  },
  notesInput: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY,
    minHeight: 80,
  },
  footer: {
    width: '100%',
  },
}));
