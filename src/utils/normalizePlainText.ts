export default function normalizePlainText(text: string) {
  return text
    .toUpperCase()
    .replace(/Ç/g, 'C')
    .replace(/Ğ/g, 'G')
    .replace(/I/g, 'I')
    .replace(/İ/g, 'I')
    .replace(/Ö/g, 'O')
    .replace(/Ş/g, 'S')
    .replace(/Ü/g, 'U')
    .replace(/\s+/g, ' ')
    .trim();
}
