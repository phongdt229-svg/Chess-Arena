import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import type { PieceType } from '@chess-arena/chess-core';

// Every geometry sits on y = 0 (feet) and faces -z (towards black), centred on x/z.
export const PIECE_HEIGHTS: Record<PieceType, number> = {
  p: 0.68,
  r: 0.83,
  n: 0.98,
  b: 1.025,
  q: 1.12,
  k: 1.32,
};

const SEGMENTS = 40;

const lathe = (pts: [number, number][]) =>
  new THREE.LatheGeometry(
    pts.map(([r, y]) => new THREE.Vector2(r, y)),
    SEGMENTS,
  );

const sphere = (r: number, y: number, sy = 1) => {
  const g = new THREE.SphereGeometry(r, 32, 20);
  g.scale(1, sy, 1);
  g.translate(0, y, 0);
  return g;
};

const box = (w: number, h: number, d: number, x: number, y: number, z: number, rotY = 0) => {
  const g = new THREE.BoxGeometry(w, h, d);
  g.rotateY(rotY);
  g.translate(x, y, z);
  return g;
};

const cone = (r: number, h: number, x: number, y: number, z: number) => {
  const g = new THREE.ConeGeometry(r, h, 12);
  g.translate(x, y + h / 2, z);
  return g;
};

const ring = (count: number, radius: number, make: (x: number, z: number, angle: number) => THREE.BufferGeometry) =>
  Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2;
    return make(Math.cos(a) * radius, Math.sin(a) * radius, a);
  });

const merge = (parts: THREE.BufferGeometry[]) => {
  const merged = mergeGeometries(parts.map((p) => (p.index ? p.toNonIndexed() : p)));
  parts.forEach((p) => p.dispose());
  if (!merged) throw new Error('Failed to merge piece geometry');
  return merged;
};

// Shared moulded foot: wide plinth + cove, ends at y = 0.14 with radius 0.24
const FOOT: [number, number][] = [
  [0, 0],
  [0.34, 0],
  [0.35, 0.02],
  [0.34, 0.05],
  [0.3, 0.07],
  [0.3, 0.09],
  [0.26, 0.11],
  [0.24, 0.14],
];

function pawn() {
  return merge([
    lathe([
      ...FOOT,
      [0.19, 0.2],
      [0.13, 0.3],
      [0.1, 0.38],
      [0.17, 0.4],
      [0.18, 0.43],
      [0.12, 0.46],
      [0.09, 0.48],
    ]),
    sphere(0.16, 0.52),
  ]);
}

function rook() {
  return merge([
    lathe([
      ...FOOT,
      [0.21, 0.2],
      [0.2, 0.5],
      [0.2, 0.56],
      [0.28, 0.6],
      [0.28, 0.7],
      [0.25, 0.72],
      [0.25, 0.74],
      [0.18, 0.74],
      [0, 0.74],
    ]),
    ...ring(6, 0.215, (x, z, a) => box(0.13, 0.1, 0.11, x, 0.78, z, -a)),
  ]);
}

function bishop() {
  return merge([
    lathe([
      ...FOOT,
      [0.2, 0.2],
      [0.13, 0.34],
      [0.1, 0.46],
      [0.2, 0.49],
      [0.2, 0.52],
      [0.12, 0.55],
      [0.1, 0.58],
    ]),
    sphere(0.17, 0.72, 1.4),
    sphere(0.055, 0.97),
  ]);
}

// Side profile of a horse head, +x = forward (nose), y = up
function knightHead() {
  const s = new THREE.Shape();
  s.moveTo(-0.17, 0.26);
  s.lineTo(-0.2, 0.46);
  s.quadraticCurveTo(-0.2, 0.68, -0.1, 0.82);
  s.lineTo(-0.07, 0.94);
  s.lineTo(0.0, 0.84);
  s.quadraticCurveTo(0.08, 0.82, 0.14, 0.78);
  s.quadraticCurveTo(0.26, 0.68, 0.32, 0.56);
  s.quadraticCurveTo(0.33, 0.49, 0.27, 0.48);
  s.lineTo(0.17, 0.5);
  s.quadraticCurveTo(0.08, 0.46, 0.12, 0.36);
  s.quadraticCurveTo(0.2, 0.3, 0.2, 0.26);
  s.closePath();

  const g = new THREE.ExtrudeGeometry(s, {
    depth: 0.18,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 12,
  });
  g.translate(0, 0, -0.09);
  g.rotateY(Math.PI / 2 + 0.5); // nose points to -z, turned ~30deg so the profile reads from the default camera
  return g;
}

function knight() {
  return merge([
    lathe([...FOOT, [0.23, 0.2], [0.22, 0.24], [0.24, 0.26], [0.2, 0.28], [0, 0.28]]),
    knightHead(),
  ]);
}

function queen() {
  return merge([
    lathe([
      ...FOOT,
      [0.2, 0.2],
      [0.14, 0.36],
      [0.11, 0.52],
      [0.1, 0.66],
      [0.2, 0.69],
      [0.2, 0.73],
      [0.13, 0.77],
      [0.2, 0.84],
      [0.25, 0.96],
      [0.22, 0.97],
      [0.0, 0.92],
    ]),
    ...ring(8, 0.225, (x, z) => cone(0.035, 0.11, x, 0.95, z)),
    ...ring(8, 0.225, (x, z) => sphere(0.04, 1.08, 1).translate(x, 0, z)),
    sphere(0.075, 1.03),
  ]);
}

function king() {
  return merge([
    lathe([
      ...FOOT,
      [0.22, 0.2],
      [0.16, 0.4],
      [0.12, 0.62],
      [0.11, 0.78],
      [0.22, 0.82],
      [0.22, 0.86],
      [0.14, 0.9],
      [0.21, 0.96],
      [0.24, 1.05],
      [0.2, 1.07],
      [0, 1.04],
    ]),
    box(0.075, 0.28, 0.075, 0, 1.18, 0),
    box(0.22, 0.075, 0.075, 0, 1.23, 0),
  ]);
}

const builders: Record<PieceType, () => THREE.BufferGeometry> = {
  p: pawn,
  r: rook,
  n: knight,
  b: bishop,
  q: queen,
  k: king,
};

const cache = new Map<PieceType, THREE.BufferGeometry>();

export function getPieceGeometry(type: PieceType): THREE.BufferGeometry {
  let geometry = cache.get(type);
  if (!geometry) {
    geometry = builders[type]();
    cache.set(type, geometry);
  }
  return geometry;
}

const materials = new Map<'w' | 'b', THREE.Material>();

export function getPieceMaterial(color: 'w' | 'b'): THREE.Material {
  let material = materials.get(color);
  if (!material) {
    material =
      color === 'w'
        ? new THREE.MeshStandardMaterial({ color: 0xf6efdc, roughness: 0.38, metalness: 0.08 })
        : new THREE.MeshStandardMaterial({
            color: 0x25252c,
            roughness: 0.3,
            metalness: 0.3,
            emissive: 0x0b0b10,
          });
    materials.set(color, material);
  }
  return material;
}
