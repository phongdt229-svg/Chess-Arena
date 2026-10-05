import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { squareToWorld } from './coords';
import { getPieceGeometry, getPieceMaterial } from './pieceGeometry';
import type { CapturedGhost as Ghost } from './captured';

const DELAY = 0.22; // let the capturing piece arrive first
const DURATION = 0.5;
const BOARD_SURFACE_Y = 0.05;

// A captured piece sinks into the board and fades out, then removes itself
export default function CapturedGhost({ ghost, onDone }: { ghost: Ghost; onDone: (id: number) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const invalidate = useThree((s) => s.invalidate);
  const baseScale = useThree((s) => (s.size.width < 600 ? 1.2 : 1));
  const pos = squareToWorld(ghost.square);

  const geometry = useMemo(() => getPieceGeometry(ghost.type), [ghost.type]);
  const material = useMemo(() => {
    const m = (getPieceMaterial(ghost.color) as THREE.MeshStandardMaterial).clone();
    m.transparent = true;
    return m;
  }, [ghost.color]);
  useEffect(() => () => material.dispose(), [material]);
  useEffect(() => invalidate(), [invalidate]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    elapsed.current += delta;
    const t = Math.min(1, Math.max(0, (elapsed.current - DELAY) / DURATION));
    const eased = t * t;
    mesh.position.y = BOARD_SURFACE_Y - eased * 0.45;
    mesh.scale.setScalar(baseScale * (1 - eased * 0.4));
    material.opacity = 1 - eased;
    if (t >= 1) onDone(ghost.id);
    else invalidate();
  });

  return (
    <mesh
      ref={meshRef}
      position={[pos.x, BOARD_SURFACE_Y, pos.z]}
      rotation={[0, ghost.color === 'b' ? Math.PI : 0, 0]}
      geometry={geometry}
      material={material}
      castShadow
    />
  );
}
