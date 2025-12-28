export default function deepEqualPartial(
  obj1: Record<string, any>,
  obj2: Record<string, any>
): boolean {
  if (obj1 === obj2) return true;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object' || obj1 === null || obj2 === null) {
    return false;
  }

  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2) || obj1.length !== obj2.length) return false;

    return obj1.every((item, index) => deepEqualPartial(item, obj2[index]));
  }

  return Object.keys(obj1).every(key => {
    if (!(key in obj2)) return false;
    return deepEqualPartial(obj1[key], obj2[key]);
  });
}
