import React, { useCallback, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '#components/atoms';
import Svg from '#components/atoms/svg';
import { BackArrow } from '#assets/svg';
import { StyleSheet, useStyles } from '#theme/unistyles';

const CHECKLIST_KEY = '@ayna/dev_test_checklist';

// Her yeni özellik geldiğinde elle test edilecek senaryolar.
// Yeni özellik eklerken buraya satır ekle.
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

export default function TestScenariosScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      AsyncStorage.getItem(CHECKLIST_KEY).then(raw => {
        if (alive && raw) setChecked(JSON.parse(raw));
      });
      return () => {
        alive = false;
      };
    }, [])
  );

  const persist = (next: Record<string, boolean>) => {
    setChecked(next);
    AsyncStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
  };

  const toggle = (key: string) => {
    persist({ ...checked, [key]: !checked[key] });
  };

  const reset = () => persist({});

  const total = SCENARIOS.reduce((n, g) => n + g.items.length, 0);
  const done = Object.values(checked).filter(Boolean).length;

  // Prod'da görünmesin (yalnız dev araç).
  if (!__DEV__) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Text style={styles.muted}>Bu sayfa yalnızca geliştirme modunda kullanılır.</Text>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Test Senaryoları</Text>
          <Text style={styles.headerSubtitle}>
            Geliştirme aracı · {done}/{total} işaretlendi
          </Text>
        </View>
        <TouchableOpacity onPress={reset} style={styles.resetLink}>
          <Text style={styles.resetLinkText}>Sıfırla</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {SCENARIOS.map(group => (
          <View key={group.group} style={styles.group}>
            <Text style={styles.groupTitle}>{group.group}</Text>
            <View style={styles.card}>
              {group.items.map((item, i) => {
                const key = `${group.group} / ${item}`;
                const isChecked = !!checked[key];
                return (
                  <TouchableOpacity
                    key={key}
                    activeOpacity={0.7}
                    onPress={() => toggle(key)}
                    style={[styles.row, i > 0 && styles.rowBorder]}>
                    <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
                      {isChecked && <Text style={styles.checkmark}>✓</Text>}
                    </View>
                    <Text style={[styles.itemText, isChecked && styles.itemTextChecked]}>
                      {item}
                    </Text>
                  </TouchableOpacity>
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
  resetLink: {
    padding: theme.spacing[2],
  },
  resetLinkText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing[4],
    paddingBottom: theme.spacing[10],
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing[3],
    paddingVertical: theme.spacing[4],
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.PRIMARY,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    fontSize: 14,
    color: theme.colors.white,
    fontFamily: theme.fontFamily.bold,
  },
  itemText: {
    flex: 1,
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.PRIMARY,
  },
  itemTextChecked: {
    color: theme.colors.typography.SECONDARY,
    textDecorationLine: 'line-through',
  },
}));
