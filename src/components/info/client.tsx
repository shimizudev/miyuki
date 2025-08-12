"use client";

import { motion } from "motion/react";
import type { AnimeInfo } from "@/lib/info";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Calendar,
  Clock,
  Star,
  Users,
  Music,
  TrendingUp,
  Heart,
} from "lucide-react";
import Image from "next/image";
import { formatNumber } from "@/lib/format-number";
import { capitalize } from "@/lib/capitalize";

interface AnimeInfoClientProps {
  info: AnimeInfo;
}

export function AnimeInfoClient({ info }: AnimeInfoClientProps) {
  return (
    <div className="bg-background min-h-screen">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative"
      >
        {info.bannerImage && (
          <div className="relative h-[300px] overflow-hidden sm:h-[400px] md:h-[500px] lg:h-[600px]">
            <div className="absolute inset-0 bg-cover bg-center bg-no-repeat">
              <Image
                src={info.bannerImage || "/placeholder.svg"}
                alt={info.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            <div className="from-background/80 via-background/40 to-background/20 absolute inset-0 bg-gradient-to-t" />
            <div className="from-background/20 via-background/40 to-background absolute inset-0 bg-gradient-to-b" />
          </div>
        )}

        <div className="absolute right-0 bottom-0 left-0 p-4 sm:p-6 lg:p-8">
          <div className="container mx-auto max-w-6xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col items-center gap-6 sm:gap-8 lg:flex-row lg:items-end"
            >
              <div className="order-1 flex-shrink-0 lg:order-none">
                <div className="relative h-64 w-44 overflow-hidden rounded-lg shadow-2xl sm:h-80 sm:w-56 lg:h-96 lg:w-64">
                  <Image
                    src={info.coverImage || info.images?.jpg?.large_image_url}
                    alt={info.title_english || info.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>

              <div className="text-foreground flex-1 space-y-3 text-center sm:space-y-4 lg:mb-8 lg:text-left">
                <div className="space-y-2">
                  <h1 className="text-2xl leading-tight font-bold sm:text-3xl lg:text-4xl xl:text-5xl">
                    {info.title_english || info.title}
                  </h1>

                  {info.title_japanese && (
                    <p className="text-muted-foreground text-lg font-medium sm:text-xl">
                      {info.title_japanese}
                    </p>
                  )}

                  {info.aired.string && (
                    <p className="text-muted-foreground text-sm font-medium">
                      Aired from {info.aired.string}
                    </p>
                  )}

                  {info.genres && info.genres.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-2 pt-2 lg:justify-start">
                      {info.genres.slice(0, 4).map((genre) => (
                        <Badge
                          key={genre.mal_id}
                          variant="secondary"
                          className="border-foreground/20 bg-foreground/10 text-foreground text-xs"
                        >
                          {genre.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap justify-center gap-2 sm:gap-3 lg:justify-start">
                  {info.score && (
                    <Badge className="flex items-center gap-1 border-yellow-400/30 bg-yellow-500/20 text-yellow-100">
                      <Star className="h-3 w-3 fill-current" />
                      {info.score}
                    </Badge>
                  )}

                  {info.year && (
                    <Badge className="flex items-center gap-1 border-blue-400/30 bg-blue-500/20 text-blue-100">
                      <Calendar className="h-3 w-3" />
                      {info.year}
                    </Badge>
                  )}

                  {info.episodes && (
                    <Badge className="flex items-center gap-1 border-green-400/30 bg-green-500/20 text-green-100">
                      <Clock className="h-3 w-3" />
                      {info.episodes} Episodes
                    </Badge>
                  )}

                  {info.members && (
                    <Badge className="flex items-center gap-1 border-purple-400/30 bg-purple-500/20 text-purple-100">
                      <Users className="h-3 w-3" />
                      {formatNumber(info.members)} Members
                    </Badge>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-12 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          {info.synopsis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-8 sm:mb-12"
            >
              <h2 className="mb-4 text-2xl font-bold sm:text-3xl">Synopsis</h2>
              <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                {info.synopsis}
              </p>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="grid grid-cols-1 gap-6 sm:gap-8 xl:grid-cols-2"
          >
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <h3 className="mb-4 text-xl font-bold sm:mb-6">Details</h3>
                <div className="space-y-3 sm:space-y-4">
                  {[
                    { label: "Type", value: info.type },
                    { label: "Status", value: info.status },
                    {
                      label: "Season",
                      value: `${capitalize(info.season as string)}${info.year ? ` ${info.year}` : ""}`,
                    },
                    { label: "Duration", value: info.duration },
                    { label: "Rating", value: info.rating },
                    { label: "Source", value: info.source },
                  ].map((detail) =>
                    detail.value ? (
                      <div
                        key={detail.label}
                        className="border-border/50 flex items-center justify-between border-b py-2 last:border-b-0"
                      >
                        <span className="text-muted-foreground text-sm sm:text-base">
                          {detail.label}
                        </span>
                        <span className="text-sm font-medium sm:text-base">
                          {detail.value}
                        </span>
                      </div>
                    ) : null,
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardContent className="p-4 sm:p-6">
                <h3 className="mb-4 text-xl font-bold sm:mb-6">
                  Statistics & Studios
                </h3>
                <div className="space-y-4 sm:space-y-6">
                  {/* Statistics */}
                  <div className="grid grid-cols-2 gap-4">
                    {info.rank && (
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="mb-1 flex items-center justify-center gap-1 text-orange-500">
                          <TrendingUp className="h-4 w-4" />
                        </div>
                        <div className="text-lg font-bold">#{info.rank}</div>
                        <div className="text-muted-foreground text-xs">
                          Rank
                        </div>
                      </div>
                    )}
                    {info.popularity && (
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="mb-1 flex items-center justify-center gap-1 text-blue-500">
                          <Users className="h-4 w-4" />
                        </div>
                        <div className="text-lg font-bold">
                          #{info.popularity}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Popularity
                        </div>
                      </div>
                    )}
                    {info.favorites && (
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="mb-1 flex items-center justify-center gap-1 text-red-500">
                          <Heart className="h-4 w-4" />
                        </div>
                        <div className="text-lg font-bold">
                          {formatNumber(info.favorites)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Favorites
                        </div>
                      </div>
                    )}
                    {info.scored_by && (
                      <div className="bg-muted/50 rounded-lg p-3 text-center">
                        <div className="mb-1 flex items-center justify-center gap-1 text-yellow-500">
                          <Star className="h-4 w-4" />
                        </div>
                        <div className="text-lg font-bold">
                          {formatNumber(info.scored_by)}
                        </div>
                        <div className="text-muted-foreground text-xs">
                          Scored By
                        </div>
                      </div>
                    )}
                  </div>
                  {info.studios && info.studios.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-muted-foreground text-sm font-medium tracking-wide uppercase">
                        Studios
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {info.studios.map((studio) => (
                          <Badge
                            key={studio.mal_id}
                            variant="outline"
                            className="text-sm"
                          >
                            {studio.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 grid grid-cols-1 gap-6 sm:mt-8 sm:gap-8 lg:grid-cols-2"
          >
            {(info.theme?.openings?.length > 0 ||
              info.theme?.endings?.length > 0) && (
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-xl font-bold sm:mb-6">
                    <Music className="h-5 w-5" />
                    Theme Songs
                  </h3>
                  <div className="space-y-4">
                    {info.theme?.openings && info.theme.openings.length > 0 && (
                      <div>
                        <h4 className="text-muted-foreground mb-2 text-sm font-medium tracking-wide uppercase">
                          Opening Themes
                        </h4>
                        <div className="space-y-2">
                          {info.theme.openings
                            .slice(0, 3)
                            .map((opening, index) => (
                              <div
                                key={index}
                                className="bg-muted/30 rounded p-2 text-sm"
                              >
                                {opening}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                    {info.theme?.endings && info.theme.endings.length > 0 && (
                      <div>
                        <h4 className="text-muted-foreground mb-2 text-sm font-medium tracking-wide uppercase">
                          Ending Themes
                        </h4>
                        <div className="space-y-2">
                          {info.theme.endings
                            .slice(0, 3)
                            .map((ending, index) => (
                              <div
                                key={index}
                                className="bg-muted/30 rounded p-2 text-sm"
                              >
                                {ending}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {info.relations && info.relations.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-6 sm:mt-8"
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-4 text-xl font-bold sm:mb-6">
                    Related Anime & Manga
                  </h3>
                  <div className="space-y-4">
                    {info.relations.slice(0, 5).map((relation, index) => (
                      <div
                        key={index}
                        className="border-border/50 border-b pb-3 last:border-b-0"
                      >
                        <div className="mb-2 flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {relation.relation}
                          </Badge>
                        </div>
                        <div className="space-y-1">
                          {relation.entry.slice(0, 3).map((entry) => (
                            <div
                              key={entry.mal_id}
                              className="flex items-center justify-between"
                            >
                              <span className="text-sm font-medium">
                                {entry.name}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {entry.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {info.background && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-6 sm:mt-8"
            >
              <Card className="border-0 shadow-sm">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="mb-4 text-xl font-bold">Background</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
                    {info.background}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
