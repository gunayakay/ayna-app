export default function formatToTurkishDate(timestamp: string) {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}
