import * as THREE from 'three';
import type { PieceType } from '@chess-arena/chess-core';

const PIECE_HEIGHT = 0.9;
const PIECE_RADIUS = 0.32;

/**
 * Create geometries for each piece type using simple shapes
 * Uses LatheGeometry for rotational symmetry (pawn, bishop, queen)
 * and basic BoxGeometry for others
 */

export function getPieceGeometry(type: PieceType): THREE.BufferGeometry {
  switch (type) {
    case 'p':
      return createPawnGeometry();
    case 'n':
      return createKnightGeometry();
    case 'b':
      return createBishopGeometry();
    case 'r':
      return createRookGeometry();
    case 'q':
      return createQueenGeometry();
    case 'k':
      return createKingGeometry();
    default:
      return new THREE.BoxGeometry(0.2, 0.2, 0.2);
  }
}

function createPawnGeometry(): THREE.BufferGeometry {
  // Pawn: conical body + spherical head
  const positions: number[] = [];
  const indices: number[] = [];

  // Base cylinder (wider at bottom)
  const baseRadius = PIECE_RADIUS * 0.7;
  const topRadius = PIECE_RADIUS * 0.55;
  const baseHeight = PIECE_HEIGHT * 0.5;

  // Create cone-like base (tapered cylinder)
  const segments = 16;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * baseRadius;
    const z = Math.sin(angle) * baseRadius;
    positions.push(x, -baseHeight / 2, z);
  }

  // Top ring of base
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * topRadius;
    const z = Math.sin(angle) * topRadius;
    positions.push(x, baseHeight / 2, z);
  }

  // Sphere top (simplified)
  const sphereRadius = topRadius * 0.9;
  for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * sphereRadius;
    const z = Math.sin(angle) * sphereRadius;
    positions.push(x, baseHeight / 2 + sphereRadius * 0.8, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createKnightGeometry(): THREE.BufferGeometry {
  // Knight: wide base + cone head (horse-like)
  const positions: number[] = [];

  // Wide base (horseshoe shape)
  const baseRadius = PIECE_RADIUS * 0.8;
  const baseHeight = PIECE_HEIGHT * 0.4;
  const segments = 16;

  // Base ring
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * baseRadius;
    const z = Math.sin(angle) * baseRadius;
    positions.push(x, -baseHeight / 2, z);
  }

  // Top ring (narrower)
  const topRadius = PIECE_RADIUS * 0.6;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * topRadius;
    const z = Math.sin(angle) * topRadius;
    positions.push(x, baseHeight / 2, z);
  }

  // Head cone (tall and narrow)
  const headRadius = PIECE_RADIUS * 0.45;
  const headHeight = PIECE_HEIGHT * 0.5;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * headRadius;
    const z = Math.sin(angle) * headRadius;
    positions.push(x, baseHeight / 2 + headHeight * 0.8, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createBishopGeometry(): THREE.BufferGeometry {
  // Bishop: cylinder body + pointed cone top with ball
  const positions: number[] = [];

  const bodyRadius = PIECE_RADIUS * 0.5;
  const bodyHeight = PIECE_HEIGHT * 0.4;
  const segments = 16;

  // Body cylinder
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * bodyRadius;
    const z = Math.sin(angle) * bodyRadius;
    positions.push(x, -bodyHeight / 2, z);
  }

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * bodyRadius;
    const z = Math.sin(angle) * bodyRadius;
    positions.push(x, bodyHeight / 2, z);
  }

  // Bulge in middle
  const bulgeRadius = bodyRadius * 1.2;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * bulgeRadius;
    const z = Math.sin(angle) * bulgeRadius;
    positions.push(x, 0, z);
  }

  // Top cone point (tall and narrow)
  const topRadius = PIECE_RADIUS * 0.3;
  const topHeight = PIECE_HEIGHT * 0.45;
  for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * topRadius;
    const z = Math.sin(angle) * topRadius;
    positions.push(x, bodyHeight / 2 + topHeight * 0.9, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createRookGeometry(): THREE.BufferGeometry {
  // Rook: tall cylinder with castle-like top (crenellations)
  const positions: number[] = [];

  const baseRadius = PIECE_RADIUS * 0.65;
  const bodyHeight = PIECE_HEIGHT * 0.65;
  const segments = 16;

  // Main body - cylinder
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * baseRadius;
    const z = Math.sin(angle) * baseRadius;
    positions.push(x, -bodyHeight / 2, z);
  }

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * baseRadius;
    const z = Math.sin(angle) * baseRadius;
    positions.push(x, bodyHeight / 2, z);
  }

  // Castle top (wider ring)
  const topRadius = PIECE_RADIUS * 0.75;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * topRadius;
    const z = Math.sin(angle) * topRadius;
    positions.push(x, bodyHeight / 2 + PIECE_HEIGHT * 0.15, z);
  }

  // Crenellations (small squares on top)
  const crenRadius = PIECE_RADIUS * 0.55;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * crenRadius;
    const z = Math.sin(angle) * crenRadius;
    positions.push(x, bodyHeight / 2 + PIECE_HEIGHT * 0.25, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createQueenGeometry(): THREE.BufferGeometry {
  // Queen: bulbous body + tall crown-like top
  const positions: number[] = [];

  const segments = 16;

  // Lower body (wider base)
  const baseLowerRadius = PIECE_RADIUS * 0.65;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * baseLowerRadius;
    const z = Math.sin(angle) * baseLowerRadius;
    positions.push(x, -PIECE_HEIGHT * 0.25, z);
  }

  // Bulge (widest point)
  const bulgeRadius = PIECE_RADIUS * 0.7;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * bulgeRadius;
    const z = Math.sin(angle) * bulgeRadius;
    positions.push(x, 0, z);
  }

  // Upper body taper
  const upperRadius = PIECE_RADIUS * 0.55;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * upperRadius;
    const z = Math.sin(angle) * upperRadius;
    positions.push(x, PIECE_HEIGHT * 0.25, z);
  }

  // Crown base
  const crownBase = PIECE_RADIUS * 0.45;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * crownBase;
    const z = Math.sin(angle) * crownBase;
    positions.push(x, PIECE_HEIGHT * 0.35, z);
  }

  // Crown top (pointed)
  const crownTip = PIECE_RADIUS * 0.25;
  for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * crownTip;
    const z = Math.sin(angle) * crownTip;
    positions.push(x, PIECE_HEIGHT * 0.85, z);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();
  return geometry;
}

