import { Platform } from 'react-native';
import colors from './atoms/colors'; // Senin oluşturduğun yeni colors dosyasını import et
import borderRadius from './atoms/borderRadius';
import fontSizes from './atoms/fontSizes';
import spacing from './atoms/spacing';

const lightTheme = {
  colors: {
    // 🟠 BRAND (Ana Renkler)
    primaryLightest: colors.brand[50], // Arka plan vurguları
    primaryLighter: colors.brand[100],
    primaryLight: colors.brand[400],
    primary: colors.brand.DEFAULT, // #FF9F43 (Ana Turuncu)
    primaryDarker: colors.brand[600], // Hover/Active durumları

    // ⚫️ NEUTRAL (Tipografi ve Zemin)
    typography: {
      PRIMARY: colors.neutral[900], // Ana Başlıklar (#1A1A1A)
      SECONDARY: colors.neutral[500], // Alt Metinler (#8E8E93)
      TERTIARY: colors.neutral[400], // Pasif İkonlar
    },
    background: {
      PRIMARY: colors.neutral[50], // Uygulama Arkaplanı (#F9F9F7)
      CARD: colors.white, // Kartlar
      MODAL: colors.white, // Action Sheet
    },
    border: {
      PRIMARY: colors.neutral[200], // İnce Çizgiler
    },

    // 🔴 DANGER (Panic Butonu)
    danger: {
      background: colors.danger[50], // Buton Zemini (#FFF5F5)
      text: colors.danger.DEFAULT, // Buton Yazısı (#FF3B30)
    },

    // 🟢 SUCCESS (Tamamlananlar)
    success: colors.success.DEFAULT,

    black: colors.black,
    white: colors.white,
  },

  spacing: { ...spacing },
  fontSizes: { ...fontSizes },
  borderRadius: { ...borderRadius },

  fontFamily: {
    // iOS ve Android için font eşleştirmesi
    thin: 'PlusJakartaSans_200ExtraLight', // PlusJakarta'da 100 bazen sorunlu olabiliyor, 200 güvenli
    extraLight: 'PlusJakartaSans_200ExtraLight',
    light: 'PlusJakartaSans_300Light',
    regular: 'PlusJakartaSans_400Regular',
    medium: 'PlusJakartaSans_500Medium',
    semiBold: 'PlusJakartaSans_600SemiBold',
    bold: 'PlusJakartaSans_700Bold',
    extraBold: 'PlusJakartaSans_800ExtraBold',
    black: 'PlusJakartaSans_800ExtraBold', // 900 her zaman pakette olmayabiliyor, 800 en kalınıdır genelde.

    // Varsayılan Font
    PRIMARY: 'PlusJakartaSans_400Regular',
  },
};

export default lightTheme;
