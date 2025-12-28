import Result from '#/utils/result';

// Define types for the complex objects
interface User {
  id: number;
  name: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  roles: string[];
}

interface ErrorResponse {
  error: {
    code: string;
    description: string;
    timestamp: string;
  };
}

describe('Result Class', () => {
  it('should return a success result with default values', () => {
    const result = Result.success();

    expect(result).toEqual({
      code: 200,
      data: null,
      message: '',
    });
  });

  it('should return a success result with provided data, status code, and message', () => {
    const result = Result.success('Success data', 201, 'Created successfully');

    expect(result).toEqual({
      code: 201,
      data: 'Success data',
      message: 'Created successfully',
    });
  });

  it('should return a success result with data and default status code and message', () => {
    const result = Result.success('Some data');

    expect(result).toEqual({
      code: 200,
      data: 'Some data',
      message: '',
    });
  });

  it('should return an error result with default values', () => {
    const result = Result.error();

    expect(result).toEqual({
      code: 500,
      data: null,
      message: 'An error occurred',
    });
  });

  it('should return an error result with provided message, status code, and data', () => {
    const result = Result.error('Not Found', 404, 'Error data');

    expect(result).toEqual({
      code: 404,
      data: 'Error data',
      message: 'Not Found',
    });
  });

  it('should return an error result with default message and status code but provided data', () => {
    const result = Result.error(undefined, undefined, 'Some error data');

    expect(result).toEqual({
      code: 500,
      data: 'Some error data',
      message: 'An error occurred',
    });
  });

  it('should handle a complex object as data in a success result', () => {
    const complexData: User = {
      id: 123,
      name: 'John Doe',
      address: {
        street: '123 Main St',
        city: 'Anytown',
        country: 'USA',
      },
      roles: ['admin', 'user'],
    };

    const result = Result.success<User>(complexData, 200, 'User data retrieved successfully');

    expect(result).toEqual({
      code: 200,
      data: complexData,
      message: 'User data retrieved successfully',
    });
  });

  it('should handle a complex object as data in an error result', () => {
    const complexErrorData: ErrorResponse = {
      error: {
        code: 'USER_NOT_FOUND',
        description: 'The user with the given ID was not found.',
        timestamp: '2024-08-28T12:34:56Z',
      },
    };

    const result = Result.error<ErrorResponse>('User not found', 404, complexErrorData);

    expect(result).toEqual({
      code: 404,
      data: complexErrorData,
      message: 'User not found',
    });
  });
});
