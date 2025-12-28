const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
const turkishCharactersRegex = /[çÇğĞıİöÖşŞüÜ]/;

/**
 * Validates if the given email is in a proper format and does not contain Turkish characters.
 * @param email - The email string to validate.
 * @returns True if the email is valid and does not contain Turkish characters, false otherwise.
 */
export default function isEmailValid(email: string): boolean {
  return emailRegex.test(email) && !turkishCharactersRegex.test(email);
}
