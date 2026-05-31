import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '#components/atoms';
import Svg from '#components/atoms/svg';
import { Button, Stepper } from '#components';
import { StyleSheet, useStyles } from '#theme/unistyles';
import { BackArrow, Close } from '#assets/svg';
import { goalStorage, addictionStorage } from '#/utils';
import type { GoalCategory, HabitFrequency } from '#/utils';

// ─── Katalog ─────────────────────────────────────────────────────────────────

const HABIT_CATEGORIES = [
  {
    id: 'health',
    name: 'Sağlık',
    items: [
      { id: 'water', name: 'Su Takibi', icon: '💧', color: '#3B82F6' },
      { id: 'exercise', name: 'Spor', icon: '🏃', color: '#10B981' },
      { id: 'sleep', name: 'Uyku', icon: '😴', color: '#8B5CF6' },
      { id: 'meditation', name: 'Meditasyon', icon: '🧘', color: '#F59E0B' },
    ],
  },
  {
    id: 'productivity',
    name: 'Üretkenlik',
    items: [
      { id: 'reading', name: 'Kitap Okuma', icon: '📚', color: '#EF4444' },
      { id: 'writing', name: 'Günlük Yazma', icon: '✍️', color: '#EC4899' },
      { id: 'learning', name: 'Öğrenme', icon: '🎓', color: '#6366F1' },
    ],
  },
  {
    id: 'finance',
    name: 'Finans',
    items: [
      { id: 'budget', name: 'Bütçe Takibi', icon: '💰', color: '#059669' },
      { id: 'savings', name: 'Tasarruf', icon: '🏦', color: '#0891B2' },
    ],
  },
];

const ADDICTION_ITEMS = [
  { id: 'smoking', name: 'Sigara', icon: '🚬', color: '#6B7280' },
  { id: 'alcohol', name: 'Alkol', icon: '🍺', color: '#92400E' },
  { id: 'social_media', name: 'Sosyal Medya', icon: '📱', color: '#7C3AED' },
  { id: 'gaming', name: 'Aşırı Oyun', icon: '🎮', color: '#DC2626' },
  { id: 'sugar', name: 'Şeker / Atıştırma', icon: '🍭', color: '#DB2777' },
  { id: 'binge_watch', name: 'Dizi / Binge', icon: '📺', color: '#1D4ED8' },
  { id: 'pornography', name: 'Pornografi', icon: '🔞', color: '#7C3AED' },
];

// Default stepper config for habits
const HABIT_DEFAULTS: Record<string, { unit?: string; maxValue: number; step?: number }> = {
  water: { maxValue: 8 },
  exercise: { unit: 'dk', maxValue: 60 },
  sleep: { unit: 'sa', maxValue: 10 },
  meditation: { unit: 'dk', maxValue: 30 },
  reading: { unit: 'sf', maxValue: 50 },
  writing: { maxValue: 1 },
  learning: { unit: 'dk', maxValue: 60 },
  budget: { unit: '₺', maxValue: 1300, step: 50 },
  savings: { unit: '₺', maxValue: 5000, step: 100 },
};

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewState = 'list' | 'settings';

