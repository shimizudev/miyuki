import { AnimeSlider } from "@/components/cards/anime-slider";
import { AnimeHero } from "@/components/home/hero";
import { getAnilistMetric } from "@/lib/anilist";

export const revalidate = 2 * 3600;

export default async function Home() {
  const trending = await getAnilistMetric({
    sort: ["TRENDING_DESC", "POPULARITY_DESC"],
  });

  return (
    <div>
      <AnimeHero media={trending.data.Page.media[0]} />
      <div className="p-6 md:p-8">
        <section className="flex flex-col gap-3 space-y-2">
          <h1 className="text-3xl font-bold">
            <span className="text-primary">|</span> Trending Now
          </h1>
          <AnimeSlider animes={trending.data.Page.media} />
        </section>
      </div>
    </div>
  );
}
