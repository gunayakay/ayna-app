import isTCKNValid from './isTCKNValid';
import isVKNValid from './isVKNValid';

export default function isTCKNVKNValid(value: string) {
  if (!value) {
    return false;
  }

  const { length } = value;

  if (length < 10 || length > 11) {
    return false;
  }

  const isIDValid = length === 10 ? isVKNValid(value) : isTCKNValid(value);

  return isIDValid;
}
