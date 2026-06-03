import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '#components/atoms';
import Svg from '#components/atoms/svg';
import { BackArrow } from '#assets/svg';
import { StyleSheet, useStyles } from '#theme/unistyles';

const RESULTS_KEY = '@ayna/dev_test_results';
const ROUND_KEY = '@ayna/dev_test_round';

// Her yeni özellik geldiğinde elle test edilecek senaryolar.
const SCENARIOS: { group: string; items: string[] }[] = [
  {
    group: 'Onboarding',
    items: ['Welcome 3 slayt Türkçe görünüyor', 'İsim girince Ana Sayfa’ya düşüyor'],
  },
  {
    group: 'Kalıcılık (gerçek kapat-aç)',
    items: [
      'İsim kalıyor',
      'Eklenen bağımlılıklar kalıyor',
      'Tur / rekor doğru geri geliyor',
      'Avatar fotoğrafı kalıyor',
    ],
  },
  {
    group: 'Bağımlılık — Tamamen Bırak',
    items: [
      'Ekle → AKTİF TUR sayacı işliyor',
      'Yeni Tur → sayaç sıfırlanıyor, rekor korunuyor',
      'Başlangıcı Düzenle / geçmişe dönük çalışıyor',
    ],
  },
  {
    group: 'Bağımlılık — Sınırla',
    items: [
      'Periyot otomatik geliyor (günlük/haftalık)',
      'Kullandım (+1) sayıyor',
      'Geri al (−1) çalışıyor',
      'İzni düzenle çalışıyor',
      'BUGÜN / BU HAFTA etiketi doğru',
    ],
  },
  {
    group: 'Avatar',
    items: [
      'Profil’de avatara dokun → foto seç',
      'Foto Profil ve Ana Sayfa’da görünüyor (ayna camında)',
      'Değiştir / Kaldır çalışıyor',
    ],
  },
  {
    group: 'İstatistikler',
    items: [
      'Veri yokken dürüst boş durum',
      'Gerçek metrikler (rekor / tur / yüzleşme)',
      'Limit modunda 7 günlük kullanım grafiği',
    ],
  },
  {
    group: 'Profil',
    items: ['İsmi Düzenle çalışıyor', 'Verileri Sıfırla (onaylı) çalışıyor'],
  },
  {
    group: 'Tab Bar',
    items: [
      'Etiketler Türkçe (Ana Sayfa/Geçmiş/İstatistik/Profil)',
      'İkonlar doğru (saat / grafik)',
      '+ butonu yapıyı bozmuyor',
    ],
  },
];

type Status = 'pass' | 'fail';
interface Result {
  status: Status;
  note?: string;
}

