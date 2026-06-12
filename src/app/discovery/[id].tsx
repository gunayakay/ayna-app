import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';

import { Text } from '#components/atoms';
import SvgIcon from '#components/atoms/svg';
import EditMenuSheet from '#components/edit-menu-sheet';
import ExperienceSheet from '#components/experience-sheet';
import { BackArrow, Dots } from '#assets/svg';
import { StyleSheet, useStyles } from '#theme/unistyles';
import {
  discoveryStorage,
  getThemeDef,
  resolveThemeEmoji,
  resolveThemeTitle,
  type DiscoveryTheme,
  type DiscoveryExperience,
} from '#/utils';

const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
const TINTS = ['#FBEAD7', '#E2EEF4', '#EFE4F6', '#E2F0EA'];

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return 'bugün';
  if (days === 1) return 'dün';
  if (days < 7) return `${days} gün önce`;
  const w = Math.floor(days / 7);
  if (w < 5) return `${w} hafta önce`;
  const d = new Date(ts);
  return `${d.getDate()} ${TR_MONTHS[d.getMonth()]}`;
}

export default function DiscoveryDetailScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const id = params.id;

  const [themeRow, setThemeRow] = useState<DiscoveryTheme | null>(null);
  const [experiences, setExperiences] = useState<DiscoveryExperience[]>([]);

  const expRef = useRef<BottomSheetModal>(null);
  const editRef = useRef<BottomSheetModal>(null);
  const [draftTitle, setDraftTitle] = useState('');

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const load = async () => {
    setThemeRow(await discoveryStorage.getTheme(id));
    setExperiences(await discoveryStorage.getExperiences(id));
  };

  const themeKey = themeRow?.themeKey ?? 'other';
  const def = getThemeDef(themeKey);
  const emoji = themeRow ? resolveThemeEmoji(themeRow) : def.emoji;
  const title = themeRow ? resolveThemeTitle(themeRow) : def.title;

  const openNew = () => {
    expRef.current?.present();
  };
  const openExp = (expId: string) => {
    router.push({ pathname: '/discovery/exp/[id]', params: { id: expId } });
  };

  const openThemeEdit = () => {
    setDraftTitle(title);
    editRef.current?.present();
  };
  const handleSaveTheme = async () => {
    await discoveryStorage.updateTheme(id, { title: draftTitle });
    editRef.current?.dismiss();
    load();
  };
  const handleDeleteTheme = async () => {
    await discoveryStorage.removeTheme(id);
    editRef.current?.dismiss();
    router.back();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bloom} pointerEvents="none" />
      <View style={styles.top}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <SvgIcon Icon={BackArrow} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{emoji} {title}</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={openThemeEdit}>
          <SvgIcon Icon={Dots} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* log girişi */}
        <TouchableOpacity activeOpacity={0.9} onPress={openNew} style={styles.logMini}>
          <Text style={styles.logPrompt}>{def.logPrompt}</Text>
          <View style={styles.logAdd}><Text style={styles.logAddText}>+ Ekle</Text></View>
        </TouchableOpacity>

        <View style={styles.ghead}>
          <Text style={styles.gt}>{def.archiveLabel}</Text>
          <Text style={styles.gc}>{experiences.length} deneyim</Text>
        </View>

        {experiences.length === 0 ? (
          <Text style={styles.empty}>Henüz bir şey eklemedin. İlk denemeni “+ Ekle” ile yaz — burada birikecek.</Text>
        ) : (
          <View style={styles.grid}>
            {experiences.map((e, i) => (
              <TouchableOpacity key={e.id} activeOpacity={0.85} onPress={() => openExp(e.id)} style={styles.gcard}>
                <View style={styles.cover}>
                  {e.photoUri ? (
                    <>
                      <Image source={{ uri: e.photoUri }} style={styles.coverImg} contentFit="cover" />
                      <View style={styles.badge}><Text style={styles.badgeText}>📷</Text></View>
                    </>
                  ) : (
                    <View style={[styles.coverEmo, { backgroundColor: TINTS[i % TINTS.length] }]}>
                      <Text style={styles.coverEmoText}>{emoji}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.ci}>
                  <Text style={styles.cn} numberOfLines={1}>{e.title}</Text>
                  <View style={styles.cmeta}>
                    {!!e.rating && <Text style={styles.star}>★ {e.rating}</Text>}
                    {!!e.note && <Text style={styles.tagMini}>📝</Text>}
                  </View>
                  {!!e.location && <Text style={styles.loc} numberOfLines={1}>📍 {e.location}</Text>}
                  <Text style={styles.date}>{relTime(e.createdAt)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <ExperienceSheet ref={expRef} themeId={id} themeKey={themeKey} experience={null} onSaved={load} />

      <EditMenuSheet
        ref={editRef}
        heading="Temayı düzenle"
        snapPoints={['40%']}
        onSave={handleSaveTheme}
        saveDisabled={!draftTitle.trim()}
        deleteLabel="Bu temayı sil"
        deleteTitle="Temayı sil"
        deleteMessage={`"${title}" ve tüm deneyimlerin silinecek. Bu geri alınamaz.`}
        onDelete={handleDeleteTheme}>
        <Text style={styles.editLabel}>Tema adı</Text>
        <BottomSheetTextInput
          style={styles.editInput}
          value={draftTitle}
          onChangeText={setDraftTitle}
          placeholder={def.title}
          placeholderTextColor={theme.colors.typography.TERTIARY}
          maxLength={40}
        />
      </EditMenuSheet>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: { flex: 1, backgroundColor: theme.colors.background.PRIMARY },
  bloom: { position: 'absolute', top: -110, right: -70, width: 340, height: 340, borderRadius: 340, backgroundColor: theme.colors.primaryLighter, opacity: 0.4 },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2] },
  iconBtn: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.6)' },
  topTitle: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY, flex: 1, textAlign: 'center' },
  scroll: { paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[16] },
  logMini: {
    marginTop: theme.spacing[2], marginBottom: theme.spacing[5], flexDirection: 'row', alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.6)', borderWidth: 1, borderColor: theme.colors.border.PRIMARY,
    borderRadius: theme.borderRadius['3xl'], paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[4],
  },
  logPrompt: { flex: 1, fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY },
  logAdd: { backgroundColor: theme.colors.typography.PRIMARY, borderRadius: theme.borderRadius.full, paddingVertical: theme.spacing[2], paddingHorizontal: theme.spacing[4] },
  logAddText: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold, color: theme.colors.white },
  ghead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: theme.spacing[1] },
  gt: { fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY },
  gc: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY },
  empty: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.regular, color: theme.colors.typography.SECONDARY, lineHeight: 21, paddingHorizontal: theme.spacing[2], marginTop: theme.spacing[3] },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[3], marginTop: theme.spacing[3] },
  gcard: { width: '47.5%', backgroundColor: 'rgba(255,255,255,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.7)', borderRadius: theme.borderRadius['3xl'], overflow: 'hidden' },
  cover: { height: 104, position: 'relative' },
  coverImg: { width: '100%', height: '100%' },
  coverEmo: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverEmoText: { fontSize: 40 },
  badge: { position: 'absolute', left: 8, top: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.85)', alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 12 },
  ci: { padding: theme.spacing[3] },
  cn: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.PRIMARY },
  cmeta: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[2], marginTop: 5 },
  star: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.primaryDarker },
  tagMini: { fontSize: 11 },
  loc: { fontSize: 10, fontFamily: theme.fontFamily.semiBold, color: '#3D7EA6', marginTop: 4 },
  date: { fontSize: 10, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.TERTIARY, marginTop: 5 },
  editLabel: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY, marginBottom: theme.spacing[2] },
  editInput: { fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.PRIMARY, paddingVertical: theme.spacing[2], borderBottomWidth: 2, borderBottomColor: theme.colors.primaryLight },
}));
