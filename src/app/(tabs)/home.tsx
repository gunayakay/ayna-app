import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect } from 'expo-router';

import { Text } from '#components/atoms';
import AddictionWidget from '#components/addiction-widget';
import CheckInSheet, { InputMode } from '#components/check-in-sheet';
import GhostWidget from '#components/ghost-widget';
import ProgressBar from '#components/progress-bar';
import { StyleSheet, useStyles } from '#theme/unistyles';
import {
  onboardingStorage,
  OnboardingData,
  goalStorage,
  GoalSettings,
  GoalCategory,
  HabitFrequency,
  battleStorage,
  addGoalSheetRef,
} from '#/utils';

// Widget configuration based on action IDs
const WIDGET_CONFIG: Record<string, {
  icon: string;
  title: string;
  type: 'progress' | 'circular' | 'wide';
  unit?: string;
  maxLabel?: string;
  maxValue: number;
  step?: number;
}> = {
  water: { icon: '💧', title: 'Su Takibi', type: 'progress', maxValue: 8, maxLabel: 'Bardak' },
  exercise: { icon: '🏃', title: 'Spor', type: 'circular', unit: 'dk', maxValue: 60 },
  budget: { icon: '💰', title: 'Bütçe', type: 'wide', unit: '₺', maxValue: 1300, step: 50 },
  sleep: { icon: '🌙', title: 'Uyku', type: 'circular', unit: 'sa', maxValue: 10 },
  steps: { icon: '👟', title: 'Adım', type: 'progress', maxValue: 10000 },
  weight: { icon: '⚖️', title: 'Kilo', type: 'progress', unit: 'kg', maxValue: 100 },
  medicine: { icon: '💊', title: 'İlaç', type: 'progress', maxValue: 3 },
  savings: { icon: '🏦', title: 'Birikim', type: 'wide', unit: '₺', maxValue: 5000, step: 100 },
  reading: { icon: '📚', title: 'Kitap', type: 'circular', unit: 'sf', maxValue: 50 },
  focus: { icon: '🎯', title: 'Odaklanma', type: 'circular', unit: 'dk', maxValue: 120 },
  learning: { icon: '🧠', title: 'Öğrenme', type: 'circular', unit: 'dk', maxValue: 60 },
  meditation: { icon: '🧘', title: 'Meditasyon', type: 'circular', unit: 'dk', maxValue: 30 },
  journal: { icon: '✍️', title: 'Günlük', type: 'progress', maxValue: 1 },
  gratitude: { icon: '🙏', title: 'Şükran', type: 'progress', maxValue: 3 },
  quit_smoking: { icon: '🚭', title: 'Sigara', type: 'progress', maxValue: 0 },
  social_detox: { icon: '📵', title: 'Ekran Süresi', type: 'circular', unit: 'dk', maxValue: 60 },
  no_junk: { icon: '🥗', title: 'Sağlıklı Beslenme', type: 'progress', maxValue: 3 },
  call_family: { icon: '👨‍👩‍👧', title: 'Aile', type: 'progress', maxValue: 1 },
  quality_time: { icon: '❤️', title: 'Kaliteli Zaman', type: 'circular', unit: 'dk', maxValue: 60 },
};

// Addiction goal metadata (for home screen display)
const ADDICTION_CONFIG: Record<string, { icon: string; title: string }> = {
  smoking: { icon: '🚬', title: 'Sigara' },
  alcohol: { icon: '🍺', title: 'Alkol' },
  social_media: { icon: '📱', title: 'Sosyal Medya' },
  gaming: { icon: '🎮', title: 'Aşırı Oyun' },
  sugar: { icon: '🍭', title: 'Şeker' },
  binge_watch: { icon: '📺', title: 'Dizi / Binge' },
  pornography: { icon: '🔞', title: 'Pornografi' },
};

// Derive input mode from widget config
function deriveInputMode(config: { maxValue: number; unit?: string }): InputMode {
  if (config.maxValue <= 1) return 'check';
  if (config.unit === 'dk' || config.unit === 'sa') return 'time';
  return 'count';
}

