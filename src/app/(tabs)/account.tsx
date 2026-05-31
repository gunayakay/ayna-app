import { Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

import { Container, Text } from '#components/atoms';
import { StyleSheet, useStyles } from '#theme/unistyles';

export default function AccountScreen() {
  const { styles } = useStyles(stylesheet);

  const handleReset = async () => {
    Alert.alert(
      'Reset Onboarding',
      'Tüm veriler silinecek ve onboarding baştan başlayacak.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sıfırla',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace('/onboarding/welcome');
          },
        },
      ],
    );
  };

  return (
    <Container style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text>Manage your profile here.</Text>

      {__DEV__ && (
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>Reset Onboarding (Dev Only)</Text>
        </TouchableOpacity>
      )}
    </Container>
  );
}

const stylesheet = StyleSheet.create(theme => ({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
  },
  title: {
    marginBottom: theme.spacing[2],
    fontFamily: theme.fontFamily.bold,
    fontSize: theme.fontSizes.lg,
  },
  resetButton: {
    marginTop: theme.spacing[8],
    backgroundColor: theme.colors.danger,
    borderRadius: theme.borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  resetButtonText: {
    fontSize: theme.fontSizes.sm,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.white,
  },
}));
