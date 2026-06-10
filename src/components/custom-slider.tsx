import React, { useState } from 'react';
import { View, PanResponder, LayoutChangeEvent } from 'react-native';
import { StyleSheet, useStyles } from '#theme/unistyles';

export interface CustomSliderProps {
  value: number;
  minimumValue?: number;
  maximumValue?: number;
  onValueChange?: (value: number) => void;
  minimumTrackColor?: string;
  maximumTrackColor?: string;
  thumbColor?: string;
}

export default function CustomSlider({
  value,
  minimumValue = 0,
  maximumValue = 100,
  onValueChange,
  minimumTrackColor,
  maximumTrackColor,
  thumbColor,
}: CustomSliderProps) {
  const { styles, theme } = useStyles(stylesheet);
  const [sliderWidth, setSliderWidth] = useState(0);

  const minTrackColor = minimumTrackColor || theme.colors.primary;
  const maxTrackColor = maximumTrackColor || theme.colors.border.PRIMARY;
  const thumbBgColor = thumbColor || theme.colors.white;

  const normalizedValue = (value - minimumValue) / (maximumValue - minimumValue);
  const thumbPosition = normalizedValue * sliderWidth;

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: (evt) => {
      updateValue(evt.nativeEvent.locationX);
    },
    onPanResponderMove: (evt) => {
      updateValue(evt.nativeEvent.locationX);
    },
  });

  const updateValue = (locationX: number) => {
    if (sliderWidth === 0) return;

    const clampedX = Math.max(0, Math.min(locationX, sliderWidth));
    const newNormalizedValue = clampedX / sliderWidth;
    const newValue = Math.round(
      minimumValue + newNormalizedValue * (maximumValue - minimumValue)
    );

    onValueChange?.(newValue);
  };

  const handleLayout = (event: LayoutChangeEvent) => {
    setSliderWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      style={styles.container}
      onLayout={handleLayout}
      {...panResponder.panHandlers}>
      {/* Track Background */}
      <View style={[styles.track, { backgroundColor: maxTrackColor }]}>
        {/* Filled Track */}
        <View
          style={[
            styles.filledTrack,
            {
              backgroundColor: minTrackColor,
              width: `${normalizedValue * 100}%`,
            },
          ]}
        />
      </View>

      {/* Thumb */}
      <View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbBgColor,
            left: Math.max(0, thumbPosition - 14),
          },
        ]}
      />
    </View>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    height: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  track: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  filledTrack: {
    height: '100%',
    borderRadius: 3,
  },
  thumb: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
}));
