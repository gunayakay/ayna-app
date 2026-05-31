import React, { useState } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';
import ProgressBar from '#components/progress-bar';
import CustomSlider from '#components/custom-slider';
import { onboardingStorage } from '#/utils';

const DISCIPLINE_LEVELS = [
  { min: 0, max: 20, label: 'Baslangic', emoji: '😞' },
  { min: 21, max: 40, label: 'Gelisiyor', emoji: '😐' },
  { min: 41, max: 60, label: 'Idare Eder', emoji: '😊' },
  { min: 61, max: 80, label: 'Iyi', emoji: '😄' },
  { min: 81, max: 100, label: 'Mukemmel', emoji: '🔥' },
];

function getDisciplineLevel(value: number) {
  return (
    DISCIPLINE_LEVELS.find(level => value >= level.min && value <= level.max) ||
    DISCIPLINE_LEVELS[0]
  );
}

export default function DisciplineScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [disciplineValue, setDisciplineValue] = useState(60);

  const currentLevel = getDisciplineLevel(disciplineValue);

  const handleContinue = async () => {
    await onboardingStorage.saveDisciplineLevel(disciplineValue);
    router.push('/onboarding/name');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={0.8} height={6} color={theme.colors.primary} />
        </View>
        <Text style={styles.stepText}>4/5</Text>
      </View>

      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title}>Kendine karsi durust ol.</Text>
        <Text style={styles.subtitle}>Su anki disiplin seviyen ne durumda?</Text>

        {/* Value Display */}
        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>%{disciplineValue}</Text>
          <Text style={styles.levelLabel}>{currentLevel.label}</Text>
        </View>

        {/* Slider */}
        <View style={styles.sliderContainer}>
          <Text style={styles.emojiLeft}>😞</Text>
          <View style={styles.sliderWrapper}>
            <CustomSlider
              value={disciplineValue}
              minimumValue={0}
              maximumValue={100}
              onValueChange={setDisciplineValue}
              minimumTrackColor={theme.colors.primary}
              maximumTrackColor={theme.colors.border.PRIMARY}
              thumbColor={theme.colors.white}
            />
          </View>
          <Text style={styles.emojiRight}>🔥</Text>
        </View>
      </View>

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
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
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
    marginBottom: 64,
  },
  valueContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  valueText: {
    fontSize: 72,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  levelLabel: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    marginTop: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  emojiLeft: {
    fontSize: 32,
  },
  emojiRight: {
    fontSize: 32,
  },
  sliderWrapper: {
    flex: 1,
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
