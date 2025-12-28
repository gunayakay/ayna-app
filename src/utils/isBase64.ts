export default function isBase64(str: string): boolean {
  const base64ImageRegex = /^data:image\/(png|jpeg|jpg|gif|bmp|webp);base64,/;

  if (base64ImageRegex.test(str)) {
    try {
      const base64Data = str.split(',')[1];

      if (base64Data.length % 4 === 0 && !/[^A-Za-z0-9+/=]/.test(base64Data)) {
        atob(base64Data);
        return true;
      }
    } catch (e) {
      return false;
    }
  }

  return false;
}
