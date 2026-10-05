import { CHARACTERS_CATALOG } from '../data/characters';

// All 8 Sorting Hat animation images
export const HAT_IMAGES = [
  '/assets/hat/hat_1.png',
  '/assets/hat/hat_2.png',
  '/assets/hat/hat_3.png',
  '/assets/hat/hat_4.png',
  '/assets/hat/hat_5.png',
  '/assets/hat/hat_6.png',
  '/assets/hat/hat_7.png',
  '/assets/hat/hat_surprised.png',
];

// Core UI and Merchandise Assets
export const CORE_ASSETS = [
  '/assets/xts_logo.png',
  '/assets/shirt_front.png',
  '/assets/shirt_back.png',
  ...HAT_IMAGES,
];

export function preloadImage(src: string): Promise<void> {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = () => resolve(); // Resolve anyway so it never blocks execution
    img.src = src;
  });
}

/**
 * Preloads all core assets (hats, shirts, logo, fonts, character portraits)
 * so mobile devices never experience missing images or render lag.
 */
export async function preloadCriticalAssets(): Promise<void> {
  // 1. Preload core assets in parallel
  await Promise.all(CORE_ASSETS.map(preloadImage));

  // 2. Preload web fonts
  if (typeof document !== 'undefined' && document.fonts) {
    try {
      await document.fonts.ready;
    } catch {
      // Ignored if font loading API fails
    }
  }

  // 3. Preload all character portraits in the background
  const characterImages = Object.values(CHARACTERS_CATALOG)
    .map(c => c.image)
    .filter(Boolean);

  characterImages.forEach(src => {
    const img = new Image();
    img.src = src;
  });
}
