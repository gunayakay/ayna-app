# AYNAPP - MASTER PROJECT INSTRUCTIONS

> **Last Updated:** 2025-02-10  
> **Version:** 3.0 (Production-Ready)  
> **Purpose:** Guide AI assistants to build Aynapp consistently with existing architecture

---

## 🎯 PROJECT IDENTITY

### What is Aynapp?

A **self-reflection habit tracker** that asks "Why didn't you do it?" instead of just marking tasks
as failed. It's a mirror (Ayna = Mirror in Turkish) that helps users confront their excuses with
compassion, not judgment.

### Core Philosophy

- **Non-judgmental**: Never punish failure, always ask "what stopped you?"
- **Data-driven**: Collect psychological blockers for academic research
- **Minimalist**: Clean UI, no clutter, focus on reflection

---

## 🛠️ TECHNICAL STACK

### Platform

- **Framework:** React Native (Expo SDK 52)
- **Routing:** Expo Router (file-based, located in `src/app/`)
- **Language:** TypeScript
- **Styling:** Unistyles (`react-native-unistyles` v2.20.0)
- **Custom Theme:** `src/theme/atoms/` (colors, spacing, typography)
- **State Management:** Context API (to be migrated to Zustand)
- **Backend:** Firebase (Firestore + Auth) - TO BE IMPLEMENTED

### Package Manager

- **Yarn 4.11.0** (NOT npm!)

### Key Dependencies

```json
{
  "@gorhom/bottom-sheet": "^4",
  "expo-router": "~4.0.9",
  "react-native-unistyles": "2.20.0",
  "@expo-google-fonts/plus-jakarta-sans": "^0.4.2",
  "react-native-reanimated": "~3.16.1",
  "react-native-safe-area-context": "4.12.0"
}
```

---

## 📁 PROJECT STRUCTURE (CRITICAL!)

**⚠️ IMPORTANT: This project uses `src/` folder, NOT root `app/` folder!**

```
ayna-app/
├── src/                          # ALL SOURCE CODE HERE
│   ├── app/                      # Expo Router screens
│   │   ├── (tabs)/               # Main app (after login)
│   │   │   ├── _layout.tsx
│   │   │   ├── home.tsx
│   │   │   ├── analytics.tsx
│   │   │   ├── history.tsx
│   │   │   └── account.tsx
│   │   ├── authentication/       # Auth flow
│   │   │   └── login.tsx
│   │   ├── onboarding/           # First-time user flow
│   │   │   ├── _layout.tsx
│   │   │   ├── welcome.tsx       ✅ EXISTS (3-slide carousel)
│   │   │   ├── categories.tsx    ✅ EXISTS
│   │   │   ├── name.tsx          ✅ EXISTS
│   │   │   ├── actions.tsx       ✅ EXISTS
│   │   │   ├── blockers.tsx      ✅ EXISTS
│   │   │   ├── discipline.tsx    ✅ EXISTS
│   │   │   └── loading.tsx       ✅ EXISTS
│   │   ├── _layout.tsx           # Root layout
│   │   ├── index.tsx             # Entry point
│   │   ├── splash.tsx
│   │   ├── library.tsx
│   │   └── confrontation.tsx
│   ├── components/               # ✅ REUSABLE COMPONENTS (USE THESE!)
│   │   ├── atoms/                # Basic building blocks
│   │   │   ├── text.tsx          # Custom Text component
│   │   │   ├── text-input.tsx
│   │   │   ├── image.tsx
│   │   │   └── container.tsx
│   │   ├── button.tsx            # Custom Button
│   │   ├── checkbox.tsx
│   │   ├── bottom-sheet.tsx
│   │   ├── modal.tsx
│   │   ├── controlled-input.tsx
│   │   ├── stepper.tsx
│   │   ├── progress-bar.tsx
│   │   ├── progress-circle.tsx
│   │   └── [50+ more components - CHECK BEFORE CREATING NEW ONES!]
│   ├── theme/                    # Custom theme system
│   │   └── atoms/
│   │       ├── colors.ts         ✅ USE THIS (see below)
│   │       ├── spacing.ts
│   │       ├── borderRadius.ts
│   │       ├── fontSizes.ts
│   │       └── breakpoints.ts
│   ├── constants/                # App-wide constants
│   ├── utils/                    # Helper functions
│   ├── types/                    # TypeScript types
│   ├── lang/                     # i18next translations
│   └── assets/                   # Images, SVGs, Lottie
│       ├── svg/
│       ├── img/
│       └── lottie/
├── package.json
├── babel.config.js               # Contains path aliases
└── tsconfig.json
```

