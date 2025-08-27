import { useQuery } from "@tanstack/react-query";

interface AnimeEpisode {
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

interface ProviderEpisode {
  provider: string;
  episodes: AnimeEpisode[];
}

interface EpisodesApiResponse {
  success: boolean;
  data: ProviderEpisode[];
  message: string;
  timestamp: string;
}

interface UseEpisodesOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

const fetchEpisodes = async (id: string): Promise<EpisodesApiResponse> => {
  const response = await fetch(`/api/nudes?id=${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch episode data: ${response.status}`);
  }

  return response.json();
};

export const useEpisodes = (id: string, options: UseEpisodesOptions = {}) => {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000,
    gcTime = 15 * 60 * 1000,
  } = options;

  return useQuery({
    queryKey: ["episodes", id],
    queryFn: () => fetchEpisodes(id),
    enabled: enabled && !!id,
    staleTime,
    gcTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type { AnimeEpisode, ProviderEpisode, EpisodesApiResponse };
