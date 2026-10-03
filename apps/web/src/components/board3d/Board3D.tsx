import { useState, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import Tile3D from './Tile3D';
import Piece3D from './Piece3D';
import './Board3D.css';

function BoardScene() {
  const { board, selectedSquare, legalMoves, lastMoveFrom, lastMoveTo, inCheckSquare, orientation } =
    useGameStore();
  const [quality, setQuality] = useState<'low' | 'high'>('high');
  const cameraRef = useRef<THREE.PerspectiveCamera>(null);
  const controlsRef = useRef<any>(null);

  const isLegalTarget = (sq: number) => legalMoves.some((m) => m.to === sq);
  const isLastMoveSquare = (sq: number) => lastMoveFrom === sq || lastMoveTo === sq;

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      const distance = 12;
      const cameraPos = orientation === 'w' ? { x: 0, y: 8, z: 10 } : { x: 0, y: 8, z: -10 };
      cameraRef.current.position.set(cameraPos.x, cameraPos.y, cameraPos.z);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  return (
    <>
      <PerspectiveCamera
        ref={cameraRef}
        position={orientation === 'w' ? [0, 8, 10] : [0, 8, -10]}
        fov={50}
        aspect={window.innerWidth / window.innerHeight}
        near={0.1}
        far={1000}
      />

      <OrbitControls
        ref={controlsRef}
        maxPolarAngle={Math.PI * 0.45}
        minDistance={5}
        maxDistance={20}
        autoRotate={false}
      />

      {quality === 'high' && (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 7]} intensity={0.8} castShadow shadow-mapSize={2048} />
        </>
      )}
      {quality === 'low' && <ambientLight intensity={0.8} />}

      {/* Board tiles */}
      {Array.from({ length: 64 }).map((_, sq) => (
        <Tile3D
          key={sq}
          index={sq}
          isSelected={sq === selectedSquare}
          isLegalTarget={isLegalTarget(sq)}
          isLastMove={isLastMoveSquare(sq)}
          isInCheck={sq === inCheckSquare}
          quality={quality}
        />
      ))}

      {/* Pieces */}
      {board.map((piece, sq) =>
        piece ? <Piece3D key={`piece-${sq}`} square={sq} piece={piece} /> : null
      )}

      {/* UI Panel */}
      <div className="board3d-controls">
        <button onClick={resetCamera} title="Reset camera view" className="btn-reset-camera">
          ↻ Reset View
        </button>
        <div className="quality-selector">
          <label>
            Quality:
            <select value={quality} onChange={(e) => setQuality(e.target.value as 'low' | 'high')}>
              <option value="low">Low</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
      </div>
    </>
  );
}

function PerspectiveCamera({
  ref,
  position,
  fov,
  aspect,
  near,
  far,
}: {
  ref: any;
  position: [number, number, number];
  fov: number;
  aspect: number;
  near: number;
  far: number;
}) {
  const cam = useRef<THREE.PerspectiveCamera>(null);

  if (ref) {
    ref.current = cam.current;
  }

  return (
    <perspectiveCamera ref={cam} position={position} fov={fov} aspect={aspect} near={near} far={far} />
  );
}

export default function Board3D() {
  return (
    <div className="board3d-container">
      <Canvas shadows>
        <BoardScene />
      </Canvas>
    </div>
  );
}
