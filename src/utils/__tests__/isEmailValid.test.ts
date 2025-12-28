import isEmailValid from '#/utils/isEmailValid';

describe('isEmailValid', () => {
  it('should return true for a valid email without Turkish characters', () => {
    const email = 'test@example.com';
    expect(isEmailValid(email)).toBe(true);
  });

  it('should return false for an email with Turkish characters', () => {
    const email = 'testç@example.com';
    expect(isEmailValid(email)).toBe(false);
  });

  it('should return false for an invalid email format', () => {
    const email = 'test@.com';
    expect(isEmailValid(email)).toBe(false);
  });

  it('should return false for an email with invalid domain', () => {
    const email = 'test@example';
    expect(isEmailValid(email)).toBe(false);
  });

  it('should return false for an email with multiple "@" symbols', () => {
    const email = 'test@@example.com';
    expect(isEmailValid(email)).toBe(false);
  });

  it('should return false for an email with spaces', () => {
    const email = 'test @example.com';
    expect(isEmailValid(email)).toBe(false);
  });

  it('should return false for an email with special characters in the domain', () => {
    const email = 'test@exa!mple.com';
    expect(isEmailValid(email)).toBe(false);
  });
});
