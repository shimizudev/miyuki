import { ANIZIP_URL } from "./constants";
import { safeAwait } from "./safe-await";

export const getClearArt = async (id: string): Promise<string | null> => {
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

  const data = jsonData as {
    images: Array<{
      coverType: "ClearLogo" | "Banner" | "Fanart" | "Poster";
      url: string;
    }>;
  };

  const clearLogo = data.images?.find(
    (img) => img.coverType.toLowerCase() === "clearlogo".toLowerCase(),
  );

  return clearLogo?.url ?? null;
};
