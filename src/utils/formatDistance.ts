import i18n from '#lang/i18n';

export default function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    const distanceMeters = Math.round(distanceKm * 1000);
    return `${distanceMeters} ${i18n.t('general.meters')}`;
  } else {
    return `${distanceKm.toFixed(2)} ${i18n.t('general.km')}`;
  }
}
