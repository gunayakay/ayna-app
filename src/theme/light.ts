import { Platform } from 'react-native';

import borderRadius from './atoms/borderRadius';
import colors from './atoms/colors';
import fontSizes from './atoms/fontSizes';
import spacing from './atoms/spacing';

const lightTheme = {
  colors: {
    typography: {
      PRIMARY: { ...colors.neutral },
    },
    border: {
      PRIMARY: { ...colors.neutral },
    },
    black: colors.black,
    white: colors.white,
    primaryLightest: colors.lavender[50],
    primaryLighter: colors.lavender[100],
    primaryLight: colors.lavender[400],
    primary: colors.lavender.DEFAULT,
    primaryDarker: colors.lavender[900],
    secondaryLightest: colors['pastel-green'][50],
    secondaryLighter: colors['pastel-green'][200],
    secondary: colors['pastel-green'].DEFAULT,
    secondaryDarker: colors['pastel-green'][900],
    success: colors.malachite.DEFAULT,
    dangerLighter: colors['burnt-sienna'][100],
    dangerLight: colors['burnt-sienna'][400],
    danger: colors['burnt-sienna'].DEFAULT,
    dangerDarker: colors['burnt-sienna'][900],
    warning: colors.sun.DEFAULT,
  },
  spacing: { ...spacing },
  fontSizes: { ...fontSizes },
  borderRadius: { ...borderRadius },
  fontFamily: {
    PRIMARY: Platform.OS === 'ios' ? 'Poppins-Regular' : 'Poppins_400Regular',
    thin: Platform.OS === 'ios' ? 'Poppins-Thin' : 'Poppins_100Thin',
    extraLight: Platform.OS === 'ios' ? 'Poppins-ExtraLight' : 'Poppins_200ExtraLight',
    light: Platform.OS === 'ios' ? 'Poppins-Light' : 'Poppins_300Light',
    regular: Platform.OS === 'ios' ? 'Poppins-Regular' : 'Poppins_400Regular',
    medium: Platform.OS === 'ios' ? 'Poppins-Medium' : 'Poppins_500Medium',
    semiBold: Platform.OS === 'ios' ? 'Poppins-SemiBold' : 'Poppins_600SemiBold',
    bold: Platform.OS === 'ios' ? 'Poppins-Bold' : 'Poppins_700Bold',
    extraBold: Platform.OS === 'ios' ? 'Poppins-ExtraBold' : 'Poppins_800ExtraBold',
    black: Platform.OS === 'ios' ? 'Poppins-Black' : 'Poppins_900Black',
  },
};

export default lightTheme;
