import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { squareToWorld } from './coords';
import type { Quality3D } from './quality';
import { clickSuppressed } from '../board2d/dragState';

interface Tile3DProps {
  index: number;
  isSelected: boolean;
  isLegalTarget: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  isHint?: boolean;
  quality: Quality3D;
}

export default function Tile3D({
  index,
  isSelected,
  isLegalTarget,
  isLastMove,
  isInCheck,
  isHint = false,
  quality,
}: Tile3DProps) {
  const { clickSquare } = useGameStore();
  const coords = squareToWorld(index);

  const file = index % 8;
  const rank = Math.floor(index / 8);
  const isDark = (file + rank) % 2 === 1;

  // Determine tile color - more refined board colors
  let color = isDark ? 0x7a6f63 : 0xf4e8d8; // Refined brown / Light cream
  if (isHint) color = 0x3fae5a; // Suggested move
  else if (isInCheck) color = 0xd84545; // Deep red for check
  else if (isSelected) color = 0xc4d651; // Olive green for selected
  else if (isLastMove) color = isDark ? 0x9d9968 : 0xe6d966; // Highlight last move
  else if (isLegalTarget) color = isDark ? 0x7a6f63 : 0xf4e8d8; // Normal (marker will show)

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 0.1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: quality === 'low' ? 0 : 0.1,
        roughness: quality === 'low' ? 0.5 : 0.3,
      }),
    [color, quality]
  );

  return (
    <mesh
      position={[coords.x, coords.y, coords.z]}
      geometry={geometry}
      material={material}
      onClick={() => {
        if (!clickSuppressed()) clickSquare(index);
      }}
      castShadow
      receiveShadow
    >
      {/* Legal target marker - dot in center */}
      {isLegalTarget && (
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.02, 16]} />
          <meshStandardMaterial color={0x888888} metalness={0.4} roughness={0.3} emissive={0x555555} />
        </mesh>
      )}
    </mesh>
  );
}
