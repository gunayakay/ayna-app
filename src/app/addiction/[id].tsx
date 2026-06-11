import React, { useCallback, useEffect, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import Svg, { Rect, Line } from 'react-native-svg';

import { Text } from '#components/atoms';
import SvgIcon from '#components/atoms/svg';
import GlassCard from '#components/glass-card';
import ProgressRing from '#components/progress-ring';
import { BackArrow, Reward } from '#assets/svg';
import { StyleSheet, useStyles } from '#theme/unistyles';
import { addictionStorage, goalStorage, formatDuration, RuleStats } from '#/utils';

const TR_DAY_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function AddictionDetailScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string; icon?: string; title?: string }>();

  const id = params.id;
  const icon = params.icon ?? '🚭';
  const title = params.title ?? 'Direniş';

  const [mode, setMode] = useState<'abstinence' | 'limit' | 'rule'>('abstinence');
  // rule
  const [ruleText, setRuleText] = useState('');
  const [ruleStats, setRuleStats] = useState<RuleStats | null>(null);
  // abstinence
  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [best, setBest] = useState<number | null>(null);
  const [rounds, setRounds] = useState(0);
  const [durations, setDurations] = useState<number[]>([]);
  // limit
  const [limit, setLimit] = useState(3);
  const [unit, setUnit] = useState<'count' | 'minutes'>('count');
  const [period, setPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [usesCurrent, setUsesCurrent] = useState(0);
  const [usesPrev, setUsesPrev] = useState(0);
  const [weekUsage, setWeekUsage] = useState<{ label: string; value: number }[]>([]);

  useFocusEffect(useCallback(() => { load(); }, [id]));

  useEffect(() => {
    if (sessionStart === null) return;
    setElapsed(Date.now() - sessionStart);
    const t = setInterval(() => setElapsed(Date.now() - sessionStart), 1000);
    return () => clearInterval(t);
  }, [sessionStart]);

  const load = async () => {
    const config = await goalStorage.getAddictionConfig(id);
    setMode(config.mode);
    if (config.mode === 'rule') {
      setRuleText(config.rule ?? '');
      setRuleStats(await addictionStorage.getRuleStats(id));
      return;
    }
    if (config.mode === 'limit') {
      const p = config.limitPeriod ?? 'weekly';
      setPeriod(p);
      setLimit(config.limit ?? 3);
      setUnit(config.unit ?? 'count');
      const { current, previous } = await addictionStorage.getUsage(id, p);
      setUsesCurrent(current);
      setUsesPrev(previous);
      // son 7 gün kullanım (getUses'tan)
      const uses = await addictionStorage.getUses(id);
      const byDay = new Map<string, number>();
      for (const u of uses) byDay.set(dayKey(u.time), (byDay.get(dayKey(u.time)) ?? 0) + (u.amount ?? 1));
      const now = Date.now();
      const w: { label: string; value: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now - i * 86400000);
        w.push({ label: TR_DAY_SHORT[d.getDay()], value: byDay.get(`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`) ?? 0 });
      }
      setWeekUsage(w);
      return;
    }
    const stats = await addictionStorage.getStats(id);
    setSessionStart(stats.currentSessionStart);
    setBest(stats.personalBestMs);
    setRounds(stats.totalSessions);
    setDurations(stats.allDurationsMs ?? []);
    if (stats.currentSessionStart !== null) setElapsed(Date.now() - stats.currentSessionStart);
  };

  const handleRelapse = async () => {
    const now = Date.now();
    await addictionStorage.relapseAt(id, now);
    const s = await addictionStorage.startSessionAt(id, now);
    setSessionStart(s.startTime);
    setElapsed(0);
    const stats = await addictionStorage.getStats(id);
    setBest(stats.personalBestMs);
    setRounds(stats.totalSessions);
    setDurations(stats.allDurationsMs ?? []);
  };

  const handleReduceLimit = async () => {
    const step = unit === 'minutes' ? 15 : 1;
    const next = Math.max(step, limit - step);
    setLimit(next);
    await goalStorage.setAddictionConfig(id, { mode: 'limit', limitPeriod: period, limit: next, unit });
  };

  const handleRuleMark = async (kept: boolean) => {
    await addictionStorage.setRuleToday(id, kept);
    setRuleStats(await addictionStorage.getRuleStats(id));
  };

  const u = unit === 'minutes' ? ' dk' : '';
  const ringPct =
    mode === 'limit'
      ? limit > 0 ? Math.min(1, usesCurrent / limit) : 0
      : best && best > 0 ? Math.min(1, elapsed / best) : 0;
  const maxBar = Math.max(limit, ...weekUsage.map(d => d.value), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bloom} pointerEvents="none" />
      <View style={styles.top}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <SvgIcon Icon={BackArrow} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{icon} {title}</Text>
        <View style={styles.iconBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {mode === 'abstinence' ? (
          <>
            {/* aktif tur */}
            <View style={styles.hero}>
              <ProgressRing progress={ringPct} mode="percent" label={`%${Math.round(ringPct * 100)}`} size={150} />
              <Text style={styles.heroVal}>{sessionStart !== null ? formatDuration(elapsed) : '—'}</Text>
              <Text style={styles.heroLabel}>şu anki turun</Text>
              {best && best > 0 ? (
                elapsed >= best ? (
                  <Text style={styles.underRing}>Rekorunu geçtin — bu senin en uzun turun 🎉</Text>
                ) : (
                  <Text style={styles.underRing}>Rekoruna {formatDuration(best - elapsed)} kaldı</Text>
                )
              ) : (
                <Text style={styles.underRing}>İlk turundasın — rekorun sensin</Text>
              )}
            </View>

            <TouchableOpacity activeOpacity={0.8} style={styles.honestBtn} onPress={handleRelapse}>
              <Text style={styles.honestText}>Bugün içtim</Text>
            </TouchableOpacity>

            {/* rekor + ayağa kalkış */}
            <GlassCard radius={20} style={styles.card}>
              <View style={styles.cardPad}>
                <View style={styles.recordRow}>
                  <SvgIcon Icon={Reward} width={26} height={26} stroke={theme.colors.primaryDarker} strokeWidth={1.6} />
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.recVal}>{best ? formatDuration(best) : '—'}</Text>
                    <Text style={styles.recLabel}>en uzun turun</Text>
                  </View>
                  <View style={styles.cbCol}>
                    <Text style={styles.cbNum}>{rounds}</Text>
                    <Text style={styles.cbLabel}>kez{'\n'}ayağa kalktın</Text>
                  </View>
                </View>
              </View>
            </GlassCard>

            {/* geçmiş turlar */}
            {durations.length > 0 && (
              <GlassCard radius={20} style={styles.card}>
                <View style={styles.cardPad}>
                  <Text style={styles.cardLabel}>GEÇMİŞ TURLARIN</Text>
                  <Svg width="100%" height={60} viewBox="0 0 300 60" preserveAspectRatio="none">
                    {durations.slice(0, 8).reverse().map((ms, i, arr) => {
                      const mx = Math.max(...durations, 1);
                      const h = Math.max(4, (ms / mx) * 54);
                      const w = 300 / Math.min(8, arr.length) - 8;
                      const x = i * (300 / Math.min(8, arr.length)) + 4;
                      return <Rect key={i} x={x} y={60 - h} width={w} height={h} rx={5} fill="#FFB86B" />;
                    })}
                  </Svg>
                </View>
              </GlassCard>
            )}

            <Text style={styles.voice}>
              Ömür boyu düşünme — sadece bir sonraki turu. Önemli olan kaç kez düştüğün değil, kaç kez kalktığın.{rounds > 0 ? ` Şu ana kadar ${rounds}.` : ''}
            </Text>
          </>
        ) : mode === 'rule' ? (
          <>
            {/* kural */}
            <View style={styles.hero}>
              <Text style={styles.ruleBig}>“{ruleText}”</Text>
              <Text style={styles.heroLabel}>kuralın</Text>
            </View>

            <Text style={styles.askq}>Bugün kuralına uydun mu?</Text>
            <View style={styles.ruleBtns}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleRuleMark(true)}
                style={[styles.ruleBtn, ruleStats?.todayKept === true && styles.ruleBtnYes]}>
                <Text style={[styles.ruleBtnText, ruleStats?.todayKept === true && styles.ruleBtnTextOn]}>
                  ✓ Tuttum
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => handleRuleMark(false)}
                style={[styles.ruleBtn, ruleStats?.todayKept === false && styles.ruleBtnNo]}>
                <Text style={[styles.ruleBtnText, ruleStats?.todayKept === false && styles.ruleBtnTextOn]}>
                  Tutamadım
                </Text>
              </TouchableOpacity>
            </View>

            <GlassCard radius={20} style={styles.card}>
              <View style={styles.cardPad}>
                <View style={styles.recordRow}>
                  <Text style={styles.streakBig}>🔥 {ruleStats?.currentStreak ?? 0} <Text style={styles.streakUnit}>gün</Text></Text>
                  <View style={styles.cbCol}>
                    <Text style={styles.cbNum}>{ruleStats?.thisWeekKept ?? 0}/7</Text>
                    <Text style={styles.cbLabel}>bu hafta{'\n'}tuttun</Text>
                  </View>
                </View>
                <Text style={styles.recLabel}>en uzun seri: {ruleStats?.bestStreak ?? 0} gün</Text>
              </View>
            </GlassCard>

            <GlassCard radius={20} style={styles.card}>
              <View style={styles.cardPad}>
                <Text style={styles.cardLabel}>SON 7 GÜN</Text>
                <View style={styles.weekDots}>
                  {(ruleStats?.last7 ?? []).map((d, i) => (
                    <View key={i} style={styles.dayCol}>
                      <View
                        style={[
                          styles.dayDot,
                          d.kept === true && styles.dayDotKept,
                          d.kept === false && styles.dayDotMiss,
                        ]}>
                        {d.kept === true && <Text style={styles.dayTick}>✓</Text>}
                      </View>
                      <Text style={styles.dayLbl}>{d.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </GlassCard>

            <Text style={styles.voice}>
              Tutamadığın gün ceza değil — sadece veri. Tam bırakmak değil; kuralına uydukça savaşı küçük küçük kazanıyorsun.
            </Text>
          </>
        ) : (
          <>
            {/* limit kullanımı */}
            <View style={styles.hero}>
              <ProgressRing progress={ringPct} mode="percent" label={`%${Math.round(ringPct * 100)}`} size={150} color="#FFB86B" />
              <Text style={styles.heroVal}>{usesCurrent}<Text style={styles.heroMax}> / {limit}{u}</Text></Text>
              <Text style={styles.heroLabel}>{period === 'daily' ? 'bugün' : 'bu hafta'}</Text>
              <Text style={styles.underRing}>
                {usesCurrent < limit
                  ? `${limit - usesCurrent}${u} hakkın kaldı`
                  : usesCurrent === limit ? 'sınırdasın' : `${usesCurrent - limit}${u} aştın — sorun değil, sadece veri`}
              </Text>
            </View>

            {/* sınır azalt */}
            <GlassCard radius={20} style={styles.card}>
              <View style={styles.cardPad}>
                <Text style={styles.cardLabel}>{period === 'daily' ? 'GÜNLÜK' : 'HAFTALIK'} SINIRIN</Text>
                <Text style={styles.limitVal}>{limit}{u}</Text>
                {usesPrev > 0 && (
                  <Text style={styles.recLabel}>{period === 'daily' ? 'dün' : 'geçen hafta'}: {usesPrev}{u}</Text>
                )}
                <TouchableOpacity activeOpacity={0.8} style={styles.reduceBtn} onPress={handleReduceLimit}>
                  <Text style={styles.reduceText}>Sınırı {Math.max(unit === 'minutes' ? 15 : 1, limit - (unit === 'minutes' ? 15 : 1))}{u}'ya indireyim</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>

            {/* 7 gün kullanım */}
            <GlassCard radius={20} style={styles.card}>
              <View style={styles.cardPad}>
                <Text style={styles.cardLabel}>SON 7 GÜN{unit === 'minutes' ? ' · dk' : ''}</Text>
                <Svg width="100%" height={64} viewBox="0 0 300 64" preserveAspectRatio="none">
                  {period === 'daily' && (
                    <Line x1="0" y1={64 - (limit / maxBar) * 56} x2="300" y2={64 - (limit / maxBar) * 56}
                      stroke="rgba(240,140,46,0.55)" strokeWidth={1.5} strokeDasharray="5 5" />
                  )}
                  {weekUsage.map((d, i) => {
                    const h = Math.max(3, (d.value / maxBar) * 56);
                    const x = 6 + i * 42;
                    const isToday = i === weekUsage.length - 1;
                    return <Rect key={i} x={x} y={64 - h} width={30} height={h} rx={6} fill={isToday ? theme.colors.primary : '#FFB86B'} />;
                  })}
                </Svg>
                <View style={styles.barLabels}>
                  {weekUsage.map((d, i) => <Text key={i} style={styles.barLabel}>{d.label}</Text>)}
                </View>
              </View>
            </GlassCard>

            <Text style={styles.voice}>
              Aşmak başarısızlık değil — sadece veri. Sınırını gönüllü küçülttükçe savaşı kazanıyorsun.
            </Text>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: { flex: 1, backgroundColor: theme.colors.background.PRIMARY },
  bloom: { position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: 360, backgroundColor: theme.colors.primaryLighter, opacity: 0.45 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },
  topTitle: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY },
  scroll: { paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[16] },
  hero: { alignItems: 'center', paddingVertical: theme.spacing[5] },
  heroVal: { fontSize: theme.fontSizes['3xl'], fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY, marginTop: theme.spacing[4] },
  heroMax: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY },
  heroLabel: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY, marginTop: 2 },
  underRing: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: theme.colors.primaryDarker, marginTop: theme.spacing[3] },
  honestBtn: { height: 54, borderRadius: theme.borderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1.5, borderColor: theme.colors.border.PRIMARY, marginBottom: theme.spacing[3] },
  honestText: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.PRIMARY },
  card: { marginBottom: theme.spacing[3] },
  cardPad: { padding: theme.spacing[4] },
  cardLabel: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY, letterSpacing: 0.8, marginBottom: theme.spacing[2] },
  recordRow: { flexDirection: 'row', alignItems: 'center' },
  recVal: { fontSize: theme.fontSizes.xl, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY },
  recLabel: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY, marginTop: 1 },
  cbCol: { marginLeft: 'auto', alignItems: 'flex-end' },
  cbNum: { fontSize: theme.fontSizes['2xl'], fontFamily: theme.fontFamily.extraBold, color: theme.colors.primaryDarker },
  cbLabel: { fontSize: 10, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY, textAlign: 'right' },
  limitVal: { fontSize: theme.fontSizes['2xl'], fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY },
  reduceBtn: { marginTop: theme.spacing[3], height: 46, borderRadius: theme.borderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1.5, borderColor: theme.colors.border.PRIMARY },
  reduceText: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.PRIMARY },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[2], paddingHorizontal: 4 },
  barLabel: { fontSize: 9, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.TERTIARY, width: 36, textAlign: 'center' },
  voice: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY, fontStyle: 'italic', textAlign: 'center', lineHeight: 20, paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[4] },
  // rule
  streakBig: { fontSize: theme.fontSizes['2xl'], fontFamily: theme.fontFamily.extraBold, color: theme.colors.primaryDarker },
  streakUnit: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY },
  ruleBig: { fontSize: theme.fontSizes['2xl'], fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY, textAlign: 'center', lineHeight: 32, paddingHorizontal: theme.spacing[2] },
  askq: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY, textAlign: 'center', marginBottom: theme.spacing[3] },
  ruleBtns: { flexDirection: 'row', gap: theme.spacing[3], marginBottom: theme.spacing[3] },
  ruleBtn: { flex: 1, height: 52, borderRadius: theme.borderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1.5, borderColor: theme.colors.border.PRIMARY },
  ruleBtnYes: { backgroundColor: 'rgba(54,179,126,0.16)', borderColor: theme.colors.success },
  ruleBtnNo: { backgroundColor: theme.colors.primaryLightest, borderColor: theme.colors.primary },
  ruleBtnText: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY },
  ruleBtnTextOn: { color: theme.colors.typography.PRIMARY },
  weekDots: { flexDirection: 'row', justifyContent: 'space-between' },
  dayCol: { alignItems: 'center', gap: 6 },
  dayDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.06)' },
  dayDotKept: { backgroundColor: theme.colors.success },
  dayDotMiss: { backgroundColor: theme.colors.primaryLighter },
  dayTick: { fontSize: 13, color: theme.colors.white, fontFamily: theme.fontFamily.bold },
  dayLbl: { fontSize: 9, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.TERTIARY },
}));
