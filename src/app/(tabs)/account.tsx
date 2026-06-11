import React, { useCallback, useState } from 'react';
import { View, TouchableOpacity, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import { Text } from '#components/atoms';
import Svg from '#components/atoms/svg';
import MirrorAvatar from '#components/mirror-avatar';
import GlassCard from '#components/glass-card';
import { Camera } from '#assets/svg';
import { StyleSheet, useStyles } from '#theme/unistyles';
import { onboardingStorage } from '#/utils';

export default function AccountScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let alive = true;
      onboardingStorage.getUserName().then(n => {
        if (alive) setName(n ?? '');
      });
      onboardingStorage.getAvatarUri().then(uri => {
        if (alive) setAvatarUri(uri);
      });
      return () => {
        alive = false;
      };
    }, [])
  );

  const initial = (name.trim().charAt(0) || '?').toUpperCase();

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      const uri = result.assets[0].uri;
      await onboardingStorage.saveAvatarUri(uri);
      setAvatarUri(uri);
    }
  };

  const handleAvatarPress = () => {
    if (avatarUri) {
      Alert.alert('Profil Fotoğrafı', undefined, [
        { text: 'Değiştir', onPress: pickImage },
        {
          text: 'Kaldır',
          style: 'destructive',
          onPress: async () => {
            await onboardingStorage.clearAvatarUri();
            setAvatarUri(null);
          },
        },
        { text: 'Vazgeç', style: 'cancel' },
      ]);
    } else {
      pickImage();
    }
  };

  const startEdit = () => {
    setDraft(name);
    setEditing(true);
  };

  const saveName = async () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    await onboardingStorage.saveUserName(trimmed);
    setName(trimmed);
    setEditing(false);
  };

  const handleReset = () => {
    Alert.alert(
      'Verileri Sıfırla',
      'Tüm verilerin — ismin, bağımlılıkların, turların, kayıtların — kalıcı olarak silinecek. Bu işlem geri alınamaz.',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/onboarding/welcome');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom + 96 }]}>
      <View style={styles.bloom} pointerEvents="none" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profil</Text>
      </View>

      {/* Avatar + isim */}
      <GlassCard radius={28} style={styles.profileCard}>
        <View style={styles.profilePad}>
        <View style={styles.avatarWrap}>
          <TouchableOpacity activeOpacity={0.85} onPress={handleAvatarPress}>
            <MirrorAvatar uri={avatarUri} initial={initial} size={84} />
          </TouchableOpacity>
          <View style={styles.cameraBadge} pointerEvents="none">
            <Svg Icon={Camera} width={14} height={14} stroke={theme.colors.white} strokeWidth={1.5} />
          </View>
        </View>

        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.input}
              value={draft}
              onChangeText={setDraft}
              placeholder="İsmin"
              placeholderTextColor={theme.colors.typography.TERTIARY}
              autoFocus
              autoCapitalize="words"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={saveName}
            />
            <View style={styles.editButtons}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setEditing(false)}
                style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>İptal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={saveName}
                disabled={draft.trim().length === 0}
                style={[styles.saveBtn, draft.trim().length === 0 && styles.saveBtnDisabled]}>
                <Text style={styles.saveBtnText}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <>
            <Text style={styles.name}>{name || 'İsimsiz'}</Text>
            <TouchableOpacity activeOpacity={0.7} onPress={startEdit} style={styles.editLink}>
              <Text style={styles.editLinkText}>İsmi Düzenle</Text>
            </TouchableOpacity>
          </>
        )}
        </View>
      </GlassCard>

      {/* Test aracı — TestFlight/dahili sürümde görünür; halka açık sürümden önce gizlenecek */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push('/test-scenarios')}>
        <GlassCard radius={20} style={styles.devRow}>
          <View style={styles.devRowInner}>
            <Text style={styles.devRowText}>🧪 Test Senaryoları</Text>
            <Text style={styles.devRowHint}>Test turları ›</Text>
          </View>
        </GlassCard>
      </TouchableOpacity>

      {/* Tehlikeli bölge */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetButtonText}>Verileri Sıfırla</Text>
        </TouchableOpacity>
        <Text style={styles.resetHint}>
          Her şey yalnızca bu cihazda tutulur. Hesap yok, bulut yok.
        </Text>
      </View>
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
  },

  bloom: {
    position: 'absolute',
    top: -110,
    right: -70,
    width: 340,
    height: 340,
    borderRadius: 340,
    backgroundColor: theme.colors.primaryLighter,
    opacity: 0.45,
  },
  profileCard: {
    marginHorizontal: theme.spacing[4],
  },
  profilePad: {
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  avatarWrap: {
    width: 84,
    height: 84,
    marginBottom: theme.spacing[4],
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.primary,
    borderWidth: 2,
    borderColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: theme.fontSizes['2xl'],
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    marginBottom: theme.spacing[2],
  },
  editLink: {
    paddingVertical: theme.spacing[1],
    paddingHorizontal: theme.spacing[2],
  },
  editLinkText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.primary,
  },

  editRow: {
    width: '100%',
    gap: theme.spacing[3],
  },
  input: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
    paddingVertical: theme.spacing[2],
    borderBottomWidth: 2,
    borderBottomColor: theme.colors.primary,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: theme.spacing[3],
  },
  cancelBtn: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  cancelBtnText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  saveBtn: {
    paddingVertical: theme.spacing[2],
    paddingHorizontal: theme.spacing[5],
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.typography.PRIMARY,
  },
  saveBtnDisabled: {
    opacity: 0.4,
  },
  saveBtnText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },

  devRow: {
    marginHorizontal: theme.spacing[4],
    marginTop: theme.spacing[4],
  },
  devRowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing[4],
    paddingHorizontal: theme.spacing[5],
  },
  devRowText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
  },
  devRowHint: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  footer: {
    marginTop: 'auto',
    padding: theme.spacing[6],
    alignItems: 'center',
  },
  resetButton: {
    paddingVertical: theme.spacing[3],
    paddingHorizontal: theme.spacing[6],
    borderRadius: theme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: theme.colors.danger.text,
  },
  resetButtonText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.danger.text,
  },
  resetHint: {
    fontSize: theme.fontSizes.xs,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.TERTIARY,
    textAlign: 'center',
    marginTop: theme.spacing[3],
  },
}));
