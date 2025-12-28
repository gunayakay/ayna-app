import { TouchableOpacity, View } from 'react-native';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createStyleSheet, useStyles } from 'react-native-unistyles';

import { Row } from '#components';
import { ROUTES } from '#constants';
import useGetMeHeader from '#features/account/hooks/useGetMeHeader';
import { removeAppPath } from '#utils';

import { Container, Image, Text } from './atoms';
import HeaderSkeletonLoading from './header-skeleton';
import MainLayout from './main-layout';

export interface TabsLayoutProps {
  children: React.ReactNode;
  isAccount?: boolean;
  disableBottomMargin?: boolean;
  statusBarColor?: string;
  enableMargin?: boolean;
}

export function TabsHeader() {
  const { data, isLoading } = useGetMeHeader();
  const { styles } = useStyles(stylesheet);
  const { t } = useTranslation();

  const headerImage =
    (process.env.EXPO_PUBLIC_IMAGE_URL ?? '') + removeAppPath(data?.value?.profilePhoto ?? '');

  const handleNavigateProfile = () => {
    router.push(ROUTES.ACCOUNT_PROFILE);
  };
  return (
    <Container style={styles.container}>
      {isLoading ? (
        <HeaderSkeletonLoading isLoading={isLoading} />
      ) : (
        <TouchableOpacity onPress={handleNavigateProfile} style={styles.welcomeWrapper}>
          <Row>
            {data?.value?.profilePhoto && (
              <Image
                source={{
                  uri: headerImage,
                }}
                style={styles.pp}
              />
            )}
            <View>
              <Text style={styles.welcomeText}>
                {data?.value?.firstName
                  ? t('screens.tabs.welcomeText', { name: data?.value?.firstName })
                  : t('screens.tabs.welcomeTextWithoutName')}
              </Text>
              <Text style={styles.welcomeSubtext}>{t('screens.tabs.welcomeSubtext')}</Text>
            </View>
          </Row>
        </TouchableOpacity>
      )}
    </Container>
  );
}

export default function TabsLayout({
  children,
  isAccount,
  disableBottomMargin,
  statusBarColor = 'white',
  enableMargin = true,
}: TabsLayoutProps) {
  const { styles, theme } = useStyles(stylesheet);
  const insets = useSafeAreaInsets();
  const tabbarHeight = disableBottomMargin
    ? 0
    : theme.spacing[12] + insets.bottom + 2 * theme.spacing[2];

  return (
    <MainLayout
      statusBarColor={statusBarColor}
      enableMargin={enableMargin}
      style={[styles.layout, { marginBottom: tabbarHeight }]}>
      {isAccount ? null : <TabsHeader />}
      {children}
    </MainLayout>
  );
}

const stylesheet = createStyleSheet(theme => ({
  layout: {
    backgroundColor: theme.colors.white,
  },
  container: {
    paddingVertical: theme.spacing[2],
    flexDirection: 'row',
    gap: theme.spacing[2],
    marginBottom: theme.spacing[2],
  },
  pp: {
    width: theme.spacing[12],
    aspectRatio: 1,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.typography.PRIMARY[100],
  },
  welcomeWrapper: {
    justifyContent: 'space-between',
  },
  welcomeText: {
    fontSize: theme.fontSizes.xl,
    fontFamily: theme.fontFamily.semiBold,
    color: theme.colors.typography.PRIMARY[800],
  },
  welcomeSubtext: {
    fontFamily: theme.fontFamily.regular,
    color: theme.colors.typography.PRIMARY[600],
  },
  filterIconContainer: {
    marginLeft: 'auto',
    aspectRatio: 1,
    justifyContent: 'center',
    borderRadius: theme.borderRadius.full,
    alignItems: 'center',
    backgroundColor: theme.colors.typography.PRIMARY[100],
  },
}));
