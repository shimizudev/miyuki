import { JIKAN_URL } from "./constants";
import { miyuki } from "./request";
import { safeAwait } from "./safe-await";

export interface MALImageSet {
  image_url: string;
  small_image_url: string;
  large_image_url: string;
}

export interface MALImageFormats {
  jpg: MALImageSet;
  webp: MALImageSet;
}

export interface MALTrailerImages {
  image_url: string;
  small_image_url: string;
  medium_image_url: string;
  large_image_url: string;
  maximum_image_url: string;
}

export interface MALTrailer {
  youtube_id: string;
  url: string;
  embed_url: string;
  images: MALTrailerImages;
}

export interface MALTitles {
  type: string;
  title: string;
}

export interface MALAiredPropDate {
  day: number;
  month: number;
  year: number;
}

export interface MALAired {
  from: string | null;
  to: string | null;
  prop: {
    from: MALAiredPropDate;
    to: MALAiredPropDate;
  };
  string: string;
}

export interface MALBroadcast {
  day: string;
  time: string;
  timezone: string;
  string: string;
}

export interface MALProducer {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface MALGenre {
  mal_id: number;
  type: string;
  name: string;
  url: string;
}

export interface MALRelation {
  relation: string;
  entry: {
    mal_id: number;
    type: string;
    name: string;
    url: string;
  }[];
}

export interface MALThemeSongs {
  openings: string[];
  endings: string[];
}

export interface MALExternalLink {
  name: string;
  url: string;
}

export interface MALStreamingPlatform {
  name: string;
  url: string;
}

export interface MALAnime {
  mal_id: number;
  url: string;
  images: MALImageFormats;
  trailer: MALTrailer;
  approved: boolean;
  titles: MALTitles[];
  title: string;
  title_english?: string;
  title_japanese?: string;
  title_synonyms?: string[];
  type: string;
  source: string;
  episodes: number | null;
  status: string;
  airing: boolean;
  aired: MALAired;
  duration: string;
  rating: string;
  score: number | null;
  scored_by: number | null;
  rank: number | null;
  popularity: number;
  members: number;
  favorites: number;
  synopsis?: string;
  background?: string;
  season?: string;
  year?: number;
  broadcast: MALBroadcast;
  producers: MALProducer[];
  licensors: MALProducer[];
  studios: MALProducer[];
  genres: MALGenre[];
  explicit_genres: MALGenre[];
  themes: MALGenre[];
  demographics: MALGenre[];
  relations: MALRelation[];
  theme: MALThemeSongs;
  external: MALExternalLink[];
  streaming: MALStreamingPlatform[];
}

export const getMalAnimeInfo = async (id: string) => {
  if (!id) {
    console.error("❌ getMalAnimeInfo: Missing anime ID");
    return null;
  }

  const url = `${JIKAN_URL}/anime/${id}/full`;

  const { data: response, error: fetchError } = await safeAwait(
    miyuki.get<{ data: MALAnime }>(url),
  );

  if (fetchError || !response?.ok) {
    console.error(
      `❌ Failed to fetch anime info from Jikan: ${fetchError?.message || response?.statusText}`,
    );
    return null;
  }

  const { data: json, error: parseError } = await safeAwait(response.json());

  if (parseError || !json?.data) {
    console.error("❌ Failed to parse anime info JSON", parseError);
    return null;
  }

  return json.data as MALAnime;
};
