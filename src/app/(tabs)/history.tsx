import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { Text } from '#components/atoms';
import { StyleSheet, useStyles } from '#theme/unistyles';
import { battleStorage, addictionStorage, formatDuration } from '#/utils';
import type { HabitBattle, AddictionSession } from '#/utils';

// Unified goal metadata lookup (habits + addictions)
const GOAL_LOOKUP: Record<string, { icon: string; title: string }> = {
  water: { icon: '💧', title: 'Su Takibi' },
  exercise: { icon: '🏃', title: 'Spor' },
  budget: { icon: '💰', title: 'Bütçe' },
  sleep: { icon: '🌙', title: 'Uyku' },
  steps: { icon: '👟', title: 'Adım' },
  weight: { icon: '⚖️', title: 'Kilo' },
  medicine: { icon: '💊', title: 'İlaç' },
  savings: { icon: '🏦', title: 'Birikim' },
  reading: { icon: '📚', title: 'Kitap' },
  focus: { icon: '🎯', title: 'Odaklanma' },
  learning: { icon: '🧠', title: 'Öğrenme' },
  meditation: { icon: '🧘', title: 'Meditasyon' },
  journal: { icon: '✍️', title: 'Günlük' },
  gratitude: { icon: '🙏', title: 'Şükran' },
  quit_smoking: { icon: '🚭', title: 'Sigara' },
  social_detox: { icon: '📵', title: 'Ekran Süresi' },
  no_junk: { icon: '🥗', title: 'Sağlıklı Beslenme' },
  call_family: { icon: '👨‍👩‍👧', title: 'Aile' },
  quality_time: { icon: '❤️', title: 'Kaliteli Zaman' },
  smoking: { icon: '🚬', title: 'Sigara' },
  alcohol: { icon: '🍺', title: 'Alkol' },
  social_media: { icon: '📱', title: 'Sosyal Medya' },
  gaming: { icon: '🎮', title: 'Aşırı Oyun' },
  sugar: { icon: '🍭', title: 'Şeker' },
  binge_watch: { icon: '📺', title: 'Dizi / Binge' },
  pornography: { icon: '🔞', title: 'Pornografi' },
};

const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

function getDayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDayLabel(dayKey: string): string {
  const today = getDayKey(Date.now());
  const yesterday = getDayKey(Date.now() - 86400000);
  if (dayKey === today) return 'Bugün';
  if (dayKey === yesterday) return 'Dün';
  const [, month, day] = dayKey.split('-').map(Number);
  return `${day} ${TR_MONTHS[month - 1]}`;
}

