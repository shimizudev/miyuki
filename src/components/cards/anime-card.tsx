"use client";

import type { AnilistMedia } from "@/lib/anilist";
import Image from "next/image";
import { motion, useInView } from "motion/react";
import { useState, useRef } from "react";
import Link from "next/link";

export const AnimeCard = ({ anime }: { anime: AnilistMedia }) => {
  const [isHovered, setIsHovered] = useState(false);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: isInView ? 1 : 0,
        y: isInView ? 0 : 20,
      }}
      transition={{ duration: 0.2 }}
      whileHover={{ y: -5 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="cursor-pointer select-none"
    >
      <Link draggable={false} href={`/anime/${anime.id.toString()}`}>
        <Image
          src={anime.coverImage.extraLarge || anime.coverImage.large}
          alt={anime.title.english || anime.title.romaji}
          width={3000}
          draggable={false}
          height={3000}
          className="h-[290px] max-h-[290px] w-[200px] max-w-[200px] rounded-sm object-cover transition-all duration-300"
        />
        <div className="flex flex-col gap-0">
          <motion.h1
            title={anime.title.english || anime.title.romaji}
            className="w-[200px] truncate font-medium"
            animate={{
              color: isHovered
                ? (anime.coverImage.color ?? "var(--text-foreground)")
                : "var(--text-foreground)",
            }}
            transition={{ duration: 0.2 }}
          >
            {anime.title.english || anime.title.romaji}
          </motion.h1>
          <div className="text-muted-foreground flex gap-1">
            {anime.genres.slice(0, 2).map((genre, index) => (
              <span key={genre} className="text-sm">
                {genre}
                {index < anime.genres.slice(0, 2).length - 1 ? ", " : ""}
              </span>
            ))}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
