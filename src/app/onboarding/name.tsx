import React, { useState } from 'react';
import { View, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';
import ProgressBar from '#components/progress-bar';
import { onboardingStorage } from '#/utils';

export default function NameScreen() {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');

  const handleContinue = async () => {
    await onboardingStorage.saveUserName(name.trim());
    await onboardingStorage.markOnboardingCompleted();
    router.replace('/(tabs)/home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        {/* Progress Header */}
        <View style={styles.progressHeader}>
          <View style={styles.progressBarContainer}>
            <ProgressBar progress={1} height={6} color={theme.colors.primary} />
          </View>
          <Text style={styles.stepText}>2/2</Text>
        </View>

        <View style={styles.content}>
          {/* Title */}
          <Text style={styles.title}>Sana nasil hitap{'\n'}edelim?</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder=""
              placeholderTextColor={theme.colors.typography.TERTIARY}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus
            />
            <View style={styles.inputUnderline} />
          </View>
        </View>

        {/* Continue Button */}
        <View style={[styles.buttonContainer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleContinue}
            style={[
              styles.continueButton,
              name.trim().length === 0 && styles.continueButtonDisabled,
            ]}
            disabled={name.trim().length === 0}>
            <Text style={styles.continueButtonText}>Devam Et</Text>
            <View style={styles.checkmarkContainer}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const stylesheet = createStyleSheet(theme => ({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.PRIMARY,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  progressBarContainer: {
    flex: 1,
  },
  stepText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.medium,
    color: theme.colors.typography.SECONDARY,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: theme.fontFamily.bold,
    color: theme.colors.typography.PRIMARY,
    lineHeight: 40,
    marginBottom: 120,
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    fontSize: 32,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  inputUnderline: {
    height: 2,
    backgroundColor: theme.colors.primary,
    borderRadius: 1,
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 16,
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
  continueButtonDisabled: {
    opacity: 0.4,
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
