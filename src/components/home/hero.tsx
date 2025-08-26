"use client";

import { AnilistMedia } from "@/lib/anilist";
import { Star, Play, Plus } from "lucide-react";
import { motion } from "motion/react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";

interface AnimeHeroProps {
  media: AnilistMedia;
  onPlay?: () => void;
  onAddToList?: () => void;
}

export function AnimeHero({ media, onPlay, onAddToList }: AnimeHeroProps) {
  const displayTitle = media.title.english || media.title.romaji;
  const cleanDescription = media.description?.replace(/<[^>]*>/g, "") || "";
  const truncatedDescription =
    cleanDescription.length > 200
      ? cleanDescription.substring(0, 200) + "..."
      : cleanDescription;

  return (
    <div className="relative h-[70vh] w-full overflow-hidden">
      <motion.div
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute inset-0"
      >
        <div
          className="h-full w-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${media.bannerImage})`,
          }}
        />
        <div className="from-background/80 via-background/40 absolute inset-0 bg-gradient-to-r to-transparent" />
        <div className="from-background/60 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
        <div className="to-background absolute inset-0 bg-gradient-to-b from-transparent via-transparent" />
      </motion.div>

      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-foreground mb-4 text-4xl font-bold md:text-6xl lg:text-7xl">
                {displayTitle}
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-muted-foreground mb-6 flex flex-wrap items-center gap-4 text-sm"
            >
              {media.averageScore && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{(media.averageScore / 10).toFixed(1)}</span>
                </div>
              )}
              <span>{media.seasonYear}</span>
              <span>{media.episodes} Episodes</span>
              <span className="capitalize">{media.format?.toLowerCase()}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-6 flex flex-wrap gap-2"
            >
              {media.genres.slice(0, 4).map((genre) => (
                <Badge
                  key={genre}
                  variant={"secondary"}
                  className="bg-secondary/20 text-secondary-foreground hover:bg-secondary/30"
                >
                  {genre}
                </Badge>
              ))}
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-muted-foreground text-md mb-8 leading-relaxed md:text-lg"
            >
              {truncatedDescription}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="flex flex-wrap gap-4"
            >
              <Button
                size="lg"
                onClick={onPlay}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Play className="mr-2 h-5 w-5 fill-current" />
                Watch Now
              </Button>

              <Button
                size="lg"
                variant="outline"
                onClick={onAddToList}
                className="border-border bg-secondary/10 text-foreground hover:bg-secondary/20"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add to List
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
