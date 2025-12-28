export default function isVKNValid(vkn: string) {
  const digits = vkn.split('');
  digits.pop();

  const r: number[] = [];

  digits.forEach((el, i) => {
    const x = Number(el) + 10 - (i + 1);
    const mod = x % 10;
    if (mod === 9) {
      r.push(mod);
    } else {
      const pow = 2 ** (10 - (i + 1));
      r.push((mod * pow) % 9);
    }
  });

  const total = r.reduce((acc, cur) => acc + cur);
  const c = (10 - ((total % 10) % 10)) % 10;

  return `${digits.join('')}${c}` === vkn;
}