---

## 🔗 PATH ALIASES (CRITICAL!)

**Use these import patterns - NEVER relative imports for shared code:**

```typescript
// ✅ CORRECT
import { Text } from '#components/atoms';
import { Button } from '#components/button';
import colors from '#theme/atoms/colors';
import { formatDate } from '#utils/date';

// ❌ WRONG
import { Text } from '../../components/atoms/text';
import colors from '../../../theme/atoms/colors';
```

**Available aliases (defined in babel.config.js):**

```
#components → ./src/components
#lib → ./src/lib
#utils → ./src/utils
#theme → ./src/theme
#types → ./src/types
#constants → ./src/constants
#lang → ./src/lang
#assets → ./src/assets
```

---

## 🎨 DESIGN SYSTEM

### Color Palette (src/theme/atoms/colors.ts)

**⚠️ USE THESE EXACT COLORS - DO NOT HARDCODE HEX VALUES!**

```typescript
import colors from '#theme/atoms/colors';

// Brand Colors (Orange)
colors.brand.DEFAULT; // #FF9F43 (Main orange - buttons, progress)
colors.brand[50]; // #FFF6E9 (Very light orange - backgrounds)
colors.brand[500]; // #FF9F43 (Same as DEFAULT)
colors.brand[600]; // #E68228 (Pressed state)

// Neutral Colors (Grays/Blacks)
colors.neutral[50]; // #F9F9F7 ⭐️ APP BACKGROUND (Canvas)
colors.neutral[100]; // #F2F2F7 (Card inner fills)
colors.neutral[200]; // #E5E5EA (Borders/Dividers)
colors.neutral[500]; // #8E8E93 (Secondary text)
colors.neutral[900]; // #1A1A1A ⭐️ PRIMARY TEXT (Headings)

// Status Colors
colors.danger.DEFAULT; // #FF3B30 (Error text/icons)
colors.danger[50]; // #FFF5F5 (Panic button background)
colors.success.DEFAULT; // #34C759 (Success indicators)

// Utility
colors.white; // #FFFFFF (Card backgrounds)
colors.black; // #000000
colors.transparent; // transparent
```

### Typography

**Font Family:** Plus Jakarta Sans (loaded via expo-font)

```typescript
// Font Sizes (use Unistyles or import from theme)
const fontSizes = {
  xs: 12, // Captions, hints
  sm: 14, // Small labels
  base: 16, // Body text
  lg: 18, // Subheadings
  xl: 20, // Section headers
  '2xl': 24, // Page headers
  '3xl': 32, // Onboarding titles
};

// Font Weights
const fontWeights = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};
```

**Usage Example:**

```typescript
import { Text } from '#components/atoms';

<Text
  style={{
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900]
  }}
>
  Welcome
</Text>
```

### Border Radius

```typescript
const borderRadius = {
  sm: 8, // Small elements
  md: 12, // Input fields
  lg: 16, // Cards
  xl: 24, // Large cards
  '2xl': 32, // Sheets, modals
  full: 9999, // Pill buttons (100px)
};
```

### Spacing (8pt grid)

```typescript
const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
};
```

---

## 🧩 USING EXISTING COMPONENTS

### **RULE #1: NEVER CREATE A NEW COMPONENT WITHOUT CHECKING `src/components/` FIRST!**

#### Available Components (Most Common):

**Atoms (Basic):**

```typescript
import { Text, TextInput, Image, Container } from '#components/atoms';
```

**Buttons:**

```typescript
import { Button } from '#components/button';

<Button
  label="Continue"
  onPress={handlePress}
  // Props: label, onPress, variant?, disabled?, loading?
/>
```

**Inputs:**

```typescript
import { ControlledInput } from '#components/controlled-input';

<ControlledInput
  name="email"
  control={control}
  placeholder="Email"
  // React Hook Form compatible
/>
```

**Modals/Sheets:**

```typescript
import { BottomSheet } from '#components/bottom-sheet';
import { Modal } from '#components/modal';
```

**Progress:**

```typescript
import { ProgressBar } from '#components/progress-bar';
import { ProgressCircle } from '#components/progress-circle';
```

**Other:**

```typescript
import { Checkbox } from '#components/checkbox';
import { Stepper } from '#components/stepper';
import { Loading } from '#components/loading';
```

**To see all components:**