export default function HomeScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [widgetValues, setWidgetValues] = useState<Record<string, number>>({});
  const [goalSettings, setGoalSettings] = useState<Record<string, GoalSettings>>({});
  const [goalCategories, setGoalCategories] = useState<Record<string, GoalCategory>>({});
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);

  const sheetRef = useRef<BottomSheetModal>(null);

  // Load user data on focus
  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, [])
  );

  // Reload when a goal is added via AddGoalSheet (sheet doesn't trigger focus change)
  useEffect(() => {
    return addGoalSheetRef.onGoalsChanged(loadUserData);
  }, []);

  const loadUserData = async () => {
    const data = await onboardingStorage.getOnboardingData();
    if (data) {
      setUserData(data);

      // One-time migration: seed goalStorage from onboarding actions
      if (data.actions?.length > 0) {
        const existingGoals = await goalStorage.getActiveGoals();
        if (existingGoals.length === 0) {
          for (const actionId of data.actions) {
            await goalStorage.addGoal(actionId);
          }
        }
      }
    }

    // Load active goals, settings and categories from goalStorage
    const activeGoals = await goalStorage.getActiveGoals();
    const settings = await goalStorage.getAllGoalSettings();
    const categories = await goalStorage.getAllGoalCategories();
    setGoalSettings(settings);
    setGoalCategories(categories);

    // Seed with 0, then overwrite with today's max recorded value
    const initialValues: Record<string, number> = {};
    activeGoals.forEach(actionId => {
      initialValues[actionId] = 0;
    });

    const today = getDayKey(Date.now());
    const allBattles = await battleStorage.getAll();
    for (const battle of allBattles) {
      if (getDayKey(battle.timestamp) === today && battle.goalId in initialValues) {
        initialValues[battle.goalId] = Math.max(initialValues[battle.goalId], battle.value);
      }
    }

    setWidgetValues(initialValues);
  };

  const greeting = getGreeting();
  const userName = userData?.userName || 'Kullanıcı';
  const userInitial = userName.charAt(0).toUpperCase();

  const handleWidgetPress = (actionId: string) => {
    setActiveSheetId(actionId);
    sheetRef.current?.present();
  };

  const handleWidgetUpdate = async (value: number) => {
    if (!activeSheetId) return;
    setWidgetValues(prev => ({ ...prev, [activeSheetId]: value }));
    const config = WIDGET_CONFIG[activeSheetId];
    if (!config) return;
    const maxValue = goalSettings[activeSheetId]?.targetValue ?? config.maxValue;
    const frequency = goalSettings[activeSheetId]?.frequency ?? { type: 'daily' as const };
    await battleStorage.save({
      goalId: activeSheetId,
      timestamp: Date.now(),
      value,
      maxValue,
      won: value >= maxValue,
    });
  };

  const activeConfig = activeSheetId ? WIDGET_CONFIG[activeSheetId] : null;
  const activeMaxValue = activeSheetId && activeConfig
    ? (goalSettings[activeSheetId]?.targetValue ?? activeConfig.maxValue)
    : 0;

  // Addiction goals (timer-based widgets)
  const addictionWidgets = Object.keys(widgetValues)
    .filter(id => goalCategories[id] === 'addiction' && ADDICTION_CONFIG[id])
    .map(id => ({ id, ...ADDICTION_CONFIG[id] }));

  // Habit goals (value-tracking widgets)
  const habitWidgets = Object.keys(widgetValues)
    .filter(id => WIDGET_CONFIG[id] && goalCategories[id] !== 'addiction')
    .map(id => {
      const config = WIDGET_CONFIG[id];
      const customMax = goalSettings[id]?.targetValue;
      return {
        id,
        ...config,
        maxValue: customMax ?? config.maxValue,
        value: widgetValues[id] || 0,
        inputMode: deriveInputMode(config),
        frequency: goalSettings[id]?.frequency as HabitFrequency | undefined,
      };
    });

  const hasAnyWidget = addictionWidgets.length > 0 || habitWidgets.length > 0;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userInitial}</Text>
            </View>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>
              {greeting}, {userName}.
            </Text>
            <Text style={styles.dateText}>{formatTodayDate()}</Text>
          </View>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Direnç section */}
          {addictionWidgets.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Direniş</Text>
              <View style={styles.widgetGrid}>
                {addictionWidgets.map(w => (
                  <AddictionWidget
                    key={w.id}
                    id={w.id}
                    icon={w.icon}
                    title={w.title}
                    onRemove={loadUserData}
                  />
                ))}
              </View>
            </>
          )}

          {/* Hedefler section */}
          {habitWidgets.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Hedefler</Text>
              <View style={styles.widgetGrid}>
              {habitWidgets.map(widget => {
                if (widget.type === 'circular') {
                  const done = widget.maxValue > 0 && widget.value >= widget.maxValue;
                  const progress = widget.maxValue > 0 ? widget.value / widget.maxValue : 0;
                  return (
                    <TouchableOpacity
                      key={widget.id}
                      activeOpacity={0.7}
                      onPress={() => handleWidgetPress(widget.id)}
                      style={styles.widgetCard}>
                      <Text style={styles.widgetTitle}>
                        {widget.icon} {widget.title}
                      </Text>
                      <Text style={styles.widgetValue}>
                        {widget.value}
                        <Text style={styles.widgetValueUnit}> {widget.unit}</Text>
                      </Text>
                      <Text style={[styles.widgetSubtext, done && { color: theme.colors.success }]}>
                        {done ? 'Tamamlandı ✓' : `Hedef: ${widget.maxValue} ${widget.unit ?? ''}`}
                      </Text>
                      {!done && widget.frequency && (
                        <Text style={styles.widgetFreq}>
                          {formatFrequency(widget.frequency)}
                        </Text>
                      )}
                      <View style={styles.progressContainer}>
                        <ProgressBar progress={progress} height={6} />
                      </View>
                    </TouchableOpacity>
                  );
                }

                if (widget.type === 'wide') {
                  return (
                    <TouchableOpacity
                      key={widget.id}
                      activeOpacity={0.7}
                      onPress={() => handleWidgetPress(widget.id)}
                      style={[styles.widgetCard, styles.widgetCardWide]}>
                      <Text style={styles.widgetTitle}>
                        {widget.icon} {widget.title}
                      </Text>
                      <Text style={styles.widgetValue}>
                        {widget.value.toLocaleString()}
                        {widget.unit} / {widget.maxValue.toLocaleString()}
                        {widget.unit}
                      </Text>
                      <View style={styles.progressContainer}>
                        <ProgressBar progress={widget.value / widget.maxValue} height={12} />
                      </View>
                    </TouchableOpacity>
                  );
                }

                // Check-type: status text instead of progress bar
                if (widget.inputMode === 'check') {
                  const isDone = widget.value >= 1;
                  return (
                    <TouchableOpacity
                      key={widget.id}
                      activeOpacity={0.7}
                      onPress={() => handleWidgetPress(widget.id)}
                      style={styles.widgetCard}>
                      <Text style={styles.widgetTitle}>
                        {widget.icon} {widget.title}
                      </Text>
                      <Text
                        style={[
                          styles.widgetStatus,
                          isDone && { color: theme.colors.success },
                        ]}>
                        {isDone ? 'Tamamlandı ✓' : 'Yapılmadı'}
                      </Text>
                    </TouchableOpacity>
                  );
                }

                // Default progress bar type
                return (
                  <TouchableOpacity
                    key={widget.id}
                    activeOpacity={0.7}
                    onPress={() => handleWidgetPress(widget.id)}
                    style={styles.widgetCard}>
                    <Text style={styles.widgetTitle}>
                      {widget.icon} {widget.title}
                    </Text>
                    <Text style={styles.widgetValue}>
                      {widget.value} / {widget.maxValue} {widget.maxLabel || ''}
                    </Text>
                    <View style={styles.progressContainer}>
                      <ProgressBar progress={widget.value / widget.maxValue} height={12} />
                    </View>
                  </TouchableOpacity>
                );
              })}
              </View>
            </>
          )}

          {/* Ghost UI empty state */}
          {!hasAnyWidget && (
            <View style={styles.emptyState}>
              <View style={styles.ghostGrid}>
                <GhostWidget />
                <GhostWidget />
                <GhostWidget wide />
              </View>
              <Text style={styles.emptyTitle}>Henüz bir hedefin yok.</Text>
              <Text style={styles.emptySubtitle}>
                Başlamak için (+) butonuna dokun.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Dynamic Check-in Sheet (habit goals only) */}
        {activeConfig && (
          <CheckInSheet
            ref={sheetRef}
            title={activeConfig.title}
            icon={activeConfig.icon}
            goalId={activeSheetId || undefined}
            inputMode={deriveInputMode(activeConfig)}
            unit={activeConfig.unit}
            step={activeConfig.step}
            maxValue={activeMaxValue}
            maxLabel={activeConfig.maxLabel}
            initialValue={activeSheetId ? widgetValues[activeSheetId] || 0 : 0}
            onUpdate={handleWidgetUpdate}
          />
        )}
      </View>
  );
}

