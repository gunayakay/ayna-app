export default class Result<T> {
  isSuccess: boolean;
  error: {
    code: string;
    description: string;
    type: number;
  } | null;
  value: T | null;
  totalCount?: number | null;

  private constructor(
    isSuccess: boolean,
    error: { code: string; description: string; type: number } | null,
    value: T | null,
    totalCount: number = 0
  ) {
    this.isSuccess = isSuccess;
    this.error = error;
    this.value = value;
    this.totalCount = totalCount;
  }

  static success<T>(value: T | null = null, totalCount?: number): Result<T> {
    return new Result<T>(true, null, value, totalCount);
  }

  static error<T>(
    code: string = 'UNKNOWN',
    description: string = 'An error occurred',
    type: number = 0,
    value: T | null = null
  ): Result<T> {
    return new Result<T>(false, { code, description, type }, value);
  }
}
