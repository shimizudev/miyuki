import { CRYSOLINE_API } from "./constants";
import { env } from "./env";
import { getMappings } from "./mapping";
import { miyuki } from "./request";

const CRYSOLINE_API_KEY = env.CRYSOLINE_API_KEY;

// ... (keep all existing interfaces)

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

interface NImage {
  resized: Record<string, string>;
  resized_blur: Record<string, string>;
}

interface KFormatImage {
  aspectRatio: number | null;
  jpeg: {
    sm: string;
    hq: string;
  };
  webp: {
    sm: string;
    hq: string;
  };
}

export interface Episode<T = unknown> {
  id: number | string | null | undefined;
  title: string | null | undefined;
  image: KFormatImage | NImage | string | null | undefined;
  description: string | null | undefined;
  number: number | null | undefined;
  teaserUrl: string | null | undefined;
  metadata: T | null | undefined;
  isFiller: boolean | null | undefined;
  isRecap: boolean | null | undefined;
}

export interface NormalizedEpisode<T = unknown> {
  id: number | string | null | undefined;
  title: string | null | undefined;
  image: string | null;
  description: string | null | undefined;
  number: number | null | undefined;
  teaserUrl: string | null | undefined;
  metadata: T | null | undefined;
  isFiller: boolean | null | undefined;
  isRecap: boolean | null | undefined;
}

export const CrysolineMappingProviders = [
  "animenexus",
  "animepahe",
  "anizone",
  "animeheaven",
  "animeparadise",
  "animeonsen",
];

export type CrysolineProvider =
  | "nexus"
  | "animepahe"
  | "heaven"
  | "anizone"
  | "paradise"
  | "onsen";

interface ProviderEpisodesResponse<T = unknown> {
  provider: CrysolineProvider;
  id: string;
  episodes: NormalizedEpisode<T>[];
  rawEpisodes: Episode<T>[];
  error?: string;
}

const providerNameMapping: Record<string, CrysolineProvider> = {
  animenexus: "nexus",
  animepahe: "animepahe",
  anizone: "anizone",
  animeheaven: "heaven",
  animeparadise: "paradise",
  animeonsen: "onsen",
};

export const getCrysolineMapping = async (malId: string) => {
  const url = `${CRYSOLINE_API}/providers/map/mal/${malId}`;

  try {
    const response = await miyuki.getWithTimeout<CryApiResponse>(url, 15000, {
      headers: {
        "X-API-Key": CRYSOLINE_API_KEY,
      },
    });

    const jsonData = await response.json();

    if (!jsonData.success || !jsonData.data || jsonData.data.length === 0) {
      console.warn(`No mappings found for MAL ID ${malId}`);
      return {};
    }

    return jsonData.data.reduce(
      (acc, item) => {
        item.mappings.forEach((mapping) => {
          acc[mapping.provider.toLowerCase()] = mapping.providerId;
        });
        return acc;
      },
      {} as Record<string, string>,
    ) as Record<string, string>;
  } catch (error) {
    console.error(
      `Failed to get crysoline mapping for ID ${malId}:`,
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
};

const getBestImageUrl = (
  image: KFormatImage | NImage | string | null | undefined,
): string | null => {
  if (!image) return null;

  if (typeof image === "string") {
    return image;
  }

  if ("jpeg" in image && image.jpeg) {
    return image.jpeg.hq || image.jpeg.sm || null;
  }

  if ("resized" in image && image.resized) {
    const resolutions = Object.keys(image.resized)
      .map((key) => {
        const match = key.match(/(\d+)x(\d+)/);
        return match
          ? { key, width: parseInt(match[1]), height: parseInt(match[2]) }
          : null;
      })
      .filter(Boolean);

    if (resolutions.length > 0) {
      resolutions.sort((a, b) => b!.width * b!.height - a!.width * a!.height);
      return image.resized[resolutions[0]!.key];
    }

    const firstKey = Object.keys(image.resized)[0];
    return firstKey ? image.resized[firstKey] : null;
  }

  return null;
};

const normalizeEpisode = <T = unknown>(
  episode: Episode<T>,
): NormalizedEpisode<T> => {
  return {
    id: episode.id,
    title: episode.title,
    image: getBestImageUrl(episode.image),
    description: episode.description,
    number: episode.number,
    teaserUrl: episode.teaserUrl,
    metadata: episode.metadata,
    isFiller: episode.isFiller,
    isRecap: episode.isRecap,
  };
};

export const getCrysolineEpisodes = async <T = unknown>(
  id: string,
): Promise<ProviderEpisodesResponse<T>[]> => {
  const mappings = await getMappings(id);
  if (!mappings || Object.keys(mappings).length === 0) {
    return [];
  }

  const requests: Array<{
    provider: CrysolineProvider;
    id: string;
    url: string;
  }> = [];

  for (const [providerName, providerId] of Object.entries(mappings)) {
    if (!providerId) continue;

    const mappedProvider = providerNameMapping[providerName.toLowerCase()];
    if (mappedProvider) {
      requests.push({
        provider: mappedProvider,
        id: providerId,
        url: `${CRYSOLINE_API}/anime/${mappedProvider}/episodes/${providerId}`,
      });
    }
  }

  if (requests.length === 0) {
    return [];
  }

  const results = await Promise.allSettled(
    requests.map(async ({ provider, id: providerId, url }) => {
      try {
        const response = await miyuki.getWithTimeout<{ data: Episode<T>[] }>(
          url,
          2000,
          {
            headers: {
              "X-API-KEY": CRYSOLINE_API_KEY,
            },
          },
        );

        const rawData = await response.json();
        const episodes = rawData.data ? rawData.data.map(normalizeEpisode) : [];

        return {
          provider,
          id: providerId,
          episodes,
          rawEpisodes: rawData.data || [],
        } as ProviderEpisodesResponse<T>;
      } catch (error) {
        return {
          provider,
          id: providerId,
          episodes: [],
          rawEpisodes: [],
          error: error instanceof Error ? error.message : "Unknown error",
        } as ProviderEpisodesResponse<T>;
      }
    }),
  );

  return results.map((result, index) => {
    if (result.status === "fulfilled") {
      return result.value;
    } else {
      const { provider, id: providerId } = requests[index];
      return {
        provider,
        id: providerId,
        episodes: [],
        rawEpisodes: [],
        error: result.reason?.message || "Request failed",
      } as ProviderEpisodesResponse<T>;
    }
  });
};
