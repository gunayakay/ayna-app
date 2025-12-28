export default function isTCKNValid(tckn: string) {
  const isEleven = /^[0-9]{11}$/.test(tckn);
  let totalX = 0;
  for (let i = 0; i < 10; i += 1) {
    totalX += Number(tckn.substring(i, 1));
  }
  const isRuleX = totalX % 10 === Number(tckn.substring(10, 1));
  let totalY1 = 0;
  let totalY2 = 0;
  for (let i = 0; i < 10; i += 2) {
    totalY1 += Number(tckn.substring(i, 1));
  }
  for (let i = 1; i < 10; i += 2) {
    totalY2 += Number(tckn.substring(i, 1));
  }
  const isRuleY = (totalY1 * 7 - totalY2) % 10 === Number(tckn.substring(9, 0));

  if (!(isEleven && isRuleX && isRuleY)) {
    return false;
  }

  return true;
}