interface CatalogItem {
  id: string;
  name: string;
  icon: string;
  color: string;
  category: GoalCategory;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isCheckType(goalId: string): boolean {
  const d = HABIT_DEFAULTS[goalId];
  return !d || d.maxValue <= 1;
}

// ─── Screen ──────────────────────────────────────────────────────────────────

export default function LibraryScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const [activeGoals, setActiveGoals] = useState<string[]>([]);
  const [viewState, setViewState] = useState<ViewState>('list');
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);

  // Habit settings state
  const [targetValue, setTargetValue] = useState(1);
  const [freqType, setFreqType] = useState<'daily' | 'weekly' | 'interval'>('daily');
  const [freqCount, setFreqCount] = useState(3); // timesPerWeek or hours

  useFocusEffect(
    useCallback(() => {
      goalStorage.getActiveGoals().then(setActiveGoals);
    }, [])
  );

  const handleClose = () => router.back();

  const getFrequency = (): HabitFrequency => {
    if (freqType === 'daily') return { type: 'daily' };
    if (freqType === 'weekly') return { type: 'weekly', timesPerWeek: freqCount };
    return { type: 'interval', hours: freqCount };
  };

  const handleItemPress = async (item: CatalogItem) => {
    if (activeGoals.includes(item.id)) {
      await goalStorage.removeGoal(item.id);
      setActiveGoals(prev => prev.filter(id => id !== item.id));
      return;
    }

    if (item.category === 'addiction') {
      // Addictions go straight to confirm view (no stepper)
      setSelectedItem(item);
      setViewState('settings');
      return;
    }

    // Habit: check-type adds directly
    if (isCheckType(item.id)) {
      await goalStorage.addGoal(item.id);
      await goalStorage.saveGoalSettings(item.id, {
        targetValue: 1,
        frequency: { type: 'daily' },
      });
      await goalStorage.setGoalCategory(item.id, 'habit');
      setActiveGoals(prev => [...prev, item.id]);
      return;
    }

    // Habit with value: show settings sub-view
    const defaults = HABIT_DEFAULTS[item.id];
    setSelectedItem(item);
    setTargetValue(defaults?.maxValue ?? 1);
    setFreqType('daily');
    setFreqCount(3);
    setViewState('settings');
  };

  const handleSettingsBack = () => {
    setViewState('list');
    setSelectedItem(null);
  };

  const handleAddHabit = async () => {
    if (!selectedItem) return;
    await goalStorage.addGoal(selectedItem.id);
    await goalStorage.saveGoalSettings(selectedItem.id, {
      targetValue,
      frequency: getFrequency(),
    });
    await goalStorage.setGoalCategory(selectedItem.id, 'habit');
    setActiveGoals(prev => [...prev, selectedItem.id]);
    setViewState('list');
    setSelectedItem(null);
  };

  const handleStartAddiction = async () => {
    if (!selectedItem) return;
    await goalStorage.addGoal(selectedItem.id);
    await goalStorage.setGoalCategory(selectedItem.id, 'addiction');
    // Start resistance timer immediately
    await addictionStorage.startSession(selectedItem.id);
    setActiveGoals(prev => [...prev, selectedItem.id]);
    setViewState('list');
    setSelectedItem(null);
  };

  // ── Settings sub-view ────────────────────────────────────────────────────

  if (viewState === 'settings' && selectedItem) {
    const isAddiction = selectedItem.category === 'addiction';
    const defaults = HABIT_DEFAULTS[selectedItem.id];

    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleSettingsBack}
            style={styles.iconButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Svg Icon={BackArrow} width={24} height={24} stroke={theme.colors.typography.PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {isAddiction ? 'Savaşı Başlat' : 'Hedef Ayarı'}
          </Text>
          <View style={styles.iconButton} />
        </View>

        <ScrollView
          contentContainerStyle={styles.settingsContent}
          showsVerticalScrollIndicator={false}>
          {/* Icon */}
          <View style={[styles.settingsIcon, { backgroundColor: selectedItem.color + '20' }]}>
            <Text style={styles.settingsIconText}>{selectedItem.icon}</Text>
          </View>
          <Text style={styles.settingsName}>{selectedItem.name}</Text>

          {isAddiction ? (
            // ── Addiction confirm ─────────────────────────────────────────
            <>
              <Text style={styles.addictionDesc}>
                Direniş zamanlayıcın şimdi başlayacak.{'\n'}
                Ne kadar dayanabilirsin?
              </Text>
              <Text style={styles.addictionNote}>
                Relapse olursan sıfırlanır — ama bu bir başarısızlık değil,{'\n'}
                yeni bir tur.
              </Text>
              <Button onPress={handleStartAddiction} style={styles.addButton}>
                Savaşı Başlat
              </Button>
            </>
          ) : (
            // ── Habit settings ────────────────────────────────────────────
            <>
              {/* Target value */}
              <Text style={styles.settingsQuestion}>Hedefin ne kadar?</Text>
              <View style={styles.stepperContainer}>
                <Stepper
                  value={targetValue}
                  min={1}
                  max={(defaults?.maxValue ?? 10) * 3}
                  step={defaults?.step ?? 1}
                  unit={defaults?.unit}
                  onValueChange={setTargetValue}
                />
              </View>

              {/* Frequency */}
              <Text style={styles.settingsQuestion}>Ne sıklıkla?</Text>
              <View style={styles.freqPills}>
                {(['daily', 'weekly', 'interval'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    activeOpacity={0.7}
                    onPress={() => setFreqType(type)}
                    style={[styles.freqPill, freqType === type && styles.freqPillActive]}>
                    <Text
                      style={[
                        styles.freqPillText,
                        freqType === type && styles.freqPillTextActive,
                      ]}>
                      {type === 'daily' ? 'Her gün' : type === 'weekly' ? 'Haftada' : 'Aralıklı'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Secondary control for weekly / interval */}
              {freqType === 'weekly' && (
                <View style={styles.freqSecondary}>
                  <TouchableOpacity
                    style={styles.freqAdjBtn}
                    activeOpacity={0.7}
                    onPress={() => setFreqCount(c => Math.max(1, c - 1))}>
                    <Text style={styles.freqAdjText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.freqValue}>Haftada {freqCount} kez</Text>
                  <TouchableOpacity
                    style={styles.freqAdjBtn}
                    activeOpacity={0.7}
                    onPress={() => setFreqCount(c => Math.min(7, c + 1))}>
                    <Text style={styles.freqAdjText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}

              {freqType === 'interval' && (
                <View style={styles.freqSecondary}>
                  <TouchableOpacity
                    style={styles.freqAdjBtn}
                    activeOpacity={0.7}
                    onPress={() => setFreqCount(c => Math.max(1, c - 1))}>
                    <Text style={styles.freqAdjText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.freqValue}>Her {freqCount} saatte bir</Text>
                  <TouchableOpacity
                    style={styles.freqAdjBtn}
                    activeOpacity={0.7}
                    onPress={() => setFreqCount(c => Math.min(168, c + 1))}>
                    <Text style={styles.freqAdjText}>+</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Button onPress={handleAddHabit} style={styles.addButton}>
                Ekle
              </Button>
            </>
          )}
        </ScrollView>
      </View>
    );
  }

  // ── List view ─────────────────────────────────────────────────────────────

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.iconButton} />
        <Text style={styles.headerTitle}>Yeni Ekle</Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={handleClose}
          style={styles.iconButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg Icon={Close} width={24} height={24} stroke={theme.colors.typography.PRIMARY} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {/* Alışkanlıklar */}
        <Text style={styles.sectionLabel}>Alışkanlıklar</Text>
        {HABIT_CATEGORIES.map(category => (
          <View key={category.id} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category.name}</Text>
            <View style={styles.itemsGrid}>
              {category.items.map(item => {
                const catalogItem: CatalogItem = { ...item, category: 'habit' };
                const isActive = activeGoals.includes(item.id);
                return (
                  <ItemCard
                    key={item.id}
                    item={catalogItem}
                    isActive={isActive}
                    onPress={() => handleItemPress(catalogItem)}
                    styles={styles}
                  />
                );
              })}
            </View>
          </View>
        ))}

        {/* Bağımlılıklar */}
        <Text style={[styles.sectionLabel, styles.sectionLabelDanger]}>Bağımlılıklar</Text>
        <Text style={styles.sectionHint}>
          Direniş zamanlayıcısı ile kişisel rekorlarını kır.
        </Text>
        <View style={[styles.itemsGrid, styles.addictionGrid]}>
          {ADDICTION_ITEMS.map(item => {
            const catalogItem: CatalogItem = { ...item, category: 'addiction' };
            const isActive = activeGoals.includes(item.id);
            return (
              <ItemCard
                key={item.id}
                item={catalogItem}
                isActive={isActive}
                onPress={() => handleItemPress(catalogItem)}
                styles={styles}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function ItemCard({
  item,
  isActive,
  onPress,
  styles,
}: {
  item: CatalogItem;
  isActive: boolean;
  onPress: () => void;
  styles: ReturnType<typeof useStyles<typeof stylesheet>>['styles'];
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.itemCard, isActive && { borderColor: item.color }]}>
      {isActive && (
        <View style={[styles.checkBadge, { backgroundColor: item.color }]}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <Text style={styles.itemIcon}>{item.icon}</Text>
      </View>
      <Text style={styles.itemName}>{item.name}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[12],
  },

  // Section labels
  sectionLabel: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[4],
    marginTop: theme.spacing[2],
  },
  sectionLabelDanger: {
    marginTop: theme.spacing[8],
    color: '#DC2626',
  },
  sectionHint: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[4],
    marginTop: -theme.spacing[2],
  },

  // Categories (habits)
  categorySection: {
    marginBottom: theme.spacing[6],
  },
  categoryTitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[3],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  itemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  addictionGrid: {
    marginBottom: theme.spacing[4],
  },

  // Item card
  itemCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[4],
    width: '47%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  checkBadge: {
    position: 'absolute',
    top: theme.spacing[2],
    right: theme.spacing[2],
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 14,
    color: theme.colors.white,
    fontFamily: theme.fontFamily.bold,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[2],
  },
  itemIcon: {
    fontSize: 32,
  },
  itemName: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
  },

  // Settings sub-view
  settingsContent: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[6],
    paddingBottom: theme.spacing[12],
  },
  settingsIcon: {
    width: 96,
    height: 96,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing[4],
  },
  settingsIconText: {
    fontSize: 48,
  },
  settingsName: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[8],
  },
  settingsQuestion: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[4],
    alignSelf: 'flex-start',
  },
  stepperContainer: {
    width: '100%',
    marginBottom: theme.spacing[8],
  },
  addButton: {
    width: '100%',
    marginTop: theme.spacing[4],
  },

  // Addiction settings
  addictionDesc: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
    lineHeight: 28,
    marginBottom: theme.spacing[4],
  },
  addictionNote: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: theme.spacing[8],
  },

  // Frequency picker
  freqPills: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[4],
    alignSelf: 'flex-start',
  },
  freqPill: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
    backgroundColor: theme.colors.white,
  },
  freqPillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLightest,
  },
  freqPillText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  freqPillTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
  freqSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    marginBottom: theme.spacing[8],
    alignSelf: 'flex-start',
  },
  freqAdjBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqAdjText: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 24,
  },
  freqValue: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
}));