```bash
ls src/components/
```

---

## 📱 STYLING WITH UNISTYLES

### Basic Usage

```typescript
import { createStyleSheet, useStyles } from 'react-native-unistyles';
import colors from '#theme/atoms/colors';

export default function MyScreen() {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello</Text>
    </View>
  );
}

const stylesheet = createStyleSheet({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50], // App background
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.neutral[900], // Primary text
  },
});
```

### Dynamic Styles

```typescript
const stylesheet = createStyleSheet({
  button: (variant: 'primary' | 'secondary') => ({
    backgroundColor: variant === 'primary'
      ? colors.brand.DEFAULT
      : colors.neutral[900],
    borderRadius: 100, // Pill shape
    paddingVertical: 16,
    paddingHorizontal: 32,
  }),
});

// Usage
<TouchableOpacity style={styles.button('primary')}>
```

---

## 🔥 FIREBASE INTEGRATION (TO BE IMPLEMENTED)

### Setup (Not Yet Done)

```typescript
// utils/firebase.ts (DOES NOT EXIST YET)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // TO BE ADDED
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### Firestore Schema (Planned)

```typescript
// users/{userId}/
{
  profile: { name, email, avatar, createdAt },
  settings: { theme, notifications },
  psychology: { blockers[], disciplineScore }
}

// tasks/{taskId}/
{
  userId, title, category, streak, isActive
}

// reflections/{logId}/
{
  userId, taskId, date, status, reason, note, mood
}
```

---

## 🎭 KEY SCREENS & FLOWS

### 1. Onboarding (src/app/onboarding/)

**Existing Screens:**

**welcome.tsx** ✅

- 3-slide carousel with animations
- Slides: "Kendinle Yüzleş", "Zinciri Kırma", "Değişim Başlasın"
- Uses Animated API + FlatList
- "Devam Et" button at the end

**categories.tsx** ✅

- Chip grid for category selection
- Multi-select allowed
- Categories: Sağlık, Finans, Üretkenlik, İlişkiler

**name.tsx** ✅

- Input field for user's name
- Simple validation

**blockers.tsx** ✅

- Select psychological blockers
- Options: People pleasing, Perfectionism, Overthinking, etc.

**discipline.tsx** ✅

- Slider to assess current discipline level
- Range: 0-100%

**actions.tsx** ✅

- Purpose unknown - CHECK THIS SCREEN
- Might be for selecting habits

**Flow:** welcome → categories → name → blockers → discipline → (tabs)/home

### 2. Main App (src/app/(tabs)/)

**home.tsx** ✅

- Dashboard with daily tasks
- Progress widgets
- Weekly overview
- Mood tracker
- FAB button in center

**analytics.tsx** ✅

- Statistics and graphs
- Completion rates
- Streak tracking

**history.tsx** ✅

- Past reflections log
- Calendar view

**account.tsx** ✅

- User profile
- Settings
- Badge collection

### 3. Authentication (src/app/authentication/)

**login.tsx** ✅

- Email/password login
- Social auth (to be added)

---

## ⚡ CRITICAL RULES FOR AI ASSISTANTS

### DO ✅

1. **Always use existing components** from `src/components/`
2. **Always use path aliases** (`#components`, not `../../components`)
3. **Always import colors** from `#theme/atoms/colors` (never hardcode)
4. **Always use Unistyles** for styling (no inline styles)
5. **Always handle loading/error states**
6. **Always use TypeScript types** (no `any`)
7. **Always check if a screen exists** before creating new one
8. **Always use Yarn** (not npm)

### DON'T ❌

1. **DON'T create new components** without checking existing ones first
2. **DON'T use StyleSheet.create()** (use Unistyles)
3. **DON'T hardcode colors** (use theme)
4. **DON'T use relative imports** for shared code
5. **DON'T modify existing screens** without understanding their purpose
6. **DON'T add packages** without confirming with developer
7. **DON'T use localStorage/AsyncStorage** for auth (use Firebase when implemented)
8. **DON'T skip error boundaries**

---

## 🚦 DEVELOPMENT WORKFLOW

### Before Creating New Code

1. **Check if screen exists:**

```bash
ls src/app/onboarding/  # List onboarding screens
ls src/app/(tabs)/      # List main app screens
```

2. **Check existing components:**

```bash
ls src/components/      # See all components
cat src/components/button.tsx  # View specific component
```

3. **Check theme values:**

```bash
cat src/theme/atoms/colors.ts
cat src/theme/atoms/spacing.ts
```

