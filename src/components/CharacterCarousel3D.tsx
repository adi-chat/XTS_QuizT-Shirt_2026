import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CHARACTERS, ARCHETYPE_METADATA } from '../data/characters';
import { soundManager } from '../utils/audio';
import { ChevronLeft, ChevronRight } from 'lucide-react';

// Pick 10 representative iconic characters (1 per archetype) for the landing showcase
const showcaseCharacters = [
  CHARACTERS.find(c => c.id === 'draco_malfoy') || CHARACTERS.find(c => c.archetype === 'glamour_icon')!,
  CHARACTERS.find(c => c.id === 'levi_ackerman') || CHARACTERS.find(c => c.archetype === 'ghost_in_wings')!,
  CHARACTERS.find(c => c.id === 'ted_lasso') || CHARACTERS.find(c => c.archetype === 'golden_idealist')!,
  CHARACTERS.find(c => c.id === 'michael_scott') || CHARACTERS.find(c => c.archetype === 'scene_stealer')!,
  CHARACTERS.find(c => c.id === 'severus_snape') || CHARACTERS.find(c => c.archetype === 'method_purist')!,
  CHARACTERS.find(c => c.id === 'light_yagami') || CHARACTERS.find(c => c.archetype === 'mastermind')!,
  CHARACTERS.find(c => c.id === 'billy_butcher') || CHARACTERS.find(c => c.archetype === 'dramatic_rebel')!,
  CHARACTERS.find(c => c.id === 'deadpool') || CHARACTERS.find(c => c.archetype === 'chaos_engine')!,
  CHARACTERS.find(c => c.id === 'peter_parker') || CHARACTERS.find(c => c.archetype === 'reluctant_prodigy')!,
  CHARACTERS.find(c => c.id === 'gandalf') || CHARACTERS.find(c => c.archetype === 'production_anchor')!,
].filter(Boolean);

export const CharacterCarousel3D: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Touch & pointer drag state (non-blocking for vertical scroll)
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startYRef = useRef(0);
  const isHorizontalSwipeRef = useRef<boolean | null>(null);
  const currentDragDeltaRef = useRef(0);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Auto-rotation every 3.5s when not hovered or dragged
  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % totalCards);
    }, 3500);
    return () => clearInterval(interval);
  }, [isHovered, totalCards]);

  // Touch/Drag handlers with vertical scroll preservation
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

    if (isHorizontalSwipeRef.current === null) {
      // If user scrolls vertically, release touch control to the window immediately
      if (Math.abs(deltaY) > 5 && Math.abs(deltaY) > Math.abs(deltaX)) {
        isHorizontalSwipeRef.current = false;
        isDraggingRef.current = false;
        return;
      }
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
      if (offset === 0) {
        return {
          transform: 'translateX(0px) translateZ(25px) rotateY(0deg) scale(1)',
          opacity: 1,
          zIndex: 30,
        };
      }
      if (offset === -1) {
        return {
          transform: 'translateX(-45px) translateZ(-40px) rotateY(16deg) scale(0.86)',
          opacity: 0.5,
          zIndex: 10,
        };
      }
      if (offset === 1) {
        return {
          transform: 'translateX(45px) translateZ(-40px) rotateY(-16deg) scale(0.86)',
          opacity: 0.5,
          zIndex: 10,
        };
      }
      return {
        transform: `translateX(${offset * 50}px) translateZ(-80px) scale(0.7)`,
        opacity: 0,
        zIndex: 0,
        pointerEvents: 'none' as const,
      };
    }

    // Desktop transforms
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
      {/* 10 Stage Archetypes Header (No Pill, No Star, Elegant Glowing Golden Typography) */}
      <div className="mb-2 text-center">
        <h2 className="font-cinzel text-xs sm:text-sm font-bold tracking-[0.25em] uppercase text-shimmer-gold glow-text-gold drop-shadow-[0_2px_8px_rgba(255,215,0,0.5)]">
          10 Stage Archetypes
        </h2>
      </div>

      {/* 3D Perspective Stage of Character Cards */}
      <div
        className="relative w-full flex items-center justify-center overflow-x-clip py-2 sm:py-3 cursor-grab active:cursor-grabbing"
        style={{
          perspective: isMobile ? '800px' : '1200px',
          height: isMobile ? '280px' : '385px',
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
                  isMobile ? 'w-[180px] h-[270px]' : 'w-[250px] h-[370px]'
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/20 pointer-events-none" />
                </div>

                {/* Floating Archetype Badge Pill at Top */}
                <div className="absolute top-2.5 left-2 right-2 flex justify-center pointer-events-none z-10">
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[8.5px] sm:text-[10px] font-cinzel font-black tracking-wider uppercase backdrop-blur-md border shadow-lg whitespace-nowrap"
                    style={{
                      backgroundColor: `${meta?.accentColor || '#d4af37'}35`,
                      borderColor: `${meta?.accentColor || '#d4af37'}99`,
                      color: '#fdf6ee',
                    }}
                  >
                    {meta?.badge || char.archetype.replace('_', ' ')}
                  </span>
                </div>

                {/* Floating Playbill Details Overlay Pushed Downwards at Bottom */}
                <div className="absolute bottom-2 inset-x-2 sm:bottom-3 sm:inset-x-3 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl backdrop-blur-md bg-[#140f0e]/85 border border-[#d4af37]/45 shadow-2xl flex flex-col text-left pointer-events-none z-10">
                  <div className="space-y-0.5">
                    <h3 className="font-cinzel text-xs sm:text-[14px] font-black text-white leading-tight drop-shadow-sm truncate">
                      {char.name}
                    </h3>
                    <p className="text-[9px] sm:text-[11px] font-cinzel text-[#ffd700] font-bold leading-tight truncate">
                      {char.title}
                    </p>
                  </div>

                  <div className="w-full h-px bg-[#d4af37]/35 my-1" />

                  <p className="font-playfair text-[8.5px] sm:text-[11px] italic text-[#fce8d5] leading-snug line-clamp-2">
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
