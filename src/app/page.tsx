import { ModeToggle } from "@/components/base/theme-swticher";
import { AnimeSlider } from "@/components/cards/anime-slider";
import { getAnilistMetric } from "@/lib/anilist";

export default async function Home() {
  const trending = await getAnilistMetric({
    sort: ["TRENDING_DESC", "POPULARITY_DESC"],
  });

  return (
    <div>
      <ModeToggle />
      <div>
        <AnimeSlider animes={trending.data.Page.media} />
      </div>
    </div>
  );
}
