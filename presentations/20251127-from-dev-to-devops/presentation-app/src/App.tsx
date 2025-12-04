import { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RPGRoad } from './components/RPGRoad';
import { SlideView } from './components/SlideView';
import { TerminalSection } from './components/TerminalSection';
import { slides } from './data/slides';
import './index.css';

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [showRoad, setShowRoad] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentSlide = slides[currentIndex];

  const goToNext = useCallback(() => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1);
      // Show road when navigating past start screen
      if (currentIndex >= 0) {
        setShowRoad(true);
      }
    }
  }, [currentIndex]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      // Hide road if going back to start screen
      if (currentIndex - 1 === 0) {
        setShowRoad(false);
      }
    }
  }, [currentIndex]);

  const handleStart = useCallback(() => {
    setShowRoad(true);
    setCurrentIndex(1);
  }, []);

  const handleSlideChange = useCallback((index: number) => {
    setCurrentIndex(index);
    // Keep terminal state when navigating via road
    if (index > 0) {
      setShowRoad(true);
    } else {
      // Close terminal when going back to start screen
      setIsTerminalOpen(false);
    }
    // Scroll to top when changing slides
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const handleOpenTerminal = useCallback(() => {
    setIsTerminalOpen(prev => !prev); // Toggle terminal
  }, []);

  const handleCloseTerminal = useCallback(() => {
    setIsTerminalOpen(false);
    // Scroll back to top
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowRight':
        case ' ':
        case 'Enter':
          e.preventDefault();
          goToNext();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          goToPrev();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          if (isTerminalOpen) {
            handleCloseTerminal();
          } else {
            handleOpenTerminal();
          }
          break;
        case 'Escape':
          if (isTerminalOpen) {
            handleCloseTerminal();
          }
          break;
        case 'Home':
          e.preventDefault();
          setCurrentIndex(0);
          setShowRoad(false);
          setIsTerminalOpen(false);
          break;
        case 'End':
          e.preventDefault();
          setCurrentIndex(slides.length - 1);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, isTerminalOpen, goToNext, goToPrev, handleOpenTerminal, handleCloseTerminal]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[var(--background)] overflow-y-auto overflow-x-hidden"
    >
      {/* Animated background - fixed */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.3) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-[var(--primary)] rounded-full opacity-30"
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
              y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            }}
            animate={{
              y: [null, -100],
              opacity: [0.3, 0],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* RPG Road Navigation - fixed at top */}
      <AnimatePresence>
        {showRoad && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50"
          >
            <RPGRoad
              slides={slides}
              currentIndex={currentIndex}
              onSlideChange={handleSlideChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main scrollable content */}
      <div className="relative z-10">
        {/* Slide content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <SlideView
              slide={currentSlide}
              onOpenTerminal={handleOpenTerminal}
              onNext={goToNext}
              onPrev={goToPrev}
              onStart={handleStart}
              isFirst={currentIndex === 0}
              isLast={currentIndex === slides.length - 1}
              isTerminalOpen={isTerminalOpen}
            />
          </motion.div>
        </AnimatePresence>

        {/* Terminal Section - inline, scrollable */}
        <AnimatePresence>
          {isTerminalOpen && !currentSlide.isStartScreen && (
            <motion.div
              ref={terminalRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <TerminalSection
                title={currentSlide.title}
                content={currentSlide.technicalContent}
                onClose={handleCloseTerminal}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard hints - fixed at bottom */}
      {!currentSlide.isStartScreen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4 text-xs text-[var(--text-muted)] bg-[var(--surface)]/80 backdrop-blur-sm px-4 py-2 rounded-full border border-[var(--surface-light)] z-40"
        >
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--surface-light)] px-1.5 py-0.5 rounded">{'<-'}</kbd>
            <kbd className="bg-[var(--surface-light)] px-1.5 py-0.5 rounded">{'->'}</kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--surface-light)] px-1.5 py-0.5 rounded">T</kbd>
            {isTerminalOpen ? 'Close' : 'Terminal'}
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-[var(--surface-light)] px-1.5 py-0.5 rounded">Home</kbd>
            Start
          </span>
        </motion.div>
      )}

      {/* Slide counter - fixed at bottom right */}
      {showRoad && (
        <div className="fixed bottom-4 right-4 font-pixel text-xs text-[var(--text-muted)] z-40">
          {currentIndex + 1} / {slides.length}
        </div>
      )}
    </div>
  );
}

export default App;
