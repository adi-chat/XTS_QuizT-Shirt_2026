import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { QUIZ_QUESTIONS } from './data/quizQuestions';
import { CHARACTERS_CATALOG } from './data/characters';
import { resolveWinningArchetype, resolveCharacterByTemporalBand } from './utils/scoringEngine';
import type { ArchetypeKey, CharacterProfile, QuizOption, TemporalAccumulator } from './types/quiz';
import { FloatingCandles } from './components/FloatingCandles';
import { SortingHat } from './components/SortingHat';
import type { HatExpression } from './components/SortingHat';
import { TShirtCustomizer } from './components/TShirtCustomizer';
import { StoryShareModal } from './components/StoryShareModal';
import { TheatreCurtains } from './components/TheatreCurtains';
import SpotlightDust from './components/SpotlightDust';
import { CharacterCarousel3D } from './components/CharacterCarousel3D';
import { soundManager } from './utils/audio';
import {
  Sparkles,
  ChevronLeft,
  Share2,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle,
} from 'lucide-react';
import { ORDER_FORM_URL } from './constants';
import { preloadCriticalAssets, preloadImage } from './utils/preloadAssets';

const HAT_DELIBERATION_PHRASES = [
  "Hmm... fascinating... I sense immense stage presence...",
  "Let's consult the ancient society archives...",
  "Ah! An unpredictable spirit... where to cast you?",
  "Theatrical genius or backstage menace? Perhaps both...",
  "The stage lights are warming... your destiny is clear!",
];

// Fixed deterministic roulette table of hat expressions per question (0-9) and option (0-3)
// Completely varied per question, but 100% consistent across all users and browsers
const QUESTION_OPTION_HAT_FACES: Record<number, Record<number, string>> = {
  0: { 0: 'hat_3.png', 1: 'hat_6.png', 2: 'hat_1.png', 3: 'hat_5.png' },
  1: { 0: 'hat_surprised.png', 1: 'hat_4.png', 2: 'hat_7.png', 3: 'hat_2.png' },
  2: { 0: 'hat_6.png', 1: 'hat_3.png', 2: 'hat_5.png', 3: 'hat_surprised.png' },
  3: { 0: 'hat_4.png', 1: 'hat_7.png', 2: 'hat_2.png', 3: 'hat_1.png' },
  4: { 0: 'hat_5.png', 1: 'hat_surprised.png', 2: 'hat_3.png', 3: 'hat_6.png' },
  5: { 0: 'hat_2.png', 1: 'hat_1.png', 2: 'hat_4.png', 3: 'hat_7.png' },
  6: { 0: 'hat_7.png', 1: 'hat_5.png', 2: 'hat_surprised.png', 3: 'hat_3.png' },
  7: { 0: 'hat_1.png', 1: 'hat_6.png', 2: 'hat_2.png', 3: 'hat_4.png' },
  8: { 0: 'hat_surprised.png', 1: 'hat_3.png', 2: 'hat_7.png', 3: 'hat_5.png' },
  9: { 0: 'hat_4.png', 1: 'hat_7.png', 2: 'hat_6.png', 3: 'hat_surprised.png' },
};

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function getRandomComment(comments: string[]): string {
  return comments[Math.floor(Math.random() * comments.length)] || '';
}

