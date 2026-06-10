import { View } from 'react-native';

import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, useStyles } from '#theme/unistyles';

import { ROUTES } from '#constants';

import SafeguardAction from './safeguard-action';

export default function LegalDocsView() {
  const { styles } = useStyles(stylesheet);
  const { t } = useTranslation();

  const handlePdpaPress = () => {
    router.push(`/${ROUTES.PDF}?uri=https://buum-e.com/assets/resources/kvkk-aydinlatma.pdf`);
  };

  const handleUserAgreementPress = () => {
    router.push(`/${ROUTES.PDF}?uri=https://buum-e.com/assets/resources/uyelik-sozlesmesi.pdf`);
  };

  const handleOpenConsentPress = () => {
    router.push(`/${ROUTES.PDF}?uri=https://buum-e.com/assets/resources/acik-riza-metni.pdf`);
  };

  return (
    <View style={styles.container}>
      <SafeguardAction title={t('screens.account.pdpa')} onPress={handlePdpaPress} />
      <SafeguardAction
        title={t('screens.account.userAgreement')}
        onPress={handleUserAgreementPress}
      />
      <SafeguardAction title={t('screens.account.openConsent')} onPress={handleOpenConsentPress} />
    </View>
  );
}

const stylesheet = StyleSheet.create(() => ({
  container: {
    flex: 1,
  },
}));
