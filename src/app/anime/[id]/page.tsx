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
  const info = await getAnimeInfo(id);

  return (
    <>
      <AnimeInfoClient info={info} />
    </>
  );
}
