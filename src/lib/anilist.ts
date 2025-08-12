import { METRIC_QUERY } from "./anilist-query";
import { ANILIST_API } from "./constants";
import { safeAwait } from "./safe-await";

export type MediaSort =
  | "ID"
  | "ID_DESC"
  | "TITLE_ROMAJI"
  | "TITLE_ROMAJI_DESC"
  | "TITLE_ENGLISH"
  | "TITLE_ENGLISH_DESC"
  | "TITLE_NATIVE"
  | "TITLE_NATIVE_DESC"
  | "TYPE"
  | "TYPE_DESC"
  | "FORMAT"
  | "FORMAT_DESC"
  | "START_DATE"
  | "START_DATE_DESC"
  | "END_DATE"
  | "END_DATE_DESC"
  | "SCORE"
  | "SCORE_DESC"
  | "POPULARITY"
  | "POPULARITY_DESC"
  | "TRENDING"
  | "TRENDING_DESC"
  | "EPISODES"
  | "EPISODES_DESC"
  | "DURATION"
  | "DURATION_DESC"
  | "STATUS"
  | "STATUS_DESC";

export type MediaSeason = "WINTER" | "SPRING" | "SUMMER" | "FALL";

export interface AnilistMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  coverImage: {
    extraLarge: string;
    large: string;
    medium: string;
    color: string | null;
  };
  bannerImage: string | null;
  description: string;
  averageScore: number;
  episodes: number;
  season: string;
  seasonYear: number;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  endDate: {
    year: number;
    month: number;
    day: number;
  };
  format: string;
  status: string;
  genres: string[];
  studios: {
    nodes: {
      name: string;
    }[];
  };
  popularity: number;
  trending: number;
}

export interface AnilistResponse {
  data: {
    Page: {
      pageInfo: {
        total: number;
        currentPage: number;
        lastPage: number;
        hasNextPage: boolean;
        perPage: number;
      };
      media: AnilistMedia[];
    };
  };
}

export interface AnilistQueryParams {
  page?: number;
  perPage?: number;
  sort?: MediaSort[];
  season?: MediaSeason;
  year?: number;
}

export const getAnilistMetric = async (
  params: AnilistQueryParams = {},
): Promise<AnilistResponse> => {
  const {
    page = 1,
    perPage = 20,
    sort = ["POPULARITY_DESC"],
    season,
    year,
  } = params;

  const response = await fetch(ANILIST_API, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "Cache-Control": "max-age=18000",
      Pragma: "cache",
      Expires: "18000",
    },
    body: JSON.stringify({
      query: METRIC_QUERY,
      variables: { page, perPage, sort, season, year },
    }),
  });

  if (!response.ok) {
    throw new Error(`Anilist API error: ${response.status}`);
  }

  return (await response.json()) as AnilistResponse;
};

type AniListCoverImage = {
  extraLarge: string;
  large: string;
  medium: string;
  color: string | null;
};

export type AniListImageMedia = {
  coverImage: AniListCoverImage;
  bannerImage: string | null;
};

export const getAniListAnimeImages = async (
  id: string,
): Promise<AniListImageMedia | null> => {
  if (!id) {
    console.error("❌ getAniListAnimeImages: Missing anime ID");
    return null;
  }

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        coverImage {
          extraLarge
          large
          medium
          color
        }
        bannerImage
      }
    }
  `;

  const variables = { id: Number(id) };

  const { data: response, error: fetchError } = await safeAwait(
    fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }),
  );

  if (fetchError || !response?.ok) {
    console.error(
      `❌ Failed to fetch anime info from AniList: ${fetchError?.message || response?.statusText}`,
    );
    return null;
  }

  const { data: json, error: parseError } = await safeAwait(response.json());

  if (parseError || !json?.data?.Media) {
    console.error("❌ Failed to parse AniList anime JSON", parseError);
    return null;
  }

  return json.data.Media as AniListImageMedia;
};

export const getMalIdFromAniList = async (
  aniListId: string,
): Promise<number | null> => {
  if (!aniListId) {
    console.error("❌ getMalIdFromAniList: Missing AniList ID");
    return null;
  }

  const query = `
    query ($id: Int) {
      Media(id: $id, type: ANIME) {
        idMal
      }
    }
  `;

  const variables = { id: Number(aniListId) };

  const { data: response, error: fetchError } = await safeAwait(
    fetch(ANILIST_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ query, variables }),
    }),
  );

  if (fetchError || !response?.ok) {
    console.error(
      `❌ Failed to fetch MAL ID from AniList: ${fetchError?.message || response?.statusText}`,
    );
    return null;
  }

  const { data: json, error: parseError } = await safeAwait(response.json());

  if (parseError || !json?.data?.Media) {
    console.error("❌ Failed to parse AniList MAL ID JSON", parseError);
    return null;
  }

  return json.data.Media.idMal;
};
