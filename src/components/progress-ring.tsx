import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { Text } from '#components/atoms';
import { StyleSheet, useStyles } from '#theme/unistyles';

type RingMode = 'plus' | 'percent' | 'done';

interface ProgressRingProps {
  /** 0..1 doluluk */
  progress?: number;
  size?: number;
  /** plus: ortada + (dokun-ekle) · percent: ortada % · done: yeşil + tik */
  mode?: RingMode;
  /** percent modunda gösterilecek metin (örn "63%") */
  label?: string;
  /** halka rengi (varsayılan turuncu); limit/yumuşak için override */
  color?: string;
}

/**
 * Mockup'taki "dolma halka" — dokun-tamamla kontrolü.
 * plus = boş/devam (ortada +), done = tuttu (yeşil + tik), percent = direniş/limit (% metni).
 */
export default function ProgressRing({
  progress = 0,
  size = 44,
  mode = 'plus',
  label,
  color,
}: ProgressRingProps) {
  const { styles, theme } = useStyles(stylesheet);

  const stroke = 4;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const tickScale = r / 20; // tik 44px halkaya göre tunlandı; büyük halkalarda ölçekle
  const clamped = Math.max(0, Math.min(1, progress));
  const ringColor = color ?? theme.colors.primary;
  const isDone = mode === 'done';

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        {/* track — done ise içi yeşil dolar (beyaz tik görünsün) */}
        <Circle
          cx={cx}
          cy={cy}
          r={r}
          stroke={isDone ? theme.colors.success : 'rgba(0,0,0,0.08)'}
          strokeWidth={stroke}
          fill={isDone ? theme.colors.success : 'none'}
        />
        {/* progress arc (done değilse) */}
        {!isDone && clamped > 0 && (
          <Circle
            cx={cx}
            cy={cy}
            r={r}
            stroke={ringColor}
            strokeWidth={stroke}
            strokeLinecap="round"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped)}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        )}
        {/* done tik — halka boyutuyla ölçeklenir */}
        {isDone && (
          <Path
            d={`M${cx - 6 * tickScale} ${cy + 0.5 * tickScale} L${cx - 1.5 * tickScale} ${cy + 4.5 * tickScale} L${cx + 6 * tickScale} ${cy - 3.5 * tickScale}`}
            stroke={theme.colors.white}
            strokeWidth={Math.max(2.6, 2.6 * tickScale)}
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        )}
      </Svg>
      {/* merkez içerik */}
      {mode === 'plus' && (
        <View style={styles.center} pointerEvents="none">
          <Text style={[styles.plus, { color: theme.colors.primaryDarker }]}>+</Text>
        </View>
      )}
      {mode === 'percent' && label && (
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.percent}>{label}</Text>
        </View>
      )}
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  center: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plus: {
    fontSize: 20,
    fontFamily: theme.fontFamily.medium,
    marginTop: -2,
  },
  percent: {
    fontSize: 11,
    fontFamily: theme.fontFamily.extraBold,
    color: theme.colors.typography.PRIMARY,
  },
}));
