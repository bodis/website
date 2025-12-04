import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import type { Slide } from '../data/slides';

interface RPGRoadProps {
  slides: Slide[];
  currentIndex: number;
  onSlideChange: (index: number) => void;
}

export function RPGRoad({ slides, currentIndex, onSlideChange }: RPGRoadProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const progress = (currentIndex / (slides.length - 1)) * 100;

  return (
    <div className="bg-[var(--surface)]/95 backdrop-blur-sm border-b border-[var(--road-border)] w-full">
      <div className="w-full px-4 py-3">
        {/* Level indicator */}
        <div className="flex items-center justify-between mb-2">
          <div className="font-pixel text-xs text-[var(--secondary)] glow-secondary">
            Level {currentIndex + 1} / {slides.length}
          </div>
          <div className="text-xs text-[var(--text-muted)] truncate max-w-[200px] md:max-w-none">
            {slides[currentIndex].title}
          </div>
        </div>

        {/* Road container */}
        <div className="relative h-16 mx-4">
          {/* Road background */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-[var(--road)] rounded-full border-2 border-[var(--road-border)] overflow-hidden">
            {/* Road markings (dashes) */}
            <div className="absolute inset-0 flex items-center justify-around px-2">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-1 bg-amber-500/30 rounded"
                />
              ))}
            </div>

            {/* Progress glow */}
            <motion.div
              className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-[var(--primary)]/30 to-[var(--secondary)]/20"
              initial={{ width: '0%' }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Milestone markers */}
          {slides.map((slide, index) => {
            const position = (index / (slides.length - 1)) * 100;
            const isActive = index === currentIndex;
            const isPassed = index < currentIndex;
            const isHovered = hoveredIndex === index;

            return (
              <div
                key={slide.id}
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer group"
                style={{ left: `${position}%` }}
                onClick={() => onSlideChange(index)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                {/* Milestone dot */}
                <motion.div
                  className={`
                    w-3 h-3 rounded-full border-2 transition-all duration-300
                    ${isActive ? 'bg-[var(--secondary)] border-[var(--secondary)] scale-150' : ''}
                    ${isPassed && !isActive ? 'bg-[var(--primary)] border-[var(--primary)]' : ''}
                    ${!isPassed && !isActive ? 'bg-[var(--surface)] border-[var(--text-muted)]' : ''}
                  `}
                  whileHover={{ scale: 1.5 }}
                />

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-[var(--surface-light)] rounded-lg border border-[var(--road-border)] shadow-xl whitespace-nowrap z-10"
                    >
                      <div className="text-xs font-semibold text-[var(--text-primary)]">
                        {slide.title.length > 30 ? slide.title.substring(0, 30) + '...' : slide.title}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] mt-1">
                        Click to jump
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[var(--surface-light)]" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* The Character! */}
          <motion.div
            className="absolute -translate-x-1/2 z-20"
            style={{ top: '0px' }}
            initial={false}
            animate={{
              left: `${progress}%`,
            }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20
            }}
          >
            <motion.div
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 0.4,
                repeat: Infinity,
                repeatType: 'loop',
              }}
            >
              {/* Pixel art character */}
              <div className="relative">
                {/* Character glow */}
                <div className="absolute inset-0 bg-[var(--secondary)] blur-md opacity-50 rounded-full" />

                {/* Character body */}
                <div className="relative w-8 h-10 flex flex-col items-center">
                  {/* Head */}
                  <div className="w-6 h-6 bg-amber-200 rounded-full border-2 border-amber-400 relative">
                    {/* Eyes */}
                    <div className="absolute top-2 left-1 w-1 h-1 bg-slate-800 rounded-full" />
                    <div className="absolute top-2 right-1 w-1 h-1 bg-slate-800 rounded-full" />
                    {/* Hair */}
                    <div className="absolute -top-1 left-0 right-0 h-2 bg-amber-800 rounded-t-full" />
                  </div>
                  {/* Body (laptop) */}
                  <div className="w-5 h-3 bg-slate-600 rounded mt-0.5 flex items-center justify-center">
                    <div className="w-3 h-2 bg-[var(--secondary)] rounded-sm text-[4px] flex items-center justify-center">
                      {'</>'}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
