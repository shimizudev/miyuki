import { ANIZIP_URL } from "./constants";
import { MediaData, MediaImage } from "./info";
import { safeAwait } from "./safe-await";

export const extractClearLogo = (data: MediaData): MediaImage | undefined =>
  data.images?.find((img) => img.coverType?.toLowerCase() === "clearlogo");
export const extractBanner = (data: MediaData): MediaImage | undefined =>
  data.images?.find((img) => img.coverType?.toLowerCase() === "banner");
export const extractPoster = (data: MediaData): MediaImage | undefined =>
  data.images?.find((img) => img.coverType?.toLowerCase() === "poster");
export const extractFanart = (data: MediaData): MediaImage | undefined =>
  data.images?.find((img) => img.coverType?.toLowerCase() === "fanart");

export const getClearLogo = async (id: string): Promise<string | null> => {
  const url = `${ANIZIP_URL}/mappings?anilist_id=${id}`;

  const { data: response, error: fetchError } = await safeAwait(fetch(url));

  if (fetchError) {
    console.error(
      `Failed to fetch clear art for ID ${id}:`,
      fetchError.message,
    );
    return null;
  }

  if (!response.ok) {
    console.warn(`API returned ${response.status} for ID ${id}`);
    return null;
  }

  const { data: jsonData, error: parseError } = await safeAwait(
    response.json(),
  );

  if (parseError) {
    console.error(
      `Failed to parse JSON response for ID ${id}:`,
      parseError.message,
    );
    return null;
  }

  const data = jsonData as MediaData;

  return extractClearLogo(data)?.url ?? null;
};
