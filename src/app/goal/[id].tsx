import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import Svg, { Rect, Line } from 'react-native-svg';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';

import { Text } from '#components/atoms';
import SvgIcon from '#components/atoms/svg';
import GlassCard from '#components/glass-card';
import ProgressRing from '#components/progress-ring';
import EditMenuSheet from '#components/edit-menu-sheet';
import { BackArrow, Dots } from '#assets/svg';
import { StyleSheet, useStyles } from '#theme/unistyles';
import { battleStorage, goalStorage } from '#/utils';

const TR_DAY_SHORT = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];

function dayKey(ts: number): string {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function GoalDetailScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    id: string;
    icon?: string;
    title?: string;
    unit?: string;
    maxValue?: string;
    value?: string;
  }>();

  const id = params.id;
  const icon = params.icon ?? '🎯';
  const title = params.title ?? 'Hedef';
  const unit = params.unit ?? '';
  const todayValue = Number(params.value ?? 0);

  const [maxValue, setMaxValue] = useState(Number(params.maxValue ?? 0));
  const [days, setDays] = useState<{ label: string; value: number; max: number }[]>([]);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [weekTotal, setWeekTotal] = useState(0);

  // düzenle/sil
  const editRef = useRef<BottomSheetModal>(null);
  const [targetDraft, setTargetDraft] = useState('');

  const openEdit = () => {
    setTargetDraft(maxValue > 0 ? String(maxValue) : '');
    editRef.current?.present();
  };

  const handleSaveTarget = async () => {
    const next = parseInt(targetDraft.replace(/[^0-9]/g, '') || '0', 10);
    if (!next || next <= 0) return;
    const existing = await goalStorage.getGoalSettings(id);
    await goalStorage.saveGoalSettings(id, {
      targetValue: next,
      frequency: existing?.frequency ?? { type: 'daily' },
    });
    setMaxValue(next);
    editRef.current?.dismiss();
  };

  const handleDelete = async () => {
    await goalStorage.removeGoal(id);
    editRef.current?.dismiss();
    router.back();
  };

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [id])
  );

  const loadHistory = async () => {
    const all = await battleStorage.getAll();
    const mine = all.filter(b => b.goalId === id);

    // günlük max değer
    const byDay = new Map<string, { value: number; max: number }>();
    for (const b of mine) {
      const k = dayKey(b.timestamp);
      const prev = byDay.get(k);
      if (!prev || b.value > prev.value) byDay.set(k, { value: b.value, max: b.maxValue });
    }

    // son 7 gün
    const now = Date.now();
    const last7: { label: string; value: number; max: number }[] = [];
    let total = 0;
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      const rec = byDay.get(k);
      const v = rec?.value ?? 0;
      total += v;
      last7.push({ label: TR_DAY_SHORT[d.getDay()], value: v, max: rec?.max ?? maxValue });
    }
    setDays(last7);
    setWeekTotal(total);

    // streak: bugünden/dünden geriye, hedefi tutturulan ardışık gün
    const won = (k: string) => {
      const r = byDay.get(k);
      return r ? r.max > 0 && r.value >= r.max : false;
    };
    let s = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(now - i * 86400000);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (won(k)) s++;
      else if (i === 0) continue; // bugün henüz yapılmamışsa streak kırılmaz
      else break;
    }
    setStreak(s);

    // en uzun streak
    const keys = [...byDay.keys()];
    let best = 0;
    // basit: son 60 günü tara
    let run = 0;
    for (let i = 60; i >= 0; i--) {
      const d = new Date(now - i * 86400000);
      const k = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (won(k)) { run++; best = Math.max(best, run); }
      else run = 0;
    }
    setBestStreak(Math.max(best, s, keys.length ? 0 : 0));
  };

  const progress = maxValue > 0 ? Math.min(1, todayValue / maxValue) : 0;
  const done = maxValue > 0 && todayValue >= maxValue;
  const avg = days.length ? Math.round(weekTotal / days.length) : 0;
  const hitDays = days.filter(d => d.max > 0 && d.value >= d.max).length;
  const maxBar = Math.max(maxValue, ...days.map(d => d.value), 1);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bloom} pointerEvents="none" />

      {/* top bar */}
      <View style={styles.top}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <SvgIcon Icon={BackArrow} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{icon} {title}</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={openEdit}>
          <SvgIcon Icon={Dots} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* büyük halka */}
        <View style={styles.hero}>
          <ProgressRing progress={progress} mode={done ? 'done' : 'percent'} label={`%${Math.round(progress * 100)}`} size={150} />
          <Text style={styles.heroVal}>
            {todayValue}<Text style={styles.heroMax}> / {maxValue} {unit}</Text>
          </Text>
          <Text style={styles.heroLabel}>bugün</Text>
        </View>

        {/* streak */}
        <GlassCard radius={20} style={styles.card}>
          <View style={styles.cardPad}>
            <View style={styles.streakRow}>
              <Text style={styles.streakBig}>🔥 {streak} <Text style={styles.streakUnit}>gün</Text></Text>
              <View style={styles.recCol}>
                <Text style={styles.recLabel}>en uzun</Text>
                <Text style={styles.recVal}>{bestStreak} gün</Text>
              </View>
            </View>
          </View>
        </GlassCard>

        {/* 7-gün grafik */}
        <GlassCard radius={20} style={styles.card}>
          <View style={styles.cardPad}>
          <Text style={styles.cardLabel}>SON 7 GÜN{unit ? ` · ${unit}` : ''}</Text>
          <Svg width="100%" height={72} viewBox="0 0 300 72" preserveAspectRatio="none">
            {maxValue > 0 && (
              <Line x1="0" y1={72 - (maxValue / maxBar) * 64} x2="300" y2={72 - (maxValue / maxBar) * 64}
                stroke="rgba(54,179,126,0.4)" strokeWidth={1} strokeDasharray="4 4" />
            )}
            {days.map((d, i) => {
              const h = Math.max(3, (d.value / maxBar) * 64);
              const x = 6 + i * 42;
              const isDone = d.max > 0 && d.value >= d.max;
              const isToday = i === days.length - 1;
              return (
                <Rect key={i} x={x} y={72 - h} width={30} height={h} rx={6}
                  fill={isDone ? theme.colors.success : isToday ? theme.colors.primary : '#FFB86B'} />
              );
            })}
          </Svg>
          <View style={styles.barLabels}>
            {days.map((d, i) => <Text key={i} style={styles.barLabel}>{d.label}</Text>)}
          </View>
          </View>
        </GlassCard>

        {/* istatistik */}
        <GlassCard radius={20} style={styles.card}>
          <View style={styles.cardPad}>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{weekTotal}<Text style={styles.statUnit}> {unit}</Text></Text>
              <Text style={styles.statLabel}>bu hafta toplam</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{avg}<Text style={styles.statUnit}> {unit}</Text></Text>
              <Text style={styles.statLabel}>günlük ort.</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statVal}>{hitDays}/7</Text>
              <Text style={styles.statLabel}>tutturma</Text>
            </View>
          </View>
          </View>
        </GlassCard>

        <Text style={styles.voice}>
          {streak >= 3
            ? `${streak} gündür aralıksız. Aynan berraklaşıyor — bunu sen yapıyorsun.`
            : hitDays > 0
              ? 'İz bırakmaya başladın. Devamı sende.'
              : 'Henüz bu hafta tutmadın. Bugün bir şeyle başla — gerisi gelir.'}
        </Text>
      </ScrollView>

      <EditMenuSheet
        ref={editRef}
        heading={`${icon} ${title}`}
        snapPoints={['48%']}
        onSave={handleSaveTarget}
        saveDisabled={!targetDraft.trim()}
        deleteLabel="Bu hedefi sil"
        deleteTitle="Hedefi sil"
        deleteMessage={`"${title}" ve tüm kayıtları silinecek. Bu geri alınamaz.`}
        onDelete={handleDelete}>
        <Text style={styles.editLabel}>Günlük hedef{unit ? ` (${unit})` : ''}</Text>
        <View style={styles.editField}>
          <BottomSheetTextInput
            style={styles.editInput}
            keyboardType="number-pad"
            value={targetDraft}
            onChangeText={setTargetDraft}
            placeholder="0"
            placeholderTextColor={theme.colors.typography.TERTIARY}
            maxLength={6}
            selectTextOnFocus
          />
          {!!unit && <Text style={styles.editUnit}>{unit}</Text>}
        </View>
      </EditMenuSheet>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: { flex: 1, backgroundColor: theme.colors.background.PRIMARY },
  bloom: {
    position: 'absolute', top: -120, right: -80, width: 360, height: 360, borderRadius: 360,
    backgroundColor: theme.colors.primaryLighter, opacity: 0.45,
  },
  top: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2],
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  topTitle: {
    fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY,
  },
  scroll: { paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[16] },
  hero: { alignItems: 'center', paddingVertical: theme.spacing[5] },
  heroVal: {
    fontSize: theme.fontSizes['3xl'], fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY, marginTop: theme.spacing[4],
  },
  heroMax: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY },
  heroLabel: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY, marginTop: 2 },
  card: { marginBottom: theme.spacing[3] },
  cardPad: { padding: theme.spacing[4] },
  cardLabel: {
    fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY,
    letterSpacing: 0.8, marginBottom: theme.spacing[3],
  },
  streakRow: { flexDirection: 'row', alignItems: 'center' },
  streakBig: { fontSize: theme.fontSizes['2xl'], fontFamily: theme.fontFamily.extraBold, color: theme.colors.primaryDarker },
  streakUnit: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY },
  recCol: { marginLeft: 'auto', alignItems: 'flex-end' },
  recLabel: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY },
  recVal: { fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: theme.spacing[2], paddingHorizontal: 4 },
  barLabel: { fontSize: 9, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.TERTIARY, width: 36, textAlign: 'center' },
  stats: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: theme.fontSizes.xl, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY },
  statUnit: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY },
  statLabel: { fontSize: 10, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY, marginTop: 2 },
  voice: {
    fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY,
    fontStyle: 'italic', textAlign: 'center', lineHeight: 20, paddingHorizontal: theme.spacing[4], paddingTop: theme.spacing[4],
  },
  editLabel: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY, marginBottom: theme.spacing[2] },
  editField: { flexDirection: 'row', alignItems: 'baseline', gap: theme.spacing[2], borderBottomWidth: 2, borderBottomColor: theme.colors.primaryLight, paddingBottom: theme.spacing[2] },
  editInput: { flex: 1, fontSize: 36, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY, padding: 0 },
  editUnit: { fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY },
}));
