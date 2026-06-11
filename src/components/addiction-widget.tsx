import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Modal, Platform, TouchableOpacity, View } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';

import { StyleSheet, useStyles } from '#theme/unistyles';
import { Text } from './atoms';
import GlassCard from './glass-card';
import ProgressRing from './progress-ring';
import { addictionStorage, formatDuration, goalStorage } from '#/utils';

type PickerMode = 'edit-start' | 'new-round';

const TIME_OFFSETS = [
  { label: 'Şimdi', ms: 0 },
  { label: '1 sa önce', ms: 60 * 60 * 1000 },
  { label: '3 sa önce', ms: 3 * 60 * 60 * 1000 },
  { label: '6 sa önce', ms: 6 * 60 * 60 * 1000 },
  { label: 'Dün', ms: 24 * 60 * 60 * 1000 },
  { label: '2 gün önce', ms: 2 * 24 * 60 * 60 * 1000 },
  { label: '3 gün önce', ms: 3 * 24 * 60 * 60 * 1000 },
];

export interface AddictionWidgetProps {
  id: string;
  icon: string;
  title: string;
  onRemove?: () => void;
}

export default function AddictionWidget({ id, icon, title, onRemove }: AddictionWidgetProps) {
  const { styles, theme } = useStyles(stylesheet);
  const router = useRouter();
  const sheetRef = useRef<BottomSheetModal>(null);

  const [mode, setMode] = useState<'abstinence' | 'limit'>('abstinence');
  const [limitPeriod, setLimitPeriod] = useState<'daily' | 'weekly'>('weekly');
  const [limit, setLimit] = useState(3);
  const [unit, setUnit] = useState<'count' | 'minutes'>('count');
  const [usesCurrent, setUsesCurrent] = useState(0);
  const [usesPrevious, setUsesPrevious] = useState(0);

  const [sessionStart, setSessionStart] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [pickerMode, setPickerMode] = useState<PickerMode | null>(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedOffset, setSelectedOffset] = useState(0);
  const [pickedDate, setPickedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => { loadStats(); }, [id]);

  useEffect(() => {
    if (sessionStart === null) return;
    setElapsed(Date.now() - sessionStart);
    const interval = setInterval(() => setElapsed(Date.now() - sessionStart!), 30000);
    return () => clearInterval(interval);
  }, [sessionStart]);

  const loadStats = async () => {
    const config = await goalStorage.getAddictionConfig(id);
    setMode(config.mode);
    if (config.mode === 'limit') {
      const period = config.limitPeriod ?? 'weekly';
      setLimitPeriod(period);
      setLimit(config.limit ?? 3);
      setUnit(config.unit ?? 'count');
      const { current, previous } = await addictionStorage.getUsage(id, period);
      setUsesCurrent(current);
      setUsesPrevious(previous);
      return;
    }
    const stats = await addictionStorage.getStats(id);
    setSessionStart(stats.currentSessionStart);
    setPersonalBest(stats.personalBestMs);
    if (stats.currentSessionStart !== null) {
      setElapsed(Date.now() - stats.currentSessionStart);
    }
  };

  const refreshUsage = async () => {
    const { current, previous } = await addictionStorage.getUsage(id, limitPeriod);
    setUsesCurrent(current);
    setUsesPrevious(previous);
  };

  const handleLogUse = async (amount = 1) => {
    await addictionStorage.logUse(id, amount);
    await refreshUsage();
  };

  const handleUndoUse = async () => {
    await addictionStorage.undoLastUse(id);
    await refreshUsage();
  };

  const changeLimit = async (direction: number) => {
    const step = unit === 'minutes' ? 15 : 1;
    const next = Math.max(step, limit + direction * step);
    setLimit(next);
    await goalStorage.setAddictionConfig(id, { mode: 'limit', limitPeriod, limit: next, unit });
  };

  const openPicker = (mode: PickerMode) => {
    setPickerMode(mode);
    setSelectedOffset(0);
    setPickedDate(new Date());
    setShowDatePicker(false);
  };

  const handlePillSelect = (ms: number) => {
    setSelectedOffset(ms);
    setPickedDate(new Date(Date.now() - ms));
    setShowDatePicker(false);
  };

  const handleDateChange = (_e: DateTimePickerEvent, date?: Date) => {
    if (date) { setPickedDate(date); setSelectedOffset(-1); }
  };

  const getConfirmTime = () => pickedDate.getTime();

  const handleSaveStart = async () => {
    const newStart = getConfirmTime();
    await addictionStorage.updateSessionStart(id, newStart);
    setSessionStart(newStart);
    setElapsed(Date.now() - newStart);
    setPickerMode(null);
    sheetRef.current?.dismiss();
  };

  const handleConfirmNewRound = async () => {
    const roundTime = getConfirmTime();
    await addictionStorage.relapseAt(id, roundTime);
    const session = await addictionStorage.startSessionAt(id, roundTime);
    setSessionStart(session.startTime);
    setElapsed(Date.now() - session.startTime);
    const stats = await addictionStorage.getStats(id);
    setPersonalBest(stats.personalBestMs);
    setPickerMode(null);
    sheetRef.current?.dismiss();
  };

  const handleRemoveTap = () => {
    sheetRef.current?.dismiss();
    setTimeout(() => setShowRemoveModal(true), 300);
  };

  const handleConfirmRemove = async () => {
    await goalStorage.removeGoal(id);
    await addictionStorage.purgeGoal(id);
    setShowRemoveModal(false);
    onRemove?.();
  };

  const snapPoints = useMemo(() => ['50%', '85%'], []);

  // dolma halka: limit modunda kullanım/sınır, direniş modunda aktif tur/rekor
  const best = personalBest ?? 0;
  const ringPct =
    mode === 'limit'
      ? limit > 0
        ? Math.min(1, usesCurrent / limit)
        : 0
      : best > 0
        ? Math.min(1, elapsed / best)
        : 0;

  return (
    <>
      {/* ── Kompakt glass satır (anasayfa) ─────────────────────────────────── */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() =>
          router.push({ pathname: '/addiction/[id]', params: { id, icon, title } })
        }>
        <GlassCard radius={22}>
          <View style={styles.row}>
            <Text style={styles.rowEmoji}>{icon}</Text>
            <View style={styles.rowMid}>
              <Text style={styles.rowName}>{title}</Text>
              {mode === 'limit' ? (
                <Text style={styles.rowSub} numberOfLines={1}>
                  {limitPeriod === 'daily' ? 'bugün ' : 'bu hafta '}
                  <Text style={styles.rowVal}>
                    {usesCurrent}/{limit}{unit === 'minutes' ? ' dk' : ''}
                  </Text>
                  {usesCurrent < limit
                    ? unit === 'minutes'
                      ? ` · ${limit - usesCurrent} dk kaldı`
                      : ` · ${limit - usesCurrent} hakkın kaldı`
                    : usesCurrent === limit
                      ? ' · sınırdasın'
                      : unit === 'minutes'
                        ? ` · ${usesCurrent - limit} dk fazla`
                        : ` · ${usesCurrent - limit} fazla`}
                </Text>
              ) : (
                <Text style={styles.rowSub} numberOfLines={1}>
                  aktif tur{' '}
                  <Text style={styles.rowVal}>
                    {sessionStart !== null ? formatDuration(elapsed) : '—'}
                  </Text>
                  {best > 0 ? ` · 🏆 ${formatDuration(best)}` : ''}
                </Text>
              )}
            </View>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => { setPickerMode(null); sheetRef.current?.present(); }}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <ProgressRing
                progress={ringPct}
                mode="percent"
                label={`${Math.round(ringPct * 100)}%`}
                color={mode === 'limit' ? '#FFB86B' : undefined}
              />
            </TouchableOpacity>
          </View>
        </GlassCard>
      </TouchableOpacity>

      {/* ── Bottom sheet ────────────────────────────────────────────────────── */}
      <BottomSheetModal
        ref={sheetRef}
        snapPoints={snapPoints}
        backgroundStyle={styles.sheetBg}
        handleIndicatorStyle={styles.sheetHandle}>
        <BottomSheetScrollView
          contentContainerStyle={styles.sheetContent}
          keyboardShouldPersistTaps="handled">
          {pickerMode === null ? (
            mode === 'limit' ? (
              <>
                {/* Limit mode actions */}
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{icon}  {title}</Text>
                  <Text style={styles.sheetSubtitle}>
                    {limitPeriod === 'daily' ? 'Bugün' : 'Bu hafta'}: {usesCurrent} / {limit}
                    {unit === 'minutes' ? ' dk' : ''}
                    {usesPrevious > 0
                      ? `   ·   ${limitPeriod === 'daily' ? 'dün' : 'geçen hafta'} ${usesPrevious}${
                          unit === 'minutes' ? ' dk' : ''
                        }`
                      : ''}
                  </Text>
                </View>

                {unit === 'minutes' ? (
                  <View style={styles.quickAddRow}>
                    {[15, 30, 60].map(m => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.actionBtn, styles.quickAddBtn]}
                        activeOpacity={0.7}
                        onPress={() => handleLogUse(m)}>
                        <Text style={styles.actionBtnText}>+{m} dk</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                    onPress={() => handleLogUse(1)}>
                    <Text style={styles.actionBtnText}>Kullandım (+1)</Text>
                  </TouchableOpacity>
                )}

                {usesCurrent > 0 && (
                  <TouchableOpacity
                    style={styles.actionBtn}
                    activeOpacity={0.7}
                    onPress={handleUndoUse}>
                    <Text style={styles.actionBtnText}>
                      {unit === 'minutes' ? 'Son girişi geri al' : 'Geri al (−1)'}
                    </Text>
                  </TouchableOpacity>
                )}

                <View style={styles.limitEditor}>
                  <TouchableOpacity
                    style={styles.limitBtn}
                    activeOpacity={0.7}
                    onPress={() => changeLimit(-1)}>
                    <Text style={styles.limitBtnText}>−</Text>
                  </TouchableOpacity>
                  <Text style={styles.limitLabel}>
                    {limitPeriod === 'daily' ? 'Günlük' : 'Haftalık'} izin: {limit}
                    {unit === 'minutes' ? ' dk' : ''}
                  </Text>
                  <TouchableOpacity
                    style={styles.limitBtn}
                    activeOpacity={0.7}
                    onPress={() => changeLimit(1)}>
                    <Text style={styles.limitBtnText}>+</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.dangerBtn}
                  activeOpacity={0.7}
                  onPress={handleRemoveTap}>
                  <Text style={styles.dangerBtnText}>Kaldır</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Abstinence mode actions */}
                <View style={styles.sheetHeader}>
                  <Text style={styles.sheetTitle}>{icon}  {title}</Text>
                  {sessionStart !== null && (
                    <Text style={styles.sheetSubtitle}>Aktif tur: {formatDuration(elapsed)}</Text>
                  )}
                </View>

                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                  onPress={() => openPicker('edit-start')}>
                  <Text style={styles.actionBtnText}>Başlangıcı Düzenle</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.7}
                  onPress={() => openPicker('new-round')}>
                  <Text style={styles.actionBtnText}>Yeni Tur Başlat</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.dangerBtn}
                  activeOpacity={0.7}
                  onPress={handleRemoveTap}>
                  <Text style={styles.dangerBtnText}>Kaldır</Text>
                </TouchableOpacity>
              </>
            )
          ) : (
            <>
              {/* Time picker */}
              <View style={styles.sheetHeader}>
                <Text style={styles.sheetTitle}>
                  {pickerMode === 'edit-start' ? 'Bu tur ne zaman başladı?' : 'Ne zaman oldu?'}
                </Text>
              </View>

              <View style={styles.offsetPills}>
                {TIME_OFFSETS.map(opt => {
                  const isActive = selectedOffset === opt.ms;
                  return (
                    <TouchableOpacity
                      key={opt.ms}
                      activeOpacity={0.7}
                      onPress={() => handlePillSelect(opt.ms)}
                      style={[styles.pill, isActive && styles.pillActive]}>
                      <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                        {opt.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowDatePicker(v => !v)}
                style={[styles.pill, showDatePicker && styles.pillActive]}>
                <Text style={[styles.pillText, showDatePicker && styles.pillTextActive]}>
                  📅{'  '}
                  {selectedOffset === -1
                    ? pickedDate.toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
                    : 'Kesin tarih seç'}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={pickedDate}
                  mode="datetime"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  maximumDate={new Date()}
                  onChange={handleDateChange}
                  style={styles.datePicker}
                  locale="tr-TR"
                />
              )}

              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setPickerMode(null)}
                  style={styles.cancelBtn}>
                  <Text style={styles.cancelBtnText}>Geri</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={pickerMode === 'edit-start' ? handleSaveStart : handleConfirmNewRound}
                  style={styles.confirmBtn}>
                  <Text style={styles.confirmBtnText}>
                    {pickerMode === 'edit-start' ? 'Kaydet' : 'Yeni Tur'}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheetModal>

      {/* ── Remove confirm modal ─────────────────────────────────────────────── */}
      <Modal
        visible={showRemoveModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRemoveModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Hedefi kaldır</Text>
            <Text style={styles.modalDesc}>
              {icon} {title} hedefi ve tüm tur geçmişin silinecek.
            </Text>
            <View style={styles.actionRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowRemoveModal(false)}
                style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>Vazgeç</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleConfirmRemove}
                style={styles.removeConfirmBtn}>
                <Text style={styles.removeConfirmBtnText}>Kaldır</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  // ── Kompakt glass satır ─────────────────────────────────────────────────────
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

  // ── Card (eski, kullanılmıyor) ──────────────────────────────────────────────
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['6xl'],
    padding: theme.spacing[5],
    flex: 1,
    minWidth: '45%',
  },
  cardHeader: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[3],
  },
  timerLabel: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    letterSpacing: 0.8,
    marginBottom: theme.spacing[1],
  },
  timerValue: {
    fontSize: theme.fontSizes['3xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[1],
  },
  recordText: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },

  // ── Bottom sheet ───────────────────────────────────────────────────────────
  sheetBg: {
    backgroundColor: theme.colors.background.MODAL,
    borderTopLeftRadius: theme.borderRadius['6xl'],
    borderTopRightRadius: theme.borderRadius['6xl'],
  },
  sheetHandle: {
    backgroundColor: theme.colors.border.PRIMARY,
    width: 36,
  },
  sheetContent: {
    paddingHorizontal: theme.spacing[6],
    paddingBottom: theme.spacing[16],
  },
  sheetHeader: {
    paddingVertical: theme.spacing[5],
    marginBottom: theme.spacing[2],
  },
  sheetTitle: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[1],
  },
  sheetSubtitle: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  actionBtn: {
    backgroundColor: theme.colors.background.PRIMARY,
    borderRadius: theme.borderRadius['5xl'],
    paddingVertical: theme.spacing[4],
    alignItems: 'center',
    marginBottom: theme.spacing[3],
  },
  actionBtnText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
  dangerBtn: {
    paddingVertical: theme.spacing[3],
    alignItems: 'center',
    marginTop: theme.spacing[1],
  },
  dangerBtnText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    opacity: 0.55,
  },

  // ── Limit mode editor ──────────────────────────────────────────────────────
  limitEditor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[4],
    marginTop: theme.spacing[1],
    marginBottom: theme.spacing[3],
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[4],
    backgroundColor: theme.colors.background.PRIMARY,
    borderRadius: theme.borderRadius['5xl'],
  },
  limitBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  limitBtnText: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 26,
  },
  limitLabel: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
  },
  quickAddRow: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  quickAddBtn: {
    flex: 1,
  },

  // ── Picker ─────────────────────────────────────────────────────────────────
  offsetPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[3],
  },
  pill: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
    backgroundColor: theme.colors.background.PRIMARY,
    marginBottom: theme.spacing[1],
  },
  pillActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryLightest,
  },
  pillText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  pillTextActive: {
    color: theme.colors.primary,
    fontFamily: theme.fontFamily.semiBold,
  },
  datePicker: {
    width: '100%',
    marginBottom: theme.spacing[2],
  },
  actionRow: {
    flexDirection: 'row',
    gap: theme.spacing[3],
    marginTop: theme.spacing[4],
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.PRIMARY,
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.typography.PRIMARY,
    alignItems: 'center',
  },
  confirmBtnText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },

  // ── Remove modal ───────────────────────────────────────────────────────────
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[6],
  },
  modalCard: {
    backgroundColor: theme.colors.background.CARD,
    borderRadius: theme.borderRadius['5xl'],
    padding: theme.spacing[6],
    width: '100%',
  },
  modalTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[2],
  },
  modalDesc: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[6],
    lineHeight: 20,
  },
  removeConfirmBtn: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.danger.background,
    alignItems: 'center',
  },
  removeConfirmBtnText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.danger.text,
  },
}));
