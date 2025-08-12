import { TVDB_API } from "./constants";

const apiKeys = [
  "f5744a13-9203-4d02-b951-fbd7352c1657",
  "8f406bec-6ddb-45e7-8f4b-e1861e10f1bb",
  "5476e702-85aa-45fd-a8da-e74df3840baf",
  "51020266-18f7-4382-81fc-75a4014fa59f",
];

async function getToken(key: string): Promise<string | undefined> {
  const data: Response | undefined = await fetch(`${TVDB_API}/login`, {
    body: JSON.stringify({
      apikey: `${key}`,
    }),
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  }).catch(() => {
    return undefined;
  });
  if (!data) return undefined;

  if (data.ok) {
    return ((await data.json()) as { data: { token: string } }).data
      .token as string;
  }

  return undefined;
}

export const getTVDBArtworks = async (
  tvdb_id: string,
  type: "series" | "movie" = "series",
) => {
  const token = await getToken(
    apiKeys[Math.floor(Math.random() * apiKeys.length)],
  );

  const url = `${TVDB_API}/${type}/${tvdb_id}/extended`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const info = (await response.json()) as { data: ITVDBResponse };

  const artwork: IArtwork[] = info.data.artworks;

  const artworkIds = {
    banner: [1, 16, 6],
    poster: [2, 7, 14, 27],
    backgrounds: [3, 8, 15],
    icon: [5, 10, 18, 19, 26],
    clearArt: [22, 24],
    clearLogo: [23, 25],
    fanart: [11, 12],
    actorPhoto: [13],
    cinemagraphs: [20, 21],
  };

  const coverImages = artwork.filter((art) =>
    artworkIds.poster.includes(Number(art.type)),
  );
  coverImages.sort((a, b) => b.score - a.score);

  const banners = artwork.filter((art) =>
    artworkIds.backgrounds.includes(Number(art.type)),
  );
  banners.sort((a, b) => b.score - a.score);

  const typeMapping: { [key: string]: string } = {
    backgrounds: "banner",
    banner: "top_banner",
    clearLogo: "clear_logo",
    poster: "poster",
    icon: "icon",
    clearArt: "clear_art",
  };

  function getType(type: number): string | null {
    for (const key in artworkIds) {
      if (artworkIds[key as keyof typeof artworkIds].includes(type)) {
        return typeMapping[key];
      }
    }
    return null;
  }

  const artworkData = artwork
    .map((art) => {
      const type = getType(art.type);
      if (!type) return null;
      return {
        type,
        image: art.image,
      };
    })
    .filter(Boolean) as {
    type: string;
    image: string;
  }[];

  return artworkData;
};

interface ITVDBResponse {
  id: number;
  name: string;
  slug: string;
  image: string;
  nameTranslations: string[];
  overviewTranslations: string[];
  aliases: {
    language: string;
    name: string;
  }[];
  firstAired: string;
  lastAired: string;
  nextAired: string;
  score: number;
  status: {
    id: number;
    name: string;
    recordType: string;
    keepUpdated: boolean;
  };
  originalCountry: string;
  originalLanguage: string;
  defaultSeasonType: number;
  isOrderRandomized: boolean;
  lastUpdated: string;
  averageRuntime: number;
  episodes: number | null;
  overview: string;
  year: number;
  artworks: IArtwork[];
  companies: INetwork[];
  originalNetwork: INetwork;
  latestNetwork: INetwork;
  genres: {
    id: number;
    name: string;
    slug: string;
  }[];
  trailers: {
    id: number;
    name: string;
    url: string;
    language: string;
    runtime: number;
  }[];
  lists: IList[];
  remoteIds: {
    id: string;
    type: number;
    sourceName: string;
  }[];
  characters: ITVDBCharacter[];
  airsDays: {
    sunday: boolean;
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
  };
  airsTime: string;
  seasons: ITVDBSeason[];
  tags: {
    id: number;
    tag: number;
    tagName: string;
    name: string;
    helpText: null;
  }[];
  contentRatings: {
    id: number;
    name: string;
    country: string;
    description: string;
    contentType: string;
    order: number;
    fullname: string | null;
  }[];
  seasonTypes: {
    id: number;
    name: string;
    type: string;
    alternateName: string | null;
  }[];
}

interface IArtwork {
  id: number;
  image: string;
  thumbnail: string;
  language: null | string;
  type: number;
  score: number;
  width: number;
  height: number;
  includesText: boolean;
  thumbnailWidth: number;
  thumbnailHeight: number;
  updatedAt: number;
  status: {
    id: number;
    name: null | string;
  };
  tagOptions: null;
}

interface INetwork {
  id: number;
  name: string;
  slug: string;
  nameTranslations: string[];
  overviewTranslations: string[];
  aliases: string[];
  country: string;
  primaryCompanyType: number;
  activeDate: null;
  inactiveDate: null;
  companyType: {
    companyTypeId: number;
    companyTypeName: string;
  };
  parentCompany: {
    id: null;
    name: null;
    relation: {
      id: null;
      typeName: null;
    };
  };
}

interface IList {
  id: number;
  name: string;
  overview: string;
  url: string;
  isOfficial: boolean;
  nameTranslations: string[];
  overviewTranslations: string[];
  aliases: string[];
  score: number;
  image: string;
  imageIsFallback: boolean;
  remoteIds: null;
  tags: null;
}

interface ITVDBCharacter {
  id: number;
  name: string;
  peopleId: number;
  seriesId: number;
  series: null;
  movie: null;
  movieId: null;
  episodeId: null;
  type: number;
  image: string;
  sort: number;
  isFeatured: boolean;
  url: string;
  nameTranslations: null;
  overviewTranslations: null;
  aliases: null;
  peopleType: string;
  peopleName: string;
  peopleImageURL: string;
  personName: string;
  tagOptions: null;
  personImgURL: string;
}

interface ITVDBSeason {
  id: number;
  seriesId: number;
  type: {
    id: number;
    name: string;
    type: string;
    alternateName: null;
  };
  number: number;
  nameTranslations: string[];
  overviewTranslations: string[];
  image: string;
  imageType: number;
  companies: {
    studio: null;
    network: null;
    production: null;
    distributor: null;
    specialEffects: null;
  };
  lastUpdated: string;
}
