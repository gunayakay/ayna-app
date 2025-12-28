import isStringEmpty from '#/utils/isStringEmpty'; // Adjust the path as per your project structure

describe('isEmptyString Utility Function', () => {
  it('should return true for an empty string', () => {
    expect(isStringEmpty('')).toBe(true);
  });

  it('should return true for a string with only spaces', () => {
    expect(isStringEmpty('   ')).toBe(true);
  });

  it('should return false for a non-empty string', () => {
    expect(isStringEmpty('Hello')).toBe(false);
  });

  it('should return true for null', () => {
    expect(isStringEmpty(null)).toBe(true);
  });

  it('should return true for undefined', () => {
    expect(isStringEmpty(undefined)).toBe(true);
  });

  it('should return false for a string with non-space characters', () => {
    expect(isStringEmpty(' a ')).toBe(false);
  });
});
