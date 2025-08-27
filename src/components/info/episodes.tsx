"use client";

import { useEpisodes } from "@/hooks/api/use-episodes";
import { Search, ChevronDown, Filter, RefreshCw } from "lucide-react";
import { motion } from "motion/react";
import { useState, useMemo } from "react";
import { AnimeEpisode } from "../cards/episode-card";
import { Button } from "../ui/button";

export default function EpisodesSection({
  animeId = "sample-anime",
}: {
  animeId?: string;
}) {
  const [selectedProvider, setSelectedProvider] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showFillers, setShowFillers] = useState(true);
  const [isProviderDropdownOpen, setIsProviderDropdownOpen] = useState(false);
  const [isRangeDropdownOpen, setIsRangeDropdownOpen] = useState(false);
  const [rangeSearchQuery, setRangeSearchQuery] = useState("");
  const [selectedRange, setSelectedRange] = useState<{
    start: number;
    end: number;
  } | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useEpisodes(animeId);

  const providers = data?.data || [];

  if (!selectedProvider && providers.length > 0) {
    setSelectedProvider(providers[0].provider);
  }

  const selectedProviderData = providers.find(
    (p) => p.provider === selectedProvider,
  );

  const episodes = useMemo(() => {
    return selectedProviderData?.episodes || [];
  }, [selectedProviderData]);

  const episodeRanges = useMemo(() => {
    if (episodes.length === 0) return [];

    const ranges = [];
    const maxEpisode = Math.max(...episodes.map((ep) => ep.number));

    for (let start = 1; start <= maxEpisode; start += 5) {
      const end = Math.min(start + 4, maxEpisode);
      ranges.push({ start, end });
    }

    return ranges;
  }, [episodes]);

  const filteredRanges = useMemo(() => {
    if (!rangeSearchQuery) return episodeRanges;

    return episodeRanges.filter(
      (range) =>
        `${range.start}-${range.end}`.includes(rangeSearchQuery) ||
        range.start.toString().includes(rangeSearchQuery) ||
        range.end.toString().includes(rangeSearchQuery),
    );
  }, [episodeRanges, rangeSearchQuery]);

  useMemo(() => {
    if (!selectedRange && episodeRanges.length > 0) {
      setSelectedRange(episodeRanges[0]);
    }
  }, [episodeRanges, selectedRange]);

  const filteredEpisodes = useMemo(() => {
    let filtered = episodes.filter((episode) => {
      const matchesFillerFilter = showFillers || !episode.isFiller;
      return matchesFillerFilter;
    });

    if (searchQuery) {
      const matchingEpisodes = filtered.filter(
        (episode) =>
          episode.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          episode.number.toString().includes(searchQuery),
      );

      if (matchingEpisodes.length > 0 && selectedRange) {
        const firstMatch = matchingEpisodes[0];
        const correctRange = episodeRanges.find(
          (range) =>
            firstMatch.number >= range.start && firstMatch.number <= range.end,
        );

        if (
          correctRange &&
          (correctRange.start !== selectedRange.start ||
            correctRange.end !== selectedRange.end)
        ) {
          setSelectedRange(correctRange);
        }
      }

      filtered = matchingEpisodes;
    }

    if (!searchQuery && selectedRange) {
      filtered = filtered.filter(
        (episode) =>
          episode.number >= selectedRange.start &&
          episode.number <= selectedRange.end,
      );
    }

    return filtered.slice(0, 5);
  }, [episodes, searchQuery, showFillers, selectedRange, episodeRanges]);

  const handlePlay = (episode: AnimeEpisode) => {
    console.log("Playing episode:", episode);
  };

  const handleInfo = (episode: AnimeEpisode) => {
    console.log("Showing info for episode:", episode);
  };

  const handleRefetch = () => {
    refetch();
  };

  const handleRangeSelect = (range: { start: number; end: number }) => {
    setSelectedRange(range);
    setIsRangeDropdownOpen(false);
    setRangeSearchQuery("");
  };

  return (
    <div className="bg-background/95 border-border/20 border-t backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold">Episodes</h2>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search episodes"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background/50 border-border/30 focus:border-primary/50 focus:ring-primary/20 h-10 w-full rounded-lg border pr-4 pl-10 text-sm focus:ring-2 focus:outline-none sm:w-64"
              />
            </div>

            {episodeRanges.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setIsRangeDropdownOpen(!isRangeDropdownOpen)}
                  className="bg-background/50 border-border/30 hover:border-primary/50 flex h-10 items-center gap-2 rounded-lg border px-4 text-sm transition-colors"
                >
                  <span className="font-medium">
                    {selectedRange
                      ? `${selectedRange.start}-${selectedRange.end}`
                      : "Select Range"}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isRangeDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isRangeDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-background border-border/30 absolute top-12 right-0 z-20 max-h-48 min-w-[120px] overflow-y-auto rounded-lg border shadow-lg"
                  >
                    <div className="bg-background border-border/30 sticky top-0 border-b p-2">
                      <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-2 h-3 w-3 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Search ranges..."
                          value={rangeSearchQuery}
                          onChange={(e) => setRangeSearchQuery(e.target.value)}
                          className="bg-background/50 border-border/30 focus:border-primary/50 h-7 w-full rounded border pr-2 pl-6 text-xs focus:outline-none"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {filteredRanges.length === 0 ? (
                      <div className="text-muted-foreground px-4 py-2 text-xs">
                        No ranges found
                      </div>
                    ) : (
                      filteredRanges.map((range) => (
                        <button
                          key={`${range.start}-${range.end}`}
                          onClick={() => handleRangeSelect(range)}
                          className={`hover:bg-muted/50 block w-full px-4 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                            selectedRange &&
                            selectedRange.start === range.start &&
                            selectedRange.end === range.end
                              ? "bg-primary/10 text-primary"
                              : ""
                          }`}
                        >
                          {range.start}-{range.end}
                        </button>
                      ))
                    )}
                  </motion.div>
                )}
              </div>
            )}

            {providers.length > 0 && (
              <div className="relative">
                <button
                  onClick={() =>
                    setIsProviderDropdownOpen(!isProviderDropdownOpen)
                  }
                  className="bg-background/50 border-border/30 hover:border-primary/50 flex h-10 items-center gap-2 rounded-lg border px-4 text-sm transition-colors"
                >
                  <span className="font-medium">{selectedProvider}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isProviderDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isProviderDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-background border-border/30 absolute top-12 right-0 z-10 min-w-[140px] rounded-lg border shadow-lg"
                  >
                    {providers.map((provider) => (
                      <button
                        key={provider.provider}
                        onClick={() => {
                          setSelectedProvider(provider.provider);
                          setIsProviderDropdownOpen(false);
                        }}
                        className={`hover:bg-muted/50 block w-full px-4 py-2 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          selectedProvider === provider.provider
                            ? "bg-primary/10 text-primary"
                            : ""
                        }`}
                      >
                        {provider.provider}
                        <span className="text-muted-foreground ml-2 text-xs">
                          ({provider.episodes.length})
                        </span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            )}

            <Button
              variant={showFillers ? "secondary" : "outline"}
              size="sm"
              onClick={() => setShowFillers(!showFillers)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              {showFillers ? "Hide Fillers" : "Show Fillers"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefetch}
              disabled={isFetching}
              className="gap-2 bg-transparent"
            >
              <RefreshCw
                className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="text-primary h-8 w-8 animate-spin" />
            <span className="text-muted-foreground ml-2">
              Loading episodes...
            </span>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border-destructive/20 rounded-lg border p-6 text-center">
            <p className="text-destructive mb-4">Failed to load episodes</p>
            <Button onClick={handleRefetch} variant="outline" size="sm">
              Try Again
            </Button>
          </div>
        )}

        {!isLoading && !error && (
          <>
            {filteredEpisodes.length === 0 ? (
              <div className="bg-muted/20 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No episodes match your search"
                    : selectedRange
                      ? `No episodes available in range ${selectedRange.start}-${selectedRange.end}`
                      : "No episodes available"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredEpisodes.map((episode, index) => (
                  <motion.div
                    key={episode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <AnimeEpisode
                      episode={episode}
                      onPlay={handlePlay}
                      onInfo={handleInfo}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}

        {!isLoading && !error && filteredEpisodes.length > 0 && (
          <div className="text-muted-foreground mt-6 text-center text-sm">
            Showing {filteredEpisodes.length} of {episodes.length} episodes
            {searchQuery
              ? ` matching "${searchQuery}" ${selectedRange ? `(Auto-selected range: ${selectedRange.start}-${selectedRange.end})` : ""}`
              : selectedRange
                ? ` (Range: ${selectedRange.start}-${selectedRange.end})`
                : ""}
          </div>
        )}
      </div>
    </div>
  );
}
