import React, { useEffect, useState } from 'react';

export type HatExpression =
  | 'idle'
  | 'talking'
  | 'thinking'
  | 'verdict'
  | 'surprised'
  | 'shocked'
  | 'pucker'
  | 'gasp'
  | 'A'
  | 'B'
  | 'C'
  | 'D'
  | 'hat_1'
  | 'hat_2'
  | 'hat_3'
  | 'hat_4'
  | 'hat_5'
  | 'hat_6'
  | 'hat_7'
  | 'hat_surprised';

interface SortingHatProps {
  state?: HatExpression;
  faceImage?: string; // Optional direct image path or filename (e.g. 'hat_6.png' or '/assets/hat/hat_6.png')
  commentary?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showSpeechBubble?: boolean;
  bubblePosition?: 'top' | 'top-right' | 'top-left';
  bubbleType?: string;
  bubbleSpacing?: string;
  onHatClick?: () => void;
}

export const SortingHat: React.FC<SortingHatProps> = ({
  state = 'idle',
  faceImage,
  commentary = '',
  size = 'md',
  showSpeechBubble = true,
  bubblePosition = 'top',
  bubbleSpacing,
  onHatClick,
}) => {
  // Deliberation animation frame cycling state
  const [thinkingFrame, setThinkingFrame] = useState<number>(0);

  // When thinking, cycle expressions including new puckered/gasping expressions
  useEffect(() => {
    if (state === 'thinking') {
      const thinkingImages = ['hat_1.png', 'hat_3.png', 'hat_6.png', 'hat_4.png', 'hat_5.png', 'hat_7.png'];
      const timer = setInterval(() => {
        setThinkingFrame(prev => (prev + 1) % thinkingImages.length);
      }, 420);
      return () => clearInterval(timer);
    }
  }, [state]);

  // Determine current image based on direct faceImage prop or state
  const getHatImage = (): string => {
    if (faceImage) {
      return faceImage.startsWith('/') ? faceImage : `/assets/hat/${faceImage}`;
    }

    if (state === 'thinking') {
      const frames = ['hat_1.png', 'hat_3.png', 'hat_6.png', 'hat_4.png', 'hat_5.png', 'hat_7.png'];
      return `/assets/hat/${frames[thinkingFrame % frames.length]}`;
    }

    switch (state) {
      case 'talking':
      case 'hat_2':
        return '/assets/hat/hat_2.png';
      case 'verdict':
        return '/assets/hat/hat_4.png';
      case 'surprised':
      case 'shocked':
      case 'hat_surprised':
        return '/assets/hat/hat_surprised.png';
      case 'pucker':
      case 'hat_6':
        return '/assets/hat/hat_6.png';
      case 'gasp':
      case 'hat_7':
        return '/assets/hat/hat_7.png';
      case 'A':
      case 'hat_3':
        return '/assets/hat/hat_3.png';
      case 'B':
      case 'hat_4':
        return '/assets/hat/hat_4.png';
      case 'C':
      case 'hat_1':
        return '/assets/hat/hat_1.png';
      case 'D':
      case 'hat_5':
        return '/assets/hat/hat_5.png';
      case 'idle':
      default:
        return '/assets/hat/hat_1.png';
    }
  };

  const hatImageSrc = getHatImage();

  // Prominent, majestic sizes with compact xs for mobile hero viewport
  const sizeClasses = {
    xs: 'w-24 h-24 sm:w-28 sm:h-28',
    sm: 'w-36 h-36 sm:w-44 sm:h-44',
    md: 'w-52 h-52 sm:w-64 sm:h-64',
    lg: 'w-72 h-72 sm:w-84 sm:h-84 lg:w-96 lg:h-96',
    xl: 'w-80 h-80 sm:w-96 sm:h-96 lg:w-[420px] lg:h-[420px]',
  }[size];

  return (
    <div
      className="relative flex flex-col items-center select-none"
      onContextMenu={e => e.preventDefault()}
    >
      {/* Speech / Thought Bubble */}
      {showSpeechBubble && commentary && (
        <div
          className={`relative z-30 ${
            bubbleSpacing || (size === 'xs' ? 'mb-1.5' : 'mb-2 sm:mb-3')
          } flex flex-col items-center transition-all duration-300 transform ${
            state !== 'idle' ? 'scale-100 opacity-100 translate-y-0' : 'scale-95 opacity-95'
          } ${
            bubblePosition === 'top-right'
              ? 'self-end -mr-2'
              : bubblePosition === 'top-left'
              ? 'self-start -ml-2'
              : 'self-center'
          } w-full ${size === 'xs' ? 'max-w-[290px] sm:max-w-[340px]' : 'max-w-[290px] sm:max-w-[380px] md:max-w-[440px] lg:max-w-[480px]'}`}
        >
          {/* Main Bubble Container */}
          <div
            className={`w-full ${
              size === 'xs' ? 'px-4 pt-2.5 pb-3.5 rounded-xl border' : 'px-5 py-3 rounded-2xl border-2'
            } bg-[#1e1614] border-[#d4af37]/80 text-[#fdf6ee] text-center relative z-20`}
            style={{
              boxShadow:
                '0 12px 30px -4px rgba(0, 0, 0, 0.95), inset 0 1px 0 rgba(255, 215, 0, 0.25)',
            }}
          >
            <p className={`font-playfair ${size === 'xs' ? 'text-[12px] sm:text-xs' : 'text-xs sm:text-sm md:text-base'} italic text-[#fce8d5] leading-relaxed tracking-wide transition-all duration-200`}>
              “{commentary.replace(/^["“]|["”]$/g, '')}”
            </p>

            {/* Extruding Comment Beak matching internal color */}
            <div
              className={`absolute ${size === 'xs' ? '-bottom-1.5 w-3 h-3' : '-bottom-2 w-3.5 h-3.5'} left-1/2 -translate-x-1/2 bg-[#1e1614] border-b-2 border-r-2 border-[#d4af37]/80 rotate-45 z-30 rounded-br-sm pointer-events-none`}
            />
          </div>
        </div>
      )}

      {/* Sorting Hat Animated Wrapper (Bobbing and Weaving) */}
      <div className="relative flex items-center justify-center">
        {/* RADIANT MULTI-LAYER GLOWING AURA BEHIND THE SORTING HAT */}
        <div
          className="absolute inset-0 rounded-full blur-xl pointer-events-none transition-all duration-700 animate-pulse"
          style={{
            background:
              state === 'thinking'
                ? 'radial-gradient(circle, rgba(168, 85, 247, 0.6) 0%, rgba(212, 175, 55, 0.4) 40%, transparent 75%)'
                : state === 'verdict'
                ? 'radial-gradient(circle, rgba(255, 215, 0, 0.75) 0%, rgba(245, 198, 66, 0.5) 40%, rgba(225, 29, 72, 0.3) 65%, transparent 80%)'
                : 'radial-gradient(circle, rgba(255, 215, 0, 0.5) 0%, rgba(212, 175, 55, 0.35) 40%, transparent 75%)',
            transform: 'scale(1.05)',
          }}
        />

        {/* Subtle Ambient Halo */}
        <div
          className="absolute inset-2 rounded-full blur-2xl pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, rgba(122, 28, 28, 0.15) 50%, transparent 75%)',
          }}
        />

        {/* Revolving Decorative Ring */}
        <div
          className="absolute -inset-4 pointer-events-none opacity-25 animate-spin"
          style={{ animationDuration: '40s' }}
        >
          <div className="w-full h-full rounded-full border border-dashed border-[#d4af37]/40" />
        </div>

        {/* Embedded Graphic (Rendered as CSS Background Image to prevent right-click image menu) */}
        <div
          onClick={onHatClick}
          className={`relative ${sizeClasses} animate-hat-bob-weave cursor-pointer filter drop-shadow-[0_0_18px_rgba(255,215,0,0.45)] drop-shadow-[0_6px_10px_rgba(0,0,0,0.6)] transition-transform duration-300 active:scale-95`}
          title="The Sorting Hat"
        >
          <div
            className="w-full h-full bg-contain bg-center bg-no-repeat pointer-events-none select-none transition-all duration-200"
            style={{
              backgroundImage: `url(${hatImageSrc})`,
            }}
          />
        </div>

        {/* Subtle ground shadow tightly tucked under brim */}
        <div className="absolute bottom-1 w-2/3 h-3 bg-black/60 rounded-full blur-sm -z-0 pointer-events-none" />
      </div>
    </div>
  );
};
