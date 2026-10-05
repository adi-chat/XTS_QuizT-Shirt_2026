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

  // If one band has strictly more answers for this archetype, it wins
  if (b2 > b1 && b2 > b3) {
    winningBand = 2;
  } else if (b1 > b2 && b1 > b3) {
    winningBand = 1;
  } else if (b3 > b1 && b3 > b2) {
    winningBand = 3;
  } else if (b2 >= b1 && b2 >= b3) {
    // In any tie involving Band 2 (e.g. b1=1, b2=1 or 3-way tie), Band 2 wins (Regina George, Michael Scott, Ted Lasso, etc.)
    winningBand = 2;
  } else if (b1 > b3) {
    winningBand = 1;
  } else {
    winningBand = 3;
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
