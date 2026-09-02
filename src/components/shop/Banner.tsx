import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BannerImage } from '../../types';
import { cn } from '../../lib/utils';

interface BannerProps {
  images: BannerImage[];
}

export default function Banner({ images }: BannerProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [images.length]);

  if (!images || images.length === 0) return null;

  const currentBanner = images[current];

  return (
    <div className="relative h-36 sm:h-44 md:h-48 w-full rounded-[24px] sm:rounded-[28px] overflow-hidden group border border-white/[0.08] shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner?.id || current}
          initial={{ opacity: 0, scale: 1.02 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {currentBanner?.url ? (
            <img 
              src={currentBanner.url} 
              alt={currentBanner.text || "Boutique Banner"} 
              className="w-full h-full object-cover select-none"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-slate-900/80 flex items-center justify-center text-white/25 uppercase tracking-widest font-bold text-xs">
              Flair Fiora Visual
            </div>
          )}
          
          {/* Subtle Ambient Shading */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
          
          {/* Banner Text Tag (Rendered with high legibility) */}
          {currentBanner?.text && currentBanner.text.trim().length > 0 && (
            <div className="absolute bottom-4 left-4 sm:left-6 max-w-[70%] sm:max-w-[75%] pointer-events-none">
              <motion.div 
                key={currentBanner.text}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.4 }}
                className="backdrop-blur-md bg-black/60 border border-white/15 px-3 sm:px-4 py-1.5 sm:py-2 rounded-[14px] sm:rounded-[18px] shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
              >
                <h2 className="text-sm sm:text-base md:text-lg font-black text-white tracking-wide leading-tight drop-shadow-md truncate">
                  {currentBanner.text}
                </h2>
              </motion.div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Pagination indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-3.5 right-4 sm:right-6 flex gap-1.5 p-1.5 bg-black/60 backdrop-blur-xl rounded-full border border-white/10 shadow-lg">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-500",
                current === i ? "w-6 bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]" : "w-1.5 bg-white/30 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

