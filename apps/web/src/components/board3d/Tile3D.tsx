import { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import { squareToWorld } from './coords';

interface Tile3DProps {
  index: number;
  isSelected: boolean;
  isLegalTarget: boolean;
  isLastMove: boolean;
  isInCheck: boolean;
  quality: 'low' | 'high';
}

export default function Tile3D({
  index,
  isSelected,
  isLegalTarget,
  isLastMove,
  isInCheck,
  quality,
}: Tile3DProps) {
  const { clickSquare } = useGameStore();
  const coords = squareToWorld(index);

  const file = index % 8;
  const rank = Math.floor(index / 8);
  const isDark = (file + rank) % 2 === 1;

  // Determine tile color
  let color = isDark ? 0x8b7355 : 0xf0d9b5; // Dark brown / Light tan
  if (isInCheck) color = 0xff4444; // Red for check
  else if (isSelected) color = 0xbaca44; // Light green for selected
  else if (isLastMove) color = isDark ? 0xa9a664 : 0xd4c555; // Highlight last move
  else if (isLegalTarget) color = isDark ? 0x8b7355 : 0xf0d9b5; // Normal (marker will show)

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 0.1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color,
        metalness: quality === 'high' ? 0.1 : 0,
        roughness: quality === 'high' ? 0.3 : 0.5,
      }),
    [color, quality]
  );

  return (
    <mesh
      position={[coords.x, coords.y, coords.z]}
      geometry={geometry}
      material={material}
      onClick={() => clickSquare(index)}
      castShadow
      receiveShadow
    >
      {/* Legal target marker */}
      {isLegalTarget && (
        <mesh position={[0, 0.1, 0]}>
          <circleGeometry args={[0.15, 8]} />
          <meshBasicMaterial color={0xcccccc} transparent opacity={0.7} />
        </mesh>
      )}
    </mesh>
  );
}
