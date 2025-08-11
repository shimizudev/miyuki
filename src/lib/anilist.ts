import { METRIC_QUERY } from "./anilist-query";

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

export const getAnilistMetric = async (params: AnilistQueryParams = {}): Promise<AnilistResponse> => {
  const { page = 1, perPage = 20, sort = ["POPULARITY_DESC"], season, year } = params;
  
  const response = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Cache-Control": "max-age=18000",
      "Pragma": "cache",
      "Expires": "18000",
    },
    body: JSON.stringify({
      query: METRIC_QUERY,
      variables: { page, perPage, sort, season, year }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Anilist API error: ${response.status}`);
  }
  
  return await response.json() as AnilistResponse;
};