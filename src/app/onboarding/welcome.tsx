import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  Image,
  Animated,
  Easing,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Kendinle Yuzles.',
    description:
      'Ayna, sadece yaptiklarini degil, yapmaktan kactiklarini da gosterir. Gercek potansiyelini kesfet.',
  },
  {
    id: '2',
    title: 'Zinciri Kirma.',
    description:
      'Her gun kendine hesap ver. Ufak adimlar at, devasa sonuclar insa et.',
  },
  {
    id: '3',
    title: 'Degisim Baslasin.',
    description:
      'Ister yeni bir sen insa et, ister seni tutanlardan kurtul. Secim senin.',
  },
];

export default function WelcomeScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Entrance animations
  const skipAnim = useRef(new Animated.Value(0)).current;
  const logoAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const paginationAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.stagger(100, [
      Animated.timing(logoAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(skipAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(contentAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(paginationAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isLastSlide = currentIndex === SLIDES.length - 1;

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(offsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
  };

  const handleContinue = () => {
    if (isLastSlide) {
      router.push('/onboarding/name');
    } else {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  };

  const handleSkip = () => {
    router.push('/onboarding/name');
  };

  // Animation interpolations
  const logoTranslateY = logoAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const contentTranslateY = contentAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [30, 0],
  });

  const buttonTranslateY = buttonAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const renderSlide = ({ item, index }: { item: (typeof SLIDES)[0]; index: number }) => (
    <View style={styles.slide}>
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: logoAnim,
            transform: [{ translateY: logoTranslateY }],
          },
        ]}>
        <Image
          source={require('#assets/img/ayna-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </Animated.View>
      <Animated.View
        style={{
          opacity: contentAnim,
          transform: [{ translateY: contentTranslateY }],
        }}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Skip Button */}
      <Animated.View
        style={[
          styles.skipButton,
          {
            opacity: skipAnim,
          },
        ]}>
        <TouchableOpacity activeOpacity={0.7} onPress={handleSkip}>
          <Text style={styles.skipText}>Gec</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />

      {/* Pagination Dots */}
      <Animated.View
        style={[
          styles.pagination,
          {
            opacity: paginationAnim,
          },
        ]}>
        {SLIDES.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex ? styles.dotActive : styles.dotInactive,
            ]}
          />
        ))}
      </Animated.View>

      {/* Continue Button */}
      <Animated.View
        style={[
          styles.buttonContainer,
          {
            paddingBottom: insets.bottom + 16,
            opacity: buttonAnim,
            transform: [{ translateY: buttonTranslateY }],
          },
        ]}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleContinue}
          style={styles.continueButton}>
          <Text style={styles.continueButtonText}>
            {isLastSlide ? 'Aynayi Olustur!' : 'Devam Et'}
          </Text>
          <View style={styles.checkmarkContainer}>
            <Text style={styles.checkmark}>✓</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const stylesheet = createStyleSheet(theme => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  skipButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  skipText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  slide: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 80,
  },
  logoContainer: {
    width: 220,
    height: 220,
    marginBottom: 48,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.SECONDARY,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 16,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 32,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    width: 24,
    backgroundColor: theme.colors.typography.PRIMARY,
  },
  dotInactive: {
    width: 8,
    backgroundColor: theme.colors.border.PRIMARY,
  },
  buttonContainer: {
    paddingHorizontal: 24,
  },
  continueButton: {
    backgroundColor: theme.colors.typography.PRIMARY,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  continueButtonText: {
    fontSize: theme.fontSizes.base,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },
  checkmarkContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 14,
    color: theme.colors.white,
  },
}));