const TR_DAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
const TR_MONTHS_LONG = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function formatTodayDate(): string {
  const d = new Date();
  return `${TR_DAYS[d.getDay()]}, ${d.getDate()} ${TR_MONTHS_LONG[d.getMonth()]}`;
}

function formatFrequency(freq?: HabitFrequency): string {
  if (!freq) return '';
  if (freq.type === 'daily') return 'Her gün';
  if (freq.type === 'weekly') return `Haftada ${freq.timesPerWeek} kez`;
  if (freq.type === 'interval') return `Her ${freq.hours} saatte bir`;
  return '';
}

function getDayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) return 'Günaydın';
  if (hour < 18) return 'İyi günler';
  return 'İyi akşamlar';
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
  },
  avatarContainer: {
    marginRight: theme.spacing[3],
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.white,
  },
  greetingContainer: {
    flex: 1,
  },
  greeting: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  dateText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    marginTop: theme.spacing[1],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: theme.spacing[3],
    marginTop: theme.spacing[1],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[24],
  },
  addictionSection: {
    gap: theme.spacing[3],
    marginBottom: theme.spacing[3],
    backgroundColor: theme.colors.primaryLighter,
    borderRadius: theme.borderRadius['6xl'],
    padding: theme.spacing[3],
  },
  widgetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
  },
  widgetCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['6xl'],
    padding: theme.spacing[5],
    flex: 1,
    minWidth: '45%',
  },
  widgetCardWide: {
    minWidth: '100%',
  },
  widgetTitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[2],
  },
  widgetValue: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[1],
  },
  widgetValueUnit: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  widgetSubtext: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[1],
  },
  widgetFreq: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.TERTIARY,
    marginBottom: theme.spacing[2],
  },
  widgetStatus: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    marginTop: theme.spacing[2],
  },
  progressContainer: {
    marginTop: theme.spacing[1],
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: theme.spacing[4],
  },
  ghostGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[8],
    width: '100%',
  },
  emptyTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
    marginBottom: theme.spacing[2],
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
  },
}));
