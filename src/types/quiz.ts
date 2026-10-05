// 10 Core Archetypes from the XTS Casting Matrix
export type ArchetypeKey =
  | 'mastermind'
  | 'dramatic_rebel'
  | 'golden_idealist'
  | 'scene_stealer'
  | 'method_purist'
  | 'ghost_in_wings'
  | 'chaos_engine'
  | 'glamour_icon'
  | 'reluctant_prodigy'
  | 'production_anchor';

// 3 Temporal Acts across the 10 questions
// Band 1 (Q1–Q3): The Audition / Raw First Instincts
// Band 2 (Q4–Q7): Mid-Rehearsal Grind / Chaos Endurance
// Band 3 (Q8–Q10): Curtain Call / The Final Showdown
export type TemporalBand = 1 | 2 | 3;

// Theatrical Alter Ego Profile
export interface CharacterProfile {
  id: string;
  name: string;
  archetype: ArchetypeKey;
  band: TemporalBand;
  title: string;
  quote: string;
  vibe: string;
  stageTell: string;
  merchPitch: string;
  tags: string[];
  image: string;
  accentColor?: string;
  badge?: string;
  traits?: string[];
  character?: string;
  description?: string;
  pitch?: string;
  tagline?: string;
  imageSrc?: string;
}

// Option within a question
export interface QuizOption {
  id: string;
  label: string;
  archetype: ArchetypeKey;
  hatComments: [string, string];
}

// Question definition structured by Temporal Band
export interface QuizQuestion {
  id: number;
  band: TemporalBand;
  prompt: string;
  options: QuizOption[];
}

// Accumulator for LCM = 12 Temporal Normalization
export interface TemporalAccumulator {
  band1: number;
  band2: number;
  band3: number;
}

// Final resolved quiz result
export interface QuizResult {
  archetype: ArchetypeKey;
  character: CharacterProfile;
}

// Alias for story modal compatibility
export type CharacterResult = CharacterProfile;
