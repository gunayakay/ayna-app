import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';

import { Text } from '#components/atoms';
import { StyleSheet, useStyles } from '#theme/unistyles';

interface MirrorAvatarProps {
  uri: string | null;
  initial: string;
  size: number;
}

// Profil fotoğrafını Ayna logosunun (kavisli-kare ayna) "cam" alanına gömer.
// Foto yoksa cam beyaz kalır, baş harf gösterilir.
export default function MirrorAvatar({ uri, initial, size }: MirrorAvatarProps) {
  const { styles } = useStyles(stylesheet);
  const frameRadius = Math.round(size * 0.3);
  const pad = Math.max(3, Math.round(size * 0.07));
  const innerRadius = Math.max(2, frameRadius - pad);

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: frameRadius, padding: pad }]}>
      <View style={[styles.glass, { borderRadius: innerRadius }]}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" />
        ) : (
          <Text style={[styles.initial, { fontSize: Math.round(size * 0.4) }]}>{initial}</Text>
        )}
      </View>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  frame: {
    backgroundColor: theme.colors.primary,
  },
  glass: {
    flex: 1,
    backgroundColor: theme.colors.white,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  initial: {
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.primary,
  },
}));
