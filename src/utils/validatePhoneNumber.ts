export default function validateTurkishPhoneNumber(phoneNumber: string) {
  const pattern = /^0\(\d{3}\)\s\d{3}\s\d{2}\s\d{2}$/;
  const result = pattern.test(phoneNumber);
  return result;
}
