"use client";

import { motion, useMotionValue, animate } from "motion/react";
import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimeCard } from "./anime-card";
import type { AnilistMedia } from "@/lib/anilist";

interface AnimeSliderProps {
  animes: AnilistMedia[];
  title?: string;
}

export const AnimeSlider = ({ animes, title }: AnimeSliderProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(0);
  const constraintsRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);

  const cardWidth = 200;
  const cardGap = 16;
  const cardTotalWidth = cardWidth + cardGap;

  const [maxDragDistance, setMaxDragDistance] = useState(0);
  const [visibleCards, setVisibleCards] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (constraintsRef.current) {
        const containerWidth =
          constraintsRef.current.getBoundingClientRect().width;
        const cardsVisible = Math.floor(containerWidth / cardTotalWidth);
        setVisibleCards(Math.max(1, cardsVisible));

        const totalContentWidth = animes.length * cardTotalWidth - cardGap;
        const maxDrag = Math.max(0, totalContentWidth - containerWidth);
        setMaxDragDistance(maxDrag);
      }
    };

    updateDimensions();

    const resizeObserver = new ResizeObserver(updateDimensions);
    if (constraintsRef.current) {
      resizeObserver.observe(constraintsRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [animes.length, cardTotalWidth]);

  useEffect(() => {
    const unsubscribe = x.on("change", (latest) => {
      setCurrentPosition(-latest);
    });
    return unsubscribe;
  }, [x]);

  const handleDragEnd = () => {
    setIsDragging(false);

    // Snap to nearest card
    const currentX = x.get();
    const snapPosition =
      Math.round(-currentX / cardTotalWidth) * cardTotalWidth;
    const clampedPosition = Math.max(
      0,
      Math.min(maxDragDistance, snapPosition),
    );

    animate(x, -clampedPosition, {
      type: "spring",
      damping: 30,
      stiffness: 400,
      duration: 0.6,
    });
  };

  const navigateLeft = () => {
    const newPosition = Math.max(
      0,
      currentPosition - cardTotalWidth * Math.max(1, visibleCards - 1),
    );
    animate(x, -newPosition, {
      type: "spring",
      damping: 30,
      stiffness: 400,
      duration: 0.6,
    });
  };

  const navigateRight = () => {
    const newPosition = Math.min(
      maxDragDistance,
      currentPosition + cardTotalWidth * Math.max(1, visibleCards - 1),
    );
    animate(x, -newPosition, {
      type: "spring",
      damping: 30,
      stiffness: 400,
      duration: 0.6,
    });
  };

  const showLeftButton = currentPosition > 5;
  const showRightButton = currentPosition < maxDragDistance - 5;

  return (
    <div className="w-full">
      {title && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
      )}

      <div className="group relative" ref={sliderRef}>
        <motion.button
          onClick={navigateLeft}
          className="absolute top-1/2 left-2 z-20 -translate-y-1/2 rounded-full bg-black/80 p-2 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-black/90"
          initial={{ opacity: 0, x: -20 }}
          animate={{
            opacity: showLeftButton ? 1 : 0,
            x: showLeftButton ? 0 : -20,
            pointerEvents: showLeftButton ? "auto" : "none",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        <motion.button
          onClick={navigateRight}
          className="absolute top-1/2 right-2 z-20 -translate-y-1/2 rounded-full bg-black/80 p-2 text-white shadow-lg backdrop-blur-sm transition-all duration-200 hover:bg-black/90"
          initial={{ opacity: 0, x: 20 }}
          animate={{
            opacity: showRightButton ? 1 : 0,
            x: showRightButton ? 0 : 20,
            pointerEvents: showRightButton ? "auto" : "none",
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>

        <div ref={constraintsRef} className="relative overflow-hidden">
          <motion.div
            drag="x"
            dragConstraints={{ left: -maxDragDistance, right: 0 }}
            dragElastic={0.1}
            dragMomentum={true}
            onDragStart={() => setIsDragging(true)}
            onDragEnd={handleDragEnd}
            style={{ x }}
            className="flex cursor-grab gap-4 select-none"
            whileTap={{ cursor: "grabbing" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
          >
            {animes.map((anime, index) => (
              <motion.div
                key={`${anime.id}-${index}`}
                className="flex-shrink-0"
                style={{ width: cardWidth }}
                animate={{
                  scale: isDragging ? 0.98 : 1,
                }}
                transition={{ duration: 0.2 }}
              >
                <AnimeCard anime={anime} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};
