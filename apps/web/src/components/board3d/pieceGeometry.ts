import * as THREE from 'three';
import type { PieceType } from '@chess-arena/chess-core';

const PIECE_HEIGHT = 0.8;
const PIECE_RADIUS = 0.3;

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
  // Simple pawn: sphere on top of cone
  const group = new THREE.Group();

  // Base cylinder
  const baseGeom = new THREE.CylinderGeometry(PIECE_RADIUS * 0.6, PIECE_RADIUS * 0.8, PIECE_HEIGHT * 0.4, 8);
  // Top sphere
  const sphereGeom = new THREE.SphereGeometry(PIECE_RADIUS * 0.6, 8, 8);

  // Merge geometries by creating combined buffer
  const positions: number[] = [];
  const combined = new THREE.BufferGeometry();

  // Base positions
  const basePos = baseGeom.getAttribute('position');
  for (let i = 0; i < basePos.count; i++) {
    positions.push(basePos.getX(i), basePos.getY(i) - PIECE_HEIGHT * 0.3, basePos.getZ(i));
  }

  // Sphere positions (offset up)
  const spherePos = sphereGeom.getAttribute('position');
  for (let i = 0; i < spherePos.count; i++) {
    positions.push(spherePos.getX(i), spherePos.getY(i) + PIECE_HEIGHT * 0.2, spherePos.getZ(i));
  }

  combined.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  combined.computeVertexNormals();

  baseGeom.dispose();
  sphereGeom.dispose();

  return combined;
}

function createKnightGeometry(): THREE.BufferGeometry {
  // Simple knight: cylinder base + tilted box for head
  const geom = new THREE.CylinderGeometry(PIECE_RADIUS * 0.5, PIECE_RADIUS * 0.7, PIECE_HEIGHT * 0.5, 8);
  return geom;
}

function createBishopGeometry(): THREE.BufferGeometry {
  // Bishop: cone on cylinder
  const geom = new THREE.ConeGeometry(PIECE_RADIUS * 0.5, PIECE_HEIGHT * 0.6, 8);
  return geom;
}

function createRookGeometry(): THREE.BufferGeometry {
  // Rook: cylinder (castle-like with flat top)
  const geom = new THREE.CylinderGeometry(PIECE_RADIUS * 0.6, PIECE_RADIUS * 0.7, PIECE_HEIGHT, 8);
  return geom;
}

function createQueenGeometry(): THREE.BufferGeometry {
  // Queen: tall cone + sphere on top
  const geom = new THREE.ConeGeometry(PIECE_RADIUS * 0.5, PIECE_HEIGHT * 0.8, 8);
  return geom;
}

function createKingGeometry(): THREE.BufferGeometry {
  // King: cylinder with cross on top (two boxes)
  const geom = new THREE.CylinderGeometry(PIECE_RADIUS * 0.55, PIECE_RADIUS * 0.65, PIECE_HEIGHT * 0.7, 8);
  return geom;
}

/**
 * Create material for pieces
 */
export function getPieceMaterial(color: 'w' | 'b'): THREE.Material {
  return new THREE.MeshStandardMaterial({
    color: color === 'w' ? 0xf5deb3 : 0x2c2c2c,
    roughness: 0.3,
    metalness: 0.2,
  });
}