export default function TestScenariosScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [round, setRound] = useState(1);
  const [results, setResults] = useState<Record<string, Result>>({});
  const [showReport, setShowReport] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      Promise.all([AsyncStorage.getItem(RESULTS_KEY), AsyncStorage.getItem(ROUND_KEY)]).then(
        ([r, rd]) => {
          if (!alive) return;
          if (r) setResults(JSON.parse(r));
          if (rd) setRound(parseInt(rd, 10) || 1);
        }
      );
      return () => {
        alive = false;
      };
    }, [])
  );

  const persist = (next: Record<string, Result>) => {
    setResults(next);
    AsyncStorage.setItem(RESULTS_KEY, JSON.stringify(next));
  };

  const setStatus = (key: string, status: Status) => {
    const cur = results[key];
    if (cur?.status === status) {
      const next = { ...results };
      delete next[key];
      persist(next);
    } else {
      persist({ ...results, [key]: { status, note: cur?.note } });
    }
  };

  const setNote = (key: string, note: string) => {
    const cur = results[key];
    if (!cur) return;
    persist({ ...results, [key]: { ...cur, note } });
  };

  const newRound = () => {
    const next = round + 1;
    setRound(next);
    AsyncStorage.setItem(ROUND_KEY, String(next));
    persist({});
    setShowReport(false);
  };

  const total = SCENARIOS.reduce((n, g) => n + g.items.length, 0);
  const passed = Object.values(results).filter(r => r.status === 'pass').length;
  const failed = Object.values(results).filter(r => r.status === 'fail').length;
  const pending = total - passed - failed;

  const buildReport = (): string => {
    const date = new Date().toLocaleString('tr-TR');
    const fails: string[] = [];
    const passes: string[] = [];
    SCENARIOS.forEach(g =>
      g.items.forEach(item => {
        const r = results[`${g.group} / ${item}`];
        if (r?.status === 'fail') fails.push(`- [${g.group}] ${item}${r.note ? ` — ${r.note}` : ''}`);
        else if (r?.status === 'pass') passes.push(`- [${g.group}] ${item}`);
      })
    );
    let md = `# Ayna Test — Tur ${round} · ${date}\n`;
    md += `Özet: ${passed} ✅ · ${failed} ❌ · ${pending} bekliyor\n\n`;
    md += `## ❌ Kalanlar (${fails.length})\n${fails.length ? fails.join('\n') : '- (yok)'}\n\n`;
    md += `## ✅ Geçenler (${passes.length})\n${passes.length ? passes.join('\n') : '- (yok)'}`;
    return md;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Svg Icon={BackArrow} width={22} height={22} stroke={theme.colors.typography.PRIMARY} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.headerTitle}>Test · Tur {round}</Text>
          <Text style={styles.headerSubtitle}>
            {passed} ✅ · {failed} ❌ · {pending} bekliyor
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => setShowReport(s => !s)}>
          <Text style={styles.actionBtnText}>{showReport ? 'Raporu Kapat' : 'Raporu Oluştur'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.actionBtnGhost]} onPress={newRound}>
          <Text style={styles.actionBtnGhostText}>Yeni Tur</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {showReport && (
          <View style={styles.reportCard}>
            <Text style={styles.reportHint}>Uzun bas → seç → kopyala, sonra Claude'a yapıştır:</Text>
            <Text selectable style={styles.reportText}>
              {buildReport()}
            </Text>
          </View>
        )}

        {SCENARIOS.map(group => (
          <View key={group.group} style={styles.group}>
            <Text style={styles.groupTitle}>{group.group}</Text>
            <View style={styles.card}>
              {group.items.map((item, i) => {
                const key = `${group.group} / ${item}`;
                const r = results[key];
                return (
                  <View key={key} style={[styles.row, i > 0 && styles.rowBorder]}>
                    <View style={styles.rowTop}>
                      <Text style={styles.itemText}>{item}</Text>
                      <View style={styles.markButtons}>
                        <TouchableOpacity
                          onPress={() => setStatus(key, 'pass')}
                          style={[styles.mark, r?.status === 'pass' && styles.markPass]}>
                          <Text style={[styles.markIcon, r?.status === 'pass' && styles.markIconOn]}>
                            ✓
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => setStatus(key, 'fail')}
                          style={[styles.mark, r?.status === 'fail' && styles.markFail]}>
                          <Text style={[styles.markIcon, r?.status === 'fail' && styles.markIconOn]}>
                            ✕
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                    {r?.status === 'fail' && (
                      <TextInput
                        style={styles.noteInput}
                        placeholder="Ne bozuk? (kısa not)"
                        placeholderTextColor={theme.colors.typography.TERTIARY}
                        value={r.note ?? ''}
                        onChangeText={t => setNote(key, t)}
                        multiline
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  muted: {
    margin: theme.spacing[6],
    color: theme.colors.typography.SECONDARY,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing[4],
    paddingVertical: theme.spacing[3],
    gap: theme.spacing[2],
  },
  backBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
  },
  headerSubtitle: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing[2],
    paddingHorizontal: theme.spacing[4],
    paddingBottom: theme.spacing[2],
  },
  actionBtn: {
    flex: 1,
    paddingVertical: theme.spacing[3],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.typography.PRIMARY,
    alignItems: 'center',
  },
  actionBtnText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },
  actionBtnGhost: {
    backgroundColor: theme.colors.white,
  },
  actionBtnGhostText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[10],
  },
  reportCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['4xl'],
    padding: theme.spacing[4],
    marginBottom: theme.spacing[5],
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  reportHint: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
    marginBottom: theme.spacing[2],
  },
  reportText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 20,
  },
  group: {
    marginBottom: theme.spacing[5],
  },
  groupTitle: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.SECONDARY,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: theme.spacing[2],
  },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius['4xl'],
    paddingHorizontal: theme.spacing[4],
  },
  row: {
    paddingVertical: theme.spacing[3],
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.PRIMARY,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
  },
  itemText: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
  },
  markButtons: {
    flexDirection: 'row',
    gap: theme.spacing[2],
  },
  mark: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markPass: {
    backgroundColor: theme.colors.success,
    borderColor: theme.colors.success,
  },
  markFail: {
    backgroundColor: theme.colors.danger.text,
    borderColor: theme.colors.danger.text,
  },
  markIcon: {
    fontSize: 15,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.TERTIARY,
  },
  markIconOn: {
    color: theme.colors.white,
  },
  noteInput: {
    marginTop: theme.spacing[3],
    backgroundColor: theme.colors.background.PRIMARY,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing[3],
    paddingVertical: theme.spacing[2],
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY,
    minHeight: 38,
  },
}));