export default function App() {
  const landingContainerRef = useRef<HTMLDivElement>(null);

  // Screen State
  const [screen, setScreen] = useState<'landing' | 'quiz' | 'thinking' | 'result'>('landing');

  // Audio State
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getMuted());

  // Quiz State
  const [currentQIndex, setCurrentQIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, QuizOption>>({});
  const [pendingOptionId, setPendingOptionId] = useState<string | null>(null);
  const [hoveredOptionIndex, setHoveredOptionIndex] = useState<number | null>(null);
  const [activeCommentary, setActiveCommentary] = useState<string>(
    "A bold soul approaches... Let's see what theatrical madness you harbor."
  );
  const [hatState, setHatState] = useState<HatExpression>('idle');
  const [deliberationText, setDeliberationText] = useState<string>(HAT_DELIBERATION_PHRASES[0]);

  // Landing Hat Oscillation
  const [landingFaceOverride, setLandingFaceOverride] = useState<string | null>(null);
  const oscillationTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Result State
  const [winningCharacter, setWinningCharacter] = useState<CharacterProfile>(CHARACTERS_CATALOG['feluda']);
  const [customName, setCustomName] = useState<string>('');
  const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);

  const currentQuestion = QUIZ_QUESTIONS[currentQIndex] || QUIZ_QUESTIONS[0];
  const progressPercentage = Math.round(((currentQIndex) / QUIZ_QUESTIONS.length) * 100);

  // Automatically reset scroll position to top whenever screen or question advances
  useEffect(() => {
    const resetScroll = () => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (landingContainerRef.current) {
        landingContainerRef.current.scrollTop = 0;
      }
      const mainEl = document.querySelector('main');
      if (mainEl) {
        mainEl.scrollTop = 0;
      }
    };

    resetScroll();
    const frameId = requestAnimationFrame(resetScroll);
    const timeoutId = setTimeout(resetScroll, 60);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timeoutId);
    };
  }, [screen, currentQIndex]);

  // Preload all critical assets (8 hat pictures, logo, polo shirts, fonts, character portraits)
  useEffect(() => {
    preloadCriticalAssets();
  }, []);

  const handleToggleSound = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playChime(1.2);
    }
  };

  // Interactive hat click on landing
  const handleLandingHatClick = () => {
    soundManager.playClickPop();

    const quips = [
      "I sense pure theatrical chaos in your thoughts...",
      "Ah! A dramatic flair even before sitting on the stool!",
      "I see talent... yes... but where to put you?",
      "The stage is set. Enter when you are ready!",
      "Great heavens! The theatrical energy is overflowing!",
      "Curious... most curious indeed...",
      "I know theatrical ambition when I see it!"
    ];
    setActiveCommentary(quips[Math.floor(Math.random() * quips.length)]);

    const allFaces = [
      'hat_1.png', 'hat_2.png', 'hat_3.png', 'hat_4.png',
      'hat_5.png', 'hat_6.png', 'hat_7.png', 'hat_surprised.png',
    ];
    const targetFace = allFaces[Math.floor(Math.random() * allFaces.length)];

    if (oscillationTimerRef.current) clearInterval(oscillationTimerRef.current);

    let step = 0;
    const totalSteps = 8;
    oscillationTimerRef.current = setInterval(() => {
      step++;
      if (step < totalSteps) {
        const randomFrame = allFaces[Math.floor(Math.random() * allFaces.length)];
        setLandingFaceOverride(randomFrame);
      } else {
        setLandingFaceOverride(targetFace);
        if (oscillationTimerRef.current) clearInterval(oscillationTimerRef.current);
        setTimeout(() => {
          setLandingFaceOverride(null);
        }, 1800);
      }
    }, 90);
  };

  const handleStartQuiz = () => {
    soundManager.playChime(1.1);
    setHatState('idle');
    setActiveCommentary("Place me upon your head... let's see what theatrical greatness lies within!");
    setTimeout(() => {
      setScreen('quiz');
      setHatState('idle');
      setPendingOptionId(null);
    }, 400);
  };

  // Option Click: Select & preview commentary
  const handleOptionClick = (option: QuizOption) => {
    if (pendingOptionId === option.id) {
      handleConfirmSelection();
      return;
    }

    soundManager.playSelect();
    setPendingOptionId(option.id);
    const chosenComment = getRandomComment(option.hatComments);
    setActiveCommentary(chosenComment);
    setHatState('talking');
  };

  // Confirm and advance
  const handleConfirmSelection = () => {
    if (!pendingOptionId) return;

    const chosenOption = currentQuestion.options.find(opt => opt.id === pendingOptionId);
    if (!chosenOption) return;

    soundManager.playChime(1 + (currentQIndex % 4) * 0.15);
    const updatedAnswers = { ...userAnswers, [currentQIndex]: chosenOption };
    setUserAnswers(updatedAnswers);

    if (currentQIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      setPendingOptionId(null);
      setHoveredOptionIndex(null);
      setHatState('idle');
      setActiveCommentary("Hmm... fascinating. And what say you to this?");
    } else {
      handleFinishQuiz(updatedAnswers);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
      setPendingOptionId(userAnswers[currentQIndex - 1]?.id || null);
      setHatState('idle');
      setHoveredOptionIndex(null);
    }
  };

  // Tally & Resolve 30-Character Result
  const handleFinishQuiz = (finalAnswers: Record<number, QuizOption>) => {
    const scores: Record<ArchetypeKey, number> = {
      mastermind: 0,
      dramatic_rebel: 0,
      golden_idealist: 0,
      scene_stealer: 0,
      method_purist: 0,
      ghost_in_wings: 0,
      chaos_engine: 0,
      glamour_icon: 0,
      reluctant_prodigy: 0,
      production_anchor: 0,
    };

    const bandScores: Record<ArchetypeKey, TemporalAccumulator> = {
      mastermind: { band1: 0, band2: 0, band3: 0 },
      dramatic_rebel: { band1: 0, band2: 0, band3: 0 },
      golden_idealist: { band1: 0, band2: 0, band3: 0 },
      scene_stealer: { band1: 0, band2: 0, band3: 0 },
      method_purist: { band1: 0, band2: 0, band3: 0 },
      ghost_in_wings: { band1: 0, band2: 0, band3: 0 },
      chaos_engine: { band1: 0, band2: 0, band3: 0 },
      glamour_icon: { band1: 0, band2: 0, band3: 0 },
      reluctant_prodigy: { band1: 0, band2: 0, band3: 0 },
      production_anchor: { band1: 0, band2: 0, band3: 0 },
    };

    Object.entries(finalAnswers).forEach(([qIdxStr, opt]) => {
      const qIdx = parseInt(qIdxStr, 10);
      const q = QUIZ_QUESTIONS[qIdx];
      const arch = opt.archetype;
      scores[arch] = (scores[arch] || 0) + 1;
      const bandKey = `band${q.band}` as keyof TemporalAccumulator;
      bandScores[arch][bandKey] = (bandScores[arch][bandKey] || 0) + 1;
    });

    const winningArch = resolveWinningArchetype(scores);
    const resolvedChar = resolveCharacterByTemporalBand(winningArch, bandScores[winningArch]);
    setWinningCharacter(resolvedChar);

    setScreen('thinking');
    setHatState('thinking');

    let phraseIdx = 0;
    const interval = setInterval(() => {
      phraseIdx = (phraseIdx + 1) % HAT_DELIBERATION_PHRASES.length;
      setDeliberationText(HAT_DELIBERATION_PHRASES[phraseIdx]);
    }, 700);

    // Transition Gate: Ensure winning character portrait and fonts are cached in memory before result screen
    const charImgSrc = resolvedChar.image || (resolvedChar as any).imageSrc;
    const gatePromise = Promise.all([
      charImgSrc ? preloadImage(charImgSrc) : Promise.resolve(),
      typeof document !== 'undefined' && document.fonts ? document.fonts.ready : Promise.resolve(),
      new Promise(resolve => setTimeout(resolve, 2200)), // minimum theatrical deliberation time
    ]);

    gatePromise.then(() => {
      clearInterval(interval);
      setScreen('result');
      setHatState('verdict');
      setActiveCommentary("Aha! The verdict could not be clearer!");
      soundManager.startGrandFinale();

      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#d4af37', '#7a1c1c', '#ffffff', '#f5c842'],
      });
    });
  };

  const handleRestart = () => {
    soundManager.playClickPop();
    soundManager.startHedwigThemeLoop();
    setScreen('landing');
    setCurrentQIndex(0);
    setUserAnswers({});
    setPendingOptionId(null);
    setHatState('idle');
    setActiveCommentary("A bold soul approaches... Let's see what theatrical madness you harbor.");
  };

  const handleScrollToCustomizer = () => {
    soundManager.playClickPop();
    const el = document.getElementById('tshirt-customizer-section');
    if (el) {
      const headerOffset = 64; // accounts for 56px fixed header + 8px breathing space
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  };

  // Determine active hat expression for quiz screen
  const selectedOptionIndex = currentQuestion.options.findIndex(opt => opt.id === pendingOptionId);
  const activeQuizFaceIndex = hoveredOptionIndex !== null ? hoveredOptionIndex : selectedOptionIndex;
  const activeQuizFaceImage =
    activeQuizFaceIndex !== -1
      ? QUESTION_OPTION_HAT_FACES[currentQIndex]?.[activeQuizFaceIndex] || 'hat_3.png'
      : undefined;

  return (
    <div
      ref={landingContainerRef}
      className="relative min-h-screen w-full bg-gradient-to-b from-[#381215] via-[#241132] to-[#090615] text-[#fcf6ee] font-sans overflow-x-hidden selection:bg-[#d4af37] selection:text-[#120f0e]"
    >
      <TheatreCurtains onEnter={() => setIsMuted(soundManager.getMuted())} />
      <SpotlightDust containerRef={landingContainerRef} />
      <FloatingCandles />

      {/* Atmospheric Radial Glows: Amber-red top transitioning to purple bottom */}
      <div className="fixed -top-24 left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-b from-amber-500/20 via-rose-700/15 to-transparent rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="fixed -bottom-24 left-1/2 -translate-x-1/2 w-[950px] h-[450px] bg-gradient-to-t from-purple-900/25 via-indigo-950/15 to-transparent rounded-full blur-[150px] pointer-events-none z-0" />

      {/* FIXED TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 sm:px-8 bg-gradient-to-r from-[#2a0e10]/95 via-[#1d0e22]/95 to-[#2a0e10]/95 backdrop-blur-md border-b border-[#ffd700]/20 shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/xts_logo.png"
            alt="XTS Logo"
            className="w-8 h-8 rounded-full object-contain"
          />
          <span className="font-cinzel text-xs sm:text-sm font-bold tracking-widest text-[#f4eae1] uppercase drop-shadow-sm">
            Xaverian Theatrical Society
          </span>
        </div>

        <div className="flex items-center gap-2.5 relative">
          {screen === 'quiz' && (
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center gap-1.5 text-xs font-cinzel text-[#f4eae1]/70 hover:text-[#ffd700] px-2.5 py-1.5 rounded-lg border border-transparent hover:border-[#d4af37]/30 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleToggleSound}
            className={`flex items-center gap-1.5 text-xs font-cinzel font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${isMuted
                ? 'text-[#f4eae1]/50 border-white/10 bg-[#1c1715] hover:border-white/20'
                : 'text-[#ffd700] border-[#d4af37]/60 bg-[#251e1b] shadow-[0_0_12px_rgba(212,175,55,0.3)] hover:border-[#d4af37]'
              }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-rose-400/80" />
                <span>Sound OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-[#ffd700] animate-pulse" />
                <span>Sound ON</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className={`relative z-10 pt-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col ${screen === 'result' ? 'justify-start' : 'justify-center'
        } ${screen === 'landing'
          ? 'min-h-[calc(100dvh-3.5rem)] pb-8 overflow-y-auto lg:h-[calc(100dvh-3.5rem)] lg:max-h-[calc(100dvh-3.5rem)] lg:pb-0 lg:overflow-hidden'
          : screen === 'quiz'
            ? 'h-[calc(100dvh-3.5rem)] max-h-[calc(100dvh-3.5rem)] overflow-hidden flex flex-col justify-between'
            : 'min-h-[calc(100dvh-3.5rem)]'
        }`}>

        {/* SCREEN 1: LANDING PAGE */}
        {screen === 'landing' && (
          <div className="relative z-10 w-full max-w-7xl mx-auto min-h-full lg:h-full flex flex-col justify-between py-1 lg:py-2 animate-fade-in my-auto">
            {/* DESKTOP VIEW (lg+): 3 Columns (Hat Left -> Centralized Text + Aligned CTA Center -> Carousel Right) (Zero Scroll) */}
            <div className="hidden lg:grid grid-cols-12 gap-4 xl:gap-6 items-center h-full w-full py-2 my-auto">
              {/* 1. Sorting Hat (Left side of text, large & majestic) */}
              <div className="col-span-3 xl:col-span-3.5 flex flex-col items-center justify-center">
                <SortingHat
                  state={hatState}
                  faceImage={landingFaceOverride || undefined}
                  commentary={activeCommentary}
                  size="md"
                  showSpeechBubble={true}
                  bubbleType="thought"
                  bubbleSpacing="mb-2 sm:mb-3"
                  onHatClick={handleLandingHatClick}
                />
              </div>

              {/* 2. Text itself Centralized with Consult the Hat Button Aligned Directly Beneath It */}
              <div className="col-span-5 xl:col-span-5 flex flex-col items-center text-center justify-center px-2 -mt-3 xl:-mt-5">
                <div>
                  <h1 className="font-cinzel font-black leading-[1.12] mb-1">
                    <span className="block text-lg sm:text-xl lg:text-2xl font-bold text-[#fbebdc]/90 tracking-widest uppercase mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                      The Sorting Hat’s
                    </span>
                    <span className="block text-3xl sm:text-4xl lg:text-[2.75rem] xl:text-[3.5rem] 2xl:text-[4rem] text-shimmer-gold glow-text-gold drop-shadow-[0_4px_20px_rgba(0,0,0,0.95)] tracking-wide">
                      Theatrical Verdict
                    </span>
                  </h1>

                  <p className="font-cinzel text-xs sm:text-sm xl:text-base text-[#fce8d5]/90 italic tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] mt-3">
                    10 questions, 1 unavoidable theatrical fate.
                  </p>
                </div>

                {/* Consult the Hat Button: Generous separation from the text */}
                <div className="relative group mt-7 xl:mt-9 pt-1">
                  {/* Multi-Layer Radiant Aura & Pulse all around the button */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#ffd700] via-[#ea580c] to-[#ffd700] rounded-2xl blur-md opacity-85 group-hover:opacity-100 transition-all duration-500 animate-pulse pointer-events-none" />

                  <button
                    type="button"
                    id="enter-quiz-btn"
                    onClick={handleStartQuiz}
                    className="relative inline-flex items-center justify-center px-10 xl:px-12 py-3.5 rounded-xl bg-gradient-to-r from-[#7a1c1c] via-[#8e2222] to-[#5a1313] hover:from-[#9c2525] hover:to-[#6d1717] border-2 border-[#ffd700] text-[#ffd700] hover:text-white font-cinzel font-black text-sm xl:text-base tracking-widest uppercase shadow-[0_0_35px_rgba(255,215,0,0.7),0_0_15px_rgba(225,29,72,0.4)] transform hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer glow-gold-pulse"
                  >
                    <span>Consult the Hat →</span>
                  </button>
                </div>
              </div>

              {/* 3. Clan Cards Carousel (Right of text) */}
              <div className="col-span-4 xl:col-span-3.5 flex flex-col items-center justify-center w-full">
                <CharacterCarousel3D />
              </div>
            </div>

            {/* MOBILE VIEW (< lg): Consistent & Clutter-Free */}
            <div className="flex lg:hidden flex-col items-center text-center py-1 space-y-3 w-full my-auto">
              {/* The Animated Sorting Hat with its Thought Bubble */}
              <div className="w-full flex justify-center my-0.5">
                <SortingHat
                  state={hatState}
                  faceImage={landingFaceOverride || undefined}
                  commentary={activeCommentary}
                  size="xs"
                  showSpeechBubble={true}
                  bubbleType="thought"
                  onHatClick={handleLandingHatClick}
                />
              </div>

              {/* Titles & Description */}
              <div>
                <h1 className="font-cinzel font-black leading-tight mb-1">
                  <span className="block text-xs sm:text-sm font-bold text-[#fbebdc]/90 tracking-widest uppercase mb-0.5 drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
                    The Sorting Hat’s
                  </span>
                  <span className="block text-2xl sm:text-3xl text-shimmer-gold glow-text-gold drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]">
                    Theatrical Verdict
                  </span>
                </h1>

                <p className="font-cinzel text-[11px] sm:text-xs text-[#fce8d5]/90 italic tracking-wider drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] mt-1.5">
                  10 questions, 1 unavoidable theatrical fate.
                </p>
              </div>

              {/* Center Stage: Mobile Primary CTA Button with generous separation */}
              <div className="flex flex-col items-center text-center pt-2 pb-1 w-full">
                <div className="relative group w-full max-w-xs flex justify-center mt-1">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd700] via-[#ea580c] to-[#ffd700] rounded-2xl blur-sm opacity-80 animate-pulse pointer-events-none" />
                  <button
                    type="button"
                    id="enter-quiz-mobile-btn"
                    onClick={handleStartQuiz}
                    className="relative w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#7a1c1c] via-[#8c2222] to-[#5a1313] hover:from-[#942626] hover:to-[#6d1717] border-2 border-[#ffd700] text-[#ffd700] font-cinzel font-bold text-xs tracking-widest uppercase shadow-[0_0_25px_rgba(212,175,55,0.45)] transform active:scale-95 transition-all duration-300 glow-gold-pulse cursor-pointer"
                  >
                    <span>Consult the Hat →</span>
                  </button>
                </div>
              </div>

              {/* 3D Clan Cards Carousel (Explore by swiping) */}
              <div className="w-full pt-1 pb-4">
                <CharacterCarousel3D />
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: QUIZ PAGE */}
        {screen === 'quiz' && (
          <div className="relative z-10 w-full max-w-6xl mx-auto h-full flex flex-col justify-between pt-3.5 pb-1 sm:pt-5 sm:pb-2 animate-fade-in my-auto">
            {/* Theatrical Ceremony Progress Header (Unboxed, Sleek Bar - Distanced 10px+ from top bar) */}
            <div className="w-full max-w-2xl mx-auto mt-1 mb-2 md:mb-5 px-1 sm:px-0 flex flex-col gap-1.5 shrink-0">
              <div className="flex items-center justify-between gap-2 px-1">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffd700] shrink-0" />
                  <span className="font-cinzel text-[11px] sm:text-xs md:text-sm font-black tracking-widest text-[#ffd700] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    The Sorting Hat Ceremony
                  </span>
                </div>

                {/* Question counter & percentage (Unboxed, clean text) */}
                <div className="flex items-center gap-1.5 font-mono text-[11px] sm:text-xs md:text-sm font-bold">
                  <span className="text-[#fce8d5]/90 tracking-wider">
                    Q{currentQIndex + 1}/10
                  </span>
                  <span className="text-[#ffd700]">•</span>
                  <span className="text-[#ffd700] font-black">
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              {/* Glowing High-Contrast Progress Bar Track */}
              <div className="w-full h-1.5 sm:h-2 md:h-2.5 bg-[#120d0b]/80 rounded-full overflow-hidden border border-[#d4af37]/60 shadow-[0_0_10px_rgba(0,0,0,0.8)] p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#942626] via-[#d4af37] to-[#ffd700] transition-all duration-500 ease-out shadow-[0_0_12px_rgba(255,215,0,0.8)]"
                  style={{ width: `${Math.max(progressPercentage, 4)}%` }}
                />
              </div>
            </div>

            {/* Side-by-Side: Hat on Left, Question + Options on Right */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 items-center flex-1 my-auto min-h-0">
              {/* DESKTOP HAT (md+): Large & Majestic */}
              <div className="hidden md:flex md:col-span-5 flex-col items-center justify-center">
                <SortingHat
                  state={hatState}
                  faceImage={activeQuizFaceImage}
                  commentary={activeCommentary}
                  size="lg"
                  showSpeechBubble={true}
                  bubbleType="thought"
                />
              </div>

              {/* MOBILE VIEW (< md): Centered Speech Bubble on Top + Scaled-Up Hat Below with Visible Expressions */}
              <div className="flex md:hidden flex-col items-center justify-center w-full shrink-0 my-0.5">
                {/* Speech Bubble Spoken by the Sorting Hat */}
                <div className="relative z-20 w-full max-w-[340px] bg-[#1e1614] border border-[#d4af37]/80 rounded-xl px-4 py-1.5 text-center shadow-[0_4px_16px_rgba(0,0,0,0.85)] mb-2">
                  <p className="font-playfair text-xs italic text-[#fce8d5] leading-snug line-clamp-2">
                    “{activeCommentary.replace(/^["“]|["”]$/g, '')}”
                  </p>
                  {/* Extruding Comment Beak - 100% Solid #1e1614, exactly coherent with text box */}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#1e1614] border-b border-r border-[#d4af37]/80 rotate-45 z-30 rounded-br-sm pointer-events-none" />
                </div>

                {/* Centered Animated Sorting Hat (Aura contained so it doesn't bleed into the beak!) */}
                <div className="relative z-10 w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center -my-1">
                  <div className="absolute top-6 inset-x-2 bottom-0 rounded-full blur-lg bg-[#ffd700]/25 animate-pulse pointer-events-none" />
                  <img
                    src={
                      activeQuizFaceImage
                        ? (activeQuizFaceImage.startsWith('/') ? activeQuizFaceImage : `/assets/hat/${activeQuizFaceImage}`)
                        : hatState === 'talking'
                          ? '/assets/hat/hat_2.png'
                          : '/assets/hat/hat_1.png'
                    }
                    alt="Sorting Hat"
                    className="w-32 h-32 sm:w-36 sm:h-36 object-contain animate-hat-bob-weave filter drop-shadow-[0_8px_20px_rgba(255,215,0,0.6)] select-none"
                  />
                </div>
              </div>

              {/* QUESTION & OPTIONS */}
              <div className="md:col-span-7 flex flex-col justify-center min-h-0">
                <h3 className="font-cinzel text-sm sm:text-lg md:text-2xl lg:text-3xl font-bold text-[#f4eae1] leading-snug mb-2 md:mb-5 text-center md:text-left drop-shadow shrink-0">
                  {currentQuestion.prompt}
                </h3>

                <div className="flex flex-col gap-1.5 sm:gap-2.5 md:gap-3">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = pendingOptionId === option.id;
                    const letter = OPTION_LETTERS[idx];

                    return (
                      <button
                        key={option.id}
                        type="button"
                        onMouseEnter={() => setHoveredOptionIndex(idx)}
                        onMouseLeave={() => setHoveredOptionIndex(null)}
                        onClick={() => handleOptionClick(option)}
                        className={`group relative text-left p-2 sm:p-3 md:p-3.5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer ${isSelected
                            ? 'bg-[#7a1c1c]/50 border-[#ffd700] shadow-[0_0_16px_rgba(212,175,55,0.4)] scale-[1.01]'
                            : 'bg-[#1e1715]/80 hover:bg-[#281f1b] border-[#d4af37]/30 hover:border-[#d4af37]'
                          }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg font-cinzel font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 border transition-colors ${isSelected
                                ? 'bg-[#d4af37] text-[#120f0e] border-[#ffd700]'
                                : 'bg-[#15100f] text-[#d4af37] border-[#d4af37]/40 group-hover:border-[#d4af37]'
                              }`}
                          >
                            {letter}
                          </span>

                          <span className="font-sans text-[11.5px] sm:text-xs md:text-sm text-[#fce8d5] font-medium leading-snug">
                            {option.label}
                          </span>
                        </div>

                        {isSelected && (
                          <span className="hidden sm:inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-cinzel font-bold text-[#ffd700] shrink-0 bg-[#7a1c1c]/80 px-2 py-0.5 rounded-md border border-[#d4af37]/60">
                            <CheckCircle className="w-3 h-3" />
                            Selected
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-2 sm:mt-3 md:mt-5 flex items-center justify-between pt-1.5 sm:pt-2 md:pt-3 border-t border-white/10 shrink-0">
                  {currentQIndex > 0 ? (
                    <button
                      type="button"
                      onClick={handlePrevQuestion}
                      className="inline-flex items-center gap-1 font-cinzel text-xs text-[#f4eae1]/60 hover:text-[#d4af37] transition-colors cursor-pointer py-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>
                  ) : (
                    <span />
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmSelection}
                    disabled={!pendingOptionId}
                    className={`inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg cursor-pointer ${pendingOptionId
                        ? 'bg-gradient-to-r from-[#d4af37] to-[#ffd700] text-[#120f0e] hover:scale-105 glow-gold-pulse'
                        : 'bg-white/5 text-white/30 border border-white/10 cursor-not-allowed'
                      }`}
                  >
                    <span>{pendingOptionId ? 'Confirm Choice →' : 'Select an Answer'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 3: THINKING CEREMONY */}
        {screen === 'thinking' && (
          <div className="relative z-10 w-full max-w-xl mx-auto h-full flex flex-col justify-center items-center text-center p-4 animate-fade-in my-auto">
            <SortingHat
              state="thinking"
              commentary={deliberationText}
              size="xl"
              showSpeechBubble={true}
              bubbleType="thought"
            />

            <div className="mt-5 flex flex-col items-center">
              <p className="text-sm sm:text-base md:text-lg text-[#fce8d5]/90 font-cinzel font-semibold tracking-wide drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)] max-w-md mx-auto leading-relaxed">
                Consulting the ancient theatrical archives across all 30 alter egos...
              </p>
            </div>
          </div>
        )}

        {/* SCREEN 4: RESULT SCREEN (COMPLETELY ABOVE-THE-FOLD ON DESKTOP & MOBILE) */}
        {screen === 'result' && (
          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-6 pb-16 animate-fade-in pt-1 sm:pt-2">

            {/* UNIFIED HERO REVEAL: Sorting Hat + Alter Ego + 3 Action Buttons all at a glance */}
            <div className="w-full relative">
              {/* Subtle ambient aura behind character and hat */}
              <div
                className="absolute top-1/3 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-[130px] opacity-25 pointer-events-none"
                style={{ backgroundColor: winningCharacter.accentColor || '#d4af37' }}
              />

              {/* ----------------- DESKTOP VIEW (md+): Perfectly Aligned, Scaled, Zero Scroll ----------------- */}
              <div className="hidden md:flex flex-col w-full">
                {/* Two-Column Grid: items-start guarantees character & text align with top speech bubble! */}
                <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">

                  {/* LEFT (5 cols): Speech Bubble + Scaled Hat + Mandate Headline */}
                  <div className="col-span-5 flex flex-col items-center text-center">
                    {/* Speech Bubble */}
                    <div className="relative w-full max-w-[360px] bg-[#1e1614] border-2 border-[#d4af37]/80 rounded-2xl px-5 py-2.5 text-center shadow-[0_6px_25px_rgba(0,0,0,0.8),0_0_15px_rgba(212,175,55,0.15)] mb-3">
                      <p className="font-playfair text-xs sm:text-sm italic text-[#fce8d5] leading-snug tracking-wide">
                        “I HAVE SEEN YOUR DESTINY!<br />THE THEATRE HAS SPOKEN!”
                      </p>
                      {/* Extruding Comment Beak matching internal color */}
                      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-[#1e1614] border-b-2 border-r-2 border-[#d4af37]/80 rotate-45 z-10 rounded-br-sm pointer-events-none" />
                    </div>

                    {/* Scaled-UP Sorting Hat (Proud, Authoritative & Majestic ~220-250px) */}
                    <div className="relative w-56 h-56 sm:w-60 sm:h-60 lg:w-64 lg:h-64 flex items-center justify-center my-0.5">
                      <div
                        className="absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-700 animate-pulse"
                        style={{
                          background: 'radial-gradient(circle, rgba(255, 215, 0, 0.7) 0%, rgba(245, 198, 66, 0.4) 40%, rgba(220, 38, 38, 0.25) 65%, transparent 80%)'
                        }}
                      />
                      <img
                        src="/assets/hat/hat_4.png"
                        alt="Sorting Hat Verdict"
                        className="w-56 h-56 sm:w-60 sm:h-60 lg:w-64 lg:h-64 object-contain animate-hat-bob-weave filter drop-shadow-[0_10px_25px_rgba(255,215,0,0.6)] select-none"
                      />
                    </div>

                    {/* Mandate Headline (with quotes around “THE XTS T-SHIRT!” - Larger Font) */}
                    <div className="mt-2 text-center">
                      <span className="font-cinzel text-xs sm:text-sm lg:text-base font-bold text-[#f4eae1]/85 tracking-widest uppercase block mb-1">
                        YOU NEED TO REGISTER
                      </span>
                      <h2 className="font-cinzel text-xl sm:text-2xl lg:text-3xl font-black text-shimmer-gold glow-text-gold tracking-wide leading-tight">
                        FOR{' '}
                        <span className="underline decoration-[#c41230] decoration-4 underline-offset-4">
                          “THE XTS T-SHIRT!”
                        </span>
                      </h2>
                    </div>
                  </div>

                  {/* RIGHT (7 cols): Image extends from top till the XTS T-shirt line, details center-aligned! */}
                  <div className="col-span-7 flex flex-row items-stretch gap-6">
                    {/* Poster Image: 10px lower from top bar */}
                    <div className="w-56 lg:w-60 h-[360px] lg:h-[375px] shrink-0 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.35)] relative bg-[#0e0a09] group mt-[10px]">
                      <img
                        src={winningCharacter.image}
                        alt={winningCharacter.name}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2 text-center">
                        <span className="text-[11px] font-cinzel font-black uppercase tracking-wider text-[#ffd700] block leading-tight">
                          {winningCharacter.title}
                        </span>
                      </div>
                    </div>

                    {/* Character Name, Archetype, Quote, Society Ruling - ALL CENTER-ALIGNED! */}
                    <div className="flex flex-col items-center text-center justify-center gap-1.5 flex-1 min-w-0 self-center mt-[10px]">
                      <span className="text-[11px] font-cinzel font-bold uppercase tracking-widest text-[#d4af37]">
                        Your Theatrical Alter Ego
                      </span>

                      <h3 className="font-cinzel text-2xl lg:text-3xl font-black text-[#fffdfa] drop-shadow-md leading-tight">
                        {winningCharacter.name}
                      </h3>

                      {/* Archetype title text directly below name text - centered, NO BOX! */}
                      <div className="flex items-center my-0.5">
                        <span
                          className="text-xs sm:text-sm font-cinzel font-black tracking-[0.2em] uppercase drop-shadow-sm"
                          style={{ color: winningCharacter.accentColor || '#ffd700' }}
                        >
                          ✦ {winningCharacter.badge || 'THEATRICAL ALTER EGO'} ✦
                        </span>
                      </div>

                      <blockquote className="my-1.5 text-xs sm:text-sm italic text-[#fce8d5] font-playfair leading-relaxed max-w-md">
                        “{winningCharacter.quote}”
                      </blockquote>

                      {/* Official Society Ruling - Clean narrative, centered, NO BOX! */}
                      <div className="mt-2 text-center max-w-md">
                        <span className="text-[#ffd700] font-cinzel text-xs sm:text-sm font-bold tracking-widest uppercase block mb-1 drop-shadow-sm">
                          OFFICIAL SOCIETY RULING FOR {winningCharacter.name.toUpperCase()}:
                        </span>
                        <p className="font-sans text-xs sm:text-sm text-[#fce8d5]/90 leading-relaxed">
                          {winningCharacter.merchPitch}
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Action Buttons Below: ALL ON THE SAME ROW! */}
                <div className="flex items-center justify-center gap-4 pt-5">
                  {/* Share Story Button */}
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#f39c12] hover:from-[#e5c158] hover:to-[#ffe066] text-[#120f0e] font-cinzel font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-[#fff2a8] cursor-pointer flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4 text-[#120f0e]" />
                    <span>Share Story</span>
                  </button>

                  {/* Customize T-Shirt Button (Instant Smooth Scroll to Customizer) */}
                  <button
                    type="button"
                    onClick={handleScrollToCustomizer}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2a1d1b] to-[#3a2724] hover:from-[#422e2a] hover:to-[#4e3632] border border-[#d4af37] text-[#ffd700] font-cinzel font-bold text-xs uppercase tracking-wider hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <Sparkles className="w-4 h-4 text-[#ffd700]" />
                    <span>Customize T-Shirt ↓</span>
                  </button>

                  {/* Order T-Shirt Button with Radiant Glowing Effect! */}
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#ffd700] via-[#ea384c] to-[#ffd700] rounded-2xl blur-md opacity-85 group-hover:opacity-100 animate-pulse pointer-events-none" />
                    <a
                      href={ORDER_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#942626] via-[#b91c1c] to-[#7f1d1d] hover:from-[#a82828] hover:to-[#991b1b] border-2 border-[#ffd700] text-[#ffd700] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(255,215,0,0.6),0_0_15px_rgba(220,38,38,0.7)] hover:scale-105 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Order T-Shirt ↗</span>
                    </a>
                  </div>
                </div>
              </div>

              {/* ----------------- MOBILE HERO VIEW (< md): 100% Visible Above-the-Fold on First Load ----------------- */}
              <div className="flex md:hidden flex-col items-center w-full gap-2.5 text-center">
                {/* 1. Speech Bubble Spoken by the Sorting Hat */}
                <div className="relative w-full max-w-[340px] bg-[#1e1614] border border-[#d4af37]/80 rounded-xl px-4 py-1.5 text-center shadow-md">
                  <p className="font-playfair text-xs sm:text-sm font-semibold italic text-[#fce8d5] leading-snug tracking-wide">
                    “I HAVE SEEN YOUR DESTINY!<br />THE THEATRE HAS SPOKEN!”
                  </p>
                  {/* Extruding Comment Beak */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#1e1614] border-b border-r border-[#d4af37]/80 rotate-45 z-10 rounded-br-sm pointer-events-none" />
                </div>

                {/* 2. Scaled Sorting Hat + Mandate Headline ("THE UNIQUE XTS TEXT") */}
                <div className="flex flex-col items-center justify-center w-full">
                  {/* Sorting Hat: Sized up by a few pixels in mobile view (w-40 h-40) */}
                  <div className="relative w-40 h-40 sm:w-44 sm:h-44 flex items-center justify-center my-0.5">
                    <div
                      className="absolute inset-0 rounded-full blur-2xl pointer-events-none transition-all duration-700 animate-pulse"
                      style={{
                        background: 'radial-gradient(circle, rgba(255, 215, 0, 0.75) 0%, rgba(245, 198, 66, 0.45) 40%, rgba(220, 38, 38, 0.25) 65%, transparent 80%)'
                      }}
                    />
                    <img
                      src="/assets/hat/hat_4.png"
                      alt="Sorting Hat"
                      className="w-40 h-40 sm:w-44 sm:h-44 object-contain animate-hat-bob-weave filter drop-shadow-[0_12px_24px_rgba(255,215,0,0.75)] select-none"
                    />
                  </div>

                  {/* Unique XTS Mandate Text: White "YOU NEED TO REGISTER" + Landing Page Golden Shimmer on THE XTS T-SHIRT! (No quotes, sized up) */}
                  <div
                    className="text-center mt-1 cursor-pointer group"
                    onClick={handleScrollToCustomizer}
                    title="Click to customize your XTS T-Shirt"
                  >
                    <span className="font-cinzel text-sm sm:text-base font-black text-white tracking-[0.2em] uppercase block leading-tight mb-0.5 drop-shadow-[0_2px_8px_rgba(255,255,255,0.4)]">
                      YOU NEED TO REGISTER
                    </span>
                    <h2 className="font-cinzel tracking-wide leading-tight group-hover:scale-105 transition-transform flex items-center justify-center gap-2 flex-wrap mt-0.5">
                      <span className="text-sm sm:text-base font-bold text-[#fce8d5]/90 tracking-widest">
                        FOR
                      </span>
                      <span className="text-xl sm:text-2xl lg:text-3xl font-black text-shimmer-gold glow-text-gold underline decoration-[#c41230] decoration-2 underline-offset-4 drop-shadow-[0_2px_12px_rgba(255,215,0,0.6)]">
                        THE XTS T-SHIRT!
                      </span>
                    </h2>
                  </div>
                </div>

                {/* 3. Character Row: Image on the LEFT (Larger!), Info & Quote on the RIGHT (Larger!) */}
                <div className="flex items-center gap-3 w-full max-w-sm sm:max-w-md mx-auto px-1 text-left mt-1">
                  {/* Left: Character Portrait Poster - Sized up to w-32 sm:w-36 */}
                  <div className="w-32 sm:w-36 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.35)] relative bg-[#0e0a09]">
                    <img
                      src={winningCharacter.image}
                      alt={winningCharacter.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/75 to-transparent px-1.5 py-1 text-center">
                      <span className="text-[9px] sm:text-[10px] font-cinzel font-black uppercase tracking-wider text-[#ffd700] block truncate">
                        {winningCharacter.title}
                      </span>
                    </div>
                  </div>

                  {/* Right: Alter Ego Name, Badge & Quote - Sized up with generous typography */}
                  <div className="flex flex-col justify-center min-w-0 flex-1">
                    <span className="text-[10px] sm:text-xs font-cinzel font-bold uppercase tracking-wider text-[#d4af37] block leading-none">
                      Your Theatrical Alter Ego
                    </span>

                    <h3 className="font-cinzel text-xl sm:text-2xl font-black text-[#fffdfa] drop-shadow-md leading-tight mt-1 truncate">
                      {winningCharacter.name}
                    </h3>

                    {/* Archetype Badge */}
                    <div className="flex items-center my-1">
                      <span
                        className="text-xs sm:text-[13px] font-cinzel font-black tracking-wider uppercase drop-shadow-sm leading-none"
                        style={{ color: winningCharacter.accentColor || '#ffd700' }}
                      >
                        ✦ {winningCharacter.badge || 'THEATRICAL ALTER EGO'} ✦
                      </span>
                    </div>

                    {/* Quote on the side */}
                    <blockquote className="mt-0.5 text-xs sm:text-[13px] italic text-[#fce8d5]/95 font-playfair leading-snug line-clamp-3">
                      “{winningCharacter.quote}”
                    </blockquote>
                  </div>
                </div>

                {/* Official Society Ruling Below - Prominent & Legible */}
                <div className="w-full max-w-sm sm:max-w-md mx-auto text-center px-1 mt-0.5">
                  <span className="text-[#ffd700] font-cinzel text-xs sm:text-sm font-bold tracking-wider uppercase block mb-0.5 drop-shadow-sm leading-snug">
                    OFFICIAL SOCIETY RULING FOR {winningCharacter.name.toUpperCase()}:
                  </span>
                  <p className="font-sans text-xs sm:text-[13px] text-[#fce8d5]/90 leading-snug line-clamp-3">
                    {winningCharacter.merchPitch}
                  </p>
                </div>

                {/* 4. Action Buttons (All 3 Buttons Visible on First Load with Clean Short Labels) */}
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2 pt-1 items-center w-full max-w-sm sm:max-w-md mx-auto">
                  <button
                    type="button"
                    onClick={() => setIsShareModalOpen(true)}
                    className="px-2 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#f39c12] text-[#120f0e] font-cinzel font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#120f0e] shrink-0" />
                    <span className="whitespace-nowrap">Share</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleScrollToCustomizer}
                    className="px-2 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#2a1d1b] to-[#3a2724] border border-[#d4af37] text-[#ffd700] font-cinzel font-bold text-[11px] sm:text-xs uppercase tracking-wider active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 sm:gap-1.5 shadow-md"
                  >
                    <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffd700] shrink-0" />
                    <span className="whitespace-nowrap">Customize</span>
                  </button>

                  {/* Order Button with Glowing Effect on Mobile */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-[#ffd700] via-[#ea384c] to-[#ffd700] rounded-xl blur-sm opacity-85 animate-pulse pointer-events-none" />
                    <a
                      href={ORDER_FORM_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative w-full px-2 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#942626] via-[#b91c1c] to-[#7f1d1d] border border-[#ffd700] text-[#ffd700] font-cinzel font-black text-[11px] sm:text-xs uppercase tracking-wider shadow-[0_0_14px_rgba(255,215,0,0.7)] active:scale-95 transition-all cursor-pointer flex items-center justify-center gap-1 text-center"
                    >
                      <span className="whitespace-nowrap">Order ↗</span>
                    </a>
                  </div>
                </div>
              </div>

            </div>

            {/* STAGE 2: INTERACTIVE T-SHIRT CUSTOMIZER (Glassmorphism, No Heavy Outline Box) */}
            <div id="tshirt-customizer-section" className="w-full pt-4 scroll-mt-20">
              <TShirtCustomizer
                customName={customName}
                onNameChange={setCustomName}
              />
            </div>

            {/* Retake Auditions Button */}
            <div className="flex justify-center pt-6">
              <button
                type="button"
                onClick={handleRestart}
                className="px-6 py-2.5 rounded-full bg-transparent hover:bg-white/5 border border-white/20 text-[#f4eae1]/60 hover:text-white font-cinzel text-xs uppercase tracking-widest transition-all cursor-pointer"
              >
                Try On The Hat Again ↺
              </button>
            </div>
          </div>
        )}
      </main>


      {/* 9:16 Instagram Story Modal */}
      <StoryShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        result={winningCharacter}
        customName={customName}
      />
    </div>
  );
}
