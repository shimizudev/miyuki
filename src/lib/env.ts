import { z } from "zod";

const serverSchema = z.object({
  CRYSOLINE_API_KEY: z.string().min(1, "CRYSOLINE_API_KEY is required"),
});

const clientSchema = z.object({
  NEXT_PUBLIC_DOMAIN: z.string(),
});

const combinedSchema = serverSchema.merge(clientSchema);

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
export type CombinedEnv = z.infer<typeof combinedSchema>;

const isServer = typeof window === "undefined";

function parseEnv() {
  if (isServer) {
    const parsed = combinedSchema.safeParse(process.env);

    if (!parsed.success) {
      console.error("❌ Invalid environment variables:");
      console.error(parsed.error.format());
      throw new Error("Invalid environment variables");
    }

    return parsed.data;
  } else {
    const clientEnv = Object.keys(clientSchema.shape).reduce(
      (acc, key) => {
        acc[key] = process.env[key];
        return acc;
      },
      {} as Record<string, string | undefined>,
    );

    const parsed = clientSchema.safeParse(clientEnv);

    if (!parsed.success) {
      console.error("❌ Invalid client environment variables:");
      console.error(parsed.error.format());
      throw new Error("Invalid client environment variables");
    }

    return parsed.data;
  }
}

function createEnv() {
  const parsedEnv = parseEnv();

  if (isServer) {
    return parsedEnv as CombinedEnv;
  } else {
    const clientEnv = parsedEnv as ClientEnv;

    return new Proxy(clientEnv as Record<string, unknown>, {
      get(target, prop: string) {
        if (prop in clientEnv) {
          return target[prop];
        }

        if (prop in serverSchema.shape) {
          throw new Error(
            `❌ Cannot access server environment variable "${prop}" on the client side. ` +
              `Server-only variables are not available in the browser for security reasons.`,
          );
        }

        throw new Error(
          `❌ Environment variable "${prop}" is not defined in the schema. ` +
            `Make sure to add it to the appropriate schema in lib/env.ts`,
        );
      },
    }) as CombinedEnv;
  }
}

export const env = createEnv();

export function getServerEnv(): ServerEnv & ClientEnv {
  if (!isServer) {
    throw new Error("getServerEnv() can only be called on the server side");
  }
  return env as ServerEnv & ClientEnv;
}

export function getClientEnv(): ClientEnv {
  return env as ClientEnv;
}

export function logAvailableEnvVars() {
  if (process.env.NODE_ENV === "development") {
    console.log("🔧 Available environment variables:");
    if (isServer) {
      console.log("Server variables:", Object.keys(serverSchema.shape));
      console.log("Client variables:", Object.keys(clientSchema.shape));
    } else {
      console.log("Client variables:", Object.keys(clientSchema.shape));
      console.log("Note: Server variables are not accessible on the client");
    }
  }
}
