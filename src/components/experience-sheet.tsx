import React, { forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity } from 'react-native';

import { BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { StyleSheet, useStyles } from '#theme/unistyles';

import { Text } from './atoms';
import BottomSheet from './bottom-sheet';
import Button from './button';
import {
  discoveryStorage,
  getThemeDef,
  REPEAT_OPTIONS,
  type DiscoveryExperience,
  type NewExperience,
  type RepeatValue,
  type FieldKey,
} from '#/utils';

export interface ExperienceSheetProps {
  themeId: string;
  themeKey: string;
  experience?: DiscoveryExperience | null; // düzenleme için
  onSaved?: () => void;
}

const ExperienceSheet = forwardRef<BottomSheetModal, ExperienceSheetProps>(
  ({ themeId, themeKey, experience, onSaved }, ref) => {
    const { styles, theme } = useStyles(stylesheet);
    const def = getThemeDef(themeKey);
    const has = useCallback((f: FieldKey) => def.fields.includes(f), [def]);

    const [title, setTitle] = useState('');
    const [note, setNote] = useState('');
    const [rating, setRating] = useState(0);
    const [location, setLocation] = useState('');
    const [repeat, setRepeat] = useState<RepeatValue | null>(null);
    const [link, setLink] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [tagDraft, setTagDraft] = useState('');
    const [photoUri, setPhotoUri] = useState<string | null>(null);

    // Sheet açılınca (düzenleme/yeni) alanları doldur
    useEffect(() => {
      setTitle(experience?.title ?? '');
      setNote(experience?.note ?? '');
      setRating(experience?.rating ?? 0);
      setLocation(experience?.location ?? '');
      setRepeat(experience?.repeat ?? null);
      setLink(experience?.link ?? '');
      setTags(experience?.tags ?? []);
      setTagDraft('');
      setPhotoUri(experience?.photoUri ?? null);
    }, [experience, themeId]);

    const snapPoints = useMemo(() => ['86%'], []);

    const dismiss = () => {
      if (ref && 'current' in ref) ref.current?.dismiss();
    };

    const addTag = () => {
      const t = tagDraft.trim();
      if (t && !tags.includes(t)) setTags([...tags, t]);
      setTagDraft('');
    };

    const pickPhoto = async () => {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) return;
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
      });
      if (!res.canceled && res.assets?.[0]) setPhotoUri(res.assets[0].uri);
    };

    const handleSave = async () => {
      const t = title.trim();
      if (!t) return;
      const data: NewExperience = { title: t };
      if (has('note') && note.trim()) data.note = note.trim();
      if (has('rating') && rating > 0) data.rating = rating;
      if (has('location') && location.trim()) data.location = location.trim();
      if (has('repeat') && repeat) data.repeat = repeat;
      if (has('link') && link.trim()) data.link = link.trim();
      if (has('tags') && tags.length) data.tags = tags;
      if (has('photo') && photoUri) data.photoUri = photoUri;

      if (experience) await discoveryStorage.updateExperience(experience.id, data);
      else await discoveryStorage.addExperience(themeId, data);
      onSaved?.();
      dismiss();
    };

    return (
      <BottomSheet ref={ref} snapPoints={snapPoints} enablePanDownToClose enableCloseOnBackdropPress disableView>
        <View style={styles.container}>
          <Text style={styles.heading}>{experience ? 'Deneyimi düzenle' : def.logPrompt}</Text>

          {/* foto (opsiyonel) */}
          {has('photo') && (
            <TouchableOpacity activeOpacity={0.85} onPress={pickPhoto} style={styles.photoWrap}>
              {photoUri ? (
                <>
                  <Image source={{ uri: photoUri }} style={styles.photo} contentFit="cover" />
                  <View style={styles.photoChange}>
                    <Text style={styles.photoChangeText}>📷 değiştir</Text>
                  </View>
                </>
              ) : (
                <View style={styles.photoEmpty}>
                  <Text style={styles.photoEmptyIcon}>📷</Text>
                  <Text style={styles.photoEmptyText}>Fotoğraf ekle</Text>
                  <Text style={styles.photoEmptyHint}>isteğe bağlı</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          {/* başlık */}
          <Text style={styles.label}>{def.titlePrompt}</Text>
          <BottomSheetTextInput
            style={styles.titleInput}
            value={title}
            onChangeText={setTitle}
            placeholder={def.titlePlaceholder}
            placeholderTextColor={theme.colors.typography.TERTIARY}
            maxLength={60}
          />

          {/* konum */}
          {has('location') && (
            <>
              <Text style={styles.label}>📍 Konum</Text>
              <BottomSheetTextInput
                style={styles.fieldInput}
                value={location}
                onChangeText={setLocation}
                placeholder="Örn. Nevşehir, Türkiye"
                placeholderTextColor={theme.colors.typography.TERTIARY}
                maxLength={60}
              />
            </>
          )}

          {/* tekrar */}
          {has('repeat') && (
            <>
              <Text style={styles.label}>🔁 Tekrar eder misin?</Text>
              <View style={styles.chipRow}>
                {REPEAT_OPTIONS.map(o => (
                  <TouchableOpacity
                    key={o.key}
                    activeOpacity={0.8}
                    onPress={() => setRepeat(repeat === o.key ? null : o.key)}
                    style={[styles.optChip, repeat === o.key && styles.optChipOn]}>
                    <Text style={[styles.optChipText, repeat === o.key && styles.optChipTextOn]}>{o.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* puan */}
          {has('rating') && (
            <>
              <Text style={styles.label}>⭐ Puan</Text>
              <View style={styles.starRow}>
                {[1, 2, 3, 4, 5].map(n => (
                  <TouchableOpacity key={n} activeOpacity={0.7} onPress={() => setRating(rating === n ? 0 : n)}>
                    <Text style={[styles.star, n <= rating && styles.starOn]}>★</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* not */}
          {has('note') && (
            <>
              <Text style={styles.label}>{def.noteLabel}</Text>
              <BottomSheetTextInput
                style={styles.noteInput}
                value={note}
                onChangeText={setNote}
                placeholder={def.notePlaceholder}
                placeholderTextColor={theme.colors.typography.TERTIARY}
                multiline
              />
            </>
          )}

          {/* link */}
          {has('link') && (
            <>
              <Text style={styles.label}>🔗 Link</Text>
              <BottomSheetTextInput
                style={styles.fieldInput}
                value={link}
                onChangeText={setLink}
                placeholder="https://..."
                placeholderTextColor={theme.colors.typography.TERTIARY}
                autoCapitalize="none"
                keyboardType="url"
              />
            </>
          )}

          {/* etiketler */}
          {has('tags') && (
            <>
              <Text style={styles.label}>🏷️ Etiketler</Text>
              <View style={styles.chipRow}>
                {tags.map(t => (
                  <TouchableOpacity key={t} activeOpacity={0.7} onPress={() => setTags(tags.filter(x => x !== t))} style={styles.tagChip}>
                    <Text style={styles.tagChipText}>{t} ✕</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <BottomSheetTextInput
                style={styles.fieldInput}
                value={tagDraft}
                onChangeText={setTagDraft}
                placeholder="Etiket yaz, Enter'a bas"
                placeholderTextColor={theme.colors.typography.TERTIARY}
                onSubmitEditing={addTag}
                returnKeyType="done"
                blurOnSubmit={false}
                maxLength={24}
              />
            </>
          )}

          <Button onPress={handleSave} disabled={!title.trim()} style={styles.saveBtn}>
            {experience ? 'Kaydet' : 'Deftere ekle'}
          </Button>
        </View>
      </BottomSheet>
    );
  }
);

const stylesheet = StyleSheet.create(theme => ({
  container: { padding: theme.spacing[5], paddingBottom: theme.spacing[8] },
  heading: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[4],
  },
  photoWrap: { height: 150, borderRadius: theme.borderRadius['3xl'], overflow: 'hidden', marginBottom: theme.spacing[4] },
  photo: { width: '100%', height: '100%' },
  photoChange: {
    position: 'absolute', right: 10, bottom: 10, backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: theme.spacing[3], paddingVertical: 6, borderRadius: theme.borderRadius.full,
  },
  photoChangeText: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.white },
  photoEmpty: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 2,
    borderWidth: 1.5, borderColor: theme.colors.border.PRIMARY, borderStyle: 'dashed',
    borderRadius: theme.borderRadius['3xl'], backgroundColor: theme.colors.background.PRIMARY,
  },
  photoEmptyIcon: { fontSize: 24 },
  photoEmptyText: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY },
  photoEmptyHint: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.TERTIARY },
  label: {
    fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY,
    letterSpacing: 0.3, textTransform: 'uppercase', marginTop: theme.spacing[4], marginBottom: theme.spacing[2],
  },
  titleInput: {
    fontSize: theme.fontSizes.xl, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.PRIMARY,
    paddingVertical: theme.spacing[2], borderBottomWidth: 2, borderBottomColor: theme.colors.primaryLight,
  },
  fieldInput: {
    fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.PRIMARY,
    backgroundColor: theme.colors.background.PRIMARY, borderRadius: theme.borderRadius.xl,
    borderWidth: 1, borderColor: theme.colors.border.PRIMARY, paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[3],
  },
  noteInput: {
    fontSize: theme.fontSizes.base, fontFamily: theme.fontFamily.medium, color: theme.colors.typography.PRIMARY,
    backgroundColor: theme.colors.background.PRIMARY, borderRadius: theme.borderRadius.xl,
    borderWidth: 1, borderColor: theme.colors.border.PRIMARY, paddingHorizontal: theme.spacing[3], paddingVertical: theme.spacing[3],
    minHeight: 72, textAlignVertical: 'top',
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing[2], marginBottom: theme.spacing[2] },
  optChip: {
    paddingHorizontal: theme.spacing[4], paddingVertical: theme.spacing[2], borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.PRIMARY, borderWidth: 1.5, borderColor: theme.colors.border.PRIMARY,
  },
  optChipOn: { backgroundColor: 'rgba(54,179,126,0.12)', borderColor: theme.colors.success },
  optChipText: { fontSize: theme.fontSizes.sm, fontFamily: theme.fontFamily.bold, color: theme.colors.typography.SECONDARY },
  optChipTextOn: { color: '#1f8a5f' },
  tagChip: {
    paddingHorizontal: theme.spacing[3], paddingVertical: 6, borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primaryLightest, borderWidth: 1, borderColor: theme.colors.primaryLight,
  },
  tagChipText: { fontSize: theme.fontSizes.xs, fontFamily: theme.fontFamily.bold, color: theme.colors.primaryDarker },
  starRow: { flexDirection: 'row', gap: theme.spacing[1] },
  star: { fontSize: 30, color: theme.colors.border.PRIMARY },
  starOn: { color: theme.colors.primary },
  saveBtn: { backgroundColor: theme.colors.typography.PRIMARY, marginTop: theme.spacing[6] },
}));

ExperienceSheet.displayName = 'ExperienceSheet';

export default ExperienceSheet;
