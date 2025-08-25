"use client";

import type { AnimeInfo } from "@/lib/info";
import {
  Star,
  Users,
  ChevronDown,
  ChevronUp,
  Play,
  Plus,
  Share2,
  ThumbsUp,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";

interface AnimeInfoClientProps {
  info: AnimeInfo;
}

export function AnimeInfoClient({ info }: AnimeInfoClientProps) {
  const [showFullSynopsis, setShowFullSynopsis] = useState(false);
  const [isInList, setIsInList] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [synopsisHeight, setSynopsisHeight] = useState<number>(0);
  const synopsisRef = useRef<HTMLDivElement>(null);
  const fullTextRef = useRef<HTMLDivElement>(null);

  const truncatedSynopsis =
    info.synopsis && info.synopsis.length > 180
      ? info.synopsis.substring(0, 180) + "..."
      : (info.synopsis ?? "");

  const shouldShowButton = info.synopsis && info.synopsis.length > 180;

  useEffect(() => {
    if (synopsisRef.current && fullTextRef.current) {
      if (showFullSynopsis) {
        setSynopsisHeight(fullTextRef.current.scrollHeight);
      } else {
        setSynopsisHeight(72);
      }
    }
  }, [showFullSynopsis]);

  useEffect(() => {
    if (synopsisRef.current) {
      setSynopsisHeight(72);
    }
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen overflow-hidden">
      <div className="relative">
        <div className="relative h-[75vh] overflow-hidden">
          <div
            className={`from-primary/20 to-secondary/20 absolute inset-0 bg-gradient-to-r transition-opacity duration-1000 ${
              imageLoaded ? "opacity-0" : "opacity-100"
            }`}
          />
          <Image
            src={
              info.bannerImage ??
              info.coverImage ??
              info.images.jpg.large_image_url
            }
            width={2000}
            height={2000}
            alt={info.title}
            className={`h-full w-full object-cover transition-all duration-1000 ease-out ${
              imageLoaded ? "scale-100 opacity-100" : "scale-105 opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
          <div className="from-background via-background/60 absolute inset-0 bg-gradient-to-t to-transparent" />
          <div className="from-background/80 to-background/40 absolute inset-0 bg-gradient-to-r via-transparent" />
        </div>
        <div className="absolute inset-0 flex items-end">
          <div className="mx-auto w-full max-w-6xl p-6 pb-12">
            <div className="max-w-2xl space-y-3">
              <div
                className={`space-y-2 transition-all duration-800 ease-out ${
                  imageLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "300ms" }}
              >
                <h1 className="text-4xl leading-tight font-bold transition-colors duration-300 md:text-5xl lg:text-6xl">
                  {info.title_english || info.title}
                </h1>
                {info.title_japanese && (
                  <p
                    className={`text-muted-foreground text-lg transition-all duration-600 ease-out ${
                      imageLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{ transitionDelay: "500ms" }}
                  >
                    {info.title_japanese}
                  </p>
                )}
              </div>
              <div
                className={`flex items-center gap-4 text-sm transition-all duration-700 ease-out ${
                  imageLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: "600ms" }}
              >
                <div className="flex items-center gap-1 transition-transform duration-200 hover:scale-105">
                  <Star className="h-4 w-4 animate-pulse fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{info.score}</span>
                </div>
                <span className="hover:text-primary transition-colors duration-200">
                  {info.year}
                </span>
                <span className="hover:text-primary transition-colors duration-200">
                  {info.episodes} Episodes
                </span>
                <span className="bg-muted hover:bg-muted/80 rounded px-2 py-1 text-xs font-medium transition-colors duration-200">
                  {info.rating}
                </span>
              </div>
              <div
                className={`flex flex-wrap gap-2 transition-all duration-600 ease-out ${
                  imageLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0"
                }`}
                style={{ transitionDelay: "700ms" }}
              >
                {info.genres?.slice(0, 4).map((genre, index) => (
                  <span
                    key={genre.mal_id}
                    className={`bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer rounded-full px-3 py-1 text-sm transition-all duration-200 hover:scale-105 ${
                      imageLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${800 + index * 100}ms`,
                      transitionDuration: "500ms",
                    }}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <div
                className={`max-w-xl transition-all duration-700 ease-out ${
                  imageLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-6 opacity-0"
                }`}
                style={{ transitionDelay: "900ms" }}
              >
                <div className="relative">
                  <div
                    ref={fullTextRef}
                    className="invisible absolute"
                    aria-hidden="true"
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      {info.synopsis}
                    </p>
                  </div>

                  <div
                    ref={synopsisRef}
                    className="overflow-hidden transition-all duration-500 ease-in-out"
                    style={{ height: `${synopsisHeight}px` }}
                  >
                    <p className="text-muted-foreground leading-relaxed">
                      {showFullSynopsis ? info.synopsis : truncatedSynopsis}
                    </p>
                  </div>

                  {!showFullSynopsis && shouldShowButton && (
                    <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-8 transition-opacity duration-300" />
                  )}
                </div>

                {shouldShowButton && (
                  <button
                    onClick={() => setShowFullSynopsis(!showFullSynopsis)}
                    className="text-primary group mt-3 inline-flex items-center gap-1 transition-all duration-200 hover:gap-2 hover:underline"
                  >
                    {showFullSynopsis ? (
                      <>
                        Show less
                        <ChevronUp className="h-3 w-3 transition-transform duration-200 group-hover:translate-y-[-2px]" />
                      </>
                    ) : (
                      <>
                        Read more
                        <ChevronDown className="h-3 w-3 transition-transform duration-200 group-hover:translate-y-[2px]" />
                      </>
                    )}
                  </button>
                )}
              </div>
              <div
                className={`flex gap-3 transition-all duration-800 ease-out ${
                  imageLoaded
                    ? "translate-y-0 opacity-100"
                    : "translate-y-8 opacity-0"
                }`}
                style={{ transitionDelay: "1000ms" }}
              >
                <Button>
                  <Play className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                  Play S1 E1
                </Button>
                <Button
                  variant={"secondary"}
                  onClick={() => setIsInList(!isInList)}
                >
                  <Plus
                    className={`h-5 w-5 transition-all duration-300 ${isInList ? "text-primary rotate-45" : "rotate-0"} group-hover:scale-110`}
                  />
                  My List
                </Button>
                <Button variant={"secondary"} size={"icon"}>
                  <ThumbsUp className="group-hover:text-primary h-5 w-5 transition-all duration-200 group-hover:scale-110" />
                </Button>
                <Button variant={"secondary"} size={"icon"}>
                  <Share2 className="group-hover:text-primary h-5 w-5 transition-all duration-200 group-hover:scale-110" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          <div
            className={`space-y-8 transition-all duration-700 ease-out lg:col-span-2 ${
              imageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-6 opacity-0"
            }`}
            style={{ transitionDelay: "1200ms" }}
          >
            <div>
              <h2 className="hover:text-primary mb-4 text-xl font-semibold transition-colors duration-200">
                More Details
              </h2>
              <div className="bg-card hover:border-border/50 space-y-4 rounded-lg border border-transparent p-6 transition-all duration-300 hover:shadow-lg">
                <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                  {[
                    { label: "Type", value: info.type },
                    { label: "Status", value: info.status },
                    { label: "Season", value: `${info.season} ${info.year}` },
                    { label: "Duration", value: info.duration },
                    { label: "Studio", value: info.studios?.[0]?.name },
                    { label: "Aired", value: info.aired?.string },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      className={`hover:bg-muted/50 rounded p-2 transition-all duration-200 hover:scale-105 ${
                        imageLoaded
                          ? "translate-y-0 opacity-100"
                          : "translate-y-4 opacity-0"
                      }`}
                      style={{
                        transitionDelay: `${1300 + index * 100}ms`,
                        transitionDuration: "400ms",
                      }}
                    >
                      <span className="text-muted-foreground">
                        {item.label}
                      </span>
                      <div className="font-medium capitalize">{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div
            className={`space-y-6 transition-all duration-800 ease-out ${
              imageLoaded
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
            style={{ transitionDelay: "1300ms" }}
          >
            <div>
              <h3 className="hover:text-primary mb-4 text-lg font-semibold transition-colors duration-200">
                Stats
              </h3>
              <div className="bg-card hover:border-border/50 space-y-4 rounded-lg border border-transparent p-6 transition-all duration-300 hover:shadow-lg">
                {[
                  { label: "Rating", value: info.score, icon: Star },
                  {
                    label: "Members",
                    value: `${(info.members / 1000).toFixed(0)}K`,
                    icon: Users,
                  },
                  { label: "Episodes", value: info.episodes, icon: Clock },
                ].map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`hover:bg-muted/30 group flex items-center justify-between rounded p-2 transition-all duration-200 hover:scale-105 ${
                      imageLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${1400 + index * 100}ms`,
                      transitionDuration: "500ms",
                    }}
                  >
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors duration-200">
                      {stat.label}
                    </span>
                    <div className="flex items-center gap-2">
                      {stat.icon === Star && (
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-transform duration-200 group-hover:scale-110" />
                      )}
                      <span className="group-hover:text-primary font-medium transition-colors duration-200">
                        {stat.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="hover:text-primary mb-4 text-lg font-semibold transition-colors duration-200">
                Genres
              </h3>
              <div className="flex flex-wrap gap-2">
                {info.genres?.map((genre, index) => (
                  <span
                    key={genre.mal_id}
                    className={`bg-secondary text-secondary-foreground hover:bg-secondary/80 cursor-pointer rounded-md px-3 py-1 text-sm transition-all duration-200 hover:scale-105 hover:shadow-md ${
                      imageLoaded
                        ? "translate-y-0 opacity-100"
                        : "translate-y-4 opacity-0"
                    }`}
                    style={{
                      transitionDelay: `${1700 + index * 100}ms`,
                      transitionDuration: "400ms",
                    }}
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
