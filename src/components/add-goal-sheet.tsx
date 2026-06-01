import React, { forwardRef, useCallback, useMemo, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';

import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from './atoms';
import Svg from './atoms/svg';
import Button from './button';
import { BackArrow } from '#assets/svg';
import { goalStorage, addictionStorage } from '#/utils';
import type { GoalCategory, HabitFrequency } from '#/utils';

// ─── Catalog data ─────────────────────────────────────────────────────────────

const HABIT_CATEGORIES = [
  {
    id: 'health',
    name: 'Sağlık',
    items: [
      { id: 'water', name: 'Su Takibi', icon: '💧' },
      { id: 'exercise', name: 'Spor', icon: '🏃' },
      { id: 'sleep', name: 'Uyku', icon: '😴' },
      { id: 'meditation', name: 'Meditasyon', icon: '🧘' },
    ],
  },
  {
    id: 'productivity',
    name: 'Üretkenlik',
    items: [
      { id: 'reading', name: 'Kitap Okuma', icon: '📚' },
      { id: 'writing', name: 'Günlük Yazma', icon: '✍️' },
      { id: 'learning', name: 'Öğrenme', icon: '🎓' },
    ],
  },
  {
    id: 'finance',
    name: 'Finans',
    items: [
      { id: 'budget', name: 'Bütçe Takibi', icon: '💰' },
      { id: 'savings', name: 'Tasarruf', icon: '🏦' },
    ],
  },
];

const ADDICTION_ITEMS = [
  { id: 'smoking', name: 'Sigara', icon: '🚬' },
  { id: 'alcohol', name: 'Alkol', icon: '🍺' },
  { id: 'social_media', name: 'Sosyal Medya', icon: '📱' },
  { id: 'gaming', name: 'Aşırı Oyun', icon: '🎮' },
  { id: 'sugar', name: 'Şeker / Atıştırma', icon: '🍭' },
  { id: 'binge_watch', name: 'Dizi / Binge', icon: '📺' },
  { id: 'pornography', name: 'Pornografi', icon: '🔞' },
];

// Sınırlama modu için bağımlılığa göre akıllı varsayılan (periyot + sayı)
const ADDICTION_LIMIT_DEFAULTS: Record<string, { period: 'daily' | 'weekly'; limit: number }> = {
  smoking: { period: 'daily', limit: 10 },
  alcohol: { period: 'weekly', limit: 3 },
  social_media: { period: 'daily', limit: 5 },
  gaming: { period: 'daily', limit: 2 },
  sugar: { period: 'daily', limit: 2 },
  binge_watch: { period: 'weekly', limit: 3 },
  pornography: { period: 'weekly', limit: 2 },
};
const ADDICTION_LIMIT_FALLBACK = { period: 'weekly' as const, limit: 3 };

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

// Context-aware target question per goal
const TARGET_QUESTIONS: Record<string, string> = {
  water: 'Günde kaç bardak su içmek istiyorsun?',
  exercise: 'Her antrenman kaç dakika sürsün?',
  sleep: 'Her gece kaç saat uyumayı hedefliyorsun?',
  meditation: 'Her seans kaç dakika meditasyon yapacaksın?',
  reading: 'Her oturumda kaç sayfa okuyacaksın?',
  learning: 'Her gün kaç dakika öğrenmeye ayıracaksın?',
  budget: 'Günlük ne kadar harcama takip etmek istiyorsun?',
  savings: 'Birikim hedefin ne kadar?',
};

// Quick-pick values per goal (most common choices)
const QUICK_PICKS: Record<string, number[]> = {
  water: [4, 6, 8, 10],
  exercise: [15, 30, 45, 60, 90],
  sleep: [6, 7, 8, 9],
  meditation: [5, 10, 15, 20, 30],
  reading: [10, 20, 30, 50],
  learning: [15, 30, 45, 60],
  budget: [500, 1000, 1500, 2000],
  savings: [1000, 2000, 5000, 10000],
};

// Frequency context question per goal
const FREQ_QUESTIONS: Record<string, string> = {
  exercise: 'Haftada kaç kez antrenman yapmak istiyorsun?',
  reading: 'Okumayı ne sıklıkla yapacaksın?',
  meditation: 'Meditasyonu ne sıklıkla yapacaksın?',
};

const FREQ_OPTIONS = [
  {
    type: 'daily' as const,
    icon: '📅',
    label: 'Her gün',
    desc: 'Günlük alışkanlık olarak ekle',
  },
  {
    type: 'weekly' as const,
    icon: '📆',
    label: 'Haftada birkaç kez',
    desc: 'Esnek, sürdürülebilir bir plan',
  },
  {
    type: 'interval' as const,
    icon: '⏰',
    label: 'Aralıklı',
    desc: 'Kendi ritmine göre belirle',
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type SheetView = 'category' | 'catalog' | 'settings';

interface CatalogItem {
  id: string;
  name: string;
  icon: string;
  category: GoalCategory;
}

export interface AddGoalSheetProps {
  onGoalAdded?: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

const AddGoalSheet = forwardRef<BottomSheetModal, AddGoalSheetProps>(({ onGoalAdded }, ref) => {
  const { styles, theme } = useStyles(stylesheet);
  const { bottom } = useSafeAreaInsets();

  const [viewState, setViewState] = useState<SheetView>('category');
  const [selectedCategory, setSelectedCategory] = useState<GoalCategory | null>(null);
  const [selectedItem, setSelectedItem] = useState<CatalogItem | null>(null);
  const [activeGoals, setActiveGoals] = useState<string[]>([]);

  const [targetValue, setTargetValue] = useState(1);
  const [freqType, setFreqType] = useState<'daily' | 'weekly' | 'interval'>('daily');
  const [freqCount, setFreqCount] = useState(3);
  const [addictionMode, setAddictionMode] = useState<'abstinence' | 'limit'>('abstinence');
  const [limitPeriod, setLimitPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [limitCount, setLimitCount] = useState(3);

  const snapPoints = useMemo(() => {
    if (viewState === 'category') return ['38%'];
    if (viewState === 'catalog') return ['80%'];
    if (selectedItem?.category === 'addiction') {
      return addictionMode === 'limit' ? ['82%'] : ['58%'];
    }
    return ['90%'];
  }, [viewState, selectedItem, addictionMode]);

  const getFrequency = (): HabitFrequency => {
    if (freqType === 'daily') return { type: 'daily' };
    if (freqType === 'weekly') return { type: 'weekly', timesPerWeek: freqCount };
    return { type: 'interval', hours: freqCount };
  };

  const snapTo = (view: SheetView) => {
    setViewState(view);
    setTimeout(() => {
      if (ref && 'current' in ref) ref.current?.snapToIndex(0);
    }, 50);
  };

  const resetState = () => {
    setViewState('category');
    setSelectedCategory(null);
    setSelectedItem(null);
    setFreqType('daily');
    setFreqCount(3);
    setTargetValue(1);
    setAddictionMode('abstinence');
    setLimitPeriod('weekly');
    setLimitCount(3);
  };

  const dismiss = () => {
    if (ref && 'current' in ref) ref.current?.dismiss();
  };

  const handleSheetChange = useCallback(
    (index: number) => {
      if (index === 0 && viewState === 'category') {
        goalStorage.getActiveGoals().then(setActiveGoals);
      }
      if (index === -1) resetState();
    },
    [viewState]
  );

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    []
  );

  // ── Handlers ────────────────────────────────────────────────────────────────

  const handleCategorySelect = (category: GoalCategory) => {
    setSelectedCategory(category);
    snapTo('catalog');
  };

  const handleItemPress = async (item: CatalogItem) => {
    if (activeGoals.includes(item.id)) {
      await goalStorage.removeGoal(item.id);
      setActiveGoals(prev => prev.filter(id => id !== item.id));
      onGoalAdded?.();
      return;
    }

    if (item.category === 'addiction') {
      setSelectedItem(item);
      setAddictionMode('abstinence');
      const d = ADDICTION_LIMIT_DEFAULTS[item.id] ?? ADDICTION_LIMIT_FALLBACK;
      setLimitPeriod(d.period);
      setLimitCount(d.limit);
      snapTo('settings');
      return;
    }

    const defaults = HABIT_DEFAULTS[item.id];
    if (!defaults || defaults.maxValue <= 1) {
      await goalStorage.addGoal(item.id);
      await goalStorage.saveGoalSettings(item.id, { targetValue: 1, frequency: { type: 'daily' } });
      await goalStorage.setGoalCategory(item.id, 'habit');
      setActiveGoals(prev => [...prev, item.id]);
      onGoalAdded?.();
      return;
    }

    setSelectedItem(item);
    setTargetValue(defaults.maxValue);
    setFreqType('daily');
    setFreqCount(3);
    snapTo('settings');
  };

  const handleAddHabit = async () => {
    if (!selectedItem) return;
    await goalStorage.addGoal(selectedItem.id);
    await goalStorage.saveGoalSettings(selectedItem.id, {
      targetValue,
      frequency: getFrequency(),
    });
    await goalStorage.setGoalCategory(selectedItem.id, 'habit');
    onGoalAdded?.();
    dismiss();
  };

  const handleStartAddiction = async () => {
    if (!selectedItem) return;
    await goalStorage.addGoal(selectedItem.id);
    await goalStorage.setGoalCategory(selectedItem.id, 'addiction');
    await goalStorage.setAddictionConfig(
      selectedItem.id,
      addictionMode === 'limit'
        ? { mode: 'limit', limitPeriod, limit: limitCount }
        : { mode: 'abstinence' }
    );
    if (addictionMode === 'abstinence') {
      await addictionStorage.startSession(selectedItem.id);
    }
    onGoalAdded?.();
    dismiss();
  };

  // ── Shared modal props ───────────────────────────────────────────────────────

  const sharedModalProps = {
    ref,
    snapPoints,
    enablePanDownToClose: true,
    backdropComponent: renderBackdrop,
    onChange: handleSheetChange,
    handleComponent: () => null, // remove drag handle indicator
    backgroundStyle: {
      borderRadius: theme.borderRadius['4xl'],
      backgroundColor: theme.colors.background.MODAL,
    },
    bottomInset: bottom > 0 ? bottom : theme.spacing[4],
    keyboardBehavior: 'interactive' as const,
    keyboardBlurBehavior: 'restore' as const,
  };

  // ── Category view ────────────────────────────────────────────────────────────

  if (viewState === 'category') {
    return (
      <BottomSheetModal {...sharedModalProps}>
        <BottomSheetView style={styles.categoryContainer}>
          <Text style={styles.sheetTitle}>Ne eklemek istiyorsun?</Text>
          <View style={styles.categoryRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCategorySelect('habit')}
              style={styles.categoryCard}>
              <Text style={styles.categoryCardIcon}>🌱</Text>
              <Text style={styles.categoryCardTitle}>Alışkanlık</Text>
              <Text style={styles.categoryCardDesc}>Hayatına eklemek istediğin şeyler</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleCategorySelect('addiction')}
              style={[styles.categoryCard, styles.categoryCardDanger]}>
              <Text style={styles.categoryCardIcon}>⚔️</Text>
              <Text style={styles.categoryCardTitle}>Bağımlılık</Text>
              <Text style={styles.categoryCardDesc}>Durdurmak istediğin şeyler</Text>
            </TouchableOpacity>
          </View>
        </BottomSheetView>
      </BottomSheetModal>
    );
  }

  // ── Catalog view ─────────────────────────────────────────────────────────────

  if (viewState === 'catalog') {
    return (
      <BottomSheetModal {...sharedModalProps}>
        <View style={styles.sheetHeader}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => snapTo('category')}
            style={styles.iconBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Svg Icon={BackArrow} width={22} height={22} stroke={theme.colors.typography.PRIMARY} />
          </TouchableOpacity>
          <Text style={styles.sheetTitle}>
            {selectedCategory === 'habit' ? 'Alışkanlık Seç' : 'Bağımlılık Seç'}
          </Text>
          <View style={styles.iconBtn} />
        </View>

        <BottomSheetScrollView contentContainerStyle={styles.catalogContent}>
          {selectedCategory === 'habit' ? (
            HABIT_CATEGORIES.map(cat => (
              <View key={cat.id} style={styles.catalogSection}>
                <Text style={styles.catalogSectionTitle}>{cat.name}</Text>
                <View style={styles.catalogGrid}>
                  {cat.items.map(item => {
                    const catalogItem: CatalogItem = { ...item, category: 'habit' };
                    return (
                      <CatalogCard
                        key={item.id}
                        item={catalogItem}
                        isActive={activeGoals.includes(item.id)}
                        onPress={() => handleItemPress(catalogItem)}
                        styles={styles}
                      />
                    );
                  })}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.catalogSection}>
              <View style={styles.catalogGrid}>
                {ADDICTION_ITEMS.map(item => {
                  const catalogItem: CatalogItem = { ...item, category: 'addiction' };
                  return (
                    <CatalogCard
                      key={item.id}
                      item={catalogItem}
                      isActive={activeGoals.includes(item.id)}
                      onPress={() => handleItemPress(catalogItem)}
                      styles={styles}
                    />
                  );
                })}
              </View>
            </View>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }

  // ── Settings view ────────────────────────────────────────────────────────────

  const isAddiction = selectedItem?.category === 'addiction';
  const defaults = selectedItem ? HABIT_DEFAULTS[selectedItem.id] : null;
  const step = defaults?.step ?? 1;
  const unit = defaults?.unit;
  const quickPicks = selectedItem ? (QUICK_PICKS[selectedItem.id] ?? []) : [];
  const targetQuestion =
    selectedItem ? (TARGET_QUESTIONS[selectedItem.id] ?? 'Günlük hedefinizi belirleyin') : '';
  const freqQuestion =
    selectedItem
      ? (FREQ_QUESTIONS[selectedItem.id] ?? 'Bu alışkanlığı ne sıklıkla yapacaksın?')
      : '';

  return (
    <BottomSheetModal {...sharedModalProps}>
      <View style={styles.sheetHeader}>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => snapTo('catalog')}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg Icon={BackArrow} width={22} height={22} stroke={theme.colors.typography.PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.sheetTitle}>{isAddiction ? 'Savaşı Başlat' : 'Hedefi Ayarla'}</Text>
        <View style={styles.iconBtn} />
      </View>

      <BottomSheetScrollView contentContainerStyle={styles.settingsContent}>
        {/* Goal identity */}
        <View style={styles.goalIdentity}>
          <Text style={styles.goalIcon}>{selectedItem?.icon}</Text>
          <Text style={styles.goalName}>{selectedItem?.name}</Text>
        </View>

        {isAddiction ? (
          // ── Addiction: mod seçimi + ayar ───────────────────────────────────
          <View style={styles.addictionBlock}>
            {/* Mod seçimi */}
            <View style={styles.modeRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAddictionMode('abstinence')}
                style={[styles.modeCard, addictionMode === 'abstinence' && styles.modeCardActive]}>
                <Text
                  style={[
                    styles.modeCardTitle,
                    addictionMode === 'abstinence' && styles.modeCardTitleActive,
                  ]}>
                  Tamamen Bırak
                </Text>
                <Text style={styles.modeCardDesc}>Sıfır tolerans · tur + rekor</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setAddictionMode('limit')}
                style={[styles.modeCard, addictionMode === 'limit' && styles.modeCardActive]}>
                <Text
                  style={[
                    styles.modeCardTitle,
                    addictionMode === 'limit' && styles.modeCardTitleActive,
                  ]}>
                  Sınırla
                </Text>
                <Text style={styles.modeCardDesc}>Haftalık izin · kademeli azalt</Text>
              </TouchableOpacity>
            </View>

            {addictionMode === 'abstinence' ? (
              <>
                <Text style={styles.addictionDesc}>
                  Ömür boyu değil, sadece{'\n'}bir sonraki turu düşün.
                </Text>
                <Text style={styles.addictionNote}>
                  Geri düşersen sıfırlanır — bu bir başarısızlık değil, yeni bir tur. Önemli olan
                  kaç kez ayağa kalktığın.
                </Text>
              </>
            ) : (
              <>
                {/* Periyot: günlük / haftalık */}
                <View style={styles.periodRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setLimitPeriod('daily')}
                    style={[styles.periodBtn, limitPeriod === 'daily' && styles.periodBtnActive]}>
                    <Text
                      style={[
                        styles.periodBtnText,
                        limitPeriod === 'daily' && styles.periodBtnTextActive,
                      ]}>
                      Günlük
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setLimitPeriod('weekly')}
                    style={[styles.periodBtn, limitPeriod === 'weekly' && styles.periodBtnActive]}>
                    <Text
                      style={[
                        styles.periodBtnText,
                        limitPeriod === 'weekly' && styles.periodBtnTextActive,
                      ]}>
                      Haftalık
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionQuestion}>
                  {limitPeriod === 'daily'
                    ? 'Günde kaç kez izin veriyorsun?'
                    : 'Haftada kaç kez izin veriyorsun?'}
                </Text>
                <View style={styles.freqCounter}>
                  <TouchableOpacity
                    style={styles.freqCountBtn}
                    activeOpacity={0.7}
                    onPress={() => setLimitCount(c => Math.max(1, c - 1))}>
                    <Text style={styles.freqCountBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.freqCountValue}>
                    {limitPeriod === 'daily'
                      ? `Günde ${limitCount} kez`
                      : `Haftada ${limitCount} kez`}
                  </Text>
                  <TouchableOpacity
                    style={styles.freqCountBtn}
                    activeOpacity={0.7}
                    onPress={() => setLimitCount(c => Math.min(50, c + 1))}>
                    <Text style={styles.freqCountBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.addictionNote}>
                  Amaç sıfır değil, kontrol. İzni zamanla azaltarak ilerleyebilirsin. Hakkını aşman
                  bir başarısızlık değil — sadece veri.
                </Text>
              </>
            )}

            <Button onPress={handleStartAddiction} style={styles.actionButton}>
              {addictionMode === 'abstinence' ? 'Savaşı Başlat' : 'Takibi Başlat'}
            </Button>
          </View>
        ) : (
          // ── Habit settings ────────────────────────────────────────────────
          <>
            {/* Target question */}
            <Text style={styles.sectionQuestion}>{targetQuestion}</Text>

            {/* Large number picker */}
            <View style={styles.numberRow}>
              <TouchableOpacity
                style={styles.numberBtn}
                activeOpacity={0.7}
                onPress={() => setTargetValue(v => Math.max(1, v - step))}>
                <Text style={styles.numberBtnText}>−</Text>
              </TouchableOpacity>

              <View style={styles.numberCenter}>
                <Text style={styles.numberValue}>{targetValue}</Text>
                {unit && <Text style={styles.numberUnit}>{unit}</Text>}
              </View>

              <TouchableOpacity
                style={styles.numberBtn}
                activeOpacity={0.7}
                onPress={() => setTargetValue(v => v + step)}>
                <Text style={styles.numberBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick picks */}
            {quickPicks.length > 0 && (
              <View style={styles.quickPickRow}>
                {quickPicks.map(val => (
                  <TouchableOpacity
                    key={val}
                    activeOpacity={0.7}
                    onPress={() => setTargetValue(val)}
                    style={[
                      styles.quickPickBtn,
                      targetValue === val && styles.quickPickBtnActive,
                    ]}>
                    <Text
                      style={[
                        styles.quickPickText,
                        targetValue === val && styles.quickPickTextActive,
                      ]}>
                      {val}
                      {unit ? ` ${unit}` : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Frequency question */}
            <Text style={[styles.sectionQuestion, styles.sectionQuestionSecond]}>
              {freqQuestion}
            </Text>

            {/* Frequency cards */}
            <View style={styles.freqCards}>
              {FREQ_OPTIONS.map(opt => (
                <TouchableOpacity
                  key={opt.type}
                  activeOpacity={0.7}
                  onPress={() => setFreqType(opt.type)}
                  style={[styles.freqCard, freqType === opt.type && styles.freqCardActive]}>
                  <Text style={styles.freqCardIcon}>{opt.icon}</Text>
                  <View style={styles.freqCardText}>
                    <Text
                      style={[
                        styles.freqCardLabel,
                        freqType === opt.type && styles.freqCardLabelActive,
                      ]}>
                      {opt.label}
                    </Text>
                    <Text style={styles.freqCardDesc}>{opt.desc}</Text>
                  </View>
                  {freqType === opt.type && (
                    <View style={styles.freqCardCheck}>
                      <Text style={styles.freqCardCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Secondary control for weekly/interval */}
            {freqType === 'weekly' && (
              <View style={styles.freqCounter}>
                <TouchableOpacity
                  style={styles.freqCountBtn}
                  activeOpacity={0.7}
                  onPress={() => setFreqCount(c => Math.max(1, c - 1))}>
                  <Text style={styles.freqCountBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.freqCountValue}>Haftada {freqCount} kez</Text>
                <TouchableOpacity
                  style={styles.freqCountBtn}
                  activeOpacity={0.7}
                  onPress={() => setFreqCount(c => Math.min(7, c + 1))}>
                  <Text style={styles.freqCountBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            {freqType === 'interval' && (
              <View style={styles.freqCounter}>
                <TouchableOpacity
                  style={styles.freqCountBtn}
                  activeOpacity={0.7}
                  onPress={() => setFreqCount(c => Math.max(1, c - 1))}>
                  <Text style={styles.freqCountBtnText}>−</Text>
                </TouchableOpacity>
                <Text style={styles.freqCountValue}>Her {freqCount} saatte bir</Text>
                <TouchableOpacity
                  style={styles.freqCountBtn}
                  activeOpacity={0.7}
                  onPress={() => setFreqCount(c => Math.min(168, c + 1))}>
                  <Text style={styles.freqCountBtnText}>+</Text>
                </TouchableOpacity>
              </View>
            )}

            <Button onPress={handleAddHabit} style={styles.actionButton}>
              Ekle
            </Button>
          </>
        )}
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
});

// ─── CatalogCard ──────────────────────────────────────────────────────────────

function CatalogCard({
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
      style={[styles.catalogCard, isActive && styles.catalogCardActive]}>
      {isActive && (
        <View style={styles.checkBadge}>
          <Text style={styles.checkIcon}>✓</Text>
        </View>
      )}
      <Text style={styles.catalogCardIcon}>{item.icon}</Text>
      <Text style={styles.catalogCardName}>{item.name}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const stylesheet = createStyleSheet(theme => ({
  // ── Category ──────────────────────────────────────────────────────────────
  categoryContainer: {
    flex: 1,
    padding: theme.spacing[5],
    paddingTop: theme.spacing[6],
  },
  sheetTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
  },
  categoryRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[5],
  },
  categoryCard: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
    borderRadius: theme.borderRadius['3xl'],
    padding: theme.spacing[5],
    alignItems: 'center',
    gap: theme.spacing[2],
  },
  categoryCardDanger: {
    backgroundColor: '#FEF2F2',
  },
  categoryCardIcon: {
    fontSize: 36,
  },
  categoryCardTitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  categoryCardDesc: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
  },

  // ── Shared header ──────────────────────────────────────────────────────────
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4],
    paddingTop: theme.spacing[4],
    paddingBottom: theme.spacing[3],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.PRIMARY,
  },
  iconBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ── Catalog ───────────────────────────────────────────────────────────────
  catalogContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[8],
  },
  catalogSection: {
    marginBottom: theme.spacing[5],
  },
  catalogSectionTitle: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing[3],
  },
  catalogGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  catalogCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['4xl'],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[2],
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
    position: 'relative',
  },
  catalogCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLightest,
  },
  checkBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkIcon: {
    fontSize: 10,
    color: theme.colors.white,
    fontFamily: theme.fontFamily.bold,
  },
  catalogCardIcon: {
    fontSize: 22,
  },
  catalogCardName: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },

  // ── Settings: shared ──────────────────────────────────────────────────────
  settingsContent: {
    paddingHorizontal: theme.spacing[5],
    paddingTop: theme.spacing[5],
    paddingBottom: theme.spacing[10],
  },
  goalIdentity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[7],
    paddingBottom: theme.spacing[5],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.PRIMARY,
  },
  goalIcon: {
    fontSize: 40,
  },
  goalName: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  sectionQuestion: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[5],
    lineHeight: 24,
  },
  sectionQuestionSecond: {
    marginTop: theme.spacing[8],
  },
  actionButton: {
    marginTop: theme.spacing[6],
  },

  // ── Settings: number picker ───────────────────────────────────────────────
  numberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.PRIMARY,
    borderRadius: theme.borderRadius['3xl'],
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  numberBtn: {
    width: 52,
    height: 52,
    borderRadius: theme.borderRadius['2xl'],
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberBtnText: {
    fontSize: 28,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 34,
  },
  numberCenter: {
    alignItems: 'center',
  },
  numberValue: {
    fontSize: 52,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 60,
  },
  numberUnit: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    marginTop: -theme.spacing[1],
  },

  // ── Settings: quick picks ─────────────────────────────────────────────────
  quickPickRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  quickPickBtn: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
    backgroundColor: theme.colors.white,
  },
  quickPickBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLightest,
  },
  quickPickText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  quickPickTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },

  // ── Settings: frequency cards ─────────────────────────────────────────────
  freqCards: {
    gap: theme.spacing[2],
  },
  freqCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
    backgroundColor: theme.colors.white,
  },
  freqCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLightest,
  },
  freqCardIcon: {
    fontSize: 24,
  },
  freqCardText: {
    flex: 1,
    gap: theme.spacing[1],
  },
  freqCardLabel: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
  freqCardLabelActive: {
    color: theme.colors.primary,
  },
  freqCardDesc: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
  },
  freqCardCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqCardCheckText: {
    fontSize: 12,
    color: theme.colors.white,
    fontFamily: theme.fontFamily.bold,
  },

  // ── Settings: frequency counter (weekly/interval) ─────────────────────────
  freqCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    marginTop: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.background.PRIMARY,
    borderRadius: theme.borderRadius['2xl'],
  },
  freqCountBtn: {
    width: 36,
    height: 36,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqCountBtnText: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 24,
  },
  freqCountValue: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
  },

  // ── Settings: addiction ───────────────────────────────────────────────────
  addictionBlock: {
    gap: theme.spacing[4],
  },
  modeRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
  },
  modeCard: {
    flex: 1,
    padding: theme.spacing[4],
    borderRadius: theme.borderRadius['2xl'],
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
    backgroundColor: theme.colors.white,
    gap: theme.spacing[1],
  },
  modeCardActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLightest,
  },
  modeCardTitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
  modeCardTitleActive: {
    color: theme.colors.primary,
  },
  modeCardDesc: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
  },
  periodRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    backgroundColor: theme.colors.background.PRIMARY,
    borderRadius: theme.borderRadius.full,
    padding: theme.spacing[1],
  },
  periodBtn: {
    flex: 1,
    paddingVertical: theme.spacing[2],
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: theme.colors.white,
  },
  periodBtnText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  periodBtnTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
  addictionCallout: {
    backgroundColor: '#FEF2F2',
    borderRadius: theme.borderRadius['2xl'],
    padding: theme.spacing[4],
    borderLeftWidth: 3,
    borderLeftColor: '#DC2626',
  },
  addictionCalloutText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: '#DC2626',
    lineHeight: 22,
  },
  addictionDesc: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 30,
  },
  addictionNote: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    lineHeight: 22,
  },
}));

AddGoalSheet.displayName = 'AddGoalSheet';

export default AddGoalSheet;
