import React, { useState } from 'react';
import { soundManager } from '../utils/audio';
import { Volume2, VolumeX, MoveRight } from 'lucide-react';

interface TheatreCurtainsProps {
  onEnter: () => void;
}

export const TheatreCurtains: React.FC<TheatreCurtainsProps> = ({ onEnter }) => {
  const [isOpening, setIsOpening] = useState(false);
  const [isRemoved, setIsRemoved] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(!soundManager.getMuted());


  const handleToggleAudio = () => {
    const nextMuted = soundManager.toggleMute();
    setAudioEnabled(!nextMuted);
    if (!nextMuted) {
      soundManager.playClickPop();
    }
  };

  const handleEnterStage = () => {
    if (isOpening) return;

    if (audioEnabled) {
      soundManager.setMuted(false);
      soundManager.playCurtainCreak();
      // Delay enter chime slightly to accompany curtains parting
      setTimeout(() => {
        soundManager.playEnterChime();
        soundManager.initBgMusic();
      }, 450);
    } else {
      soundManager.setMuted(true);
    }

    setIsOpening(true);

    // Let animation complete before finishing
    setTimeout(() => {
      setIsRemoved(true);
      onEnter();
    }, 2100);
  };

  if (isRemoved) return null;

  return (
    <div
      id="theatre-curtains-portal"
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-neutral-950 transition-opacity duration-700 pointer-events-auto select-none ${
        isOpening ? 'pointer-events-none' : ''
      }`}
    >
      {/* Floating Ambient Sparks in Darkness */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-200 rounded-full animate-pulse"
            style={{
              top: `${(i * 19) % 95}%`,
              left: `${(i * 27) % 95}%`,
              animationDuration: `${3 + (i % 4)}s`,
              opacity: 0.3 + (i % 5) * 0.12,
            }}
          />
        ))}
      </div>

      {/* Left Velvet Curtain */}
      <div
        id="curtain-left"
        className="absolute top-0 bottom-0 left-0 w-1/2 bg-gradient-to-r from-neutral-950 via-red-950 to-[#680b18] border-r-4 border-amber-600 shadow-2xl origin-left z-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #2b0005 0px, #2b0005 15px, #750010 30px, #2b0005 45px)',
          backgroundSize: '150% 100%',
          transform: isOpening ? 'translateX(-102%) skewX(-5deg)' : 'translateX(0%) skewX(0deg)',
          transition: 'transform 2.0s cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      >
        {/* Gold Trim & Highlights */}
        <div className="absolute right-3 top-0 bottom-0 w-2.5 bg-gradient-to-r from-yellow-500 to-amber-600 opacity-90" />
        <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-yellow-300" />
        {/* Drape Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/75 pointer-events-none" />
      </div>

      {/* Right Velvet Curtain */}
      <div
        id="curtain-right"
        className="absolute top-0 bottom-0 right-0 w-1/2 bg-gradient-to-l from-neutral-950 via-red-950 to-[#680b18] border-l-4 border-amber-600 shadow-2xl origin-right z-20"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #2b0005 0px, #2b0005 15px, #750010 30px, #2b0005 45px)',
          backgroundSize: '150% 100%',
          transform: isOpening ? 'translateX(102%) skewX(5deg)' : 'translateX(0%) skewX(0deg)',
          transition: 'transform 2.0s cubic-bezier(0.77, 0, 0.175, 1)',
        }}
      >
        {/* Gold Trim & Highlights */}
        <div className="absolute left-3 top-0 bottom-0 w-2.5 bg-gradient-to-l from-yellow-500 to-amber-600 opacity-90" />
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-yellow-300" />
        {/* Drape Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/25 to-black/75 pointer-events-none" />
      </div>

      {/* Center Vintage Ticket Stub (Admit One) */}
      <div
        className={`z-30 text-center w-[210px] h-[270px] pt-6 pb-5 px-5 flex flex-col items-center relative transition-all duration-700 ${
          isOpening
            ? 'opacity-0 scale-90 translate-y-3 pointer-events-none'
            : 'opacity-100 scale-100 translate-y-0'
        }`}
      >
        {/* Authentic SVG Masked Ticket Stub */}
        <svg
          className="absolute inset-0 w-full h-full -z-10 pointer-events-none filter drop-shadow-[0_20px_45px_rgba(0,0,0,0.95)]"
          viewBox="0 0 210 270"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <mask id="ticket-clip-mask-xts">
              <rect x="0" y="0" width="210" height="270" rx="6" fill="white" />
              {/* Left & Right Circular notches */}
              <circle cx="0" cy="135" r="11" fill="black" />
              <circle cx="210" cy="135" r="11" fill="black" />
              {/* Top serrated tear notches */}
              {[...Array(14)].map((_, i) => (
                <circle key={`top-${i}`} cx={12 + i * 14.3} cy="0" r="3.5" fill="black" />
              ))}
              {/* Bottom serrated tear notches */}
              {[...Array(14)].map((_, i) => (
                <circle key={`bot-${i}`} cx={12 + i * 14.3} cy="270" r="3.5" fill="black" />
              ))}
            </mask>
          </defs>

          {/* Ticket Body */}
          <rect
            x="0"
            y="0"
            width="210"
            height="270"
            fill="#f7efe4"
            stroke="#1c1917"
            strokeWidth="1.25"
            strokeOpacity="0.15"
            mask="url(#ticket-clip-mask-xts)"
          />

          {/* Inset Dashed Border */}
          <rect
            x="5"
            y="5"
            width="200"
            height="260"
            fill="none"
            stroke="#3a2215"
            strokeWidth="0.85"
            strokeDasharray="3,3"
            strokeOpacity="0.25"
            mask="url(#ticket-clip-mask-xts)"
          />
        </svg>

        {/* Header Serial */}
        <div className="flex items-center justify-between w-full text-[8.5px] font-mono tracking-widest text-stone-600 font-extrabold mb-2.5 px-1 relative z-10">
          <span>№ 0094-B</span>
          <span>ADMIT ONE</span>
        </div>

        {/* Title & Official XTS Logo */}
        <div className="relative z-10 flex flex-col items-center">
          <img
            src="/assets/xts_logo.png"
            alt="XTS Logo"
            className="w-8 h-8 object-contain mb-1 filter drop-shadow-sm"
          />
          <span className="text-[8px] font-mono uppercase tracking-[0.2em] text-stone-600 font-extrabold mb-0.5">
            Xaverian Theatrical Society
          </span>
          <h2 className="text-[13px] font-serif font-black tracking-[0.18em] uppercase text-stone-900 leading-tight text-center">
            THE VERDICT
          </h2>
        </div>

        {/* Perforated Divider */}
        <div className="w-full border-t border-dashed border-stone-800/30 my-3 relative z-10" />

        {/* Action Button: Enter Stage */}
        <button
          type="button"
          id="enter-stage-curtains-btn"
          onClick={handleEnterStage}
          className="w-full group py-2.5 px-3 bg-stone-900 hover:bg-stone-800 active:scale-95 text-[#f7efe4] font-serif font-black tracking-[0.14em] uppercase rounded-lg text-[9.5px] transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl relative z-10 flex items-center justify-center gap-1.5"
        >
          <span>ENTER STAGE</span>
          <MoveRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </button>

        {/* Decorative Miniature Barcode */}
        <div className="flex gap-[1.5px] h-3.5 mt-3.5 opacity-80 justify-center items-center relative z-10">
          {[1, 3, 1, 2, 1, 4, 1, 2, 3, 1, 2, 1, 3, 1, 2, 1].map((w, j) => (
            <div key={j} className="bg-stone-900 h-full" style={{ width: `${w}px` }} />
          ))}
        </div>

        {/* Sound Toggle */}
        <div className="mt-3 pt-2.5 border-t border-stone-800/10 w-full flex justify-center relative z-10">
          <button
            type="button"
            onClick={handleToggleAudio}
            className="text-[8.5px] font-mono tracking-wider uppercase text-stone-600 hover:text-stone-900 transition-colors flex items-center gap-1.5 cursor-pointer font-bold"
          >
            {audioEnabled ? (
              <>
                <Volume2 className="w-2.5 h-2.5 text-stone-800 animate-pulse" />
                <span>SOUND ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-2.5 h-2.5 text-stone-400" />
                <span className="text-stone-400">MUTED</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Understage Ambient Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-gradient-to-t from-yellow-500/15 via-red-950/20 to-transparent rounded-full blur-3xl pointer-events-none" />
    </div>
  );
};
