import { UnistylesRegistry, createStyleSheet, useStyles } from 'react-native-unistyles';
import light from './light';

// ✅ Type augmentation (theme intellisense)
declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    light: typeof light;
  }
}

// ✅ Registry Ayarları
UnistylesRegistry.addThemes({
  light,
}).addConfig({
  initialTheme: 'light',
  adaptiveThemes: false,
});

// 🔥🔥🔥 ÇÖZÜM BURADA 🔥🔥🔥
// Senin kodların 'StyleSheet.create' aradığı için,
// biz de içinde 'create' fonksiyonu olan sahte bir obje oluşturuyoruz.
export const StyleSheet = {
  create: createStyleSheet,
};

export { useStyles };
