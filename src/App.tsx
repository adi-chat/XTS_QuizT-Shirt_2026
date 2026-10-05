import { useState, useRef } from 'react';
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
import { StickyCTA } from './components/StickyCTA';
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
  Tag,
} from 'lucide-react';
import { ORDER_FORM_URL } from './constants';

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
    "Ah, a bold soul approaches the sorting stool... Let's see what theatrical madness you harbor."
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

    setTimeout(() => {
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
    }, 3000);
  };

  const handleRestart = () => {
    soundManager.playClickPop();
    soundManager.startHedwigThemeLoop();
    setScreen('landing');
    setCurrentQIndex(0);
    setUserAnswers({});
    setPendingOptionId(null);
    setHatState('idle');
    setActiveCommentary("Ah, a bold soul approaches the sorting stool... Let's see what theatrical madness you harbor.");
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
      className="relative min-h-screen w-full bg-[#120f0e] text-[#f4eae1] font-sans overflow-x-hidden selection:bg-[#d4af37] selection:text-[#120f0e]"
    >
      <TheatreCurtains onEnter={() => setIsMuted(soundManager.getMuted())} />
      <SpotlightDust containerRef={landingContainerRef} />
      <FloatingCandles />

      {/* FIXED TOP HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 flex items-center justify-between px-4 sm:px-8 bg-gradient-to-r from-[#120f0e]/95 via-[#1a0a0f]/95 to-[#120f0e]/95 backdrop-blur-md border-b border-[#d4af37]/25 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="flex items-center gap-2.5">
          <img
            src="/assets/xts_logo.png"
            alt="XTS Logo"
            className="w-8 h-8 rounded-full object-contain bg-white/10 p-0.5 border border-[#d4af37]/60 shadow-[0_0_12px_rgba(212,175,55,0.3)]"
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
            className={`flex items-center gap-1.5 text-xs font-cinzel font-semibold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
              isMuted
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
      <main className={`relative z-10 pt-14 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col justify-center ${
        screen === 'landing'
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
                  onHatClick={handleLandingHatClick}
                />
              </div>

              {/* 2. Text itself Centralized with Consult the Hat Button Aligned Directly Beneath It */}
              <div className="col-span-5 xl:col-span-5 flex flex-col items-center text-center justify-center space-y-3.5 xl:space-y-4 px-2 -mt-3 xl:-mt-5">
                <div>
                  <span className="text-xs xl:text-sm uppercase tracking-[0.25em] font-cinzel text-[#d4af37] font-bold mb-1.5 block">
                    The Sorting Stool Awaits
                  </span>
                  <h1 className="font-cinzel text-3xl sm:text-4xl lg:text-[2.65rem] xl:text-[3.25rem] 2xl:text-[3.75rem] font-black text-[#f4eae1] leading-[1.12] mb-2.5 drop-shadow-md">
                    The Sorting Hat’s <br />
                    <span className="text-shimmer-gold glow-text-gold drop-shadow-lg">
                      Theatrical Verdict
                    </span>
                  </h1>
                  <p className="font-playfair text-sm xl:text-base 2xl:text-lg text-[#fce8d5]/85 italic leading-relaxed max-w-lg">
                    Step onto the stage. Discover your theatrical alter ego... and prepare for the ultimate society verdict.
                  </p>
                </div>

                <p className="font-sans text-xs xl:text-sm text-[#ffd700]/90 font-medium tracking-wide">
                  ✨ 10 questions. One unavoidable theatrical fate. ✨
                </p>

                {/* Consult the Hat Button: Centered & Directly Aligned with Middle Text (No stars in button) */}
                <div className="relative group pt-1.5">
                  {/* Multi-Layer Radiant Aura & Pulse all around the button */}
                  <div className="absolute -inset-1.5 bg-gradient-to-r from-[#ffd700] via-[#e11d48] to-[#ffd700] rounded-2xl blur-md opacity-85 group-hover:opacity-100 transition-all duration-500 animate-pulse pointer-events-none" />
                  <div className="absolute -inset-3 bg-radial from-[#ffd700]/40 via-transparent to-transparent rounded-full blur-xl opacity-60 pointer-events-none animate-pulse" />

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

              {/* 3. Carousel Card (Right of text, more to the right) */}
              <div className="col-span-4 xl:col-span-3.5 flex flex-col items-center justify-center w-full">
                <CharacterCarousel3D />
              </div>
            </div>

            {/* MOBILE VIEW (< lg): Exactly what user liked */}
            <div className="flex lg:hidden flex-col items-center text-center py-1 space-y-2.5 w-full my-auto">
              {/* The Animated Sorting Hat */}
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
                <span className="text-[10px] uppercase tracking-widest font-cinzel text-[#d4af37] font-bold mb-0.5 block">
                  The Sorting Stool Awaits
                </span>
                <h1 className="font-cinzel text-xl font-black text-[#f4eae1] leading-tight mb-1 drop-shadow">
                  The Sorting Hat’s <br />
                  <span className="text-shimmer-gold glow-text-gold drop-shadow">
                    Theatrical Verdict
                  </span>
                </h1>
                <p className="font-playfair text-[11px] text-[#fce8d5]/85 italic leading-snug max-w-xs">
                  Step onto the stage. Discover your theatrical alter ego... and prepare for the ultimate society verdict.
                </p>
              </div>

              {/* 3D Rotating Character Cover Flow */}
              <div className="w-full">
                <CharacterCarousel3D />
              </div>

              {/* Mobile Tagline & Primary CTA Button */}
              <div className="flex flex-col items-center text-center mt-1 space-y-1.5 w-full">
                <p className="font-sans text-[10px] text-[#ffd700]/90 font-medium tracking-wide">
                  ✨ 10 questions. One theatrical fate. ✨
                </p>
                <button
                  type="button"
                  id="enter-quiz-mobile-btn"
                  onClick={handleStartQuiz}
                  className="w-full max-w-xs inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#7a1c1c] via-[#8c2222] to-[#5a1313] hover:from-[#942626] hover:to-[#6d1717] border-2 border-[#d4af37] text-[#ffd700] font-cinzel font-bold text-xs tracking-widest uppercase shadow-[0_0_20px_rgba(212,175,55,0.35)] transform active:scale-95 transition-all duration-300 glow-gold-pulse cursor-pointer"
                >
                  <span>Consult the Hat →</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SCREEN 2: QUIZ PAGE */}
        {screen === 'quiz' && (
          <div className="relative z-10 w-full max-w-6xl mx-auto h-full flex flex-col justify-between pt-1 pb-1 sm:pt-2 sm:pb-2 animate-fade-in my-auto">
            {/* Theatrical Ceremony & Progress Header: High-Visibility Marquee */}
            <div className="w-full max-w-2xl mx-auto mb-1.5 md:mb-4 px-3 sm:px-5 py-1.5 sm:py-2.5 md:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#201513]/95 via-[#2c1c18]/95 to-[#201513]/95 border border-[#d4af37]/80 backdrop-blur-md shadow-[0_6px_25px_rgba(0,0,0,0.85)] flex flex-col gap-1 sm:gap-2 shrink-0">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ffd700] shrink-0" />
                  <span className="font-cinzel text-[11px] sm:text-xs md:text-sm font-black tracking-widest text-[#ffd700] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                    The Sorting Hat Ceremony
                  </span>
                </div>

                <div className="flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/70 border border-[#d4af37]/60 shadow-inner">
                  <span className="font-mono text-[11px] sm:text-xs md:text-sm font-bold text-white tracking-wider">
                    Q{currentQIndex + 1}/10
                  </span>
                  <span className="text-[#ffd700] font-bold text-xs">•</span>
                  <span className="font-mono text-[11px] sm:text-xs md:text-sm font-black text-[#ffd700]">
                    {progressPercentage}%
                  </span>
                </div>
              </div>

              {/* Glowing High-Contrast Progress Bar Track */}
              <div className="w-full h-1.5 sm:h-2.5 md:h-3 bg-[#120d0b] rounded-full overflow-hidden border border-[#d4af37]/50 shadow-inner p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#942626] via-[#d4af37] to-[#ffd700] transition-all duration-500 ease-out shadow-[0_0_10px_rgba(255,215,0,0.8)]"
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

              {/* MOBILE COMPACT HAT ROW (< md): Shrunk Hat + Thought Bubble in a sleek horizontal row (Under 60px tall) */}
              <div className="flex md:hidden items-center gap-2.5 w-full bg-[#1c1513]/90 border border-[#d4af37]/50 rounded-xl p-2 shadow-lg backdrop-blur-md shrink-0">
                {/* Compact Animated Hat */}
                <div className="relative w-11 h-11 shrink-0 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full blur-sm bg-[#ffd700]/30 animate-pulse pointer-events-none" />
                  <img
                    src={
                      activeQuizFaceImage
                        ? (activeQuizFaceImage.startsWith('/') ? activeQuizFaceImage : `/assets/hat/${activeQuizFaceImage}`)
                        : hatState === 'talking'
                        ? '/assets/hat/hat_2.png'
                        : '/assets/hat/hat_1.png'
                    }
                    alt="Sorting Hat"
                    className="w-11 h-11 object-contain animate-hat-bob-weave filter drop-shadow-[0_2px_6px_rgba(255,215,0,0.4)]"
                  />
                </div>

                {/* Snug Speech Bubble */}
                <div className="flex-1 min-w-0 bg-[#140e0c] border border-[#d4af37]/40 rounded-lg px-2.5 py-1 shadow-inner relative">
                  <p className="font-playfair text-[11px] italic text-[#fce8d5] leading-snug line-clamp-2">
                    “{activeCommentary.replace(/^["“]|["”]$/g, '')}”
                  </p>
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#140e0c] border-l border-b border-[#d4af37]/40 rotate-45" />
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
                        className={`group relative text-left p-2 sm:p-3 md:p-3.5 rounded-xl border-2 transition-all duration-200 flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-[#7a1c1c]/50 border-[#ffd700] shadow-[0_0_16px_rgba(212,175,55,0.4)] scale-[1.01]'
                            : 'bg-[#1e1715]/80 hover:bg-[#281f1b] border-[#d4af37]/30 hover:border-[#d4af37]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg font-cinzel font-bold text-[11px] sm:text-xs flex items-center justify-center shrink-0 border transition-colors ${
                              isSelected
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
                    className={`inline-flex items-center gap-2 px-5 sm:px-6 py-2 sm:py-2.5 rounded-xl font-cinzel font-bold text-xs sm:text-sm tracking-wider uppercase transition-all shadow-lg cursor-pointer ${
                      pendingOptionId
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

            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#1e1715]/80 border border-[#d4af37]/40 shadow-lg">
                <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                <span className="font-cinzel text-xs uppercase tracking-widest text-[#d4af37] font-bold">
                  The Ceremony of the Stool
                </span>
              </div>
              <p className="text-xs text-[#fce8d5]/70 font-sans tracking-wide">
                Consulting the ancient theatrical archives across all 30 alter egos...
              </p>
            </div>
          </div>
        )}

        {/* SCREEN 4: RESULT SCREEN (STAGE 1 -> STAGE 2 -> STAGE 3 HIERARCHY) */}
        {screen === 'result' && (
          <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col gap-10 pb-32 animate-fade-in pt-4">

            {/* ========================================================================= */}
            {/* STAGE 1: THE REVEAL FIRST! "YOUR THEATRICAL ALTER EGO"                    */}
            {/* ========================================================================= */}
            <div className="w-full bg-gradient-to-br from-[#1b1514]/95 via-[#16100f]/95 to-[#100b0a]/95 border-2 border-[#d4af37]/50 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl relative overflow-hidden">
              <div
                className="absolute -right-20 -top-20 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
                style={{ backgroundColor: winningCharacter.accentColor || '#d4af37' }}
              />

              {/* Header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-[#d4af37]/25 pb-5 mb-8">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">🎭</span>
                  <div>
                    <span className="text-[11px] font-cinzel font-bold uppercase tracking-widest text-[#d4af37] block">
                      Official Society Theatrical Casting
                    </span>
                    <h3 className="font-cinzel text-xl sm:text-2xl font-black text-[#f4eae1]">
                      Your Theatrical Alter Ego
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-cinzel font-bold px-3.5 py-1 rounded-full border shadow-sm"
                    style={{
                      color: winningCharacter.accentColor || '#ffd700',
                      borderColor: `${winningCharacter.accentColor || '#ffd700'}66`,
                      backgroundColor: `${winningCharacter.accentColor || '#ffd700'}18`,
                    }}
                  >
                    {winningCharacter.badge || 'THEATRICAL ALTER EGO'}
                  </span>
                </div>
              </div>

              {/* Side-by-Side: Grand Poster Left, Full Traits & Details Right */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Poster Left */}
                <div className="lg:col-span-5 flex flex-col items-center justify-center">
                  <div className="w-56 sm:w-64 md:w-72 aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#d4af37] shadow-[0_0_35px_rgba(212,175,55,0.35)] relative bg-[#0e0a09] group">
                    <img
                      src={winningCharacter.image}
                      alt={winningCharacter.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-2.5 sm:p-3 text-center">
                      <span className="text-[10.5px] sm:text-xs font-cinzel font-black uppercase tracking-wider text-[#ffd700] block leading-tight">
                        {winningCharacter.title}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Right */}
                <div className="lg:col-span-7 flex flex-col text-center lg:text-left">
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 mb-2">
                    <h4 className="font-cinzel text-3xl sm:text-4xl font-black text-[#f4eae1]">
                      {winningCharacter.name}
                    </h4>
                    <span
                      className="text-xs sm:text-sm font-cinzel font-bold px-3 py-1 rounded-full border shadow-sm"
                      style={{
                        color: winningCharacter.accentColor || '#ffd700',
                        borderColor: `${winningCharacter.accentColor || '#ffd700'}66`,
                        backgroundColor: `${winningCharacter.accentColor || '#ffd700'}18`,
                      }}
                    >
                      {winningCharacter.title}
                    </span>
                  </div>

                  <blockquote className="border-l-2 border-[#d4af37] pl-3 py-1 my-2 text-sm italic text-[#fce8d5]/90 text-left">
                    "{winningCharacter.quote}"
                  </blockquote>

                  <p className="font-sans text-sm sm:text-base text-[#fce8d5]/85 leading-relaxed mb-4">
                    {winningCharacter.vibe}
                  </p>

                  {/* Stage Tell Box */}
                  <div className="p-4 rounded-2xl bg-[#120f0e]/90 border-l-4 border-[#d4af37] text-left mb-4 shadow-lg">
                    <span className="text-[10px] uppercase font-cinzel font-bold tracking-widest text-[#d4af37] block mb-1">
                      Backstage Tell & Rehearsal Habit
                    </span>
                    <p className="font-playfair text-sm sm:text-base italic text-[#ffd700] leading-snug">
                      "{winningCharacter.stageTell}"
                    </p>
                  </div>

                  {/* Character Tags */}
                  <div className="flex flex-wrap gap-2 mb-5 justify-center lg:justify-start">
                    {winningCharacter.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 text-xs font-mono px-3 py-1 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/40 text-[#ffd700]"
                      >
                        <Tag className="w-3 h-3 text-[#d4af37]" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Share CTA & Verdict Navigation Buttons */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] via-[#ffd700] to-[#f39c12] hover:from-[#e5c158] hover:to-[#ffe066] text-[#120f0e] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:shadow-[0_0_35px_rgba(255,215,0,0.7)] hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-[#fff2a8] cursor-pointer flex items-center gap-2"
                    >
                      <Share2 className="w-4 h-4 text-[#120f0e]" />
                      <span>Share Story</span>
                    </button>

                    <a
                      href="#the-hat-verdict-section"
                      className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#7a1c1c] via-[#8c2222] to-[#5a1313] hover:from-[#9c2525] hover:to-[#6d1717] border-2 border-[#ffd700] text-[#ffd700] font-cinzel font-black text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(180,30,30,0.5)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] hover:scale-105 active:scale-95 transition-all duration-300 flex items-center gap-2 group cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#ffd700]" />
                      <span>The Hat's Verdict ↓</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STAGE 2: THE SORTING HAT'S MANDATE & MERCH DECREE                         */}
            {/* ========================================================================= */}
            <div
              id="the-hat-verdict-section"
              className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-[#241715]/98 via-[#1a1210]/98 to-[#120d0c]/98 border-2 border-[#ffd700] ring-4 ring-[#ffd700]/20 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(212,175,55,0.35)] relative overflow-hidden"
            >
              <div className="absolute -top-20 -left-20 w-80 h-80 bg-[#d4af37]/15 rounded-full blur-3xl pointer-events-none" />

              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <SortingHat
                  state="verdict"
                  faceImage="hat_4.png"
                  commentary="I HAVE SEEN YOUR DESTINY! THE THEATRE HAS SPOKEN!"
                  size="lg"
                  showSpeechBubble={true}
                />
              </div>

              <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#d4af37]/20 border border-[#d4af37] text-[#ffd700] text-xs font-cinzel font-bold uppercase tracking-widest mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#ffd700]" />
                  The Sorting Hat Has Decided
                </div>

                <h2 className="font-cinzel text-3xl sm:text-4xl lg:text-5xl font-black text-[#f4eae1] leading-[1.15] mb-4">
                  YOU NEED TO REGISTER FOR <br />
                  <span className="text-shimmer-gold glow-text-gold underline decoration-[#c41230] decoration-4 underline-offset-4">
                    XTS T-SHIRTS!
                  </span>
                </h2>

                {/* Character Tailored Merch Pitch */}
                <div className="bg-[#241a18] border border-[#7a1c1c] p-4 sm:p-5 rounded-2xl text-left mb-6 shadow-xl max-w-xl">
                  <span className="text-[#ffd700] font-cinzel text-xs font-bold tracking-widest uppercase block mb-1">
                    Official Society Ruling for {winningCharacter.name}:
                  </span>
                  <p className="font-sans text-sm sm:text-base text-[#fce8d5] leading-relaxed">
                    {winningCharacter.merchPitch}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 w-full">
                  <a
                    href="#tshirt-customizer-section"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#d4af37] to-[#ffd700] hover:from-[#e5c158] hover:to-[#ffe066] text-[#120f0e] font-cinzel font-black text-xs uppercase tracking-wider shadow-lg hover:shadow-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Customize Your Shirt ↓
                  </a>

                  <a
                    href={ORDER_FORM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#7a1c1c] to-[#942626] hover:from-[#942626] hover:to-[#a82d2d] border border-[#d4af37]/70 text-[#ffd700] font-cinzel font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 shadow-md"
                  >
                    <span>Pre-Order Form ↗</span>
                  </a>
                </div>
              </div>
            </div>

            {/* ========================================================================= */}
            {/* STAGE 3: INTERACTIVE 3D T-SHIRT CUSTOMIZER                                */}
            {/* ========================================================================= */}
            <div id="tshirt-customizer-section" className="w-full">
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

      {/* Sticky Bottom Bar on Result Screen */}
      {screen === 'result' && (
        <StickyCTA
          customName={customName}
        />
      )}

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
