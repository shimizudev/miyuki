import { miyuki } from "./request";
import { KITSU_BASE_URL } from "./constants";

interface KitsuImageDimensions {
  width: number;
  height: number;
}

interface KitsuImageMeta {
  dimensions: {
    tiny?: KitsuImageDimensions;
    small?: KitsuImageDimensions;
    medium?: KitsuImageDimensions;
    large?: KitsuImageDimensions;
  };
}

export interface KitsuImage {
  tiny?: string;
  small?: string;
  medium?: string;
  large?: string;
  original?: string;
  meta?: KitsuImageMeta;
}

export interface KitsuTitles {
  en?: string;
  en_jp?: string;
  ja_jp?: string;
  [key: string]: string | undefined;
}

export interface KitsuEpisode {
  id: string;
  type: "episodes";
  attributes: {
    createdAt: string;
    updatedAt: string;
    description?: string;
    synopsis?: string;
    titles: KitsuTitles;
    canonicalTitle: string;
    seasonNumber: number;
    number: number;
    relativeNumber: number;
    airDate?: string;
    length?: number;
    thumbnail?: KitsuImage;
  };
  relationships: {
    media: {
      data: {
        id: string;
        type: "anime";
      };
    };
    videos?: {
      data: Array<{
        id: string;
        type: "videos";
      }>;
    };
  };
}

export interface KitsuAnime {
  id: string;
  type: "anime";
  attributes: {
    createdAt: string;
    updatedAt: string;
    slug: string;
    description?: string;
    synopsis?: string;
    coverImageTopOffset?: number;
    coverImage?: KitsuImage;
    posterImage?: KitsuImage;
    titles: KitsuTitles;
    canonicalTitle: string;
    abbreviatedTitles?: string[];
    averageRating?: string;
    ratingFrequencies?: { [rating: string]: string };
    userCount?: number;
    favoritesCount?: number;
    startDate?: string;
    endDate?: string;
    nextRelease?: string;
    popularityRank?: number;
    ratingRank?: number;
    ageRating?: string;
    ageRatingGuide?: string;
    status?: "current" | "finished" | "tba" | "unreleased" | "upcoming";
    tba?: string;
    episodeCount?: number;
    episodeLength?: number;
    totalLength?: number;
    subtype?: "TV" | "movie" | "OVA" | "ONA" | "special" | "music";
    showType?: string | null;
    youtubeVideoId?: string;
    nsfw?: boolean;
  };
  relationships: {
    genres?: { data: Array<{ id: string; type: "genres" }> };
    categories?: { data: Array<{ id: string; type: "categories" }> };
    castings?: { data: Array<{ id: string; type: "castings" }> };
    installments?: { data: Array<{ id: string; type: "installments" }> };
    mappings?: { data: Array<{ id: string; type: "mappings" }> };
    reviews?: { data: Array<{ id: string; type: "reviews" }> };
    mediaRelationships?: {
      data: Array<{ id: string; type: "mediaRelationships" }>;
    };
    characters?: { data: Array<{ id: string; type: "mediaCharacters" }> };
    staff?: { data: Array<{ id: string; type: "mediaStaff" }> };
    productions?: { data: Array<{ id: string; type: "mediaProductions" }> };
    quotes?: { data: Array<{ id: string; type: "quotes" }> };
    episodes?: { data: Array<{ id: string; type: "episodes" }> };
    streamingLinks?: { data: Array<{ id: string; type: "streamingLinks" }> };
    animeProductions?: {
      data: Array<{ id: string; type: "animeProductions" }>;
    };
    animeCharacters?: { data: Array<{ id: string; type: "animeCharacters" }> };
    animeStaff?: { data: Array<{ id: string; type: "animeStaff" }> };
  };
}

interface KitsuApiResponse<T> {
  data: T;
  included?: Array<KitsuEpisode | KitsuAnime>;
  meta?: {
    count?: number;
  };
  links?: {
    first?: string;
    next?: string;
    last?: string;
  };
}

