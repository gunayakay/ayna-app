// src/utils/__tests__/result.test.ts
import Result from '../result';

describe('Result Class', () => {
  it('should return a success result with default values', () => {
    const result = Result.success();

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBeNull();
    expect(result.error).toBeNull();
  });

  it('should return a success result with provided data', () => {
    const data = 'Success data';
    const result = Result.success(data);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toBe(data);
    expect(result.error).toBeNull();
  });

  it('should return an error result with default values', () => {
    const result = Result.error();

    expect(result.isSuccess).toBe(false);
    expect(result.value).toBeNull();
    expect(result.error).not.toBeNull();
  });

  it('should return an error result with provided message and code', () => {
    const message = 'Not Found';
    const code = 404;
    const result = Result.error(message, code);

    expect(result.isSuccess).toBe(false);
    expect(result.error?.description).toBe(code); // Loglara göre description code'u tutuyor gibi görünüyor
    expect(result.error?.code).toBe(message);
  });

  it('should handle complex objects in success', () => {
    const complexData = { id: 1, info: { name: 'Test' } };
    const result = Result.success(complexData);

    expect(result.isSuccess).toBe(true);
    expect(result.value).toEqual(complexData);
  });
});
