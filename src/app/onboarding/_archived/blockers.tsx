import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';
import ProgressBar from '#components/progress-bar';
import { onboardingStorage } from '#/utils';

const BLOCKERS = [
  { id: 'smoking', label: 'Sigara', icon: '🚬' },
  { id: 'social_media', label: 'Sosyal Medya', icon: '📱' },
  { id: 'procrastination', label: 'Erteleme', icon: '😴' },
  { id: 'binge_watch', label: 'Binge Watch (Dizi)', icon: '📺' },
  { id: 'junk_food', label: 'Seker / Fast Food', icon: '🍔' },
  { id: 'gaming', label: 'Oyun', icon: '🎮' },
  { id: 'alcohol', label: 'Alkol', icon: '🍺' },
  { id: 'no_planning', label: 'Plansizlik', icon: '📅' },
  { id: 'pleasing', label: 'Baskallarini Memnun Etmek', icon: '🙃' },
  { id: 'adult_content', label: '+18 Icerik', icon: '🔞' },
  { id: 'news_addiction', label: 'Haber Bagimliligi', icon: '📰' },
  { id: 'overthinking', label: 'Asiri Dusunme', icon: '🧠' },
  { id: 'cant_say_no', label: 'Hayir Diyememek', icon: '😰' },
  { id: 'perfectionism', label: 'Mukemmeliyetcilik', icon: '✨' },
  { id: 'low_confidence', label: 'Ozguven Eksikligi', icon: '😔' },
  { id: 'sedentary', label: 'Hareketsizlik', icon: '🛋️' },
  { id: 'irregular_sleep', label: 'Duzensiz Uyku', icon: '🌙' },
  { id: 'overspending', label: 'Gereksiz Harcama', icon: '💸' },
];

export default function BlockersScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [selectedBlockers, setSelectedBlockers] = useState<string[]>([]);

  const toggleBlocker = (id: string) => {
    setSelectedBlockers(prev =>
      prev.includes(id) ? prev.filter(b => b !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    await onboardingStorage.saveBlockers(selectedBlockers);
    router.push('/onboarding/discipline');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={0.6} height={6} color={theme.colors.primary} />
        </View>
        <Text style={styles.stepText}>3/5</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Seni ne frenliyor?</Text>
        <Text style={styles.subtitle}>
          Gelisiminin onunde duran aliskanliklari isaretle.
        </Text>

        {/* Blocker Chips */}
        <View style={styles.chipsContainer}>
          {BLOCKERS.map(blocker => {
            const isSelected = selectedBlockers.includes(blocker.id);
            return (
              <TouchableOpacity
                key={blocker.id}
                activeOpacity={0.7}
                onPress={() => toggleBlocker(blocker.id)}
                style={[styles.chip, isSelected && styles.chipSelected]}>
                <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                  {blocker.label} {blocker.icon}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleContinue}
          style={styles.continueButton}>
          <Text style={styles.continueButtonText}>Devam Et</Text>
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  progressBarContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 24,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    marginBottom: 32,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
  },
  chipSelected: {
    backgroundColor: theme.colors.typography.PRIMARY,
    borderColor: theme.colors.typography.PRIMARY,
  },
  chipText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
  },
  chipTextSelected: {
    color: theme.colors.white,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  continueButton: {
    backgroundColor: theme.colors.typography.PRIMARY,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueButtonText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: theme.colors.white,
  },
}));
