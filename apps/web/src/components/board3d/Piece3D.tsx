import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import type { Piece as PieceType } from '@chess-arena/chess-core';
import { useGameStore } from '../../store/gameStore';
import { squareToWorld } from './coords';
import { getPieceGeometry, getPieceMaterial } from './pieceGeometry';

const BOARD_SURFACE_Y = 0.05; // top face of the 0.1-thick tile

interface Piece3DProps {
  square: number;
  piece: PieceType;
}

export default function Piece3D({ square, piece }: Piece3DProps) {
  const { selectedSquare, lastMoveFrom, lastMoveTo, clickSquare } = useGameStore();
  const meshRef = useRef<THREE.Mesh>(null);
  const justMoved = lastMoveTo === square && lastMoveFrom !== null;
  const startPos = useRef(justMoved ? squareToWorld(lastMoveFrom) : squareToWorld(square));
  const endPos = useRef(squareToWorld(square));
  const animProgress = useRef(0);
  const isAnimating = useRef(justMoved);
  const baseRotation = piece.color === 'b' ? Math.PI : 0;

  const coords = squareToWorld(square);
  const rotationRef = useRef(0);

  const geometry = useMemo(() => getPieceGeometry(piece.type), [piece.type]);
  const material = useMemo(() => getPieceMaterial(piece.color), [piece.color]);

  useEffect(() => {
    if (lastMoveTo === square && lastMoveFrom !== null) {
      startPos.current = squareToWorld(lastMoveFrom);
      endPos.current = coords;
      animProgress.current = 0;
      isAnimating.current = true;
    }
  }, [lastMoveFrom, lastMoveTo, square, coords]);

  useFrame(() => {
    if (!meshRef.current || !isAnimating.current) return;

    animProgress.current += 0.06;

    if (animProgress.current >= 1) {
      animProgress.current = 1;
      isAnimating.current = false;
    }

    const progress = animProgress.current;
    // Smooth ease-in-out for position
    const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
    // Smooth parabolic arc: higher for knights
    const heightMultiplier = piece.type === 'n' ? 1.3 : 0.65;
    const arc = Math.sin(progress * Math.PI) * heightMultiplier;

    meshRef.current.position.x = startPos.current.x + (endPos.current.x - startPos.current.x) * eased;
    meshRef.current.position.y = BOARD_SURFACE_Y + startPos.current.y + arc;
    meshRef.current.position.z = startPos.current.z + (endPos.current.z - startPos.current.z) * eased;

    // Subtle rotation during movement
    rotationRef.current += 0.05;
    meshRef.current.rotation.y =
      progress >= 1 ? baseRotation : baseRotation + Math.sin(rotationRef.current * 0.5) * 0.3;
  });

  // Lift up slightly if selected
  const yOffset = selectedSquare === square ? 0.3 : 0;

  return (
    <mesh
      ref={meshRef}
      position={[coords.x, BOARD_SURFACE_Y + coords.y + yOffset, coords.z]}
      rotation={[0, baseRotation, 0]}
      geometry={geometry}
      material={material}
      onClick={(e) => {
        e.stopPropagation();
        clickSquare(square);
      }}
      castShadow
      receiveShadow
    />
  );
}
