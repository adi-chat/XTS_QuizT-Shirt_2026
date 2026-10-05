/**
 * Procedural Web Audio Synthesizer & Sound Manager for "The Sorting Hat's Verdict"
 * 100% generated in real-time in the browser. Zero copyright risk, gentle magical celesta bells,
 * authentic theatrical curtains creak & enter chimes.
 */

interface MelodyNote {
  freq: number;
  duration: number;
  pauseAfter: number;
}

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;
  private melodyTimer: ReturnType<typeof setTimeout> | null = null;
  private currentMusicMode: 'ambient' | 'finale' | 'none' = 'ambient';

  constructor() {
    const saved = localStorage.getItem('xts_sound_muted');
    this.isMuted = saved === 'true';
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public initBgMusic() {
    this.startHedwigThemeLoop();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('xts_sound_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopAllMusic();
    } else {
      if (this.currentMusicMode === 'finale') {
        this.startGrandFinale();
      } else {
        this.startHedwigThemeLoop();
      }
    }
    return this.isMuted;
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    localStorage.setItem('xts_sound_muted', String(this.isMuted));
    if (this.isMuted) {
      this.stopAllMusic();
    } else {
      if (this.currentMusicMode === 'finale') {
        this.startGrandFinale();
      } else {
        this.startHedwigThemeLoop();
      }
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Woody friction creak for theatrical curtains parting
   */
  public playCurtainCreak() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;

      // Low rumble
      const osc1 = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc1.type = 'triangle';
      osc1.frequency.setValueAtTime(48, t);
      osc1.frequency.exponentialRampToValueAtTime(16, t + 1.8);

      oscGain.gain.setValueAtTime(0, t);
      oscGain.gain.linearRampToValueAtTime(0.35, t + 0.1);
      oscGain.gain.exponentialRampToValueAtTime(0.01, t + 1.8);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(130, t);

      osc1.connect(filter);
      filter.connect(oscGain);
      oscGain.connect(this.masterGain);

      osc1.start(t);
      osc1.stop(t + 1.8);

      // Micro clicks/crunch creaks
      for (let i = 0; i < 7; i++) {
        const clickTime = t + i * 0.24 + Math.random() * 0.05;
        const oscClick = this.ctx.createOscillator();
        const clickGain = this.ctx.createGain();
        oscClick.frequency.setValueAtTime(80 + Math.random() * 55, clickTime);
        clickGain.gain.setValueAtTime(0.035, clickTime);
        clickGain.gain.exponentialRampToValueAtTime(0.001, clickTime + 0.08);
        oscClick.connect(clickGain);
        clickGain.connect(this.masterGain);
        oscClick.start(clickTime);
        oscClick.stop(clickTime + 0.09);
      }
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Sparkling C-Major Arpeggio with Vibrato when entering the stage
   */
  public playEnterChime() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.0, 523.25, 659.25, 783.99, 1046.5];

      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const startTime = t + idx * 0.11;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = Math.random() > 0.4 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        // Gentle vibrato
        const lfo = this.ctx.createOscillator();
        const lfoGain = this.ctx.createGain();
        lfo.frequency.value = 7.5;
        lfoGain.gain.value = 10;
        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.12, startTime + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

        osc.connect(gain);
        gain.connect(this.masterGain);

        lfo.start(startTime);
        osc.start(startTime);

        lfo.stop(startTime + 0.8);
        osc.stop(startTime + 0.8);
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Procedural Celesta Bell Note for Harry Potter Theme
   */
  /**
   * Procedural Celesta Bell Note for Harry Potter Theme
   */
  private playCelestaBell(
    freq: number,
    startTime: number,
    duration: number,
    volume = 0.05,
    overtone = 3.0
  ) {
    if (!this.ctx || !this.masterGain) return;

    // Fundamental sine bell
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, startTime);

    // Warm overtone for crystal musical glass/celesta chime
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * overtone, startTime);

    // Envelope
    gain1.gain.setValueAtTime(0.001, startTime);
    gain1.gain.linearRampToValueAtTime(volume, startTime + 0.025);
    gain1.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    gain2.gain.setValueAtTime(0.001, startTime);
    gain2.gain.linearRampToValueAtTime(volume * 0.4, startTime + 0.012);
    gain2.gain.exponentialRampToValueAtTime(0.0001, startTime + duration * 0.55);

    osc1.connect(gain1);
    osc2.connect(gain2);
    gain1.connect(this.masterGain);
    gain2.connect(this.masterGain);

    osc1.start(startTime);
    osc2.start(startTime);

    osc1.stop(startTime + duration + 0.05);
    osc2.stop(startTime + duration * 0.55 + 0.05);
  }

  /**
   * Sparkling Confetti Chime for High Register Joy & Shimmer
   */
  private playSparkleChime(freq: number, startTime: number, duration = 0.45, volume = 0.03) {
    if (!this.ctx || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.001, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /**
   * Warm Symphonic Chord Foundation for Grandiose Fanfare
   */
  private playCelebratoryChord(
    freqs: number[],
    startTime: number,
    duration: number,
    volume = 0.04
  ) {
    if (!this.ctx || !this.masterGain) return;

    freqs.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, startTime);

      osc.type = idx === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      const noteVol = (volume / Math.sqrt(freqs.length)) * 1.2;
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.linearRampToValueAtTime(noteVol, startTime + 0.06);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    });
  }

  /**
   * Sped-Up, Atmospheric Hedwig's Theme Motif (Ambient Loop)
   * Faster pace (~120 BPM waltz tempo), buoyant celesta bells, shorter pauses.
   */
  public startHedwigThemeLoop() {
    this.currentMusicMode = 'ambient';
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopAllMusic();

    // Sped-up, rhythmic motif notes in E minor:
    const melody: MelodyNote[] = [
      { freq: 493.88, duration: 0.36, pauseAfter: 0.03 }, // B4
      { freq: 659.25, duration: 0.56, pauseAfter: 0.03 }, // E5
      { freq: 783.99, duration: 0.28, pauseAfter: 0.02 }, // G5
      { freq: 739.99, duration: 0.28, pauseAfter: 0.03 }, // F#5
      { freq: 659.25, duration: 0.56, pauseAfter: 0.03 }, // E5
      { freq: 987.77, duration: 0.42, pauseAfter: 0.03 }, // B5
      { freq: 880.0, duration: 0.72, pauseAfter: 0.08 },  // A5
      { freq: 739.99, duration: 0.88, pauseAfter: 0.22 }, // F#5

      { freq: 659.25, duration: 0.56, pauseAfter: 0.03 }, // E5
      { freq: 783.99, duration: 0.28, pauseAfter: 0.02 }, // G5
      { freq: 739.99, duration: 0.28, pauseAfter: 0.03 }, // F#5
      { freq: 622.25, duration: 0.56, pauseAfter: 0.03 }, // D#5
      { freq: 698.46, duration: 0.42, pauseAfter: 0.03 }, // F5
      { freq: 493.88, duration: 1.05, pauseAfter: 0.45 }, // B4
    ];

    let totalOffset = 0.15;
    const now = this.ctx.currentTime;

    melody.forEach(note => {
      this.playCelestaBell(note.freq, now + totalOffset, note.duration, 0.05);
      totalOffset += note.duration + note.pauseAfter;
    });

    // Schedule next repetition with a pleasant 1.4-second intermission
    const loopIntervalMs = (totalOffset + 1.4) * 1000;
    this.melodyTimer = setTimeout(() => {
      this.melodyTimer = null;
      if (!this.isMuted && this.currentMusicMode === 'ambient') {
        this.startHedwigThemeLoop();
      }
    }, loopIntervalMs);
  }

  public stopHedwigThemeLoop() {
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  /**
   * Grandiose, Upbeat Hedwig Theme & Confetti Celebration for Final Verdict
   * Features:
   * 1. Explosive, triumphant opening fanfare with multi-voice brass chords and sparkling arpeggios
   * 2. High-pace, joyful Hedwig celebration motif (~145 BPM) with rich orchestral harmony
   * 3. Shimmering cascade of confetti chimes throughout
   */
  public startGrandFinale() {
    this.currentMusicMode = 'finale';
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    this.stopAllMusic();

    const now = this.ctx.currentTime;

    // --- 1. OPENING TRIUMPHANT FANFARE (0.0s - 1.8s) ---
    // Em power chord + high celesta arpeggio burst
    this.playCelebratoryChord([164.81, 246.94, 329.63, 392.0], now, 0.5, 0.065);
    [493.88, 659.25, 783.99, 987.77, 1318.5].forEach((f, i) => {
      this.playSparkleChime(f, now + 0.04 + i * 0.06, 0.4, 0.04);
    });

    // C major victory chord
    this.playCelebratoryChord([130.81, 261.63, 329.63, 392.0, 523.25], now + 0.42, 0.5, 0.07);
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      this.playSparkleChime(f, now + 0.46 + i * 0.05, 0.4, 0.04);
    });

    // D major lift chord
    this.playCelebratoryChord([146.83, 293.66, 369.99, 440.0, 587.33], now + 0.84, 0.5, 0.07);
    [587.33, 739.99, 880.0, 1174.66].forEach((f, i) => {
      this.playSparkleChime(f, now + 0.88 + i * 0.05, 0.4, 0.04);
    });

    // B dominant flourish into soaring triumph
    this.playCelebratoryChord([123.47, 246.94, 311.13, 369.99, 493.88], now + 1.26, 0.65, 0.075);
    [493.88, 622.25, 739.99, 987.77, 1244.5].forEach((f, i) => {
      this.playSparkleChime(f, now + 1.30 + i * 0.05, 0.45, 0.045);
    });

    // --- 2. UPBEAT HEDWIG CELEBRATION THEME (from 1.9s onward, Vivace ~145 BPM) ---
    const startTime = now + 1.9;
    const finaleNotes: { freq: number; dur: number; pause: number; chord?: number[]; chime?: number }[] = [
      { freq: 493.88, dur: 0.24, pause: 0.02, chord: [164.81, 329.63, 392.0], chime: 1318.5 }, // B4
      { freq: 659.25, dur: 0.38, pause: 0.02 },                                                  // E5
      { freq: 783.99, dur: 0.20, pause: 0.02, chime: 1567.98 },                                  // G5
      { freq: 739.99, dur: 0.20, pause: 0.02 },                                                  // F#5
      { freq: 659.25, dur: 0.38, pause: 0.02, chord: [130.81, 261.63, 329.63, 392.0] },         // E5 (C major)
      { freq: 987.77, dur: 0.30, pause: 0.02, chime: 1975.53 },                                  // B5
      { freq: 880.0,  dur: 0.52, pause: 0.05, chord: [220.0, 261.63, 329.63, 440.0] },          // A5 (Am)
      { freq: 739.99, dur: 0.62, pause: 0.15, chord: [146.83, 220.0, 293.66, 369.99] },         // F#5 (D)

      { freq: 659.25, dur: 0.38, pause: 0.02, chord: [164.81, 329.63, 392.0], chime: 1318.5 }, // E5
      { freq: 783.99, dur: 0.20, pause: 0.02 },                                                  // G5
      { freq: 739.99, dur: 0.20, pause: 0.02, chime: 1479.98 },                                  // F#5
      { freq: 622.25, dur: 0.38, pause: 0.02, chord: [123.47, 246.94, 311.13, 369.99] },        // D#5 (B7)
      { freq: 698.46, dur: 0.30, pause: 0.02 },                                                  // F5
      { freq: 493.88, dur: 0.65, pause: 0.15, chord: [164.81, 246.94, 329.63, 392.0] },         // B4 (Em)

      // Victorious Grand Arpeggio Climb (Golden Snitch & Confetti Flourish)
      { freq: 659.25, dur: 0.18, pause: 0.02, chime: 1318.5 },  // E5
      { freq: 783.99, dur: 0.18, pause: 0.02, chime: 1567.98 }, // G5
      { freq: 987.77, dur: 0.20, pause: 0.02, chime: 1975.53 }, // B5
      { freq: 1318.5, dur: 0.22, pause: 0.02, chime: 2637.0 },  // E6
      { freq: 1567.98, dur: 0.95, pause: 0.3, chord: [164.81, 329.63, 415.30, 493.88, 659.25] }, // G6 (E major triumph!)
    ];

    let tOffset = 0;
    finaleNotes.forEach(fn => {
      const noteTime = startTime + tOffset;
      // High bright celesta bell
      this.playCelestaBell(fn.freq, noteTime, fn.dur, 0.055, 3.0);

      // Warm symphonic accompaniment chord
      if (fn.chord) {
        this.playCelebratoryChord(fn.chord, noteTime, fn.dur + 0.4, 0.045);
      }

      // Shimmering confetti bell
      if (fn.chime) {
        this.playSparkleChime(fn.chime, noteTime + 0.02, fn.dur + 0.25, 0.035);
      }

      tOffset += fn.dur + fn.pause;
    });

    // Schedule next celebratory repetition while user is on result page
    const totalDuration = (startTime - now) + tOffset;
    const loopIntervalMs = (totalDuration + 1.2) * 1000;

    this.melodyTimer = setTimeout(() => {
      this.melodyTimer = null;
      if (!this.isMuted && this.currentMusicMode === 'finale') {
        this.startGrandFinale();
      }
    }, loopIntervalMs);
  }

  public stopGrandFinale() {
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  public stopAllMusic() {
    if (this.melodyTimer) {
      clearTimeout(this.melodyTimer);
      this.melodyTimer = null;
    }
  }

  /**
   * Soft pop button click
   */
  public playClickPop() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx || !this.masterGain) return;

      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(190, t);
      osc.frequency.exponentialRampToValueAtTime(390, t + 0.07);

      gain.gain.setValueAtTime(0.045, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.08);
    } catch {
      // Ignored
    }
  }

  /**
   * Crisp, soft confirmation chime when selecting an option
   */
  public playSelect() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.24);
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Pleasant magical chime for confirming and moving to next question
   */
  public playChime(freqMultiplier = 1) {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const baseFreq = 587.33 * freqMultiplier;
      const freqs = [baseFreq, baseFreq * 1.25, baseFreq * 1.5];

      freqs.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.05);

        gain.gain.setValueAtTime(0.001, now + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.05 / (idx + 1), now + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.5);
      });
    } catch {
      // Graceful fallback
    }
  }

  /**
   * Gentle magical hum during deliberation
   */
  public playHatThinking() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.exponentialRampToValueAtTime(165, now + 3.0);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.3);
      gain.gain.linearRampToValueAtTime(0.07, now + 2.5);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 3.3);
    } catch {
      // Ignored
    }
  }

  /**
   * Celebratory Fanfare Chord Progression for Reveal
   */
  public playFanfare() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const chord = [392.0, 523.25, 659.25, 783.99];

      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + 0.08);

        gain.gain.setValueAtTime(0.001, now + 0.08);
        gain.gain.linearRampToValueAtTime(0.08 / Math.sqrt(idx + 1), now + 0.15);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now + 0.08);
        osc.stop(now + 1.65);
      });
    } catch {
      // Ignored
    }
  }
}

export const soundManager = new SoundManager();
