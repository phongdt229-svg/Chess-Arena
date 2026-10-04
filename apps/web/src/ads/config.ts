export type AdPlacement = 'home' | 'content' | 'game';

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
      content: clean(env.VITE_ADSENSE_SLOT_CONTENT, SLOT),
      game: clean(env.VITE_ADSENSE_SLOT_GAME, SLOT),
    },
  };
}

export function adsEnabled(env: Record<string, unknown> = import.meta.env): boolean {
  const { client, slots } = getAdsConfig(env);
  return client !== null && Object.values(slots).some((s) => s !== null);
}
