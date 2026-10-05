import React from 'react';

interface CandleData {
  left: string;
  top: string;
  delay: string;
  duration: string;
  scale: number;
  opacity: number;
  height: string;
}

export const FloatingCandles: React.FC = () => {
  // Majestic Great Hall Floating Candles constellation across the background
  const candles: CandleData[] = [
    // Far Left Flank
    { left: '3%', top: '8%', delay: '0s', duration: '6.2s', scale: 0.9, opacity: 0.85, height: 'h-16' },
    { left: '7%', top: '32%', delay: '1.4s', duration: '7.1s', scale: 0.75, opacity: 0.7, height: 'h-12' },
    { left: '11%', top: '14%', delay: '2.8s', duration: '5.8s', scale: 0.82, opacity: 0.75, height: 'h-14' },
    { left: '15%', top: '48%', delay: '0.6s', duration: '8.0s', scale: 0.65, opacity: 0.55, height: 'h-10' },

    // Left-Center Depth Layer (High Ceiling)
    { left: '22%', top: '6%', delay: '1.9s', duration: '6.7s', scale: 0.7, opacity: 0.6, height: 'h-12' },
    { left: '28%', top: '22%', delay: '3.2s', duration: '7.5s', scale: 0.6, opacity: 0.5, height: 'h-10' },
    { left: '35%', top: '10%', delay: '0.4s', duration: '6.0s', scale: 0.65, opacity: 0.55, height: 'h-11' },

    // Mid Ceiling Background (Behind Hat & Titles, very subtle and high up)
    { left: '44%', top: '5%', delay: '2.2s', duration: '8.4s', scale: 0.55, opacity: 0.45, height: 'h-9' },
    { left: '52%', top: '8%', delay: '1.1s', duration: '7.2s', scale: 0.58, opacity: 0.45, height: 'h-9' },
    { left: '59%', top: '4%', delay: '3.6s', duration: '6.8s', scale: 0.62, opacity: 0.5, height: 'h-10' },

    // Right-Center Depth Layer
    { left: '66%', top: '12%', delay: '0.8s', duration: '6.4s', scale: 0.68, opacity: 0.55, height: 'h-11' },
    { left: '73%', top: '24%', delay: '2.5s', duration: '7.8s', scale: 0.62, opacity: 0.5, height: 'h-10' },
    { left: '79%', top: '7%', delay: '1.7s', duration: '6.1s', scale: 0.72, opacity: 0.65, height: 'h-12' },

    // Far Right Flank
    { left: '85%', top: '38%', delay: '3.0s', duration: '8.2s', scale: 0.7, opacity: 0.6, height: 'h-11' },
    { left: '89%', top: '16%', delay: '0.3s', duration: '5.9s', scale: 0.85, opacity: 0.8, height: 'h-14' },
    { left: '94%', top: '44%', delay: '1.8s', duration: '7.0s', scale: 0.78, opacity: 0.7, height: 'h-12' },
    { left: '96%', top: '10%', delay: '2.7s', duration: '6.5s', scale: 0.92, opacity: 0.85, height: 'h-16' },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Deep Royal Atmospheric Glows */}
      <div className="absolute -top-20 left-1/4 w-[500px] h-[350px] bg-amber-500/10 rounded-full blur-[140px]" />
      <div className="absolute -top-20 right-1/4 w-[500px] h-[350px] bg-rose-900/15 rounded-full blur-[140px]" />
      <div className="absolute top-1/3 left-10 w-96 h-96 bg-amber-600/5 rounded-full blur-[120px]" />

      {candles.map((candle, idx) => (
        <div
          key={idx}
          className="absolute flex flex-col items-center animate-candle-float transition-opacity"
          style={{
            left: candle.left,
            top: candle.top,
            animationDelay: candle.delay,
            animationDuration: candle.duration,
            transform: `scale(${candle.scale})`,
            opacity: candle.opacity,
          }}
        >
          {/* Flame Halo Glow */}
          <div className="relative flex flex-col items-center">
            {/* Atmospheric soft amber-gold light diffusion */}
            <div
              className="absolute -top-5 w-12 h-12 rounded-full bg-amber-400/25 blur-lg animate-pulse"
              style={{ animationDuration: `${2.5 + (idx % 3)}s` }}
            />

            {/* Teardrop Candle Flame with realistic core */}
            <div
              className="w-3.5 h-6 rounded-full animate-flame relative"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 85%, #ffffff 0%, #ffeaa7 25%, #ffb142 60%, #cc5200 90%, transparent 100%)',
                boxShadow:
                  '0 0 12px rgba(255, 177, 66, 0.9), 0 0 22px rgba(255, 121, 63, 0.5), 0 0 35px rgba(212, 175, 55, 0.3)',
              }}
            >
              {/* Blue flame base */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-1.5 rounded-full bg-blue-400/50 blur-[0.5px]" />
            </div>

            {/* Charred Wick */}
            <div className="w-[1.5px] h-2 bg-gradient-to-b from-stone-900 to-amber-950 -mt-0.5" />

            {/* Tapered Wax Body */}
            <div
              className={`w-3.5 sm:w-4 ${candle.height} rounded-t-sm rounded-b-md shadow-lg relative overflow-hidden`}
              style={{
                background:
                  'linear-gradient(180deg, #f7f1e3 0%, #ede1d1 30%, #d1c0a5 75%, #a89478 100%)',
                boxShadow:
                  'inset 1px 0 2px rgba(255,255,255,0.6), inset -1px 0 3px rgba(0,0,0,0.35), 0 4px 12px rgba(0,0,0,0.5)',
              }}
            >
              {/* Soft wax drip highlight */}
              <div className="absolute top-1 left-0.5 w-1 h-3.5 bg-white/70 rounded-full opacity-80" />
            </div>

            {/* Soft bottom drip shadow */}
            <div className="w-2.5 h-1 bg-black/50 rounded-full blur-[1px] mt-0.5" />
          </div>
        </div>
      ))}
    </div>
  );
};
