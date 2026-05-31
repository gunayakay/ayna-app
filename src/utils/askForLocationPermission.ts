import * as Location from 'expo-location';

import i18n from '#lang/i18n';
// TODO: #lib/toast modülü mevcut değil - toast kütüphanesi eklenince bu import aktif edilecek
// import { show } from '#lib/toast';

export default async function askForLocationPermission() {
  const locationResponse = await Location.requestForegroundPermissionsAsync();
  if (!locationResponse.granted) {
    // TODO: Toast kütüphanesi entegre edilince show() fonksiyonu kullanılacak
    console.warn(i18n.t('screens.onboarding.locationPermissionDenied'));
  }
}
