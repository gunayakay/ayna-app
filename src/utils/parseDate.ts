export default function parseIsoToDate(input: string): string {
  const date = new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error('Invalid date format');
  }

  const day = date.getUTCDate().toString().padStart(2, '0');
  const month = (date.getUTCMonth() + 1).toString().padStart(2, '0');
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}
