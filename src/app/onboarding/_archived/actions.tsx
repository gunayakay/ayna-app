import React, { useState } from 'react';
import { View, TouchableOpacity, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';
import ProgressBar from '#components/progress-bar';
import { onboardingStorage } from '#/utils';

// All available actions mapped by category
const ACTIONS_BY_CATEGORY: Record<string, typeof ALL_ACTIONS[number][]> = {
  health: [
    { id: 'water', label: 'Su Takibi', description: 'Hidrasyonunu takip et.', icon: '💧', category: 'health' },
    { id: 'sleep', label: 'Uyku Duzeni', description: 'Uyku suresi ve kalitesi.', icon: '🌙', category: 'health' },
    { id: 'exercise', label: 'Antrenman / Spor', description: 'Gunluk egzersiz kaydi.', icon: '🏃', category: 'health' },
    { id: 'steps', label: 'Adim Takibi', description: 'Gunluk hareket hedefin.', icon: '👟', category: 'health' },
    { id: 'weight', label: 'Kilo Takibi', description: 'Hedef kilo ve degisim.', icon: '⚖️', category: 'health' },
    { id: 'medicine', label: 'Ilac Takibi', description: 'Zamaninda almayi unutma.', icon: '💊', category: 'health' },
  ],
  finance: [
    { id: 'budget', label: 'Butce / Harcama', description: 'Gelir ve gider takibi.', icon: '💰', category: 'finance' },
    { id: 'savings', label: 'Birikim Hedefi', description: 'Kumbara ve hedefler.', icon: '🏦', category: 'finance' },
  ],
  career: [
    { id: 'reading', label: 'Kitap Okuma', description: 'Sayfa sayisi ve aliskanlik.', icon: '📚', category: 'career' },
    { id: 'focus', label: 'Odaklanma', description: 'Derin calisma sureleri.', icon: '🎯', category: 'career' },
    { id: 'learning', label: 'Ogrenme', description: 'Yeni beceriler kazan.', icon: '🧠', category: 'career' },
  ],
  mind: [
    { id: 'meditation', label: 'Meditasyon', description: 'Farkindalik ve nefes.', icon: '🧘', category: 'mind' },
    { id: 'journal', label: 'Gunluk Yazma', description: 'Zihnini bosalt.', icon: '✍️', category: 'mind' },
    { id: 'gratitude', label: 'Sukran', description: 'Gunluk sukran pratigi.', icon: '🙏', category: 'mind' },
  ],
  discipline: [
    { id: 'quit_smoking', label: 'Sigarayi Birak', description: 'Zinciri kirma, saglikli kal.', icon: '🚭', category: 'discipline' },
    { id: 'social_detox', label: 'Sosyal Medya Detoksu', description: 'Ekran suresini azalt.', icon: '📵', category: 'discipline' },
    { id: 'no_junk', label: 'Saglikli Beslenme', description: 'Fast food\'dan uzak dur.', icon: '🥗', category: 'discipline' },
  ],
  relationships: [
    { id: 'call_family', label: 'Aile ile Iletisim', description: 'Yakinlarini ara.', icon: '👨‍👩‍👧', category: 'relationships' },
    { id: 'quality_time', label: 'Kaliteli Zaman', description: 'Sevdiklerinle vakit gecir.', icon: '❤️', category: 'relationships' },
  ],
};

const ALL_ACTIONS = Object.values(ACTIONS_BY_CATEGORY).flat();

// Map onboarding category IDs to action category keys
const CATEGORY_MAP: Record<string, string> = {
  health: 'health',
  career: 'career',
  relationships: 'relationships',
  discipline: 'discipline',
  finance: 'finance',
  mind: 'mind',
};

export default function ActionsScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ categories?: string }>();

  // Parse selected categories from params
  const selectedCategories = params.categories ? params.categories.split(',') : [];

  // Get available actions based on selected categories
  const availableActions = selectedCategories.length > 0
    ? selectedCategories.flatMap(cat => ACTIONS_BY_CATEGORY[CATEGORY_MAP[cat]] || [])
    : ALL_ACTIONS;

  const [selectedActions, setSelectedActions] = useState<string[]>([]);

  const toggleAction = (id: string) => {
    setSelectedActions(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleContinue = async () => {
    await onboardingStorage.saveActions(selectedActions);
    router.push('/onboarding/blockers');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Progress Header */}
      <View style={styles.progressHeader}>
        <View style={styles.progressBarContainer}>
          <ProgressBar progress={0.4} height={6} color={theme.colors.primary} />
        </View>
        <Text style={styles.stepText}>2/5</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Title */}
        <Text style={styles.title}>Ne takip etmek{'\n'}istiyorsun?</Text>
        <Text style={styles.subtitle}>
          Gunluk olarak odaklanacagin aliskanliklari sec.
        </Text>

        {/* Actions Grid */}
        <View style={styles.grid}>
          {availableActions.map(action => {
            const isSelected = selectedActions.includes(action.id);
            return (
              <TouchableOpacity
                key={action.id}
                activeOpacity={0.7}
                onPress={() => toggleAction(action.id)}
                style={[
                  styles.actionCard,
                  isSelected && styles.actionCardSelected,
                ]}>
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text
                  style={[
                    styles.actionLabel,
                    isSelected && styles.actionLabelSelected,
                  ]}>
                  {action.label}
                </Text>
                <Text
                  style={[
                    styles.actionDescription,
                    isSelected && styles.actionDescriptionSelected,
                  ]}>
                  {action.description}
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
            selectedActions.length === 0 && styles.continueButtonDisabled,
          ]}
          disabled={selectedActions.length === 0}>
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
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '47%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['3xl'],
    padding: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  actionCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLightest,
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: 4,
  },
  actionLabelSelected: {
    color: theme.colors.primary,
  },
  actionDescription: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
  },
  actionDescriptionSelected: {
    color: theme.colors.primaryDarker,
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
