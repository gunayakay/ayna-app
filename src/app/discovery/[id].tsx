import React, { useCallback, useRef, useState } from 'react';
import { View, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';

import { Text } from '#components/atoms';
import SvgIcon from '#components/atoms/svg';
import GlassCard from '#components/glass-card';
import EditMenuSheet from '#components/edit-menu-sheet';
import { BackArrow, Dots } from '#assets/svg';
import { StyleSheet, useStyles } from '#theme/unistyles';
import { discoveryStorage, DiscoveryEntry } from '#/utils';

const DISCOVERY_EMOJIS = ['🍳', '🗣️', '🎸', '📖', '🎨', '🧗', '✍️', '🌱'];

const TR_MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

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
  const params = useLocalSearchParams<{ id: string; emoji?: string; title?: string }>();

  const id = params.id;

  const [emoji, setEmoji] = useState(params.emoji ?? '🌱');
  const [title, setTitle] = useState(params.title ?? 'Keşif');
  const [entries, setEntries] = useState<DiscoveryEntry[]>([]);
  const [draft, setDraft] = useState('');

  // düzenle/sil
  const editRef = useRef<BottomSheetModal>(null);
  const [draftEmoji, setDraftEmoji] = useState(emoji);
  const [draftTitle, setDraftTitle] = useState(title);

  useFocusEffect(useCallback(() => { load(); }, [id]));

  const load = async () => setEntries(await discoveryStorage.getEntries(id));

  const openEdit = () => {
    setDraftEmoji(emoji);
    setDraftTitle(title);
    editRef.current?.present();
  };

  const handleSaveItem = async () => {
    const t = draftTitle.trim();
    if (!t) return;
    await discoveryStorage.updateItem(id, draftEmoji, t);
    setEmoji(draftEmoji);
    setTitle(t);
    editRef.current?.dismiss();
  };

  const handleDeleteItem = async () => {
    await discoveryStorage.removeItem(id);
    editRef.current?.dismiss();
    router.back();
  };

  const add = async () => {
    const t = draft.trim();
    if (!t) return;
    await discoveryStorage.addEntry(id, t);
    setDraft('');
    load();
  };

  const removeEntry = (entryId: string) => {
    Alert.alert('Kaydı sil', 'Bu kayıt silinecek.', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await discoveryStorage.removeEntry(entryId);
          load();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.bloom} pointerEvents="none" />
      <View style={styles.top}>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.back()}>
          <SvgIcon Icon={BackArrow} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.topTitle}>{emoji} {title}</Text>
        <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={openEdit}>
          <SvgIcon Icon={Dots} width={20} height={20} stroke={theme.colors.typography.PRIMARY} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* giriş */}
        <GlassCard radius={24} style={styles.addCard}>
          <View style={styles.addPad}>
            <Text style={styles.askq}>Bu hafta ne denedin?</Text>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="Örn. Mantı yaptım"
              placeholderTextColor={theme.colors.typography.TERTIARY}
              returnKeyType="done"
              onSubmitEditing={add}
            />
            <TouchableOpacity activeOpacity={0.85} style={[styles.addBtn, !draft.trim() && styles.addBtnOff]} onPress={add} disabled={!draft.trim()}>
              <Text style={styles.addBtnText}>Arşive ekle</Text>
            </TouchableOpacity>
          </View>
        </GlassCard>

        <Text style={styles.sectionLabel}>
          {entries.length > 0 ? `DENEDİKLERİN · ${entries.length}` : 'DENEDİKLERİN'}
        </Text>

        {entries.length === 0 ? (
          <Text style={styles.empty}>Henüz bir şey eklemedin. İlk denemeni yukarıdan yaz — burada birikecek.</Text>
        ) : (
          entries.map(e => (
            <TouchableOpacity key={e.id} activeOpacity={0.7} onLongPress={() => removeEntry(e.id)}>
              <GlassCard radius={18} style={styles.entryCard}>
                <View style={styles.entryPad}>
                  <View style={styles.tick}><Text style={styles.tickText}>✓</Text></View>
                  <Text style={styles.entryText}>{e.text}</Text>
                  <Text style={styles.entryTime}>{relTime(e.time)}</Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <EditMenuSheet
        ref={editRef}
        heading="Keşfi düzenle"
        snapPoints={['56%']}
        onSave={handleSaveItem}
        saveDisabled={!draftTitle.trim()}
        deleteLabel="Bu keşfi sil"
        deleteTitle="Keşfi sil"
        deleteMessage={`"${title}" ve tüm denemelerin silinecek. Bu geri alınamaz.`}
        onDelete={handleDeleteItem}>
        <Text style={styles.editLabel}>Simge</Text>
        <View style={styles.emojiRow}>
          {DISCOVERY_EMOJIS.map(e => (
            <TouchableOpacity
              key={e}
              activeOpacity={0.7}
              onPress={() => setDraftEmoji(e)}
              style={[styles.emojiOpt, draftEmoji === e && styles.emojiOptOn]}>
              <Text style={styles.emojiOptText}>{e}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={[styles.editLabel, styles.editLabelGap]}>Ad</Text>
        <BottomSheetTextInput
          style={styles.editInput}
          value={draftTitle}
          onChangeText={setDraftTitle}
          placeholder="Örn. Yemek Yapmak"
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
  topTitle: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.extraBold, color: theme.colors.typography.PRIMARY },
  scroll: { paddingHorizontal: theme.spacing[5], paddingBottom: theme.spacing[16] },
  addCard: { marginTop: theme.spacing[2], marginBottom: theme.spacing[5] },
  addPad: { padding: theme.spacing[4] },
  askq: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY, marginBottom: theme.spacing[3] },
  input: {
    fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.PRIMARY,
    paddingVertical: theme.spacing[2], borderBottomWidth: 2, borderBottomColor: theme.colors.primaryLight, marginBottom: theme.spacing[4],
  },
  addBtn: { height: 48, borderRadius: theme.borderRadius.full, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.typography.PRIMARY },
  addBtnOff: { opacity: 0.4 },
  addBtnText: { fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.semiBold, color: theme.colors.white },
  sectionLabel: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY, letterSpacing: 0.8, marginBottom: theme.spacing[3], marginLeft: theme.spacing[1] },
  empty: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.regular, color: theme.colors.typography.SECONDARY, lineHeight: 21, paddingHorizontal: theme.spacing[2] },
  entryCard: { marginBottom: theme.spacing[2] },
  entryPad: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing[3], paddingVertical: theme.spacing[3], paddingHorizontal: theme.spacing[4] },
  tick: { width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(54,179,126,0.16)', alignItems: 'center', justifyContent: 'center' },
  tickText: { fontSize: 12, color: '#1f8a5f', fontFamily: theme.fontFamily.bold },
  entryText: { flex: 1, fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.PRIMARY },
  entryTime: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.TERTIARY },
  editLabel: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.SECONDARY, marginBottom: theme.spacing[3] },
  editLabelGap: { marginTop: theme.spacing[5] },
  emojiRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2] },
  emojiOpt: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.primaryLightest, borderWidth: 2, borderColor: 'transparent' },
  emojiOptOn: { borderColor: theme.colors.primary, backgroundColor: theme.colors.primaryLighter },
  emojiOptText: { fontSize: 22 },
  editInput: { fontSize: theme.fontSizes.lg, fontFamily: theme.fontFamily.semiBold, color: theme.colors.typography.PRIMARY, paddingVertical: theme.spacing[2], borderBottomWidth: 2, borderBottomColor: theme.colors.primaryLight },
}));
