import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { Piece as PieceType } from '@chess-arena/chess-core';
import { useGameStore } from '../../store/gameStore';
import { squareToWorld } from './coords';
import { getPieceGeometry, getPieceMaterial } from './pieceGeometry';

interface Piece3DProps {
  square: number;
  piece: PieceType;
}

export default function Piece3D({ square, piece }: Piece3DProps) {
  const { selectedSquare, lastMoveFrom, lastMoveTo } = useGameStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const startPos = useRef(lastMoveFrom ? squareToWorld(lastMoveFrom) : squareToWorld(square));
  const endPos = useRef(squareToWorld(square));
  const animProgress = useRef(0);
  const isAnimating = useRef(lastMoveFrom === square ? true : false);

  const coords = squareToWorld(square);

  const geometry = useMemo(() => getPieceGeometry(piece.type), [piece.type]);
  const material = useMemo(() => getPieceMaterial(piece.color), [piece.color]);

  useEffect(() => {
    if (lastMoveFrom === square && lastMoveTo) {
      startPos.current = squareToWorld(lastMoveFrom);
      endPos.current = coords;
      animProgress.current = 0;
      isAnimating.current = true;
    }
  }, [lastMoveFrom, lastMoveTo, square, coords]);

  useFrame(() => {
    if (!meshRef.current || !isAnimating.current) return;

    animProgress.current += 0.05;

    if (animProgress.current >= 1) {
      animProgress.current = 1;
      isAnimating.current = false;
    }

    const progress = animProgress.current;
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    // Parabol arc: higher for knights
    const heightMultiplier = piece.type === 'n' ? 1.2 : 0.6;
    const arc = Math.sin(progress * Math.PI) * heightMultiplier;

    meshRef.current.position.x = startPos.current.x + (endPos.current.x - startPos.current.x) * eased;
    meshRef.current.position.y = startPos.current.y + arc;
    meshRef.current.position.z = startPos.current.z + (endPos.current.z - startPos.current.z) * eased;
  });

  // Lift up slightly if selected
  const yOffset = selectedSquare === square ? 0.3 : 0;

  return (
    <mesh
      ref={meshRef}
      position={[coords.x, coords.y + yOffset, coords.z]}
      geometry={geometry}
      material={material}
      castShadow
      receiveShadow
    />
  );
}
