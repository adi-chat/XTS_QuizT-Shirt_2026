import type { ArchetypeKey, CharacterProfile, TemporalAccumulator } from '../types/quiz';
import { CHARACTERS_CATALOG } from '../data/characters';

// Archetype ordering for deterministic tie-breaking
export const ARCHETYPE_PRECEDENCE: ArchetypeKey[] = [
  'mastermind',
  'dramatic_rebel',
  'golden_idealist',
  'scene_stealer',
  'method_purist',
  'ghost_in_wings',
  'chaos_engine',
  'glamour_icon',
  'reluctant_prodigy',
  'production_anchor',
];

/**
 * Resolves the primary winning archetype based on highest total answer frequency,
 * with deterministic precedence tie-breaking.
 */
export function resolveWinningArchetype(scores: Record<ArchetypeKey, number>): ArchetypeKey {
  let highestScore = -1;
  let winner: ArchetypeKey = 'mastermind';

  for (const archetype of ARCHETYPE_PRECEDENCE) {
    const score = scores[archetype] || 0;
    if (score > highestScore) {
      highestScore = score;
      winner = archetype;
    }
  }

  return winner;
}

/**
 * Normalizes scores across the 3 temporal bands using Least Common Multiple (LCM = 12):
 * - Band 1 (3 questions: Q1–Q3) -> multiplier = 4 (3 * 4 = 12)
 * - Band 2 (4 questions: Q4–Q7) -> multiplier = 3 (4 * 3 = 12)
 * - Band 3 (3 questions: Q8–Q10) -> multiplier = 4 (3 * 4 = 12)
 *
 * Maps to:
 * - Band 1: The Audition / Raw First Instincts
 * - Band 2: Mid-Rehearsal Grind / Chaos Endurance
 * - Band 3: Curtain Call / The Final Showdown
 */
export function resolveCharacterByTemporalBand(
  archetype: ArchetypeKey,
  bandScores: TemporalAccumulator
): CharacterProfile {
  const b1 = bandScores?.band1 || 0;
  const b2 = bandScores?.band2 || 0;
  const b3 = bandScores?.band3 || 0;

  let winningBand: 1 | 2 | 3 = 2; // Default flagship anchor: Mid-Rehearsal Grind

  // 1. Strict majority in one band
  if (b1 > b2 && b1 > b3) {
    winningBand = 1;
  } else if (b2 > b1 && b2 > b3) {
    winningBand = 2;
  } else if (b3 > b1 && b3 > b2) {
    winningBand = 3;
  }
  // 2. Deterministic 2-way ties:
  // If Band 1 ties with Band 2 (e.g. b1=1, b2=1, b3=0), Band 1 takes precedence (The Audition raw instinct)
  else if (b1 === b2 && b1 > b3) {
    winningBand = 1;
  }
  // If Band 2 ties with Band 3 (e.g. b2=1, b3=1, b1=0), Band 2 takes precedence (Mid-Rehearsal Grind anchor)
  else if (b2 === b3 && b2 > b1) {
    winningBand = 2;
  }
  // If Band 1 ties with Band 3 (e.g. b1=1, b3=1, b2=0), Band 3 takes precedence (Curtain Call showdown)
  else if (b1 === b3 && b1 > b2) {
    winningBand = 3;
  }
  // 3. 3-way tie (1, 1, 1): Flagship anchor Band 2
  else {
    winningBand = 2;
  }

  const matchedCharacter = Object.values(CHARACTERS_CATALOG).find(
    char => char.archetype === archetype && char.band === winningBand
  );

  if (!matchedCharacter) {
    return (
      Object.values(CHARACTERS_CATALOG).find(char => char.archetype === archetype) ||
      CHARACTERS_CATALOG['feluda']
    );
  }

  return matchedCharacter;
}
