import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useFocusEffect, useRouter } from 'expo-router';

import { Text } from '#components/atoms';
import AddictionWidget from '#components/addiction-widget';
import MirrorAvatar from '#components/mirror-avatar';
import CheckInSheet, { InputMode } from '#components/check-in-sheet';
import GlassCard from '#components/glass-card';
import ProgressRing from '#components/progress-ring';
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
  const router = useRouter();

  const [userData, setUserData] = useState<OnboardingData | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [widgetValues, setWidgetValues] = useState<Record<string, number>>({});
  const [goalSettings, setGoalSettings] = useState<Record<string, GoalSettings>>({});
  const [goalCategories, setGoalCategories] = useState<Record<string, GoalCategory>>({});
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [clarity, setClarity] = useState(1); // ayna berraklığı (kümülatif, son 3 gün)

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
    setAvatarUri(await onboardingStorage.getAvatarUri());
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

    // ── Ayna berraklığı (kümülatif, son 3 gün · recency-ağırlıklı) ──
    // İhmal → buğu birikir; ardışık iyi günler → berraklaşır (~3 gün streak temizler).
    const habitGoalIds = activeGoals.filter(
      gid => WIDGET_CONFIG[gid] && categories[gid] !== 'addiction'
    );
    if (habitGoalIds.length === 0) {
      setClarity(1);
    } else {
      const weights = [1, 0.7, 0.45]; // bugün, dün, evvelsi gün
      let wsum = 0;
      let csum = 0;
      for (let i = 0; i < weights.length; i++) {
        const dk = getDayKey(Date.now() - i * 86400000);
        let goalSum = 0;
        let goalN = 0;
        for (const gid of habitGoalIds) {
          const cfg = WIDGET_CONFIG[gid];
          const mx = settings[gid]?.targetValue ?? cfg.maxValue;
          if (mx <= 0) continue;
          let dayVal = 0;
          for (const b of allBattles) {
            if (b.goalId === gid && getDayKey(b.timestamp) === dk) {
              dayVal = Math.max(dayVal, b.value);
            }
          }
          goalSum += Math.min(1, dayVal / mx);
          goalN++;
        }
        const dayCompletion = goalN > 0 ? goalSum / goalN : 0;
        csum += dayCompletion * weights[i];
        wsum += weights[i];
      }
      setClarity(wsum > 0 ? csum / wsum : 1);
    }
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

  // ── Hero (B sesi + ayna berraklığı) ──
  const doneCount = habitWidgets.filter(w => w.maxValue > 0 && w.value >= w.maxValue).length;
  const totalCount = habitWidgets.length;
  const hero = computeHero(userName, doneCount, totalCount, hasAnyWidget);
  // clarity artık state'te (loadUserData'da kümülatif son-3-gün hesaplanıyor)

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* sıcak ışık bloom'u */}
      <View style={styles.bloomTop} pointerEvents="none" />
      <View style={styles.bloomBottom} pointerEvents="none" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {greeting}, {userName}.
        </Text>
        <Text style={styles.dateText}>{formatTodayDate()}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* HERO — büyük ayna + B sesi */}
        <GlassCard radius={28} intensity={26} style={styles.hero}>
          <View style={styles.heroRow}>
            <MirrorAvatar uri={avatarUri} initial={userInitial} size={84} clarity={clarity} />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>{hero.title}</Text>
              <Text style={styles.heroSub}>{hero.sub}</Text>
              {habitWidgets.length > 0 && (
                <View style={styles.chips}>
                  {habitWidgets.map(w => {
                    const done = w.maxValue > 0 && w.value >= w.maxValue;
                    return (
                      <View key={w.id} style={[styles.chip, done && styles.chipDone]}>
                        <Text style={[styles.chipText, done && styles.chipTextDone]}>
                          {done ? '✓ ' : ''}{w.icon} {w.title}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          </View>
        </GlassCard>

        {/* Direniş */}
        {addictionWidgets.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Direniş</Text>
            <View style={styles.rows}>
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

        {/* Hedefler — kompakt glass satırlar */}
        {habitWidgets.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Hedefler</Text>
            <View style={styles.rows}>
              {habitWidgets.map(widget => {
                const done = widget.maxValue > 0 && widget.value >= widget.maxValue;
                const progress = widget.maxValue > 0 ? widget.value / widget.maxValue : 0;
                const unitLabel = widget.unit ?? widget.maxLabel ?? '';
                return (
                  <TouchableOpacity
                    key={widget.id}
                    activeOpacity={0.85}
                    onPress={() =>
                      router.push({
                        pathname: '/goal/[id]',
                        params: {
                          id: widget.id,
                          icon: widget.icon,
                          title: widget.title,
                          unit: unitLabel,
                          maxValue: String(widget.maxValue),
                          value: String(widget.value),
                        },
                      })
                    }>
                    <GlassCard radius={22}>
                      <View style={styles.row}>
                        <Text style={styles.rowEmoji}>{widget.icon}</Text>
                        <View style={styles.rowMid}>
                          <Text style={[styles.rowName, done && { color: theme.colors.success }]}>
                            {widget.title}
                          </Text>
                          <Text style={styles.rowSub}>
                            <Text style={styles.rowVal}>{widget.value}</Text>
                            {' / '}{widget.maxValue} {unitLabel}
                          </Text>
                        </View>
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleWidgetPress(widget.id)}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                          <ProgressRing progress={progress} mode={done ? 'done' : 'plus'} />
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* Boş durum */}
        {!hasAnyWidget && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>Henüz bir hedefin yok.</Text>
            <Text style={styles.emptySubtitle}>Başlamak için (+) butonuna dokun.</Text>
          </View>
        )}
      </ScrollView>

      {/* Check-in Sheet */}
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

// B sesi — güne göre değişen ayna konuşması (yargısız, sakin)
function computeHero(
  userName: string,
  done: number,
  total: number,
  hasAny: boolean
): { title: string; sub: string } {
  if (!hasAny) {
    return {
      title: `Yeni bir gün, ${userName}.`,
      sub: 'Henüz aramızda bir şey geçmedi. Başlamak için bir hedef ekle.',
    };
  }
  if (total === 0) {
    return { title: 'Bugün buradasın.', sub: 'Aynan seni bekliyor.' };
  }
  if (done === 0) {
    return { title: 'Bugüne henüz başlamadın.', sub: 'Birinden başla — hangisi olursa. Gerisi gelir.' };
  }
  if (done >= total) {
    return {
      title: 'Bugün kendine baktın.',
      sub: `${total} hedef, ${total} kez döndün. Bunu ben yapmadım — sen yaptın.`,
    };
  }
  const left = total - done;
  if (done >= total / 2) {
    return { title: 'Yarısını getirdin.', sub: `${left} şey duruyor. Bugünü tamamlamana az kaldı.` };
  }
  return { title: 'Başladın. Görüyorum.', sub: `${left} şey daha seni bekliyor.` };
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  bloomTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 360,
    height: 360,
    borderRadius: 360,
    backgroundColor: theme.colors.primaryLighter,
    opacity: 0.5,
  },
  bloomBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 320,
    height: 320,
    borderRadius: 320,
    backgroundColor: theme.colors.primaryLightest,
    opacity: 0.6,
  },
  header: {
    paddingHorizontal: theme.spacing[5],
    paddingVertical: theme.spacing[3],
  },
  greeting: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY,
    letterSpacing: -0.4,
  },
  dateText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    marginTop: theme.spacing[1],
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingHorizontal: theme.spacing[5],
    paddingBottom: theme.spacing[24],
    gap: theme.spacing[2],
  },
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.SECONDARY,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: theme.spacing[4],
    marginBottom: theme.spacing[2],
    marginLeft: theme.spacing[1],
  },
  // hero
  hero: { marginTop: theme.spacing[1] },
  heroRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    padding: theme.spacing[5],
  },
  heroText: { flex: 1, minWidth: 0 },
  heroTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY,
    letterSpacing: -0.3,
    lineHeight: 22,
  },
  heroSub: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    marginTop: theme.spacing[1],
    lineHeight: 19,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginTop: theme.spacing[3],
  },
  chip: {
    backgroundColor: theme.colors.primaryLightest,
    borderRadius: 99,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  chipDone: { backgroundColor: 'rgba(54,179,126,0.14)' },
  chipText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primaryDarker,
  },
  chipTextDone: { color: '#1f8a5f' },
  // rows
  rows: { gap: theme.spacing[2] },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
  },
  rowEmoji: { fontSize: 24, width: 32, textAlign: 'center' },
  rowMid: { flex: 1, minWidth: 0 },
  rowName: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  rowSub: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    marginTop: 2,
  },
  rowVal: {
    fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY,
  },
  // empty
  emptyState: {
    alignItems: 'center',
    paddingTop: theme.spacing[10],
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
