export default function formatPhoneNumber(phoneNumber: string): string {
  return phoneNumber.replace(/[()\s-]/g, '').replace(/^0/, '0');
}
