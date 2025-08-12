import { AnimeInfoClient } from "@/components/info/client";
import { getAnimeInfo } from "@/lib/info";

interface InfoPageParams {
  id: string;
}

export default async function AnimeInfo({
  params,
}: {
  params: Promise<InfoPageParams>;
}) {
  const { id } = await params;
  const decodedId = atob(id);
  const info = await getAnimeInfo(decodedId);

  return (
    <>
      <AnimeInfoClient info={info} />
    </>
  );
}
