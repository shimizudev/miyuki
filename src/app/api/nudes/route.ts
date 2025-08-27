import { getMappings } from "@/lib/mapping";
import { getCrysolineEpisodes } from "@/lib/crysoline";
import { getAnizipEpisodes } from "@/lib/anizip";
import {
  getKitsuAnimeEpisodes,
  getKitsuIdFromMappings,
  KitsuEpisode,
} from "@/lib/kitsu";
import { EpisodeData } from "@/lib/info";
import { NormalizedEpisode } from "@/lib/crysoline";
import {
  createSuccessResponse,
  createErrorResponse,
  ErrorCodes,
} from "@/lib/helpers/response";
import { formatDistanceToNow } from "date-fns";
import { NextRequest } from "next/server";

export const revalidate = 0;

export interface AnimeEpisode {
  id: string;
  title: string | `Episode ${number}`;
  number: number;
  rating: number | null;
  airDate: {
    iso: string | null;
    relative: string | null;
    unix: number | null;
  } | null;
  thumbnail: string | null;
  teaser: string | null;
  description: string | null;
  isFiller: boolean;
}

export interface ProviderEpisode {
  provider: string;
  episodes: AnimeEpisode[];
}

interface EpisodeSourceData {
  anizip: EpisodeData[];
  kitsu: KitsuEpisode[];
  crysoline: {
    nexus?: NormalizedEpisode[];
    anizone?: NormalizedEpisode[];
    [key: string]: NormalizedEpisode[] | undefined;
  };
}

const mergeEpisodes = (sourceData: EpisodeSourceData): AnimeEpisode[] => {
  const { anizip, kitsu, crysoline } = sourceData;
  const episodeMap = new Map<number, Partial<AnimeEpisode>>();

  anizip.forEach((episode) => {
    const episodeNumber = episode.episodeNumber;
    if (!episodeNumber) return;

    let airDate = null;
    if (episode.airDate || episode.airdate) {
      const dateStr = episode.airDate || episode.airdate;
      const date = new Date(dateStr!);
      if (!isNaN(date.getTime())) {
        airDate = {
          iso: date.toISOString(),
          relative: formatDistanceToNow(date),
          unix: Math.floor(date.getTime() / 1000),
        };
      }
    }

    episodeMap.set(episodeNumber, {
      id: episode.tvdbId?.toString() || `episode-${episodeNumber}`,
      title:
        episode.title?.en ||
        episode.title?.["x-jat"] ||
        `Episode ${episodeNumber}`,
      number: episodeNumber,
      rating:
        typeof episode.rating === "string"
          ? Number.parseFloat(episode.rating)
          : typeof episode.rating === "number"
            ? episode.rating
            : null,
      airDate,
      thumbnail: episode.image || null,
      teaser: null,
      description: episode.overview || null,
      isFiller: false,
    });
  });

  kitsu.forEach((episode) => {
    const episodeNumber = episode.attributes.number;
    if (!episodeNumber) return;

    const existing = episodeMap.get(episodeNumber) || {};

    let airDate = existing.airDate;
    if (episode.attributes.airDate && !airDate) {
      const date = new Date(episode.attributes.airDate);
      if (!isNaN(date.getTime())) {
        airDate = {
          iso: date.toISOString(),
          relative: formatDistanceToNow(date),
          unix: Math.floor(date.getTime() / 1000),
        };
      }
    }

    const kitsuThumbnail =
      episode.attributes.thumbnail?.original ||
      episode.attributes.thumbnail?.large ||
      episode.attributes.thumbnail?.medium ||
      episode.attributes.thumbnail?.small ||
      null;

    episodeMap.set(episodeNumber, {
      ...existing,
      id: existing.id || episode.id,
      title:
        existing.title ||
        episode.attributes.canonicalTitle ||
        `Episode ${episodeNumber}`,
      number: episodeNumber,
      airDate,
      thumbnail: existing.thumbnail || kitsuThumbnail,
      description:
        existing.description ||
        episode.attributes.description ||
        episode.attributes.synopsis ||
        null,
    });
  });

  if (crysoline.nexus) {
    crysoline.nexus.forEach((episode) => {
      const episodeNumber = episode.number;
      if (!episodeNumber) return;

      const existing = episodeMap.get(episodeNumber);
      if (existing && episode.image) {
        existing.thumbnail = episode.image;
      }

      if (
        existing &&
        episode.isFiller !== null &&
        episode.isFiller !== undefined
      ) {
        existing.isFiller = episode.isFiller;
      }
    });
  }

  if (crysoline.anizone) {
    crysoline.anizone.forEach((episode) => {
      const episodeNumber = episode.number;
      if (!episodeNumber) return;

      const existing = episodeMap.get(episodeNumber);
      if (existing) {
        if (episode.teaserUrl) {
          existing.teaser = episode.teaserUrl;
        }

        if (!existing.thumbnail && episode.image) {
          existing.thumbnail = episode.image;
        }

        if (episode.isFiller !== null && episode.isFiller !== undefined) {
          existing.isFiller = episode.isFiller;
        }
      }
    });
  }

  Object.entries(crysoline).forEach(([provider, episodes]) => {
    if (provider === "nexus" || provider === "anizone" || !episodes) return;

    episodes.forEach((episode) => {
      const episodeNumber = episode.number;
      if (!episodeNumber) return;

      if (!episodeMap.has(episodeNumber)) {
        episodeMap.set(episodeNumber, {
          id: episode.id?.toString() || `${provider}-episode-${episodeNumber}`,
          title: episode.title || `Episode ${episodeNumber}`,
          number: episodeNumber,
          rating: null,
          airDate: null,
          thumbnail: episode.image || null,
          teaser: episode.teaserUrl || null,
          description: episode.description || null,
          isFiller: episode.isFiller || false,
        });
      } else {
        const existing = episodeMap.get(episodeNumber)!;

        if (episode.isFiller !== null && episode.isFiller !== undefined) {
          existing.isFiller = episode.isFiller;
        }

        if (!existing.teaser && episode.teaserUrl) {
          existing.teaser = episode.teaserUrl;
        }
      }
    });
  });

  const episodes = Array.from(episodeMap.values())
    .filter((episode): episode is AnimeEpisode => {
      return !!(episode.id && episode.title && episode.number);
    })
    .sort((a, b) => a.number - b.number);

  return episodes;
};

