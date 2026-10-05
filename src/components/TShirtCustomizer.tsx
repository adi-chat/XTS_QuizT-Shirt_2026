import React, { useState } from 'react';
import { Sparkles, RotateCw, CheckCircle2, Shirt } from 'lucide-react';

interface TShirtCustomizerProps {
  customName: string;
  onNameChange: (name: string) => void;
  characterTitle?: string;
}

export const TShirtCustomizer: React.FC<TShirtCustomizerProps> = ({
  customName,
  onNameChange,
}) => {
  const [view, setView] = useState<'back' | 'front'>('back');

  const displayName = customName.trim() ? customName.toUpperCase() : 'YOUR NAME';

  return (
    <div className="w-full backdrop-blur-md bg-white/[0.02] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#d4af37]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="border-b border-white/10 pb-3 mb-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#d4af37] font-cinzel font-bold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          Official Society Polo
        </div>
        <h3 className="text-2xl sm:text-3xl font-cinzel font-bold text-[#f4eae1]">
          Interactive T-Shirt Customizer
        </h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Actual Shirt Image with Real-time Personalization Overlay */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative">
          {/* Shirt Photo Container */}
          <div className="relative w-full max-w-[320px] sm:max-w-[370px] aspect-[4/5] flex items-center justify-center p-2 rounded-2xl">
            {/* Real Official Shirt Photo */}
            <img
              src={view === 'back' ? '/assets/shirt_back.png' : '/assets/shirt_front.png'}
              alt={view === 'back' ? 'Official XTS Polo Back' : 'Official XTS Polo Front'}
              className="w-full h-full object-contain filter drop-shadow-[0_15px_25px_rgba(0,0,0,0.95)] transition-all duration-300 pointer-events-none select-none cursor-pointer"
              draggable={false}
              onClick={() => setView(v => (v === 'back' ? 'front' : 'back'))}
              title="Click to flip shirt"
            />

            {/* Personalized Name Overlay */}
            {view === 'back' && (
              <div
                className="absolute -translate-x-1/2 text-center pointer-events-none select-none z-10 w-[75%]"
                style={{ top: 'calc(72.5% - 12px)', left: '47.5%' }}
              >
                <span
                  className="font-cinzel font-bold text-sm sm:text-base lg:text-lg tracking-[0.05em] text-[#e2c974] uppercase block"
                  style={{
                    textShadow: '0 1px 2px rgba(0,0,0,0.9), 0 0 1px rgba(0,0,0,0.95)',
                  }}
                >
                  {displayName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Personalization Input & Details - shifted UP with zero dead space */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Top row: Label + Flip Button beside each other */}
          <div className="flex items-center justify-between gap-3">
            <label
              htmlFor="custom-name-input"
              className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#d4af37] flex items-center gap-1.5"
            >
              <Shirt className="w-4 h-4 text-[#d4af37]" />
              Personalize Your Name:
            </label>

            <button
              type="button"
              onClick={() => setView(v => (v === 'back' ? 'front' : 'back'))}
              className="flex items-center gap-1.5 text-xs bg-[#251e1b]/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#d4af37]/60 text-[#fce8d5] hover:bg-[#d4af37] hover:text-[#120f0e] transition-all shadow-md cursor-pointer shrink-0"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Flip to {view === 'back' ? 'Front' : 'Back'}</span>
            </button>
          </div>

          {/* Custom Name Input Box */}
          <div className="bg-[#201917] border border-[#d4af37]/60 rounded-2xl p-4 shadow-xl relative">
            <div className="relative">
              <input
                id="custom-name-input"
                type="text"
                maxLength={16}
                value={customName}
                onChange={e => onNameChange(e.target.value)}
                placeholder="ENTER NAME (E.G. AHELYEAH)"
                className="w-full bg-[#14100f] border border-[#d4af37]/60 rounded-xl px-4 py-2.5 text-base sm:text-lg font-cinzel font-bold text-[#fce8d5] placeholder-[#f4eae1]/30 focus:outline-none focus:ring-2 focus:ring-[#d4af37] transition-all uppercase"
              />
              {customName && (
                <button
                  type="button"
                  onClick={() => onNameChange('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#f4eae1]/50 hover:text-white bg-[#251e1b] px-2 py-1 rounded cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>

            <p className="text-[11.5px] text-[#d4af37]/80 mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              Live preview: Printed directly beneath the society banner!
            </p>
          </div>

          {/* Official Specs List (Unboxed) */}
          <div className="flex flex-col gap-2.5 pt-1">
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#f4eae1]/90">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span><strong className="text-[#ffd700]">Premium 100% Breathable Cotton</strong> with red & gold ribbed collar</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#f4eae1]/90">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span><strong className="text-[#ffd700]">Official Theatrical Back Print</strong> (Owl, drama masks & candelabra)</span>
            </div>
            <div className="flex items-center gap-3 text-xs sm:text-sm text-[#f4eae1]/90">
              <CheckCircle2 className="w-4 h-4 text-[#d4af37] shrink-0" />
              <span><strong className="text-[#ffd700]">Custom Name Printing Available</strong> included on official order form</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
