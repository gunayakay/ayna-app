import React, {
  forwardRef,
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  LayoutChangeEvent,
  NativeSyntheticEvent,
  Platform,
  TextInput as RNTextInput,
  StyleProp,
  TextInputFocusEventData,
  TextStyle,
  TouchableOpacity,
  View,
} from 'react-native';

import { MaskedTextInput, MaskedTextInputProps } from 'react-native-mask-text';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import Svg, { SvgComponent } from './svg';
import Text from './text';

const ANIMATION_DURATION = 200;
const isStringEmpty = (value?: string | null) => !value || value.trim().length === 0;

export interface TextInputProps extends MaskedTextInputProps {
  label?: string;
  textStyle?: StyleProp<TextStyle>;
  textInputStyle?: StyleProp<TextStyle>;
  LeftIcon?: SvgComponent;
  RightIcon?: SvgComponent;
  rightAction?: () => void;
  hasError?: boolean;
  variant?: string;
}

export interface TextInputHandle {
  focus: () => void;
  blur: () => void;
}

/**
 * TextInput component with animated floating label and optional left and right icons.
 * @param {TextInputProps} props - The component props.
 * @param {string} label - The label text for the input.
 * @param {string} value - The current value of the input.
 * @param {Function} onFocus - Callback function when the input is focused.
 * @param {Function} onBlur - Callback function when the input is blurred.
 * @param {Function} onChangeText - Callback function when the text of the input changes.
 * @param {Function} onChange - Callback function when the input changes.
 * @param {StyleProp<TextStyle>} textStyle - Additional style for the text.
 * @param {StyleProp<TextStyle>} textInputStyle - Additional style for the input.
 * @param {SvgComponent} LeftIcon - The left icon component.
 * @param {SvgComponent} RightIcon - The right icon component.
 * @param {Function} rightAction - The right action component.
 * @param {boolean} hasError - Whether the input has an error.
 * @param {RNTextInputProps} rest - Additional TextInput props to be passed to the container.
 * @returns {React.ReactElement} The TextInput component.
 */
const TextInput = forwardRef<TextInputHandle, TextInputProps>(
  (
    {
      label = '',
      value = '',
      onFocus,
      onBlur,
      onChangeText,
      mask,
      style,
      textStyle,
      textInputStyle,
      LeftIcon,
      RightIcon,
      rightAction,
      hasError = false,
      variant = 'default',
      ...rest
    },
    ref
  ) => {
    if (!label) {
      throw new Error("The 'label' prop is required for the TextInput component.");
    }

    const [seperatorSize, setSeperatorSize] = useState(0);
    const [isFocused, setIsFocused] = useState(false);
    const float = useSharedValue(false);

    const inputRef = useRef<RNTextInput>(null);

    const { styles, theme } = useStyles(stylesheet);

    const handleOnChangeTextForMaskedTextInput = useCallback((text: string, rawText: string) => {
      onChangeText && onChangeText(text, rawText);
    }, []);

    const handleOnChangeTextForRNTextInput = useCallback((text: string) => {
      onChangeText && onChangeText(text, text);
    }, []);

    const animatedFloatWrapperStyle = useAnimatedStyle(() => {
      return {
        transform: [
          {
            translateY: withTiming(
              float.value ? -24 - (variant === 'textArea' && Platform.OS === 'android' ? 1 : 0) : 0,
              {
                duration: ANIMATION_DURATION,
              }
            ),
          },
          {
            translateX: withTiming(float.value ? (LeftIcon ? -18 : -3) : 0, {
              duration: ANIMATION_DURATION,
            }),
          },
          {
            scale: withTiming(float.value ? 0.85 : 1, { duration: ANIMATION_DURATION }),
          },
        ],
      };
    });

    const handleOnFocus = useCallback((e: NativeSyntheticEvent<TextInputFocusEventData>) => {
      setIsFocused(true);
      float.value = true;
      onFocus && onFocus(e);
    }, []);

    const handleOnBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        if (isStringEmpty(value)) {
          setIsFocused(false);
          float.value = false;
        }
        onBlur && onBlur(e);
      },
      [value]
    );

    const handleLabelSeperatorSize = useCallback((e: LayoutChangeEvent) => {
      const { width } = e.nativeEvent.layout;
      setSeperatorSize(prev => {
        const desiredWidth = width + theme.spacing[3];

        return prev !== desiredWidth ? desiredWidth : prev;
      });
    }, []);

    const inputStyle = useMemo(() => {
      if (hasError) return [styles.input(!!LeftIcon, !!RightIcon, variant), styles.inputError];
      return !isFocused
        ? styles.input(!!LeftIcon, !!RightIcon, variant)
        : [styles.input(!!LeftIcon, !!RightIcon, variant), styles.inputFocused];
    }, [hasError, isFocused]);

    const inputLabelStyle = useMemo(() => {
      if (hasError) return [styles.label, styles.labelError];
      return !isFocused ? styles.label : [styles.label, styles.labelFocused];
    }, [hasError, isFocused]);

    useEffect(() => {
      if (value || !isStringEmpty(value)) {
        float.value = true;
        setIsFocused(true);
      }
    }, [value]);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    return (
      <View style={[styles.container(variant), style]}>
        <Animated.View
          pointerEvents="none"
          style={[styles.labelWrapper(!!LeftIcon, variant), animatedFloatWrapperStyle]}>
          {isFocused && <View style={[styles.labelSeperator, { width: seperatorSize }]} />}
          <Text onLayout={handleLabelSeperatorSize} style={[inputLabelStyle, textStyle]}>
            {label}
          </Text>
        </Animated.View>
        {LeftIcon && (
          <View style={styles.leftIcon} testID="input-left-icon">
            <Svg
              Icon={LeftIcon}
              width={20}
              height={20}
              fill={theme.colors.typography.PRIMARY[700]}
            />
          </View>
        )}
        {RightIcon && (
          <TouchableOpacity
            onPress={rightAction}
            style={styles.rightIcon}
            testID="input-right-icon">
            <Svg
              Icon={RightIcon}
              width={20}
              height={20}
              fill={theme.colors.typography.PRIMARY[600]}
            />
          </TouchableOpacity>
        )}
        {mask ? (
          <MaskedTextInput
            ref={inputRef}
            mask={mask}
            {...rest}
            value={value}
            onChangeText={handleOnChangeTextForMaskedTextInput}
            onFocus={handleOnFocus}
            onBlur={handleOnBlur}
            multiline={variant === 'textArea'}
            numberOfLines={variant === 'textArea' ? 3 : 1}
            textAlignVertical={variant === 'textArea' ? 'top' : 'center'}
            style={[inputStyle, textInputStyle]}
          />
        ) : (
          <RNTextInput
            ref={inputRef}
            {...rest}
            value={value}
            onChangeText={handleOnChangeTextForRNTextInput}
            onFocus={handleOnFocus}
            multiline={variant === 'textArea'}
            numberOfLines={variant === 'textArea' ? 3 : 1}
            textAlignVertical={variant === 'textArea' ? 'top' : 'center'}
            onBlur={handleOnBlur}
            style={[inputStyle, textInputStyle]}
          />
        )}
      </View>
    );
  }
);

