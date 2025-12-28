export default function removeAppPath(input: string) {
  const pathToRemove = process.env.NODE_ENV === 'development' ? '/app/' : '/var/www/buume/';
  if (typeof input === 'string' && input.includes(pathToRemove)) {
    return input.replace(pathToRemove, '');
  }
  return input;
}