### Creating New Screen

```typescript
// src/app/onboarding/example.tsx
import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Text } from '#components/atoms';
import { Button } from '#components/button';
import colors from '#theme/atoms/colors';

export default function ExampleScreen() {
  const { styles } = useStyles(stylesheet);

  const handleContinue = () => {
    router.push('/(tabs)/home');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Example Screen</Text>
      <Button label="Continue" onPress={handleContinue} />
    </View>
  );
}

const stylesheet = createStyleSheet({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: 24,
  },
});
```

### Updating Existing Screen

**⚠️ IMPORTANT: Always review the existing code before modifying!**

```bash
# First, view the file
cat src/app/onboarding/welcome.tsx

# Then make targeted changes
# DON'T rewrite entire file unless necessary
```

---

## 🐛 COMMON ISSUES & SOLUTIONS

### Issue: Import Error with #components

**Solution:** Ensure `package.json` has:

```json
"imports": {
  "#*": "./src/*"
}
```

And `babel.config.js` has `module-resolver` plugin.

### Issue: Unistyles Not Working

**Solution:**

```bash
yarn add react-native-unistyles
```

Ensure `app/_layout.tsx` initializes Unistyles.

### Issue: Font Not Loading

**Solution:** Check `app/_layout.tsx` for:

```typescript
import { useFonts } from 'expo-font';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
```

---

## 📋 CURRENT PROJECT STATUS

### ✅ COMPLETED

- [x] Project structure (src/ folder)
- [x] Unistyles integration
- [x] Custom theme system (colors, spacing, etc.)
- [x] 50+ reusable components
- [x] Onboarding screens (7 screens)
- [x] Main app screens (4 tabs)
- [x] Authentication screen (login)
- [x] Path aliases (#components, etc.)
- [x] i18next setup

### 🚧 IN PROGRESS

- [ ] Firebase integration
- [ ] State management (Zustand)
- [ ] Complete onboarding flow testing
- [ ] Bottom sheet implementations

### 📝 TODO (MVP)

- [ ] Firebase Auth setup
- [ ] Firestore database integration
- [ ] Task CRUD operations
- [ ] Reflection flow (confrontation screen)
- [ ] Profile page completion
- [ ] Analytics graphs
- [ ] Notifications

---

## 🎯 MVP SCOPE (Phase 1)

### Must Have for v1.0:

1. Complete onboarding flow
2. Email/password authentication
3. Add/delete tasks manually
4. Daily check-in (complete/skip task)
5. Reflection screen when task skipped
6. Basic profile (name, avatar, streak)
7. Home dashboard with today's tasks

### Nice to Have (Phase 2):

- Pre-made task library
- Google Sign-In
- Calendar view
- Advanced statistics
- Push notifications

---

## 🤝 COLLABORATION WITH AI ASSISTANTS

### Optimal Prompt Structure

**❌ Bad Prompt:**

```
"Create a button component"
```

**✅ Good Prompt:**

```
"Check if src/components/button.tsx exists.
If yes, show me how to use it.
If no, create a new button component following:
- Unistyles for styling
- Import colors from #theme/atoms/colors
- Props: label, onPress, variant?, disabled?
- Pill shape (borderRadius: 100)
- Primary variant: colors.brand.DEFAULT background
- File path: src/components/button.tsx"
```

### Example Workflow

**Task:** "Create categories selection screen for onboarding"

**AI Should:**

1. Check if `src/app/onboarding/categories.tsx` exists
2. If yes, review it and suggest improvements
3. If no, create it using:
   - Existing `#components/atoms/Text`
   - Custom chip component OR existing selectbox
   - Colors from theme
   - Unistyles
   - Navigation to next screen

---

## 📞 REFERENCE FILES

### Quick Access Commands

```bash
# View color palette
cat src/theme/atoms/colors.ts

# List all components
ls src/components/

# View button component
cat src/components/button.tsx

# View onboarding screens
ls src/app/onboarding/

# View a specific screen
cat src/app/onboarding/welcome.tsx
```

---

## 🔮 FUTURE ENHANCEMENTS

- AI-powered insights ("You struggle on Tuesdays...")
- Apple Watch quick check-in
- Widget support (iOS/Android)
- Accountability partner feature
- Export data for thesis (anonymized CSV)
- Dark mode support

---

**Remember:** This app is about compassion, not punishment. Every design decision should reinforce
that **users are safe to fail** and **encouraged to reflect**.
