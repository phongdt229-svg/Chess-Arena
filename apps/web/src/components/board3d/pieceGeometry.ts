import * as THREE from 'three';
import type { PieceType } from '@chess-arena/chess-core';

const PIECE_HEIGHT = 0.9;
const PIECE_RADIUS = 0.32;

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

function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  let positions: number[] = [];
  let indices: number[] = [];
  let vertexOffset = 0;

  for (const geom of geometries) {
    const pos = geom.getAttribute('position');
    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i));
    }

    const idx = geom.getIndex();
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.getX(i) + vertexOffset);
      }
    }
    vertexOffset += pos.count;
  }

  const merged = new THREE.BufferGeometry();
  merged.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  if (indices.length > 0) {
    merged.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
  }
  merged.computeVertexNormals();
  return merged;
}

function createPawnGeometry(): THREE.BufferGeometry {
  // Base: cylinder
  const base = new THREE.CylinderGeometry(PIECE_RADIUS * 0.75, PIECE_RADIUS * 0.8, PIECE_HEIGHT * 0.45, 16);
  base.translate(0, -PIECE_HEIGHT * 0.1, 0);

  // Head: sphere
  const head = new THREE.SphereGeometry(PIECE_RADIUS * 0.6, 16, 16);
  head.translate(0, PIECE_HEIGHT * 0.25, 0);

  return mergeGeometries([base, head]);
}

function createKnightGeometry(): THREE.BufferGeometry {
  // Wide base
  const base = new THREE.CylinderGeometry(PIECE_RADIUS * 0.75, PIECE_RADIUS * 0.8, PIECE_HEIGHT * 0.35, 16);
  base.translate(0, -PIECE_HEIGHT * 0.15, 0);

  // Head cone
  const head = new THREE.ConeGeometry(PIECE_RADIUS * 0.5, PIECE_HEIGHT * 0.5, 16);
  head.translate(0, PIECE_HEIGHT * 0.25, 0);

  return mergeGeometries([base, head]);
}

function createBishopGeometry(): THREE.BufferGeometry {
  // Body: cylinder
  const body = new THREE.CylinderGeometry(PIECE_RADIUS * 0.55, PIECE_RADIUS * 0.7, PIECE_HEIGHT * 0.45, 16);
  body.translate(0, -PIECE_HEIGHT * 0.1, 0);

  // Top: cone
  const top = new THREE.ConeGeometry(PIECE_RADIUS * 0.4, PIECE_HEIGHT * 0.45, 16);
  top.translate(0, PIECE_HEIGHT * 0.35, 0);

  return mergeGeometries([body, top]);
}

function createRookGeometry(): THREE.BufferGeometry {
  // Main body: tall cylinder
  const body = new THREE.CylinderGeometry(PIECE_RADIUS * 0.65, PIECE_RADIUS * 0.7, PIECE_HEIGHT * 0.7, 16);
  body.translate(0, 0, 0);

  // Top ring: wide cylinder
  const top = new THREE.CylinderGeometry(PIECE_RADIUS * 0.75, PIECE_RADIUS * 0.75, PIECE_HEIGHT * 0.2, 16);
  top.translate(0, PIECE_HEIGHT * 0.45, 0);

  return mergeGeometries([body, top]);
}

function createQueenGeometry(): THREE.BufferGeometry {
  // Lower body: cylinder
  const lower = new THREE.CylinderGeometry(PIECE_RADIUS * 0.65, PIECE_RADIUS * 0.7, PIECE_HEIGHT * 0.35, 16);
  lower.translate(0, -PIECE_HEIGHT * 0.1, 0);

  // Upper body: cone
  const upper = new THREE.ConeGeometry(PIECE_RADIUS * 0.5, PIECE_HEIGHT * 0.4, 16);
  upper.translate(0, PIECE_HEIGHT * 0.25, 0);

  // Crown: smaller cone
  const crown = new THREE.ConeGeometry(PIECE_RADIUS * 0.35, PIECE_HEIGHT * 0.35, 16);
  crown.translate(0, PIECE_HEIGHT * 0.6, 0);

  return mergeGeometries([lower, upper, crown]);
}

function createKingGeometry(): THREE.BufferGeometry {
  // Base: cylinder
  const base = new THREE.CylinderGeometry(PIECE_RADIUS * 0.7, PIECE_RADIUS * 0.75, PIECE_HEIGHT * 0.4, 16);
  base.translate(0, -PIECE_HEIGHT * 0.1, 0);

  // Body: cone
  const body = new THREE.ConeGeometry(PIECE_RADIUS * 0.55, PIECE_HEIGHT * 0.35, 16);
  body.translate(0, PIECE_HEIGHT * 0.15, 0);

  // Crown: cone
  const crown = new THREE.ConeGeometry(PIECE_RADIUS * 0.4, PIECE_HEIGHT * 0.4, 16);
  crown.translate(0, PIECE_HEIGHT * 0.55, 0);

  return mergeGeometries([base, body, crown]);
}

export function getPieceMaterial(color: 'w' | 'b'): THREE.Material {
  if (color === 'w') {
    return new THREE.MeshStandardMaterial({
      color: 0xffffff, // Bright white
      roughness: 0.15,
      metalness: 0.35,
      emissive: 0xffffff,
      emissiveIntensity: 0.15,
    });
  } else {
    return new THREE.MeshStandardMaterial({
      color: 0x000000, // Pure black
      roughness: 0.1,
      metalness: 0.5,
      emissive: 0x222222,
      emissiveIntensity: 0.15,
    });
  }
}