function createKingGeometry(): THREE.BufferGeometry {
  // King: robust base + tall crown with cross
  const positions: number[] = [];
  const segments = 16;

  // Robust base
  const baseRadius = PIECE_RADIUS * 0.7;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * baseRadius;
    const z = Math.sin(angle) * baseRadius;
    positions.push(x, -PIECE_HEIGHT * 0.2, z);
  }

  // Body
  const bodyRadius = PIECE_RADIUS * 0.6;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * bodyRadius;
    const z = Math.sin(angle) * bodyRadius;
    positions.push(x, PIECE_HEIGHT * 0.2, z);
  }

  // Crown base (wider ring)
  const crownBase = PIECE_RADIUS * 0.65;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * crownBase;
    const z = Math.sin(angle) * crownBase;
    positions.push(x, PIECE_HEIGHT * 0.35, z);
  }

  // Crown middle (narrower)
  const crownMid = PIECE_RADIUS * 0.5;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    const x = Math.cos(angle) * crownMid;
    const z = Math.sin(angle) * crownMid;
    positions.push(x, PIECE_HEIGHT * 0.6, z);
  }

  // Crown top points (star-like)
  const crownTop = PIECE_RADIUS * 0.35;
  for (let i = 0; i <= 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const x = Math.cos(angle) * crownTop;
    const z = Math.sin(angle) * crownTop;
    positions.push(x, PIECE_HEIGHT * 0.85, z);
  }

  // Cross point (very top)
  positions.push(0, PIECE_HEIGHT * 0.95, 0);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  geometry.computeVertexNormals();
  return geometry;
}

/**
 * Create material for pieces - sleek and polished look
 */
export function getPieceMaterial(color: 'w' | 'b'): THREE.Material {
  if (color === 'w') {
    return new THREE.MeshStandardMaterial({
      color: 0xf5f5dc, // Beige/ivory
      roughness: 0.2,
      metalness: 0.3,
      emissive: 0xfafaf0,
      emissiveIntensity: 0.1,
    });
  } else {
    return new THREE.MeshStandardMaterial({
      color: 0x1a1a1a, // Dark gray/black
      roughness: 0.15,
      metalness: 0.4,
      emissive: 0x0a0a0a,
      emissiveIntensity: 0.1,
    });
  }
}
