import React, { useCallback, useState } from 'react';
import { View, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';

import { Text } from '#components/atoms';
import { StyleSheet, useStyles } from '#theme/unistyles';
import {
  addictionStorage,
  goalStorage,
  battleStorage,
  formatDuration,
  AddictionUse,
} from '#/utils';

const DAY_MS = 86400000;
const DAY_LABELS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

interface AnalyticsData {
  hasData: boolean;
  personalBestMs: number | null;
  longestActiveMs: number | null;
  totalSessions: number;
  completedSessions: number;
  confrontationCount: number;
  addictionCount: number;
  hasLimitGoal: boolean;
  weekUsesTotal: number;
  dailyUses: number[]; // 7
  dayLabels: string[]; // 7
}

const EMPTY: AnalyticsData = {
  hasData: false,
  personalBestMs: null,
  longestActiveMs: null,
  totalSessions: 0,
  completedSessions: 0,
  confrontationCount: 0,
  addictionCount: 0,
  hasLimitGoal: false,
  weekUsesTotal: 0,
  dailyUses: [0, 0, 0, 0, 0, 0, 0],
  dayLabels: [],
};

async function computeAnalytics(): Promise<AnalyticsData> {
  const [sessions, cats, activeGoals, configs, confLogs, battles] = await Promise.all([
    addictionStorage.getAll(),
    goalStorage.getAllGoalCategories(),
    goalStorage.getActiveGoals(),
    goalStorage.getAllAddictionConfigs(),
    goalStorage.getConfrontationLogs(),
    battleStorage.getAll(),
  ]);

  const now = Date.now();
  const completed = sessions.filter(s => s.durationMs !== null);
  const active = sessions.filter(s => s.endTime === null);

  const personalBestMs = completed.length
    ? Math.max(...completed.map(s => s.durationMs as number))
    : null;
  const longestActiveMs = active.length
    ? Math.max(...active.map(s => now - s.startTime))
    : null;

  const addictionGoals = activeGoals.filter(id => cats[id] === 'addiction');
  const hasLimitGoal = addictionGoals.some(id => configs[id]?.mode === 'limit');

  // Tüm kullanım kayıtlarını topla (limit modu)
  let allUses: AddictionUse[] = [];
  for (const id of addictionGoals) {
    const u = await addictionStorage.getUses(id);
    allUses = allUses.concat(u);
  }

  // Son 7 günün günlük kullanım kovaları
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = today.getTime() - 6 * DAY_MS;
  const dailyUses = [0, 0, 0, 0, 0, 0, 0];
  const dayLabels: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start + i * DAY_MS);
    dayLabels.push(DAY_LABELS[(d.getDay() + 6) % 7]);
  }
  let weekUsesTotal = 0;
  for (const use of allUses) {
    if (use.time >= start) {
      const idx = Math.floor((use.time - start) / DAY_MS);
      if (idx >= 0 && idx < 7) {
        dailyUses[idx]++;
        weekUsesTotal++;
      }
    }
  }

  const hasData = sessions.length > 0 || addictionGoals.length > 0 || battles.length > 0;

  return {
    hasData,
    personalBestMs,
    longestActiveMs,
    totalSessions: sessions.length,
    completedSessions: completed.length,
    confrontationCount: confLogs.length,
    addictionCount: addictionGoals.length,
    hasLimitGoal,
    weekUsesTotal,
    dailyUses,
    dayLabels,
  };
}

