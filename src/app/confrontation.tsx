import React, { useState } from 'react';
import { View, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '#components/atoms';
import { Button } from '#components';
import { StyleSheet, useStyles } from '#theme/unistyles';
import { Close } from '#assets/svg';
import Svg from '#components/atoms/svg';
import { goalStorage } from '#/utils';

const REASONS = [
  { id: 'no-time', label: 'Zamanım yoktu', icon: '⏳' },
  { id: 'tired', label: 'Yorgunum', icon: '🔋' },
  { id: 'forgot', label: 'Unuttum', icon: '🧠' },
  { id: 'low-mood', label: 'Modum düşük', icon: '📉' },
  { id: 'other', label: 'Diğer', icon: '🤷' },
];

export default function ConfrontationScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const { goalId } = useLocalSearchParams<{ goalId: string }>();

  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [notes, setNotes] = useState('');

  const handleClose = () => {
    router.back();
  };

  const toggleReason = (reasonId: string) => {
    setSelectedReasons(prev =>
      prev.includes(reasonId)
        ? prev.filter(id => id !== reasonId)
        : [...prev, reasonId]
    );
  };

  const handleSave = async () => {
    if (selectedReasons.length === 0) return;

    await goalStorage.saveConfrontationLog({
      goalId: goalId || 'unknown',
      reasons: selectedReasons,
      notes,
      date: new Date().toISOString(),
    });

    router.back();
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleClose}
            style={styles.closeButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Svg Icon={Close} width={24} height={24} stroke={theme.colors.typography.PRIMARY} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Icon */}
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🤔</Text>
          </View>

          {/* Title */}
          <Text style={styles.title}>Seni ne durdurdu?</Text>

          {/* Subtitle */}
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
            <TextInput
              style={styles.notesInput}
              placeholder="Eklemek istediğin bir şey var mı?"
              placeholderTextColor={theme.colors.typography.SECONDARY}
              multiline
              numberOfLines={6}
              value={notes}
              onChangeText={setNotes}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Footer Button */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <Button
            onPress={handleSave}
            disabled={selectedReasons.length === 0}>
            Kaydet
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[5],
    alignItems: 'center',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[5],
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: theme.fontSizes['3xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
    marginBottom: theme.spacing[8],
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    justifyContent: 'center',
    marginBottom: theme.spacing[6],
    width: '100%',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    gap: theme.spacing[2],
    borderWidth: 2,
    borderColor: 'transparent',
  },
  chipSelected: {
    backgroundColor: theme.colors.primaryLightest,
    borderColor: theme.colors.primary,
  },
  chipIcon: {
    fontSize: 20,
  },
  chipLabel: {
    fontSize: theme.fontSizes.base,
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
  },
  notesInput: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY,
    minHeight: 120,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.colors.background.PRIMARY,
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[4],
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.PRIMARY,
  },
}));
