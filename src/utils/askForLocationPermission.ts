import * as Location from 'expo-location';

import i18n from '#lang/i18n';
import { show } from '#lib/toast';

export default async function askForLocationPermission() {
  const locationResponse = await Location.requestForegroundPermissionsAsync();
  if (!locationResponse.granted) {
    show({
      content: i18n.t('screens.onboarding.locationPermissionDenied'),
      type: 'danger',
    });
  }
}
