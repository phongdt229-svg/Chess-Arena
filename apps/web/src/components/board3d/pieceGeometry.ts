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
  // Small, simple pawn - shortest piece
  const base = new THREE.CylinderGeometry(PIECE_RADIUS * 0.5, PIECE_RADIUS * 0.6, PIECE_HEIGHT * 0.3, 12);
  base.translate(0, -PIECE_HEIGHT * 0.25, 0);

  const head = new THREE.SphereGeometry(PIECE_RADIUS * 0.45, 12, 12);
  head.translate(0, PIECE_HEIGHT * 0.05, 0);

  return mergeGeometries([base, head]);
}

function createKnightGeometry(): THREE.BufferGeometry {
  // Wide, distinctive base for knight
  const base = new THREE.CylinderGeometry(PIECE_RADIUS * 0.8, PIECE_RADIUS * 0.85, PIECE_HEIGHT * 0.35, 16);
  base.translate(0, -PIECE_HEIGHT * 0.15, 0);

  // Tilted head (box-like, angular)
  const head = new THREE.BoxGeometry(PIECE_RADIUS * 0.6, PIECE_HEIGHT * 0.45, PIECE_RADIUS * 0.5, 8, 8, 8);
  head.translate(0, PIECE_HEIGHT * 0.25, PIECE_RADIUS * 0.15);
  head.rotateZ(0.3);

  return mergeGeometries([base, head]);
}

function createBishopGeometry(): THREE.BufferGeometry {
  // Bulging body - distinctive shape
  const lower = new THREE.CylinderGeometry(PIECE_RADIUS * 0.6, PIECE_RADIUS * 0.75, PIECE_HEIGHT * 0.25, 16);
  lower.translate(0, -PIECE_HEIGHT * 0.1, 0);

  const middle = new THREE.SphereGeometry(PIECE_RADIUS * 0.7, 16, 16);
  middle.scale(1, 0.5, 1);
  middle.translate(0, PIECE_HEIGHT * 0.05, 0);

  // Very tall, pointed top - distinctive bishop shape
  const top = new THREE.ConeGeometry(PIECE_RADIUS * 0.35, PIECE_HEIGHT * 0.55, 16);
  top.translate(0, PIECE_HEIGHT * 0.4, 0);

  return mergeGeometries([lower, middle, top]);
}

function createRookGeometry(): THREE.BufferGeometry {
  // Tall, thick body - castle-like
  const body = new THREE.CylinderGeometry(PIECE_RADIUS * 0.7, PIECE_RADIUS * 0.75, PIECE_HEIGHT * 0.65, 16);
  body.translate(0, 0, 0);

  // Battlements on top (castle crenellations)
  const battlement1 = new THREE.BoxGeometry(PIECE_RADIUS * 0.25, PIECE_HEIGHT * 0.25, PIECE_RADIUS * 0.7, 8, 8, 8);
  battlement1.translate(-PIECE_RADIUS * 0.25, PIECE_HEIGHT * 0.5, 0);

  const battlement2 = new THREE.BoxGeometry(PIECE_RADIUS * 0.25, PIECE_HEIGHT * 0.25, PIECE_RADIUS * 0.7, 8, 8, 8);
  battlement2.translate(PIECE_RADIUS * 0.25, PIECE_HEIGHT * 0.5, 0);

  const battlement3 = new THREE.BoxGeometry(PIECE_RADIUS * 0.7, PIECE_HEIGHT * 0.25, PIECE_RADIUS * 0.25, 8, 8, 8);
  battlement3.translate(0, PIECE_HEIGHT * 0.5, PIECE_RADIUS * 0.25);

  const battlement4 = new THREE.BoxGeometry(PIECE_RADIUS * 0.7, PIECE_HEIGHT * 0.25, PIECE_RADIUS * 0.25, 8, 8, 8);
  battlement4.translate(0, PIECE_HEIGHT * 0.5, -PIECE_RADIUS * 0.25);

  return mergeGeometries([body, battlement1, battlement2, battlement3, battlement4]);
}

function createQueenGeometry(): THREE.BufferGeometry {
  // Base with bulge - distinctive queen silhouette
  const base = new THREE.CylinderGeometry(PIECE_RADIUS * 0.6, PIECE_RADIUS * 0.7, PIECE_HEIGHT * 0.3, 16);
  base.translate(0, -PIECE_HEIGHT * 0.15, 0);

  const bulge = new THREE.SphereGeometry(PIECE_RADIUS * 0.75, 16, 16);
  bulge.scale(1, 0.4, 1);
  bulge.translate(0, PIECE_HEIGHT * 0.05, 0);

  // Body
  const body = new THREE.CylinderGeometry(PIECE_RADIUS * 0.5, PIECE_RADIUS * 0.6, PIECE_HEIGHT * 0.25, 16);
  body.translate(0, PIECE_HEIGHT * 0.2, 0);

  // Crown (tall and ornate)
  const crown = new THREE.ConeGeometry(PIECE_RADIUS * 0.45, PIECE_HEIGHT * 0.5, 16);
  crown.translate(0, PIECE_HEIGHT * 0.55, 0);

  // Crown top accent
  const accent = new THREE.SphereGeometry(PIECE_RADIUS * 0.2, 12, 12);
  accent.translate(0, PIECE_HEIGHT * 0.8, 0);

  return mergeGeometries([base, bulge, body, crown, accent]);
}

function createKingGeometry(): THREE.BufferGeometry {
  // Robust base - king must stand firm
  const base = new THREE.CylinderGeometry(PIECE_RADIUS * 0.75, PIECE_RADIUS * 0.8, PIECE_HEIGHT * 0.35, 16);
  base.translate(0, -PIECE_HEIGHT * 0.15, 0);

  // Body
  const body = new THREE.CylinderGeometry(PIECE_RADIUS * 0.6, PIECE_RADIUS * 0.65, PIECE_HEIGHT * 0.25, 16);
  body.translate(0, PIECE_HEIGHT * 0.15, 0);

  // Crown shape
  const crown = new THREE.ConeGeometry(PIECE_RADIUS * 0.5, PIECE_HEIGHT * 0.45, 16);
  crown.translate(0, PIECE_HEIGHT * 0.5, 0);

  // Cross on top - very distinctive for king
  const crossVertical = new THREE.BoxGeometry(PIECE_RADIUS * 0.15, PIECE_HEIGHT * 0.35, PIECE_RADIUS * 0.15, 6, 6, 6);
  crossVertical.translate(0, PIECE_HEIGHT * 0.8, 0);

  const crossHorizontal = new THREE.BoxGeometry(PIECE_RADIUS * 0.35, PIECE_HEIGHT * 0.1, PIECE_RADIUS * 0.15, 6, 6, 6);
  crossHorizontal.translate(0, PIECE_HEIGHT * 0.75, 0);

  return mergeGeometries([base, body, crown, crossVertical, crossHorizontal]);
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
