import React from 'react';
import { View } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { Text } from '#components/atoms';
import { StyleSheet, useStyles } from '#theme/unistyles';

const ABS_FILL = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };

interface MirrorAvatarProps {
  uri: string | null;
  initial: string;
  size: number;
  /** 0 = tamamen buğulu, 1 = berrak. İhmal arttıkça buğu artar. */
  clarity?: number;
}

// Profil fotoğrafını Ayna logosunun (kavisli-kare ayna) "cam" alanına gömer.
// Foto yoksa cam beyaz kalır, baş harf gösterilir.
// clarity < 1 ise üstüne buğu (frosted) biner — "bir süredir kendine bakmadın".
export default function MirrorAvatar({ uri, initial, size, clarity = 1 }: MirrorAvatarProps) {
  const { styles } = useStyles(stylesheet);
  const frameRadius = Math.round(size * 0.3);
  const pad = Math.max(3, Math.round(size * 0.07));
  const innerRadius = Math.max(2, frameRadius - pad);
  const fog = Math.min(0.92, Math.max(0, 1 - clarity));

  return (
    <View style={[styles.frame, { width: size, height: size, borderRadius: frameRadius, padding: pad }]}>
      <View style={[styles.glass, { borderRadius: innerRadius }]}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} contentFit="cover" />
        ) : (
          <Text style={[styles.initial, { fontSize: Math.round(size * 0.4) }]}>{initial}</Text>
        )}

        {/* berraklık parlaması (cam hissi) */}
        <LinearGradient
          colors={['rgba(255,255,255,0.55)', 'rgba(255,255,255,0)']}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.7, y: 0.7 }}
          style={ABS_FILL}
          pointerEvents="none"
        />

        {/* buğu — ihmal arttıkça opaklaşır */}
        {fog > 0.02 && (
          <LinearGradient
            colors={['rgba(255,255,255,0.97)', 'rgba(235,235,229,0.86)']}
            start={{ x: 0.2, y: 0.1 }}
            end={{ x: 0.9, y: 1 }}
            style={[ABS_FILL, { opacity: fog }]}
            pointerEvents="none"
          />
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