export default function AnalyticsScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<AnalyticsData>(EMPTY);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      computeAnalytics().then(d => {
        if (alive) setData(d);
      });
      return () => {
        alive = false;
      };
    }, [])
  );

  // Gösterilecek gerçek stat kartları (yalnızca verisi olanlar)
  const cards: { icon: string; value: string; label: string }[] = [];
  if (data.personalBestMs !== null) {
    cards.push({ icon: '🏆', value: formatDuration(data.personalBestMs), label: 'Kişisel Rekor' });
  }
  if (data.longestActiveMs !== null) {
    cards.push({ icon: '⏱', value: formatDuration(data.longestActiveMs), label: 'En Uzun Aktif Seri' });
  }
  if (data.addictionCount > 0) {
    cards.push({ icon: '🔁', value: `${data.totalSessions}`, label: 'Toplam Tur' });
    cards.push({ icon: '🪞', value: `${data.confrontationCount}`, label: 'Yüzleşme' });
  }

  const maxBar = Math.max(1, ...data.dailyUses);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>İstatistikler</Text>
        <Text style={styles.headerSubtitle}>Sadece gerçek verin</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {!data.hasData ? (
          // ── Dürüst boş durum ──────────────────────────────────────────────
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🪞</Text>
            <Text style={styles.emptyTitle}>Henüz yeterli veri yok</Text>
            <Text style={styles.emptyText}>
              Birkaç gün kullandıkça istatistiklerin burada birikecek. Uydurma sayı göstermeyiz.
            </Text>
          </View>
        ) : (
          <>
            {/* Gerçek stat kartları */}
            {cards.length > 0 && (
              <View style={styles.statsGrid}>
                {cards.map((c, i) => (
                  <View key={i} style={styles.statCard}>
                    <Text style={styles.statIcon}>{c.icon}</Text>
                    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>
                      {c.value}
                    </Text>
                    <Text style={styles.statLabel}>{c.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Limit modu varsa: son 7 günün gerçek kullanım grafiği */}
            {data.hasLimitGoal && (
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>Son 7 Gün — Kullanım</Text>
                {data.weekUsesTotal === 0 ? (
                  <Text style={styles.chartEmpty}>Bu hafta henüz kullanım kaydı yok.</Text>
                ) : (
                  <View style={styles.chart}>
                    {data.dailyUses.map((count, index) => (
                      <View key={index} style={styles.chartBarContainer}>
                        <Text style={styles.chartCount}>{count > 0 ? count : ''}</Text>
                        <View style={styles.chartBarWrapper}>
                          <View
                            style={[
                              styles.chartBar,
                              {
                                height: `${(count / maxBar) * 100}%`,
                                backgroundColor:
                                  count > 0 ? theme.colors.primary : theme.colors.border.PRIMARY,
                              },
                            ]}
                          />
                        </View>
                        <Text style={styles.chartLabel}>{data.dayLabels[index]}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            )}

            {/* Genel özet — gerçek */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Genel</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Aktif bağımlılık</Text>
                <Text style={styles.summaryValue}>{data.addictionCount}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tamamlanan tur</Text>
                <Text style={styles.summaryValue}>{data.completedSessions}</Text>
              </View>
              {data.hasLimitGoal && (
                <View style={[styles.summaryRow, styles.summaryRowLast]}>
                  <Text style={styles.summaryLabel}>Bu hafta kullanım</Text>
                  <Text style={styles.summaryValue}>{data.weekUsesTotal}</Text>
                </View>
              )}
            </View>
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

  // Boş durum
  emptyCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[8],
    alignItems: 'center',
    marginTop: theme.spacing[6],
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: theme.spacing[4],
  },
  emptyTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[2],
    textAlign: 'center',
  },
  emptyText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[3],
    marginBottom: theme.spacing[4],
  },
  statCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[5],
    alignItems: 'center',
    flex: 1,
    minWidth: '45%',
  },
  statIcon: {
    fontSize: 36,
    marginBottom: theme.spacing[2],
  },
  statValue: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[1],
    textAlign: 'center',
  },
  statLabel: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
  },

  chartCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[5],
    marginBottom: theme.spacing[4],
  },
  chartTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[4],
  },
  chartEmpty: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 150,
  },
  chartBarContainer: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
  },
  chartCount: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[1],
  },
  chartBarWrapper: {
    flex: 1,
    width: '60%',
    justifyContent: 'flex-end',
    marginBottom: theme.spacing[2],
  },
  chartBar: {
    width: '100%',
    borderRadius: theme.borderRadius.md,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },

  summaryCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[5],
  },
  summaryTitle: {
    fontSize: theme.fontSizes.lg,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[4],
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.PRIMARY,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  summaryValue: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
}));
