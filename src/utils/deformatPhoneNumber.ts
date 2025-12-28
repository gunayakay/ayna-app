export default function deformatPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace(/\D/g, '').replace(/^0/, '');
}
