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
  // Minimalist, elegant constellation of just 4 floating candles (scrap cluttered 17 candles)
  const candles: CandleData[] = [
    { left: '4%', top: '10%', delay: '0s', duration: '6.4s', scale: 0.78, opacity: 0.8, height: 'h-12' },
    { left: '11%', top: '24%', delay: '1.8s', duration: '7.2s', scale: 0.65, opacity: 0.65, height: 'h-10' },
    { left: '88%', top: '12%', delay: '0.9s', duration: '6.8s', scale: 0.75, opacity: 0.75, height: 'h-11' },
    { left: '94%', top: '26%', delay: '2.4s', duration: '7.6s', scale: 0.68, opacity: 0.65, height: 'h-10' },
  ];

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
      {/* Warm Autumn Sunset to Violet Atmospheric Glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-amber-500/15 via-rose-700/10 to-transparent rounded-full blur-[140px]" />
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[300px] bg-purple-900/15 rounded-full blur-[130px]" />

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
              className="absolute -top-5 w-10 h-10 rounded-full bg-amber-400/25 blur-lg animate-pulse"
              style={{ animationDuration: `${2.8 + (idx % 2)}s` }}
            />

            {/* Teardrop Candle Flame with realistic core */}
            <div
              className="w-3 h-5 rounded-full animate-flame relative"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 85%, #ffffff 0%, #ffeaa7 25%, #ffb142 60%, #cc5200 90%, transparent 100%)',
                boxShadow:
                  '0 0 10px rgba(255, 177, 66, 0.8), 0 0 20px rgba(255, 121, 63, 0.4), 0 0 30px rgba(212, 175, 55, 0.25)',
              }}
            >
              {/* Blue flame base */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1 rounded-full bg-blue-400/50 blur-[0.5px]" />
            </div>

            {/* Charred Wick */}
            <div className="w-[1.5px] h-2 bg-gradient-to-b from-stone-900 to-amber-950 -mt-0.5" />

            {/* Tapered Wax Body */}
            <div
              className={`w-3 sm:w-3.5 ${candle.height} rounded-t-sm rounded-b-md shadow-lg relative overflow-hidden`}
              style={{
                background:
                  'linear-gradient(180deg, #f7f1e3 0%, #ede1d1 30%, #d1c0a5 75%, #a89478 100%)',
                boxShadow:
                  'inset 1px 0 2px rgba(255,255,255,0.6), inset -1px 0 3px rgba(0,0,0,0.35), 0 4px 10px rgba(0,0,0,0.5)',
              }}
            >
              {/* Soft wax drip highlight */}
              <div className="absolute top-1 left-0.5 w-0.5 h-3 bg-white/70 rounded-full opacity-80" />
            </div>

            {/* Soft bottom drip shadow */}
            <div className="w-2 h-1 bg-black/50 rounded-full blur-[1px] mt-0.5" />
          </div>
        </div>
      ))}
    </div>
  );
};
