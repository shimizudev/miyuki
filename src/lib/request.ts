import ky, { Options } from "ky";

const miyukiClient = ky.create({
  timeout: 2000,
  headers: {
    "Cache-Control": "no-store",
    Pragma: "no-cache",
  },
  cache: "no-store",
  hooks: {
    beforeRetry: [
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      async ({ error }: { error: any }) => {
        if (error.response?.status === 429) {
          const retryAfter = error.response.headers.get("retry-after");
          if (retryAfter) {
            const delay = parseInt(retryAfter) * 1000;
            await new Promise((resolve) => setTimeout(resolve, delay));
          }
        }
      },
    ],
  },
});

export const miyuki = {
  get: <T>(url: string, options?: Options) => miyukiClient.get<T>(url, options),
  post: <T>(url: string, options?: Options) =>
    miyukiClient.post<T>(url, options),
  put: <T>(url: string, options?: Options) => miyukiClient.put<T>(url, options),
  patch: <T>(url: string, options?: Options) =>
    miyukiClient.patch<T>(url, options),
  delete: <T>(url: string, options?: Options) =>
    miyukiClient.delete<T>(url, options),

  getWithTimeout: <T>(url: string, timeoutMs: number, options?: Options) =>
    miyukiClient.get<T>(url, { ...options, timeout: timeoutMs }),

  postNoRetry: <T>(url: string, options?: Options) =>
    miyukiClient.post<T>(url, { ...options, retry: 0 }),

  heavyOperation: <T>(url: string, options?: Options) =>
    miyukiClient.post<T>(url, {
      ...options,
      timeout: 120000,
    }),
};

export { miyukiClient };
