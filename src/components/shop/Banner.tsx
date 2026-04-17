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
    if (images.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="relative h-48 sm:h-64 w-full rounded-[32px] overflow-hidden group border border-white/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={images[current]?.id || 'empty'}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          {images[current] ? (
            <img 
              src={images[current]?.url} 
              alt="Promotion" 
              className="w-full h-full object-cover select-none"
              loading="lazy"
            />
          ) : (
             <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white/20 uppercase tracking-widest font-bold">
               Awaiting Visuals
             </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
          
          <div className="absolute bottom-6 left-8">
            <motion.h2 
               key={images[current]?.text || 'default'}
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ delay: 0.4 }}
               className="text-2xl sm:text-3xl font-black font-display leading-tight uppercase tracking-tight"
            >
              {images[current]?.text || "New Collections '26"}
            </motion.h2>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 right-8 flex gap-2 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/5">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-700",
              current === i ? "w-8 bg-white" : "w-2 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </div>
  );
}