function formatDateShort(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]}`;
}

interface DayEntry {
  dayKey: string;
  label: string;
  goals: Array<{ goalId: string; icon: string; title: string; won: boolean }>;
  wonCount: number;
}

function buildDayEntries(battles: HabitBattle[]): DayEntry[] {
  const byDay: Record<string, HabitBattle[]> = {};
  for (const b of battles) {
    const key = getDayKey(b.timestamp);
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(b);
  }

  return Object.entries(byDay)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 30)
    .map(([dayKey, dayBattles]) => {
      // Best per goal: prefer won, then latest
      const byGoal: Record<string, HabitBattle> = {};
      for (const b of dayBattles) {
        const existing = byGoal[b.goalId];
        if (!existing || b.won || b.timestamp > existing.timestamp) {
          byGoal[b.goalId] = b;
        }
      }
      const unique = Object.values(byGoal);
      const goals = unique.map(b => {
        const meta = GOAL_LOOKUP[b.goalId];
        return { goalId: b.goalId, icon: meta?.icon ?? '❓', title: meta?.title ?? b.goalId, won: b.won };
      });
      return { dayKey, label: formatDayLabel(dayKey), goals, wonCount: goals.filter(g => g.won).length };
    });
}

export default function HistoryScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [dayEntries, setDayEntries] = useState<DayEntry[]>([]);
  const [addictionSessions, setAddictionSessions] = useState<AddictionSession[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    const [battles, sessions] = await Promise.all([
      battleStorage.getAll(),
      addictionStorage.getAll(),
    ]);
    setDayEntries(buildDayEntries(battles));
    setAddictionSessions(
      sessions.filter(s => s.endTime !== null).sort((a, b) => b.startTime - a.startTime)
    );
  };

  const hasHabitData = dayEntries.length > 0;
  const hasAddictionData = addictionSessions.length > 0;
  const isEmpty = !hasHabitData && !hasAddictionData;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Geçmiş</Text>
        <Text style={styles.headerSubtitle}>Tüm turların burada</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {isEmpty && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>Henüz kayıt yok</Text>
            <Text style={styles.emptySubtitle}>
              Check-in yaptıkça geçmişin burada birikecek.
            </Text>
          </View>
        )}

        {/* Habit history — day cards */}
        {hasHabitData && (
          <>
            <Text style={styles.sectionTitle}>Alışkanlık Turları</Text>
            {dayEntries.map(entry => {
              const allWon = entry.wonCount === entry.goals.length;
              return (
                <View key={entry.dayKey} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayLabel}>{entry.label}</Text>
                    <View style={[styles.winBadge, allWon && styles.winBadgeFull]}>
                      <Text style={[styles.winBadgeText, allWon && styles.winBadgeTextFull]}>
                        {entry.wonCount}/{entry.goals.length} hedef
                      </Text>
                    </View>
                  </View>
                  <View style={styles.goalsRow}>
                    {entry.goals.map(g => (
                      <View key={g.goalId} style={[styles.goalChip, g.won && styles.goalChipWon]}>
                        <Text style={styles.goalChipEmoji}>{g.icon}</Text>
                        <Text style={[styles.goalChipText, g.won && styles.goalChipTextWon]}>
                          {g.title}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })}
          </>
        )}

        {/* Addiction history — session cards */}
        {hasAddictionData && (
          <>
            <Text style={[styles.sectionTitle, hasHabitData && styles.sectionTitleSpaced]}>
              Bağımlılık Turları
            </Text>
            {addictionSessions.map(session => {
              const meta = GOAL_LOOKUP[session.goalId];
              return (
                <View key={session.id} style={styles.sessionCard}>
                  <View style={styles.sessionIconBox}>
                    <Text style={styles.sessionEmoji}>{meta?.icon ?? '❓'}</Text>
                  </View>
                  <View style={styles.sessionInfo}>
                    <Text style={styles.sessionTitle}>{meta?.title ?? session.goalId}</Text>
                    <Text style={styles.sessionDates}>
                      {formatDateShort(session.startTime)}
                      {session.endTime ? ` → ${formatDateShort(session.endTime)}` : ''}
                    </Text>
                  </View>
                  <Text style={styles.sessionDuration}>
                    {formatDuration(session.durationMs ?? Date.now() - session.startTime)}
                  </Text>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  header: {
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[4],
  },
  headerTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[1],
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[24],
  },

  // ── Empty state ────────────────────────────────────────────────────────────
  emptyState: {
    alignItems: 'center',
    paddingTop: theme.spacing[16],
    gap: theme.spacing[2],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing[2],
  },
  emptyTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  emptySubtitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
  },

  // ── Section headings ───────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: theme.spacing[3],
  },
  sectionTitleSpaced: {
    marginTop: theme.spacing[6],
  },

  // ── Day cards (habits) ─────────────────────────────────────────────────────
  dayCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  dayLabel: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
  winBadge: {
    backgroundColor: theme.colors.primaryLightest,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[1],
  },
  winBadgeFull: {
    backgroundColor: '#F0FDF4',
  },
  winBadgeText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
  },
  winBadgeTextFull: {
    color: theme.colors.success,
  },
  goalsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[1],
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
    borderRadius: theme.borderRadius['3xl'],
    backgroundColor: theme.colors.background.PRIMARY,
  },
  goalChipWon: {
    backgroundColor: '#F0FDF4',
  },
  goalChipEmoji: {
    fontSize: 14,
  },
  goalChipText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  goalChipTextWon: {
    color: theme.colors.success,
    fontFamily: theme.fontFamily.semiBold,
  },

  // ── Session cards (addictions) ─────────────────────────────────────────────
  sessionCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[4],
    marginBottom: theme.spacing[3],
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  sessionIconBox: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius['4xl'],
    backgroundColor: theme.colors.primaryLighter,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionEmoji: {
    fontSize: 22,
  },
  sessionInfo: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[1],
  },
  sessionDates: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  sessionDuration: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
}));
