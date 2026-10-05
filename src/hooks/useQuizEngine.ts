import { useState, useMemo } from 'react';
import type { ArchetypeKey, CharacterProfile, TemporalAccumulator } from '../types/quiz';
import { QUIZ_QUESTIONS } from '../data/quizQuestions';
import { CHARACTERS_CATALOG } from '../data/characters';
import { resolveWinningArchetype, resolveCharacterByTemporalBand } from '../utils/scoringEngine';

const INITIAL_ARCHETYPE_SCORES: Record<ArchetypeKey, number> = {
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

const INITIAL_BAND_SCORES: Record<ArchetypeKey, TemporalAccumulator> = {
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

export function useQuizEngine() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState(INITIAL_ARCHETYPE_SCORES);
  const [bandScores, setBandScores] = useState(INITIAL_BAND_SCORES);
  const [activeComment, setActiveComment] = useState<string | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Manual override for dev / fast-track preview of any specific character
  const [manualCharacterOverride, setManualCharacterOverride] = useState<CharacterProfile | null>(null);

  const currentQuestion = QUIZ_QUESTIONS[currentIndex] || QUIZ_QUESTIONS[0];

  const handleSelectOption = (optionId: string) => {
    if (isTransitioning) return;
    const selectedOption = currentQuestion.options.find(opt => opt.id === optionId);
    if (!selectedOption) return;

    setSelectedOptionId(optionId);

    // Pick one of the dual hat comments randomly
    const chosenComment =
      selectedOption.hatComments[Math.floor(Math.random() * selectedOption.hatComments.length)];
    setActiveComment(chosenComment);
    setIsTransitioning(true);

    const archetype = selectedOption.archetype;
    const bandKey = `band${currentQuestion.band}` as keyof TemporalAccumulator;

    setScores(prev => ({
      ...prev,
      [archetype]: (prev[archetype] || 0) + 1,
    }));

    setBandScores(prev => ({
      ...prev,
      [archetype]: {
        ...prev[archetype],
        [bandKey]: (prev[archetype]?.[bandKey] || 0) + 1,
      },
    }));

    setTimeout(() => {
      if (currentIndex + 1 < QUIZ_QUESTIONS.length) {
        setCurrentIndex(prev => prev + 1);
        setSelectedOptionId(null);
        setActiveComment(null);
        setIsTransitioning(false);
      } else {
        // Deliberation state
        setIsThinking(true);
        setTimeout(() => {
          setIsThinking(false);
          setIsComplete(true);
        }, 3000);
      }
    }, 700);
  };

  const finalResult: { archetype: ArchetypeKey; character: CharacterProfile } | null =
    useMemo(() => {
      if (manualCharacterOverride) {
        return {
          archetype: manualCharacterOverride.archetype,
          character: manualCharacterOverride,
        };
      }

      if (!isComplete) return null;

      const winningArchetype = resolveWinningArchetype(scores);
      const winningCharacter = resolveCharacterByTemporalBand(
        winningArchetype,
        bandScores[winningArchetype]
      );

      return {
        archetype: winningArchetype,
        character: winningCharacter,
      };
    }, [isComplete, scores, bandScores, manualCharacterOverride]);

  const resetQuiz = () => {
    setCurrentIndex(0);
    setScores(INITIAL_ARCHETYPE_SCORES);
    setBandScores(INITIAL_BAND_SCORES);
    setActiveComment(null);
    setSelectedOptionId(null);
    setIsTransitioning(false);
    setIsThinking(false);
    setIsComplete(false);
    setManualCharacterOverride(null);
  };

  const fastTrackToCharacter = (charId?: string) => {
    if (charId && CHARACTERS_CATALOG[charId]) {
      setManualCharacterOverride(CHARACTERS_CATALOG[charId]);
    } else {
      setManualCharacterOverride(CHARACTERS_CATALOG['feluda']);
    }
    setIsComplete(true);
    setIsThinking(false);
  };

  return {
    currentQuestion,
    currentIndex,
    totalQuestions: QUIZ_QUESTIONS.length,
    activeComment,
    selectedOptionId,
    isTransitioning,
    isThinking,
    isComplete,
    finalResult,
    handleSelectOption,
    resetQuiz,
    fastTrackToCharacter,
  };
}
