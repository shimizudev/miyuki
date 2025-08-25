import { AnimeSlider } from "@/components/cards/anime-slider";
import { getAnilistMetric } from "@/lib/anilist";

export default async function Home() {
  const trending = await getAnilistMetric({
    sort: ["TRENDING_DESC", "POPULARITY_DESC"],
  });

  return (
    <div>
      <AnimeSlider animes={trending.data.Page.media} />
    </div>
  );
}
