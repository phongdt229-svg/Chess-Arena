export type AdPlacement = 'home' | 'homeBottom' | 'content' | 'bottom' | 'rail' | 'game' | 'gameMobile';

// Where each placement lives (documentation for the site owner; also drives the .env names below)
export const PLACEMENTS: Record<AdPlacement, string> = {
  home: 'Home page, between the features and the steps',
  homeBottom: 'Home page, after the learning cards',
  content: 'Rules, Guide, Openings and Puzzles, inside the content',
  bottom: 'Rules and Guide, end of the article',
  rail: 'Guide page, sticky banner beside the article on wide screens (1380px and up)',
  game: 'Game screen sidebar on desktop',
  gameMobile: 'Game screen, bottom of the page on phones and tablets',
};

// A placement without its own ad unit reuses a related one, so three units are enough to fill every position
export const FALLBACK: Partial<Record<AdPlacement, AdPlacement>> = {
  homeBottom: 'home',
  bottom: 'content',
  rail: 'content',
  gameMobile: 'game',
};

export interface AdsConfig {
  client: string | null;
  slots: Record<AdPlacement, string | null>;
}

const PUBLISHER = /^ca-pub-\d{10,20}$/;
const SLOT = /^\d{6,20}$/;

const clean = (value: unknown, pattern: RegExp): string | null =>
  typeof value === 'string' && pattern.test(value.trim()) ? value.trim() : null;

// Read at call time (not import time) so tests and builds can change the environment
export function getAdsConfig(env: Record<string, unknown> = import.meta.env): AdsConfig {
  return {
    client: clean(env.VITE_ADSENSE_CLIENT, PUBLISHER),
    slots: {
      home: clean(env.VITE_ADSENSE_SLOT_HOME, SLOT),
      homeBottom: clean(env.VITE_ADSENSE_SLOT_HOME_BOTTOM, SLOT),
      content: clean(env.VITE_ADSENSE_SLOT_CONTENT, SLOT),
      bottom: clean(env.VITE_ADSENSE_SLOT_BOTTOM, SLOT),
      rail: clean(env.VITE_ADSENSE_SLOT_RAIL, SLOT),
      game: clean(env.VITE_ADSENSE_SLOT_GAME, SLOT),
      gameMobile: clean(env.VITE_ADSENSE_SLOT_GAME_MOBILE, SLOT),
    },
  };
}

export function adsEnabled(env: Record<string, unknown> = import.meta.env): boolean {
  const { client, slots } = getAdsConfig(env);
  return client !== null && Object.values(slots).some((s) => s !== null);
}

// The ad unit id for a placement: its own, else its fallback's, else none
export function slotFor(placement: AdPlacement, config: AdsConfig = getAdsConfig()): string | null {
  const fallback = FALLBACK[placement];
  return config.slots[placement] ?? (fallback ? config.slots[fallback] : null);
}
