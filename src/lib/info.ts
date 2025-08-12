import { ANIZIP_URL } from "./constants";
import { extractBanner, extractClearLogo, extractPoster } from "./anizip";
import { getMalAnimeInfo, MALAnime } from "./jikan";
import { safeAwait } from "./safe-await";
import {
  AniListImageMedia,
  getAniListAnimeImages,
  getMalIdFromAniList,
} from "./anilist";
import { getCrysolineMapping } from "./crysoline";
import { getTVDBArtworks } from "./tvdb";

interface MediaTitle {
  [langCode: string]: string | null; // e.g., "en", "ja", "x-jat", can be null
}

type EpisodeTitle = MediaTitle;

interface EpisodeData {
  tvdbShowId: number;
  tvdbId: number;
  seasonNumber: number;
  episodeNumber: number;
  absoluteEpisodeNumber: number;
  title?: EpisodeTitle;
  airDate?: string; // YYYY-MM-DD
  airDateUtc?: string; // ISO string
  runtime?: number;
  overview?: string;
  image?: string;
  episode?: string; // episode as string (e.g., "1")
  anidbEid?: number;
  length?: number; // duplicate of runtime?
  airdate?: string; // duplicate of airDate
  rating?: string | number;
  finaleType?: string; // e.g., "series"
}

export interface MediaImage {
  coverType: "Banner" | "Poster" | "Fanart" | "Clearlogo" | string;
  url: string;
}

interface MediaMappings {
  animeplanet_id?: string;
  kitsu_id?: number;
  mal_id?: number;
  type?: string;
  anilist_id?: number;
  anisearch_id?: number;
  anidb_id?: number;
  notifymoe_id?: string;
  livechart_id?: number;
  thetvdb_id?: number;
  imdb_id?: string;
  themoviedb_id?: string;
  [key: string]: string | number | undefined;
}

export interface MediaData {
  titles: MediaTitle;
  episodes: Record<string, EpisodeData>;
  episodeCount: number;
  specialCount: number;
  images: MediaImage[];
  mappings: MediaMappings;
}

export type AnimeInfo = MALAnime & {
  mappings: MediaMappings;
  coverImage: string | null;
  clearLogo: string | null;
  bannerImage: string | null;
  color: string | null;
};

const mergeInfo = (
  info: MALAnime,
  meta: MediaData,
  crysolineMappings?: Record<string, string> | null,
  anilistImages?: AniListImageMedia,
  tvdbImages?: { type: string; image: string }[],
) => {
  return {
    ...info,
    mappings: {
      ...meta.mappings,
      ...(crysolineMappings ?? {}),
    },
    clearLogo: extractClearLogo(meta)?.url ?? null,
    bannerImage:
      tvdbImages?.filter((img) => img.type === "banner")[0]?.image ??
      anilistImages?.bannerImage ??
      extractBanner(meta)?.url ??
      null,
    coverImage:
      extractPoster(meta)?.url ??
      anilistImages?.coverImage.extraLarge ??
      anilistImages?.coverImage.large ??
      anilistImages?.coverImage.medium ??
      null,
    color: anilistImages?.coverImage.color,
  } as AnimeInfo;
};

export const getAnimeInfo = async (id: string): Promise<AnimeInfo> => {
  const url = `${ANIZIP_URL}/mappings?anilist_id=${id}`;

  const { data: response, error: fetchError } = await safeAwait(fetch(url));

  if (fetchError) {
    console.error(
      `Failed to fetch clear art for ID ${id}:`,
      fetchError.message,
    );
    return {} as AnimeInfo;
  }

  if (!response.ok) {
    console.warn(`API returned ${response.status} for ID ${id}`);
    return {} as AnimeInfo;
  }

  const { data: jsonData, error: parseError } = await safeAwait(
    response.json(),
  );

  if (parseError) {
    console.error(
      `Failed to parse JSON response for ID ${id}:`,
      parseError.message,
    );
    return {} as AnimeInfo;
  }

  const data = jsonData as MediaData;
  const malId: string | null =
    data.mappings.mal_id?.toString() ??
    (await getMalIdFromAniList(id))?.toString() ??
    null;

  if (!malId) {
    console.error(`Mal Id not found for anilist: ${id}`);
    return {} as AnimeInfo;
  }

  const [mal, anilist, crysoline, tvdb] = await Promise.all([
    getMalAnimeInfo(malId),
    getAniListAnimeImages(id),
    getCrysolineMapping(malId),
    data.mappings.thetvdb_id
      ? getTVDBArtworks(data.mappings.thetvdb_id?.toString())
      : Promise.resolve([]),
  ]);

  if (!mal) {
    console.error(`MAL Info not found for id ${malId}.`);
    return {} as AnimeInfo;
  }

  const info = mergeInfo(mal, data, crysoline, anilist ?? undefined, tvdb);

  return info;
};
