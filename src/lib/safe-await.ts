// Type definitions for the safeAwait function
type SafeAwaitResult<T> =
  | {
      data: T;
      error: null;
    }
  | {
      data: null;
      error: Error;
    };

/**
 * A type-safe wrapper for async operations that never throws.
 * Returns a tuple-like object with either data or error, never both.
 *
 * @param promise - The promise to await safely
 * @returns Promise resolving to an object with either data or error
 *
 * @example
 * ```typescript
 * const { data, error } = await safeAwait(fetchUser(id));
 * if (error) {
 *   console.error('Failed to fetch user:', error.message);
 *   return;
 * }
 * // data is guaranteed to be non-null here
 * console.log('User:', data.name);
 * ```
 */
async function safeAwait<T>(promise: Promise<T>): Promise<SafeAwaitResult<T>> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (err) {
    // Ensure we always return an Error instance
    const error = err instanceof Error ? err : new Error(String(err));
    return { data: null, error };
  }
}

// Alternative tuple-based version (Go-style)
type SafeAwaitTuple<T> = Promise<[T, null] | [null, Error]>;

/**
 * Go-style error handling version that returns a tuple [data, error]
 *
 * @param promise - The promise to await safely
 * @returns Promise resolving to [data, null] on success or [null, error] on failure
 *
 * @example
 * ```typescript
 * const [data, error] = await safeAwaitTuple(fetchUser(id));
 * if (error) {
 *   console.error('Failed to fetch user:', error.message);
 *   return;
 * }
 * console.log('User:', data.name);
 * ```
 */
async function safeAwaitTuple<T>(promise: Promise<T>): SafeAwaitTuple<T> {
  try {
    const data = await promise;
    return [data, null];
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    return [null, error];
  }
}

// Enhanced version with custom error transformation
type ErrorTransformer<E = Error> = (error: unknown) => E;

/**
 * Enhanced safeAwait with custom error transformation
 *
 * @param promise - The promise to await safely
 * @param transformError - Optional function to transform caught errors
 * @returns Promise resolving to an object with either data or transformed error
 *
 * @example
 * ```typescript
 * const { data, error } = await safeAwaitWithTransform(
 *   fetch('/api/user'),
 *   (err) => new CustomApiError(String(err))
 * );
 * ```
 */
async function safeAwaitWithTransform<T, E = Error>(
  promise: Promise<T>,
  transformError?: ErrorTransformer<E>,
): Promise<{ data: T; error: null } | { data: null; error: E }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (err) {
    const error = transformError
      ? transformError(err)
      : ((err instanceof Error ? err : new Error(String(err))) as E);
    return { data: null, error };
  }
}

// Utility type guards for better type narrowing
function isSuccess<T>(
  result: SafeAwaitResult<T>,
): result is { data: T; error: null } {
  return result.error === null;
}

function isError<T>(
  result: SafeAwaitResult<T>,
): result is { data: null; error: Error } {
  return result.error !== null;
}

export {
  safeAwait,
  safeAwaitTuple,
  safeAwaitWithTransform,
  isSuccess,
  isError,
};
export type { SafeAwaitResult, SafeAwaitTuple, ErrorTransformer };
