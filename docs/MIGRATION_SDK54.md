# Ayna — Expo SDK 52 → 54 Migration (native Liquid Glass için)

> Amaç: anasayfayı **native iOS 26 Liquid Glass** (`expo-glass-effect`) estetiğine taşımak.
> `expo-glass-effect` SDK 54'te geldiği için tüm app SDK 54'e yükselmeli.
> Tasarım dili: `mockups/home-glass.html` + [AYNA.md](./AYNA.md).

## Zincirleme kısıt (neden bu kadar büyük)

`expo-glass-effect` → **SDK 54** → **New Architecture zorunlu** çünkü:
- `react-native-unistyles` **3.x** yalnızca New Arch (83 dosyada kullanılıyor, `useStyles` hook'u kalkıyor)
- `react-native-reanimated` **4.x** yalnızca New Arch
- `@gorhom/bottom-sheet` **5.x** New Arch + Reanimated 4

**Sonuç:** Expo Go biter → custom dev build (expo-dev-client) gerekir. Cihaz **iOS 26** olmalı ki native glass görünsün (iOS<26 → otomatik düz View).

## Yol: kademeli (52 → 53 → 54)

Tek seferde 52→54 sıçramak = React 19 + RN 0.81 + New Arch + Unistyles 3 + Reanimated 4 + bottom-sheet 5'i aynı anda debug etmek. Bunun yerine iki hop, her biri cihazda yeşillenince diğerine.

### Hop 1 — SDK 53 (React 19 + altyapı churn'ü izole et)  — KOD TARAFI BİTTİ (2026-06-10)
- [x] `npx expo install expo@^53 --fix` → Expo 53, RN 0.79.6, React 19.0.0, svg 15.11, reanimated 3.17 (3.x kaldı), TS 5.8
- [x] React 18→19: asıl churn `tsconfig.json` `"jsx": "react"` → **`"react-jsx"`** (otomatik runtime; babel zaten böyle derliyordu). 144 TS2686 "React UMD global" hatası temizlendi. Codemod gerekmedi (argsız useRef vb. bu projede yok).
- [x] metro mismatch düzeltildi: `@react-native/babel-preset|metro-config|typescript-config` 0.76.9 → **0.79.6** (metro 0.82'ye hizalandı)
- [x] **newArchEnabled: false KORUNDU**, Unistyles 2.x / Reanimated 3 KALDI
- [x] `npx expo-doctor` → **17/18** (kalan tek fail: CNG/prebuild uyarısı — native ios/android klasörleri + app.json config bir arada; pre-existing, Hop 2/3'te native'e elle dokunmak gerekecek)
- [x] **JS bundle doğrulandı**: `expo export --platform ios` → 1632 modül, exit 0, temiz. App SDK 53'te derleniyor.
- [ ] **Build + cihazda 25 senaryo testi (TEST_LOG Tur 4)** ← SIRADAKİ, kullanıcının cihazı gerekiyor

> NOT — kalan ~170 tsc hatası **migration'dan DEĞİL, pre-existing ölü kod**: `react-hook-form` hiç kurulu değil; onu import eden `controlled-*` bileşenleri (gymflow template kalıntısı) aktif rotalarda kullanılmıyor, bundle'a girmiyor. Temizlik (→ `old/`) ayrı iş; migration'ı bloklamaz. Ayrıca theme'de `dangerLighter/secondary/warning` renkleri eksik (yine ölü bileşenler).

### Hop 2 — SDK 54 (New Arch + entangled paketler)  — KOD/BUNDLE TARAFI BİTTİ (2026-06-10)
- [x] `npx expo install expo@^54 --fix` → Expo 54, RN 0.81.5, React 19.1, Reanimated 4.1.1
- [x] `react-native-worklets` eklendi (Reanimated 4 peer); babel `react-native-reanimated/plugin` → **`react-native-worklets/plugin`**
- [x] `newArchEnabled: true` → **3 yerde**: `app.json`, `ios/Podfile.properties.json`, `android/gradle.properties` (native folder'lar commit'li, app.json tek başına yetmiyor)
- [x] **Unistyles 2→3 — SHIM STRATEJİSİ** (reçeteyi atladık, daha az churn): merkez `src/theme/unistyles.ts` v3'e geçti (`StyleSheet.configure`); `useStyles` ince bir uyumluluk shim'i olarak korundu (`{ styles: stylesheet, theme: useUnistyles().theme }`). babel plugin `autoProcessImports: ['#theme/unistyles']` ile merkez re-export'u işliyor. **70 dosya** codemod ile doğrudan `react-native-unistyles` import'undan `#theme/unistyles`'a + `createStyleSheet`→`StyleSheet.create`'e normalize edildi (artık 81 dosya da shim kullanıyor). **Variant 3 dosya** (button/toast/image-picker) `useStyles(s,{variant})` → `styles.useVariants({variant})`. **StyleSheet çakışması 4 dosya** (RN'den + unistyles'tan): RN import'undan StyleSheet çıkarıldı (v3 StyleSheet RN static'lerini içeriyor).
- [x] Reanimated 3→4 (worklets otomatik), @gorhom/bottom-sheet 4→5 (5.2.14), safe-area/async-storage/svg vs. `--fix` ile bumped
- [x] `expo-dev-client` eklendi (Expo Go bitti)
- [x] @react-navigation/native+core **dedupe** (çift sürüm native modül uyarısı çözüldü)
- [x] `expo-doctor` **17/18** (kalan: CNG/prebuild uyarısı — native'i elle düzenledik, EAS build'i bloklamaz)
- [x] **JS bundle GREEN**: `expo export --platform ios` → 1891 modül, hata yok. Unistyles 3 + Reanimated 4 + bottom-sheet 5 birlikte derleniyor.
- [ ] **Build (EAS, Xcode 26) + cihazda tam test** ← SIRADAKİ. Runtime doğrulaması şart: Unistyles 3 reaktivite/variant, bottom-sheet 5 davranışı, New Arch native sürprizler — bunlar sadece New-Arch cihaz build'inde görülür.

> SHIM RİSKİ: tek statik tema ('light', adaptiveThemes false) olduğu için tema reaktivitesi runtime'da hiç tetiklenmez → shim güvenli. Variant'lar `styles.useVariants` ile runtime'da çalışmalı (cihazda doğrula). Bundle yeşil ama **runtime ≠ bundle** — asıl test cihazda.

### Hop 3 — Glass + anasayfa redesign (migration yeşilse)
- [ ] `expo-glass-effect` ekle; `isGlassEffectAPIAvailable()` ile gate
- [ ] Kartları `GlassView`'a taşı (tasarım dili: mockups/home-glass.html)
- [ ] Habit kartı birleşik etkileşim: sağ üst tek-dokunuş **+1** check halkası + karta dokun → düzenle
- [ ] `expo-notifications` ekle: akşam ~23:00 "günlük hedeflerini kaçırma" hatırlatması

## Unistyles 2 → 3 reçetesi (mekanik, 83 dosya)

Kurulum: `yarn add react-native-unistyles react-native-nitro-modules` (nitro **exact pin**); `babel.config.js` → `plugins: [['react-native-unistyles/plugin', { root: 'src' }]]`; `<UnistylesProvider>` sil; `UnistylesRegistry.addThemes/...` → `StyleSheet.configure({themes,breakpoints,settings})`.

Dosya başına:
```diff
- import { createStyleSheet, useStyles } from 'react-native-unistyles'
+ import { StyleSheet } from 'react-native-unistyles'
- const stylesheet = createStyleSheet(theme => ({ ... }))
+ const styles = StyleSheet.create(theme => ({ ... }))
  function C() {
-   const { styles } = useStyles(stylesheet)
    return <View style={styles.box} />
  }
```
**Judgment gereken 3 durum (find-replace değil):**
1. Variant: `useStyles(s,{variant})` → component içinde `styles.useVariants({variant})`
2. JSX'te `theme` kullanımı (`const { theme } = useStyles`): tercihen `withUnistyles(Comp, theme=>({...}))`, hızlı yol `const { theme } = useUnistyles()` (re-render eder, dikkatli)
3. Spread merge: `style={{...a,...b}}` → `style={[a,b]}` (v3 C++ binding spread'i kırar)

Ayrıca grep: `UnistylesRuntime` kaldırılan API'ler (addPlugin, statusBar.setColor...), `StyleSheet.hairlineWidth`.

## Risk sırası
1. Unistyles 2→3 (83 dosya, kesin, kritik yol)
2. New Arch tüm app (native sürprizler, iki platform regresyon)
3. bottom-sheet 4→5 on Reanimated 4 (bilinen SDK54 sorunları)
4. Reanimated 3→4
5. React 18→19
6. Android edge-to-edge zorunlu
