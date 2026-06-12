import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';

import { Text } from '#components/atoms';
import SvgIcon from '#components/atoms/svg';
import GlassCard from '#components/glass-card';
import ExperienceSheet from '#components/experience-sheet';
import { BackArrow, Dots } from '#assets/svg';
import { StyleSheet, useStyles } from '#theme/unistyles';
import {
  discoveryStorage,
  getThemeDef,
  REPEAT_OPTIONS,
  type DiscoveryExperience,
} from '#/utils';

const TR_MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];

function fmtDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function ExperienceDetailScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;

  const [exp, setExp] = useState<DiscoveryExperience | null>(null);
  const [themeKey, setThemeKey] = useState('other');
  const editRef = useRef<BottomSheetModal>(null);

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const load = async () => {
    const e = await discoveryStorage.getExperience(id);
    setExp(e);
    if (e) {
      const t = await discoveryStorage.getTheme(e.themeId);
      setThemeKey(t?.themeKey ?? 'other');
    }
  };

  const def = getThemeDef(themeKey);

  const handleDelete = () => {
    Alert.alert('Deneyimi sil', `"${exp?.title}" silinecek. Bu geri alınamaz.`, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await discoveryStorage.removeExperience(id);
          router.back();
        },
      },
    ]);
  };

  const repeatLabel = exp?.repeat ? REPEAT_OPTIONS.find(o => o.key === exp.repeat)?.label : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bloom} pointerEvents="none" />
      <View style={styles.top}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <SvgIcon Icon={BackArrow} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{def.emoji} {def.title}</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => editRef.current?.present()}>
          <SvgIcon Icon={Dots} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {!exp ? (
        <View style={styles.center}><Text style={styles.muted}>Deneyim bulunamadı.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {exp.photoUri && (
            <Image source={{ uri: exp.photoUri }} style={styles.hero} contentFit="cover" />
          )}

          <Text style={styles.title}>{exp.title}</Text>
          <Text style={styles.date}>{fmtDate(exp.createdAt)}</Text>

          {/* meta satırı */}
          <View style={styles.metaRow}>
            {!!exp.rating && (
              <View style={styles.metaPill}>
                <Text style={styles.metaStar}>{'★'.repeat(exp.rating)}<Text style={styles.metaStarOff}>{'★'.repeat(5 - exp.rating)}</Text></Text>
              </View>
            )}
            {!!repeatLabel && (
              <View style={styles.metaPill}><Text style={styles.metaText}>🔁 {repeatLabel}</Text></View>
            )}
          </View>

          {!!exp.location && (
            <GlassCard radius={18} style={styles.card}>
              <View style={styles.cardPad}><Text style={styles.cardLabel}>KONUM</Text><Text style={styles.cardVal}>📍 {exp.location}</Text></View>
            </GlassCard>
          )}

          {!!exp.note && (
            <GlassCard radius={18} style={styles.card}>
              <View style={styles.cardPad}><Text style={styles.cardLabel}>{def.noteLabel.toUpperCase()}</Text><Text style={styles.note}>{exp.note}</Text></View>
            </GlassCard>
          )}

          {!!exp.tags?.length && (
            <View style={styles.tagWrap}>
              {exp.tags.map(t => <View key={t} style={styles.tag}><Text style={styles.tagText}>{t}</Text></View>)}
            </View>
          )}

          {!!exp.link && (
            <TouchableOpacity activeOpacity={0.8} onPress={() => Linking.openURL(exp.link!)} style={styles.linkBtn}>
              <Text style={styles.linkText} numberOfLines={1}>🔗 {exp.link}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity activeOpacity={0.7} onPress={handleDelete} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Bu deneyimi sil</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {exp && (
        <ExperienceSheet ref={editRef} themeId={exp.themeId} themeKey={themeKey} experience={exp} onSaved={load} />
      )}
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: { flex: 1, backgroundColor: theme.colors.background.PRIMARY },
  bloom: { position: 'absolute', top: -110, right: -70, width: 340, height: 340, borderRadius: 340, backgroundColor: theme.colors.primaryLighter, opacity: 0.4 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },
  topTitle: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY, flex: 1, textAlign: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  muted: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY },
  scroll: { paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[16] },
  hero: { width: '100%', height: 220, borderRadius: theme.borderRadius['3xl'], marginTop: theme.spacing[2], marginBottom: theme.spacing[4] },
  title: { fontSize: theme.fontSizes['2xl'], fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY, marginTop: theme.spacing[2] },
  date: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.SECONDARY, marginTop: 3 },
  metaRow: { flexDirection: 'row', gap: theme.spacing[2], marginTop: theme.spacing[3], flexWrap: 'wrap' },
  metaPill: { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: theme.borderRadius.full, paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[3], borderWidth: 1, borderColor: theme.colors.border.PRIMARY },
  metaStar: { fontSize: theme.fontSizes.base, color: theme.colors.primary, letterSpacing: 1 },
  metaStarOff: { color: theme.colors.border.PRIMARY },
  metaText: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.PRIMARY },
  card: { marginTop: theme.spacing[3] },
  cardPad: { padding: theme.spacing[4] },
  cardLabel: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY, letterSpacing: 0.6, marginBottom: theme.spacing[2] },
  cardVal: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.PRIMARY },
  note: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.regular, color: theme.colors.typography.PRIMARY, lineHeight: 23 },
  tagWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2], marginTop: theme.spacing[4] },
  tag: { backgroundColor: theme.colors.primaryLightest, borderRadius: theme.borderRadius.full, paddingVertical: 6, paddingHorizontal: theme.spacing[3], borderWidth: 1, borderColor: theme.colors.primaryLight },
  tagText: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.primaryDarker },
  linkBtn: { marginTop: theme.spacing[4], backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: theme.borderRadius.xl, borderWidth: 1, borderColor: theme.colors.border.PRIMARY, paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[4] },
  linkText: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: '#3D7EA6' },
  deleteBtn: { marginTop: theme.spacing[8], height: 48, borderRadius: theme.borderRadius.full, alignItems: 'center', justifyContent: 'center' },
  deleteText: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold, color: '#FF3B30' },
}));
