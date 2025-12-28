export const TIME_DATA = Array.from({ length: 48 }, (_, i) => {
  const hours = Math.floor(i / 2)
    .toString()
    .padStart(2, '0');
  const minutes = i % 2 === 0 ? '00' : '30';
  return { id: `${hours}:${minutes}`, name: `${hours}:${minutes}` };
});
