import { ANIZIP_URL } from "./constants";
import { MediaData } from "./info";
import { safeAwait } from "./safe-await";
import { getMalIdFromAniList } from "./anilist";
import { getCrysolineMapping } from "./crysoline";

export const getMappings = async (id: string) => {
  const url = `${ANIZIP_URL}/mappings?anilist_id=${id}`;

  const { data: promiseResults, error: promiseError } = await safeAwait(
    Promise.all([fetch(url), getMalIdFromAniList(id)]),
  );

  if (promiseError || !promiseResults) {
    console.error(
      `Failed to fetch data for ID ${id}:`,
      promiseError?.message || "Unknown error",
    );
    return {};
  }

  const [response, malId] = promiseResults;

  if (!response.ok) {
    console.warn(`API returned ${response.status} for ID ${id}`);
    return {};
  }

  const { data: jsonData, error: parseError } = await safeAwait(
    response.json(),
  );

  if (parseError) {
    console.error(
      `Failed to parse JSON response for ID ${id}:`,
      parseError.message,
    );
    return {};
  }

  const data = jsonData as MediaData;

  const crysolineMappings = malId
    ? await getCrysolineMapping(malId.toString())
    : ((await Promise.resolve({})) as Record<string, string>);

  const mappings = {
    ...data.mappings,
    ...crysolineMappings,
  };

  return mappings as Record<string, string>;
};
