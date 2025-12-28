import colors from './atoms/colors';
import lightTheme from './light';

const businessTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    primaryLightest: colors['pastel-green'][50],
    primaryLighter: colors['pastel-green'][100],
    primaryLight: colors['pastel-green'][400],
    primary: colors['pastel-green'].DEFAULT,
    primaryDarker: colors['pastel-green'][900],
    secondaryLightest: colors.lavender[50],
    secondaryLighter: colors.lavender[100],
    secondary: colors.lavender.DEFAULT,
    secondaryDarker: colors.lavender[900],
  },
};

export default businessTheme;
