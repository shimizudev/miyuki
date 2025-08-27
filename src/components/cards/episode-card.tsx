"use client";

import { motion, type Variants } from "motion/react";
import { Star, Calendar, Play, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

export interface AnimeEpisode {
  id: string;
  title: string | `Episode ${number}`;
  number: number;
  rating: number | null;
  airDate: {
    iso: string | null;
    relative: string | null;
    unix: number | null;
  } | null;
  thumbnail: string | null;
  teaser: string | null;
  description: string | null;
  isFiller: boolean;
}

interface AnimeEpisodeProps {
  episode: AnimeEpisode;
  onPlay?: (episode: AnimeEpisode) => void;
  onInfo?: (episode: AnimeEpisode) => void;
  className?: string;
}

export function AnimeEpisode({
  episode,
  onPlay,
  onInfo,
  className,
}: AnimeEpisodeProps) {
  const [showTeaser, setShowTeaser] = useState(false);
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (episode.teaser) {
      const timeout = setTimeout(() => {
        setShowTeaser(true);
      }, 1000); // 1 second delay
      setHoverTimeout(timeout);
    }
  };

  const handleMouseLeave = () => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setShowTeaser(false);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
      }
    };
  }, [hoverTimeout]);

  const containerVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    hover: {
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 25,
      },
    },
  };

  const imageVariants: Variants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  const overlayVariants: Variants = {
    hidden: { opacity: 0 },
    hover: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={cn("group cursor-pointer", className)}
    >
      <div className="bg-background/80 border-border/20 hover:border-primary/30 hover:shadow-primary/5 relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg">
        <div className="from-primary/5 to-primary/5 absolute inset-0 bg-gradient-to-r via-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        <div className="relative flex gap-4">
          <div
            className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg sm:h-24 sm:w-40 md:h-28 md:w-48"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div variants={imageVariants} className="h-full w-full">
              {showTeaser && episode.teaser ? (
                <Image
                  src={episode.teaser}
                  alt={episode.title}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover"
                />
              ) : episode.thumbnail ? (
                <Image
                  src={episode.thumbnail}
                  alt={episode.title}
                  width={300}
                  height={200}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="bg-muted/50 flex h-full w-full items-center justify-center">
                  <Play className="text-muted-foreground/50 h-6 w-6" />
                </div>
              )}
            </motion.div>

            <motion.div
              variants={overlayVariants}
              initial="hidden"
              className="absolute inset-0 flex items-center justify-center gap-2 bg-black/70"
            >
              <Button
                size="sm"
                onClick={() => onPlay?.(episode)}
                className="bg-primary/90 hover:bg-primary text-primary-foreground h-8 rounded-full px-3 text-xs"
              >
                <Play className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onInfo?.(episode)}
                className="bg-background/90 hover:bg-background text-foreground h-8 rounded-full px-3"
              >
                <Info className="h-3 w-3" />
              </Button>
            </motion.div>

            <div className="absolute top-2 left-2">
              <Badge
                variant="secondary"
                className="bg-background/90 text-foreground rounded-full px-2 py-1 font-mono text-xs"
              >
                {episode.number}
              </Badge>
            </div>

            {episode.isFiller && (
              <div className="absolute top-2 right-2">
                <Badge
                  variant="outline"
                  className="bg-destructive/90 border-destructive text-destructive-foreground rounded-full px-2 py-1 text-xs"
                >
                  Filler
                </Badge>
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-start justify-between gap-3">
              <motion.h3
                className="text-foreground line-clamp-2 flex-1 text-base leading-tight font-semibold text-balance sm:text-lg"
                initial={{ opacity: 0.9 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {episode.title}
              </motion.h3>

              {episode.rating && (
                <Badge
                  variant="secondary"
                  className="bg-primary/10 text-primary border-primary/20 flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-1 text-xs"
                >
                  <Star className="h-3 w-3 fill-current" />
                  {episode.rating.toFixed(1)}
                </Badge>
              )}
            </div>

            {episode.airDate?.relative && (
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>{episode.airDate.relative} ago</span>
              </div>
            )}

            {episode.description && (
              <motion.p
                className="text-muted-foreground line-clamp-2 text-sm leading-relaxed text-pretty"
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                {episode.description}
              </motion.p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
