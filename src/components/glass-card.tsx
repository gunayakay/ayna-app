import React from 'react';
import { View, ViewStyle, StyleProp, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

import { StyleSheet, useStyles } from '#theme/unistyles';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** blur yoğunluğu (varsayılan 24) */
  intensity?: number;
  radius?: number;
}

/**
 * Buzlu cam kart — expo-blur. Üstte ince beyaz hairline + yumuşak gölge.
 * Tasarım dili: mockups/index.html (glass).
 */
export default function GlassCard({ children, style, intensity = 24, radius }: GlassCardProps) {
  const { styles } = useStyles(stylesheet);
  return (
    <View style={[styles.shadow, radius != null && { borderRadius: radius }, style]}>
      <BlurView
        intensity={intensity}
        tint="light"
        style={[styles.blur, radius != null && { borderRadius: radius }]}>
        <View style={[styles.tintOverlay, radius != null && { borderRadius: radius }]} />
        {children}
      </BlurView>
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  shadow: {
    borderRadius: 24,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.85)' : 'transparent',
    shadowColor: 'rgba(120,90,40,1)',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
  },
  // camın beyazımsı tonu (blur tek başına yeterince opak değil)
  tintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 24,
  },
}));
