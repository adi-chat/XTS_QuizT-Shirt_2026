import React from 'react';
import { ArrowRight, Sparkles, Shirt } from 'lucide-react';
import { ORDER_FORM_URL } from '../constants';

interface StickyCTAProps {
  customName: string;
}

export const StickyCTA: React.FC<StickyCTAProps> = ({ customName }) => {
  const finalOrderUrl = ORDER_FORM_URL;


  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-3 sm:p-4 bg-gradient-to-t from-[#0e0b0a] via-[#161211]/95 to-transparent backdrop-blur-md border-t border-[#d4af37]/30 shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="hidden sm:flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-xl bg-[#7a1c1c] border border-[#d4af37] flex items-center justify-center text-[#d4af37] shadow-inner">
            <Shirt className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider font-cinzel font-bold text-[#d4af37] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Limited Merch Pre-Order
            </div>
            <p className="text-xs text-[#f4eae1]/80 font-sans">
              {customName.trim()
                ? `Custom name "${customName.trim().toUpperCase()}" will be printed!`
                : '100% Breathable Cotton • Stained Glass Back Print'}
            </p>
          </div>
        </div>

        {/* Primary High-Contrast Button */}
        <a
          href={finalOrderUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#d4af37] via-[#f5c842] to-[#d4af37] hover:from-[#f5c842] hover:to-[#ffd700] text-[#120f0e] font-cinzel font-black text-sm sm:text-base px-8 py-4 rounded-2xl shadow-[0_0_25px_rgba(212,175,55,0.5)] transform hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 border border-amber-100/60 uppercase tracking-wider glow-gold-pulse group"
        >
          <span>Claim Your T-Shirt & Personalize Name</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
        </a>
      </div>
    </div>
  );
};
