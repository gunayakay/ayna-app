import { View } from 'react-native';

import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Bumerang } from '#assets/svg';

import { Svg } from './atoms';
import MainHeader, { MainHeaderProps } from './main-header';
import MainLayout, { MainLayoutProps } from './main-layout';

const NORMAL_HEADER_HEIGHT = '25%';
const NORMAL_CONTENT_HEIGHT = '75%';

export interface FormLayoutProps extends Omit<MainLayoutProps, 'children'> {
  children: React.ReactNode;
  title: string;
  headerPercentage?: string;
  bottomSheetPercentage?: string;
  headerConfig?: MainHeaderProps;
  disabledPadding?: boolean;
}

export default function FormLayout({
  children,
  title,
  headerPercentage = NORMAL_HEADER_HEIGHT,
  bottomSheetPercentage = NORMAL_CONTENT_HEIGHT,
  headerConfig,
  disabledPadding = false,
  ...rest
}: FormLayoutProps) {
  const { styles, theme } = useStyles(stylesheet);

  return (
    <MainLayout style={styles.formContainer} {...rest}>
      <View style={styles.layoutIcon}>
        <Svg Icon={Bumerang} width={351} height={390} fill={theme.colors.secondary} />
      </View>
      <MainHeader title={title} headerPercentage={headerPercentage} {...headerConfig} />
      <View style={styles.formContent(bottomSheetPercentage, disabledPadding)}>{children}</View>
    </MainLayout>
  );
}

const stylesheet = createStyleSheet(theme => ({
  formContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
  },
  layoutIcon: {
    position: 'absolute',
    top: -100,
    right: -20,
    transform: [{ rotate: '45deg' }],
  },
  formContent: (height: any, disabledPadding: boolean) => ({
    paddingHorizontal: disabledPadding ? 0 : theme.spacing[4],
    paddingVertical: theme.spacing[6],
    height,
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius['5xl'],
    borderTopRightRadius: theme.borderRadius['5xl'],
  }),
}));
