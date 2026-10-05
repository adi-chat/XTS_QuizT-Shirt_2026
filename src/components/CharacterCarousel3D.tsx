import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CHARACTERS_CATALOG, ARCHETYPE_METADATA } from '../data/characters';
import type { CharacterProfile } from '../types/quiz';
import { soundManager } from '../utils/audio';

// 10 Curated Characters (1 per Archetype) — preventing spoilers while showing stage diversity
const SHOWCASE_IDS = [
  'feluda',           // Mastermind
  'prince_zuko',      // Dramatic Rebel
  'ted_lasso',        // Golden Idealist
  'tony_stark',       // Scene Stealer
  'terence_fletcher', // Method Purist
  'levi_ackerman',    // Ghost in the Wings
  'michael_scott',    // Chaos Engine
  'draco_malfoy',     // Glamour Icon
  'peter_parker',     // Reluctant Prodigy
  'uncle_iroh',       // Production Anchor
];

export const CharacterCarousel3D: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Touch & pointer drag state
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const currentDragDeltaRef = useRef(0);

  // Resize listener for responsive 3D geometry
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Curate the 10 characters
  const showcaseCharacters: CharacterProfile[] = SHOWCASE_IDS.map(
    id => CHARACTERS_CATALOG[id]
  ).filter(Boolean);

  const totalCards = showcaseCharacters.length;

  const handleNext = useCallback(() => {
    soundManager.playClickPop();
    setActiveIndex(prev => (prev + 1) % totalCards);
  }, [totalCards]);

  const handlePrev = useCallback(() => {
    soundManager.playClickPop();
    setActiveIndex(prev => (prev - 1 + totalCards) % totalCards);
  }, [totalCards]);

  const handleSelectCard = (index: number) => {
    if (index !== activeIndex) {
      soundManager.playClickPop();
      setActiveIndex(index);
    }
  };

  // Auto-rotation every 3.2s when not hovered or dragged
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % totalCards);
    }, 3200);
    return () => clearInterval(interval);
  }, [isHovered, totalCards]);

  // Touch/Drag handlers
  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    startXRef.current = clientX;
    startYRef.current = clientY;
    currentDragDeltaRef.current = 0;
    isHorizontalSwipeRef.current = null;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
    const deltaX = clientX - startXRef.current;
    const deltaY = clientY - startYRef.current;

    // Discriminate between vertical page scroll and horizontal card swipe
    if (isHorizontalSwipeRef.current === null) {
      // If user moves vertically first by more than 5px, immediately relinquish touch to browser for native scroll!
      if (Math.abs(deltaY) > 5 && Math.abs(deltaY) > Math.abs(deltaX)) {
        isHorizontalSwipeRef.current = false;
        isDraggingRef.current = false;
        return;
      }
      // If user moves horizontally first by more than 8px, lock into card swipe
      if (Math.abs(deltaX) > 8 && Math.abs(deltaX) >= Math.abs(deltaY)) {
        isHorizontalSwipeRef.current = true;
      }
    }

    if (isHorizontalSwipeRef.current) {
      currentDragDeltaRef.current = deltaX;
    }
  };

  const handleTouchEnd = () => {
    if (!isDraggingRef.current || !isHorizontalSwipeRef.current) {
      isDraggingRef.current = false;
      isHorizontalSwipeRef.current = null;
      currentDragDeltaRef.current = 0;
      return;
    }
    isDraggingRef.current = false;
    isHorizontalSwipeRef.current = null;
    const delta = currentDragDeltaRef.current;
    if (delta < -35) {
      handleNext();
    } else if (delta > 35) {
      handlePrev();
    }
    currentDragDeltaRef.current = 0;
  };

  // Calculate shortest cyclic distance in ring
  const getOffset = (index: number) => {
    let offset = index - activeIndex;
    if (offset > totalCards / 2) offset -= totalCards;
    if (offset < -totalCards / 2) offset += totalCards;
    return offset;
  };

  // 3D Geometry calculation
  const getCardTransform = (offset: number) => {
    if (isMobile) {
      // Mobile: Depth-stacked inside 300px frame (Zero horizontal blowout)
      if (offset === 0) {
        return {
          transform: 'translateX(0px) translateZ(25px) rotateY(0deg) scale(1)',
          opacity: 1,
          zIndex: 30,
          pointerEvents: 'auto' as const,
        };
      }
      if (offset === -1) {
        return {
          transform: 'translateX(-52px) translateZ(-50px) rotateY(16deg) scale(0.85)',
          opacity: 0.45,
          zIndex: 10,
          pointerEvents: 'auto' as const,
        };
      }
      if (offset === 1) {
        return {
          transform: 'translateX(52px) translateZ(-50px) rotateY(-16deg) scale(0.85)',
          opacity: 0.45,
          zIndex: 10,
          pointerEvents: 'auto' as const,
        };
      }
      return {
        transform: `translateX(${offset * 60}px) translateZ(-140px) scale(0.6)`,
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none' as const,
      };
    }

    // Desktop: Cylindrical 5-card Cover Flow with balanced geometry
    if (offset === 0) {
      return {
        transform: 'translateX(0px) translateZ(35px) rotateY(0deg) scale(1.02)',
        opacity: 1,
        zIndex: 30,
        pointerEvents: 'auto' as const,
      };
    }
    if (offset === -1) {
      return {
        transform: 'translateX(-135px) translateZ(-70px) rotateY(22deg) scale(0.88)',
        opacity: 0.85,
        zIndex: 20,
        pointerEvents: 'auto' as const,
      };
    }
    if (offset === 1) {
      return {
        transform: 'translateX(135px) translateZ(-70px) rotateY(-22deg) scale(0.88)',
        opacity: 0.85,
        zIndex: 20,
        pointerEvents: 'auto' as const,
      };
    }
    if (offset === -2) {
      return {
        transform: 'translateX(-245px) translateZ(-145px) rotateY(35deg) scale(0.75)',
        opacity: 0.35,
        zIndex: 10,
        pointerEvents: 'auto' as const,
      };
    }
    if (offset === 2) {
      return {
        transform: 'translateX(245px) translateZ(-145px) rotateY(-35deg) scale(0.75)',
        opacity: 0.35,
        zIndex: 10,
        pointerEvents: 'auto' as const,
      };
    }
    return {
      transform: `translateX(${offset * 140}px) translateZ(-220px) scale(0.55)`,
      opacity: 0,
      zIndex: 0,
      pointerEvents: 'none' as const,
    };
  };

  return (
    <div
      className="relative w-full flex flex-col items-center select-none"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sneak Peek Header Pill */}
      <div className="flex items-center gap-1.5 px-3.5 py-1 mb-2 rounded-full bg-[#1b1513]/90 border border-[#d4af37]/60 text-[#ffd700] text-[10px] sm:text-xs uppercase tracking-widest font-cinzel font-bold shadow-lg">
        <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
        <span>Sneak Peek: 10 Stage Archetypes</span>
      </div>

      {/* 3D Perspective Stage */}
      <div
        className="relative w-full flex items-center justify-center overflow-x-clip py-2 sm:py-4 cursor-grab active:cursor-grabbing"
        style={{
          perspective: isMobile ? '800px' : '1200px',
          height: isMobile ? '260px' : '390px',
          touchAction: 'pan-y',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleTouchStart}
        onMouseMove={handleTouchMove}
        onMouseUp={handleTouchEnd}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {showcaseCharacters.map((char, index) => {
            const offset = getOffset(index);
            const style = getCardTransform(offset);
            const isActive = offset === 0;
            const meta = ARCHETYPE_METADATA[char.archetype];

            return (
              <div
                key={char.id}
                onClick={() => handleSelectCard(index)}
                className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ease-out will-change-transform ${
                  isMobile ? 'w-[172px] h-[252px]' : 'w-[255px] h-[375px]'
                } ${
                  isActive
                    ? 'bg-[#191311] border-2 border-[#ffd700] shadow-[0_0_35px_rgba(212,175,55,0.45)] ring-1 ring-[#ffd700]/50'
                    : 'bg-[#140f0e] border border-[#d4af37]/40 shadow-xl hover:border-[#d4af37]/80'
                }`}
                style={{
                  ...style,
                  touchAction: 'pan-y',
                  transition:
                    'transform 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 450ms ease, box-shadow 450ms ease',
                  WebkitFontSmoothing: 'antialiased',
                }}
              >
                {/* Full-Bleed Character Portrait Background */}
                <div className="absolute inset-0 overflow-hidden bg-black/60">
                  <img
                    src={char.image}
                    alt={char.name}
                    className="w-full h-full object-cover object-top transition-transform duration-700 hover:scale-105"
                    loading="lazy"
                  />
                  {/* Subtle theatrical vignette to ensure contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/25 pointer-events-none" />
                </div>

                {/* Floating Archetype Badge Pill at Top (Centered, No Act Mention, Zero Truncation) */}
                <div className="absolute top-2.5 left-2 right-2 flex justify-center pointer-events-none z-10">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[10.5px] font-cinzel font-black tracking-wider uppercase backdrop-blur-md border shadow-lg whitespace-nowrap"
                    style={{
                      backgroundColor: `${meta?.accentColor || '#d4af37'}35`,
                      borderColor: `${meta?.accentColor || '#d4af37'}99`,
                      color: '#fdf6ee',
                    }}
                  >
                    {meta?.badge || char.archetype.replace('_', ' ')}
                  </span>
                </div>

                {/* Floating Playbill Details Overlay Pushed Downwards at Bottom (Snug, Zero Wasted Space) */}
                <div className="absolute bottom-2 inset-x-2 sm:bottom-3 sm:inset-x-3 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl backdrop-blur-md bg-[#140f0e]/85 border border-[#d4af37]/45 shadow-2xl flex flex-col text-left pointer-events-none z-10">
                  <div className="space-y-0.5">
                    <h3 className="font-cinzel text-xs sm:text-[15px] font-black text-white leading-tight drop-shadow-sm">
                      {char.name}
                    </h3>
                    <p className="text-[9.5px] sm:text-xs font-cinzel text-[#ffd700] font-bold leading-tight">
                      {char.title}
                    </p>
                  </div>

                  <div className="w-full h-px bg-[#d4af37]/35 my-1 sm:my-1.5" />

                  <p className="font-playfair text-[8.5px] sm:text-[11.5px] italic text-[#fce8d5] leading-snug line-clamp-2">
                    "{char.quote}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Controls & Pagination */}
      <div className="flex items-center justify-center gap-4 mt-2 z-20">
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Previous Character"
          className="w-8 h-8 rounded-full bg-[#1e1715] hover:bg-[#2e2320] border border-[#d4af37]/60 text-[#ffd700] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* 10 Dot Indicators */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#16110f]/80 border border-white/10">
          {showcaseCharacters.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSelectCard(i)}
              aria-label={`Go to character ${i + 1}`}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                i === activeIndex
                  ? 'w-5 h-2 bg-[#ffd700] shadow-[0_0_8px_rgba(255,215,0,0.6)]'
                  : 'w-2 h-2 bg-white/25 hover:bg-white/50'
              }`}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={handleNext}
          aria-label="Next Character"
          className="w-8 h-8 rounded-full bg-[#1e1715] hover:bg-[#2e2320] border border-[#d4af37]/60 text-[#ffd700] flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CharacterCarousel3D;
