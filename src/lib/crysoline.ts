import { CRYSOLINE_API } from "./constants";
import { env } from "./env";
import { safeAwait } from "./safe-await";

const CRYSOLINE_API_KEY = env.CRYSOLINE_API_KEY;

interface CryMapping {
  provider: string;
  providerId: string;
}

interface CryBase {
  anilistId: string;
  malId: string;
}

interface CryDataItem {
  id: string;
  base: CryBase;
  mappings: CryMapping[];
}

interface CryApiResponse {
  success: boolean;
  data: CryDataItem[];
  message: string;
  timestamp: string;
}

export const getCrysolineMapping = async (malId: string) => {
  const url = `${CRYSOLINE_API}/providers/map/mal/${malId}`;

  const { data: response, error: fetchError } = await safeAwait(
    fetch(url, {
      headers: {
        "X-API-Key": CRYSOLINE_API_KEY,
      },
    }),
  );

  if (fetchError) {
    console.error(
      `Failed to crysoline mapping art for ID ${malId}:`,
      fetchError.message,
    );
    return null;
  }

  if (!response.ok) {
    console.warn(`API returned ${response.status} for ID ${malId}`);
    return null;
  }

  const { data: jsonData, error: parseError } = await safeAwait<CryApiResponse>(
    response.json(),
  );

  if (parseError) {
    console.error(
      `Failed to parse JSON response for ID ${malId}:`,
      parseError.message,
    );
    return null;
  }

  if (!jsonData.success || !jsonData.data || jsonData.data.length === 0) {
    console.warn(`No mappings found for MAL ID ${malId}`);
    return {};
  }

  return jsonData.data.reduce(
    (acc, item) => {
      item.mappings.forEach((mapping) => {
        acc[mapping.provider] = mapping.providerId;
      });
      return acc;
    },
    {} as Record<string, string>,
  ) as Record<string, string>;
};
