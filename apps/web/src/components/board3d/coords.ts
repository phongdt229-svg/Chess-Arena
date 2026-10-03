/**
 * Convert square index (0-63, a1-h8) to 3D world coordinates
 * Board is 8x8 in world units, centered at origin
 * White at z+ (z=3.5), Black at z- (z=-3.5)
 * File a-h corresponds to x=-3.5 to x=3.5
 */
export interface WorldCoords {
  x: number;
  y: number;
  z: number;
}

export function squareToWorld(sq: number): WorldCoords {
  const file = sq % 8; // 0-7 (a-h)
  const rank = Math.floor(sq / 8); // 0-7 (1-8)

  return {
    x: file - 3.5,
    y: 0,
    z: 3.5 - rank,
  };
}

export function indexToSquare(index: number): string {
  const file = String.fromCharCode(97 + (index % 8));
  const rank = Math.floor(index / 8) + 1;
  return `${file}${rank}`;
}

export function squareToIndex(sq: string): number {
  const file = sq.charCodeAt(0) - 97;
  const rank = parseInt(sq[1], 10) - 1;
  return rank * 8 + file;
}

/**
 * Rotate board coordinates based on player orientation
 * White: normal view (z+), Black: flipped view (z-)
 */
export function rotateCoords(coords: WorldCoords, orientation: 'w' | 'b'): WorldCoords {
  if (orientation === 'b') {
    return {
      x: -coords.x,
      y: coords.y,
      z: -coords.z,
    };
  }
  return coords;
}
