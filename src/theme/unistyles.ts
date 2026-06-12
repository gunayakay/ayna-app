import { StyleSheet as Unistyles, useUnistyles } from 'react-native-unistyles';
import light from './light';
import breakpoints from './atoms/breakpoints';

type AppBreakpoints = typeof breakpoints;

// ✅ Type augmentation (theme + breakpoint intellisense)
declare module 'react-native-unistyles' {
  export interface UnistylesThemes {
    light: typeof light;
  }
  export interface UnistylesBreakpoints extends AppBreakpoints {}
}

// ✅ Unistyles 3 yapılandırması (v2 UnistylesRegistry.addThemes yerine)
Unistyles.configure({
  themes: { light },
  breakpoints,
  settings: {
    initialTheme: 'light',
  },
});

// 🔁 v2 → v3 UYUMLULUK SHIM'İ
// Tüm dosyalar bu merkez modülden `StyleSheet` + `useStyles` alıyor.
// v3'te StyleSheet.create doğrudan kullanılır ve hook yok; babel plugin
// (autoProcessImports: ['#theme/unistyles']) bu yolu işliyor. useStyles'i
// theme'i de döndüren ince bir shim olarak koruyoruz, böylece 78 dosya
// değişmeden çalışıyor (variant kullanan 5 dosya ayrıca elden geçirildi).
export const StyleSheet = Unistyles;

export function useStyles<T>(stylesheet: T): { styles: T; theme: typeof light } {
  const { theme } = useUnistyles();
  return { styles: stylesheet, theme: theme as unknown as typeof light };
}

export { useUnistyles };
