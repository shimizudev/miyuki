import { miyuki } from "@/lib/request";
import { useQuery } from "@tanstack/react-query";

interface YouTubeVideoData {
  itag: number;
  url: string;
  width: number;
  height: number;
  last_modified: string;
  last_modified_ms: string;
  quality: string;
  fps: number;
  quality_label: string;
  projection_type: string;
  bitrate: number;
  audio_quality: string;
  approx_duration_ms: number;
  audio_sample_rate: number;
  audio_channels: number;
  signature_cipher: string;
  is_drc: boolean;
  mime_type: string;
  is_type_otf: boolean;
  has_audio: boolean;
  has_video: boolean;
  has_text: boolean;
  language: string;
  is_dubbed: boolean;
  is_auto_dubbed: boolean;
  is_descriptive: boolean;
  is_secondary: boolean;
  is_original: boolean;
}

interface YouTubeApiResponse {
  success: boolean;
  data: YouTubeVideoData;
  message: string;
  timestamp: string;
}

interface UseHeroVideoOptions {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

const fetchYouTubeVideo = async (id: string): Promise<YouTubeApiResponse> => {
  const response = await miyuki.get(`/api/yt?id=${id}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch video data: ${response.status}`);
  }

  return response.json();
};

export const useHeroVideo = (id: string, options: UseHeroVideoOptions = {}) => {
  const {
    enabled = true,
    staleTime = 10 * 60 * 1000,
    gcTime = 15 * 60 * 1000,
  } = options;

  return useQuery({
    queryKey: ["heroVideo", id],
    queryFn: () => fetchYouTubeVideo(id),
    enabled: enabled && !!id,
    staleTime,
    gcTime,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export type { YouTubeVideoData, YouTubeApiResponse };
