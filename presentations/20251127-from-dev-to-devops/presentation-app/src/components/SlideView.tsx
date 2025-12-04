import { motion } from 'framer-motion';
import { Terminal, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import type { Slide } from '../data/slides';

interface SlideViewProps {
  slide: Slide;
  onOpenTerminal: () => void;
  onNext: () => void;
  onPrev: () => void;
  onStart: () => void;
  isFirst: boolean;
  isLast: boolean;
  isTerminalOpen?: boolean;
}

export function SlideView({
  slide,
  onOpenTerminal,
  onNext,
  onPrev,
  onStart,
  isFirst,
  isLast,
  isTerminalOpen = false,
}: SlideViewProps) {
  // Start Screen (Title slide)
  if (slide.isStartScreen) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-purple-900/10 to-[var(--background)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(168,85,247,0.1),transparent_50%)]" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 flex flex-col md:flex-row items-center gap-8 md:gap-16 max-w-6xl"
        >
          {/* Title Image */}
          <motion.div
            className="relative group flex-shrink-0"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="absolute -inset-2 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl opacity-50 blur group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-[var(--surface)] rounded-lg overflow-hidden border-4 border-[var(--surface-light)] shadow-2xl">
              <img
                src={slide.imageSrc}
                alt={slide.title}
                className="w-full max-w-md h-auto object-cover"
              />
            </div>
          </motion.div>

          {/* Text content */}
          <div className="text-center md:text-left">
            {/* Title */}
            <h1 className="font-pixel text-xl md:text-2xl text-[var(--primary)] glow-primary mb-4 leading-relaxed">
              {slide.title.split(':')[0]}:
            </h1>
            <h2 className="font-pixel text-base md:text-lg text-[var(--secondary)] glow-secondary mb-6">
              {slide.title.split(':')[1] || 'A DevOps Journey'}
            </h2>

            {/* Short summary */}
            <p className="text-[var(--text-secondary)] text-base mb-8 max-w-lg leading-relaxed">
              {slide.shortSummary}
            </p>

            {/* Start button */}
            <motion.button
              onClick={onStart}
              className="group relative px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-glow)] text-white font-pixel text-sm rounded-lg transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-3">
                <Play size={20} />
                START GAME
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-[var(--secondary)] to-[var(--primary)]"
                initial={{ x: '-100%' }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>

            {/* Terminal hint */}
            <motion.button
              onClick={onOpenTerminal}
              className="mt-4 flex items-center gap-2 mx-auto md:mx-0 text-[var(--text-muted)] hover:text-[var(--secondary)] transition-colors"
              whileHover={{ scale: 1.05 }}
            >
              <Terminal size={16} />
              <span className="text-sm">View Technical Specs</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Regular slide view
  return (
    <motion.div
      className={`px-8 md:px-16 flex items-center justify-center ${
        isTerminalOpen
          ? 'pt-24 pb-4 min-h-[40vh]'
          : 'pt-28 pb-20 min-h-screen'
      }`}
      animate={{
        paddingTop: isTerminalOpen ? '6rem' : '7rem',
        paddingBottom: isTerminalOpen ? '1rem' : '5rem',
      }}
      transition={{ duration: 0.4, ease: 'easeInOut' }}
    >
      <div className="w-full" style={{ maxWidth: '1400px' }}>
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 50 }}
          animate={{
            opacity: 1,
            x: 0,
            scale: isTerminalOpen ? 0.85 : 1,
          }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 gap-12 items-center"
          style={{ transformOrigin: 'top center' }}
        >
          {/* Image Card */}
          <motion.div
            className="relative group"
            initial={{ rotate: -2 }}
            whileHover={{ rotate: 0, scale: 1.02 }}
            transition={{ duration: 0.3 }}
          >
            {/* Comic book style frame */}
            <div className="absolute -inset-2 bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] rounded-xl opacity-50 blur group-hover:opacity-75 transition-opacity" />
            <div className="relative bg-[var(--surface)] rounded-lg overflow-hidden border-4 border-[var(--surface-light)] shadow-2xl">
              {/* Image */}
              <img
                src={slide.imageSrc}
                alt={slide.title}
                className="w-full h-auto object-cover"
                onError={(e) => {
                  // Fallback placeholder
                  (e.target as HTMLImageElement).src = `https://placehold.co/800x600/1a1a2e/a855f7?text=${encodeURIComponent(slide.title.substring(0, 20))}`;
                }}
              />
              {/* Comic halftone overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(circle,transparent_20%,rgba(0,0,0,0.3)_80%)] opacity-30" />
            </div>

            {/* Chapter badge */}
            <div className="absolute -top-3 -left-3 bg-[var(--secondary)] text-[var(--background)] font-pixel text-xs px-3 py-1 rounded-full shadow-lg">
              CH.{slide.id.replace(/\D/g, '') || '0'}
            </div>
          </motion.div>

          {/* Content Card */}
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            {/* Title */}
            <h2 className="font-pixel text-lg md:text-xl text-[var(--primary)] leading-relaxed">
              {slide.title}
            </h2>

            {/* Narrative text */}
            <div className="bg-[var(--surface)]/80 backdrop-blur-sm rounded-xl p-6 border border-[var(--surface-light)]">
              <div className="prose prose-invert prose-lg">
                {slide.narrative.split('\n\n').map((paragraph, i) => (
                  <p key={i} className="text-[var(--text-secondary)] leading-relaxed mb-4 last:mb-0">
                    {paragraph.split('**').map((part, j) =>
                      j % 2 === 1 ? (
                        <strong key={j} className="text-[var(--secondary)] font-semibold">{part}</strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                ))}
              </div>
            </div>

            {/* Terminal button */}
            <motion.button
              onClick={onOpenTerminal}
              className={`flex items-center gap-3 px-5 py-3 border rounded-lg transition-all duration-300 group ${
                isTerminalOpen
                  ? 'bg-[var(--secondary)]/20 border-[var(--secondary)] text-[var(--secondary)]'
                  : 'bg-[var(--surface)] hover:bg-[var(--surface-light)] border-[var(--secondary)]/50'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Terminal className={`${isTerminalOpen ? 'text-[var(--secondary)]' : 'text-[var(--secondary)] group-hover:animate-pulse'}`} size={20} />
              <span className={`transition-colors ${isTerminalOpen ? 'text-[var(--secondary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--secondary)]'}`}>
                {isTerminalOpen ? 'Data Log Open ↓' : 'Open Data Log'}
              </span>
              <span className="ml-auto text-xs text-[var(--text-muted)] font-pixel">{'[T]'}</span>
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-8">
          <motion.button
            onClick={onPrev}
            disabled={isFirst}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isFirst
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--primary)]'
            }`}
            whileHover={!isFirst ? { x: -5 } : {}}
          >
            <ChevronLeft size={24} />
            <span className="hidden md:inline">Previous Level</span>
          </motion.button>

          <motion.button
            onClick={onNext}
            disabled={isLast}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              isLast
                ? 'opacity-30 cursor-not-allowed'
                : 'hover:bg-[var(--surface)] text-[var(--text-secondary)] hover:text-[var(--secondary)]'
            }`}
            whileHover={!isLast ? { x: 5 } : {}}
          >
            <span className="hidden md:inline">Next Level</span>
            <ChevronRight size={24} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