const stylesheet = createStyleSheet(theme => ({
  container: variant => ({
    alignItems: 'stretch',
    justifyContent: variant === 'textArea' ? 'flex-start' : 'center',
    width: '100%',
    position: 'relative',
  }),
  labelWrapper: (LeftIcon: boolean, variant: any) => ({
    position: 'absolute',
    left: LeftIcon ? theme.spacing[6] : theme.spacing[2],
    paddingStart: theme.spacing[2],
    marginTop: variant === 'textArea' ? theme.spacing[3.5] : 0,
    paddingEnd: theme.spacing[2],
    zIndex: 1,
  }),
  labelSeperator: {
    position: 'absolute',
    top: '50%',
    left: 1,
    transform: [{ translateY: -2 }],
    zIndex: 1,
    height: 7,
    backgroundColor: theme.colors.white,
  },
  labelRelativeWrapper: {
    position: 'relative',
    width: '100%',
    alignItems: 'center',
  },
  label: {
    position: 'relative',
    zIndex: 2,
    color: theme.colors.typography.PRIMARY[400],
  },
  labelFocused: {
    color: theme.colors.typography.PRIMARY[700],
  },
  labelError: {
    color: theme.colors.danger,
  },
  input: (LeftIcon: boolean, RightIcon: boolean, variant: any) => ({
    width: '100%',
    borderWidth: 1.5,
    borderColor: theme.colors.border.PRIMARY[300],
    borderRadius: theme.borderRadius['4xl'],
    backgroundColor: theme.colors.white,
    color: theme.colors.typography.PRIMARY[700],
    fontFamily: theme.fontFamily.PRIMARY,
    height: variant === 'textArea' ? 100 : 50,
    paddingTop: variant === 'textArea' ? theme.spacing[3] : 0,
    paddingRight: RightIcon ? theme.spacing[8] : theme.spacing[4],
    paddingLeft: LeftIcon ? theme.spacing[8] : theme.spacing[4],
  }),
  inputFocused: {
    borderColor: theme.colors.typography.PRIMARY[900],
    borderWidth: 2,
    backgroundColor: theme.colors.white,
  },
  inputError: {
    borderColor: theme.colors.danger,
    borderWidth: 2,
    backgroundColor: theme.colors.dangerLighter,
  },
  leftIcon: {
    position: 'absolute',
    left: theme.spacing[2],
    zIndex: 1,
  },
  rightIcon: {
    position: 'absolute',
    right: theme.spacing[4],
    zIndex: 1,
  },
}));

TextInput.displayName = 'TextInput';

export default memo(TextInput);
