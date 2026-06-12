import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StyleSheet, useStyles } from '#theme/unistyles';

import { Text } from '#components/atoms';
import ProgressBar from '#components/progress-bar';
import { onboardingStorage } from '#/utils';

const CATEGORIES = [
  { id: 'health', label: 'Saglik', icon: '❤️' },
  { id: 'career', label: 'Kariyer', icon: '💼' },
  { id: 'relationships', label: 'Iliskiler', icon: '👥' },
  { id: 'discipline', label: 'Disiplin', icon: '📋' },
  { id: 'finance', label: 'Finans', icon: '💳' },
  { id: 'mind', label: 'Zihin', icon: '🧠' },
];

export default function CategoriesScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev =>
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    await onboardingStorage.saveCategories(selectedCategories);
    router.push({
      pathname: '/onboarding/actions',
      params: { categories: selectedCategories.join(',') },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={0.2} height={6} color={theme.colors.primary} />
        </View>
        <Text style={styles.stepText}>1/5</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Bugun neyle{'\n'}yuzlesmek istiyorsun?</Text>
        <Text style={styles.subtitle}>Durust ol, bu aramizda kalacak</Text>

        {/* Category Grid */}
        <View style={styles.grid}>
          {CATEGORIES.map(category => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                activeOpacity={0.7}
                onPress={() => toggleCategory(category.id)}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text
                  style={[
                    styles.categoryLabel,
                    isSelected && styles.categoryLabelSelected,
                  ]}>
                  {category.label}
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
          style={[
            styles.continueButton,
            selectedCategories.length === 0 && styles.continueButtonDisabled,
          ]}
          disabled={selectedCategories.length === 0}>
          <Text style={styles.continueButtonText}>Devam Et</Text>
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
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
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    marginBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['3xl'],
    padding: 20,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLightest,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 12,
  },
  categoryLabel: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
  categoryLabelSelected: {
    color: theme.colors.primary,
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
  continueButtonDisabled: {
    opacity: 0.4,
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
