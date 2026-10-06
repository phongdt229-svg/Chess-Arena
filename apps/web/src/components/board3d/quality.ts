export type Quality3D = 'low' | 'medium' | 'high';

export interface QualityProfile {
  shadows: boolean;
  shadowMapSize: number;
  dpr: [number, number];
  extraLights: boolean;
}

export const QUALITY_PROFILES: Record<Quality3D, QualityProfile> = {
  low: { shadows: false, shadowMapSize: 512, dpr: [1, 1], extraLights: false },
  medium: { shadows: true, shadowMapSize: 1024, dpr: [1, 1.5], extraLights: false },
  high: { shadows: true, shadowMapSize: 2048, dpr: [1, 2], extraLights: true },
};

// Touch devices are usually the weaker ones, so they start on Medium
export function defaultQuality(): Quality3D {
  try {
    return window.matchMedia('(pointer: coarse)').matches ? 'medium' : 'high';
  } catch {
    return 'high';
  }
}

export function cameraHome(orientation: 'w' | 'b'): [number, number, number] {
  return orientation === 'w' ? [0, 8, 10] : [0, 8, -10];
}
