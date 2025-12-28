import { memo, useEffect, useRef, useState } from 'react';
import { Dimensions, Pressable, StyleSheet, View } from 'react-native';

import { Portal } from '@gorhom/portal';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import { SnapbackZoom } from 'react-native-zoom-toolkit';

export interface ZoomToCenterProps {
  children: React.ReactNode;
  isZoomed: boolean;
  handleZoom: () => void;
  recalculateZoom?: boolean;
}

const WIDTH = Dimensions.get('window').width;
const HEIGHT = Dimensions.get('window').height;

function ZoomToCenter({
  children,
  isZoomed,
  handleZoom,
  recalculateZoom = false,
}: ZoomToCenterProps) {
  const [rendered, setRendered] = useState(false);
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  const childRef = useRef<View>(null);
  const { styles } = useStyles(stylesheet);
  const [childSize, setChildSize] = useState({ width: 0, height: 0 });

  const onZoomOut = () => {
    if (childRef.current) {
      childRef.current.measureInWindow((x, y) => {
        translateX.value = withTiming(x);
        translateY.value = withTiming(y);
        scale.value = withTiming(1);
        opacity.value = withTiming(0, {}, () => {
          runOnJS(handleZoom)();
        });
      });
    }
  };

  useEffect(() => {
    if ((childRef.current && !rendered) || recalculateZoom) {
      childRef.current?.measure((x, y, width, height) => {
        translateX.value = withTiming(x);
        translateY.value = withTiming(y);
        setChildSize({ width, height });
        setRendered(true);
      });
    }
  }, [children, rendered, recalculateZoom]);

  useEffect(() => {
    if (childRef.current && isZoomed) {
      childRef.current.measureInWindow((x, y) => {
        translateX.value = x;
        translateY.value = y;
        const scaledWidth = childSize.width;
        const scaledHeight = childSize.height;

        const centerX = (WIDTH - scaledWidth) / 2;
        const centerY = (HEIGHT - scaledHeight) / 2;

        translateX.value = withTiming(centerX);
        translateY.value = withTiming(centerY + insets.bottom);
        opacity.value = withTiming(0.7);
        scale.value = withTiming(1);
      });
    }
  }, [isZoomed, childSize.width, childSize.height, insets.bottom]);

  const translateStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: scale.value,
        },
        {
          translateY: translateY.value,
        },
        {
          translateX: translateX.value,
        },
      ],
    };
  });

  const opacityStyle = useAnimatedStyle(() => ({
    backgroundColor: `rgba(0, 0, 0, ${opacity.value})`,
  }));

  return (
    <>
      {isZoomed && (
        <Portal>
          <Animated.View style={[styles.container, opacityStyle]}>
            <Pressable style={styles.closeButton} onPress={onZoomOut} />
            <Animated.View
              style={[
                styles.mainChild,
                {
                  width: childSize.width,
                  height: childSize.height,
                },
                translateStyle,
              ]}>
              <SnapbackZoom>
                <View style={{ width: childSize.width, height: childSize.height }}>{children}</View>
              </SnapbackZoom>
            </Animated.View>
          </Animated.View>
        </Portal>
      )}
      <View ref={childRef} collapsable={false} style={styles.childrenWrapper}>
        {children}
      </View>
    </>
  );
}

export default memo(ZoomToCenter);

const stylesheet = createStyleSheet(() => ({
  container: {
    flex: 1,
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  childrenWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mainChild: {
    position: 'relative',
    zIndex: 99,
  },
}));