export const extractKitsuCoverImage = (anime: KitsuAnime): string | null => {
  const coverImage = anime.attributes.coverImage;
  return (
    coverImage?.original ||
    coverImage?.large ||
    coverImage?.medium ||
    coverImage?.small ||
    null
  );
};

export const extractKitsuPosterImage = (anime: KitsuAnime): string | null => {
  const posterImage = anime.attributes.posterImage;
  return (
    posterImage?.original ||
    posterImage?.large ||
    posterImage?.medium ||
    posterImage?.small ||
    null
  );
};

export const getKitsuAnimeInfo = async (
  id: string,
): Promise<KitsuAnime | null> => {
  const url = `${KITSU_BASE_URL}/anime/${id}`;

  try {
    const response = await miyuki.get<KitsuApiResponse<KitsuAnime>>(url, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
    });

    const jsonData = await response.json();
    return jsonData.data;
  } catch (error) {
    console.error(
      `Failed to fetch Kitsu anime info for ID ${id}:`,
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
};

const fetchKitsuEpisodesPage = async (
  animeId: string,
  offset: number,
  limit: number = 20,
): Promise<KitsuApiResponse<KitsuEpisode[]> | null> => {
  const url = `${KITSU_BASE_URL}/anime/${animeId}/episodes?page[limit]=${limit}&page[offset]=${offset}&sort=number`;

  try {
    const response = await miyuki.get<KitsuApiResponse<KitsuEpisode[]>>(url, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
    });

    return await response.json();
  } catch (error) {
    console.error(
      `Failed to fetch Kitsu episodes page for anime ID ${animeId} at offset ${offset}:`,
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
};

export const getKitsuAnimeEpisodes = async (
  animeId: string,
): Promise<KitsuEpisode[] | null> => {
  const limit = 20;

  const firstPageResponse = await fetchKitsuEpisodesPage(animeId, 0, limit);

  if (!firstPageResponse) {
    return null;
  }

  const totalCount = firstPageResponse.meta?.count || 0;

  if (totalCount === 0) {
    return [];
  }

  if (totalCount <= limit) {
    return firstPageResponse.data;
  }

  const totalPages = Math.ceil(totalCount / limit);

  const pagePromises: Promise<KitsuApiResponse<KitsuEpisode[]> | null>[] = [];

  for (let page = 1; page < totalPages; page++) {
    const offset = page * limit;
    pagePromises.push(fetchKitsuEpisodesPage(animeId, offset, limit));
  }

  const pageResults = await Promise.all(pagePromises);

  const allEpisodes: KitsuEpisode[] = [...firstPageResponse.data];

  for (const pageResult of pageResults) {
    if (pageResult && pageResult.data) {
      allEpisodes.push(...pageResult.data);
    }
  }

  allEpisodes.sort((a, b) => {
    const numA = a.attributes.number || 0;
    const numB = b.attributes.number || 0;
    return numA - numB;
  });

  console.log(
    `Fetched ${allEpisodes.length} episodes for Kitsu anime ID ${animeId}`,
  );

  return allEpisodes;
};

export const searchKitsuAnime = async (
  query: string,
): Promise<KitsuAnime[] | null> => {
  const encodedQuery = encodeURIComponent(query);
  const url = `${KITSU_BASE_URL}/anime?filter[text]=${encodedQuery}&page[limit]=10`;

  try {
    const response = await miyuki.get<KitsuApiResponse<KitsuAnime[]>>(url, {
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
      },
    });

    const jsonData = await response.json();
    return jsonData.data;
  } catch (error) {
    console.error(
      `Failed to search Kitsu anime with query "${query}":`,
      error instanceof Error ? error.message : "Unknown error",
    );
    return null;
  }
};

export const getKitsuIdFromMappings = (mappings: {
  kitsu_id?: number;
}): string | null => {
  return mappings?.kitsu_id?.toString() ?? null;
};