export const GET = async (req: NextRequest) => {
  const id = new URL(req.url).searchParams.get("id");

  if (!id) {
    return Response.json(
      createErrorResponse(
        ErrorCodes.BAD_REQUEST,
        "Missing required parameter: id",
        { message: "Anime ID is required" },
      ),
      { status: 200 },
    );
  }

  try {
    const [mappings, crysolineEpisodes, anizipEpisodes] = await Promise.all([
      getMappings(id),
      getCrysolineEpisodes(id),
      getAnizipEpisodes(id),
    ]);

    if (!anizipEpisodes) {
      return Response.json(
        createErrorResponse(
          ErrorCodes.NOT_FOUND,
          "No episode data found from Anizip",
          { animeId: id },
        ),
        {
          status: 400,
        },
      );
    }

    const kitsuId = getKitsuIdFromMappings(mappings);
    const kitsuEpisodes = kitsuId ? await getKitsuAnimeEpisodes(kitsuId) : null;

    const crysolineByProvider: Record<string, NormalizedEpisode[]> = {};
    crysolineEpisodes.forEach((response) => {
      if (response.episodes && response.episodes.length > 0) {
        crysolineByProvider[response.provider] = response.episodes;
      }
    });

    const sourceData: EpisodeSourceData = {
      anizip: anizipEpisodes,
      kitsu: kitsuEpisodes || [],
      crysoline: crysolineByProvider,
    };

    const mergedMetadataEpisodes = mergeEpisodes(sourceData);

    const providerEpisodes: ProviderEpisode[] = [];

    Object.entries(crysolineByProvider).forEach(([provider, providerEps]) => {
      const episodes: AnimeEpisode[] = [];

      providerEps.forEach((providerEp) => {
        if (!providerEp.number) return;

        const mergedEpisode = mergedMetadataEpisodes.find(
          (ep) => ep.number === providerEp.number,
        );

        if (mergedEpisode) {
          episodes.push({
            ...mergedEpisode,
            id:
              providerEp.id?.toString() ||
              `${provider}-episode-${providerEp.number}`,
          });
        }
      });

      if (episodes.length > 0) {
        providerEpisodes.push({
          provider,
          episodes: episodes.sort((a, b) => a.number - b.number),
        });
      }
    });

    return Response.json(
      createSuccessResponse(
        providerEpisodes,
        "Provider episodes retrieved successfully",
      ),
      { status: 200 },
    );
  } catch (error) {
    console.error(`Error fetching episodes for anime ${id}:`, error);
    return Response.json(
      createErrorResponse(
        ErrorCodes.INTERNAL_ERROR,
        "Failed to fetch episode data",
        {
          animeId: id,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      ),
      { status: 500 },
    );
  }
};
