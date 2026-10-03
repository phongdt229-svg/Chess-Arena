import { useState, useRef, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useGameStore } from '../../store/gameStore';
import Tile3D from './Tile3D';
import Piece3D from './Piece3D';
import './Board3D.css';

function BoardScene({ quality, onResetCamera }: { quality: 'low' | 'high'; onResetCamera: () => void }) {
  const { board, selectedSquare, legalMoves, lastMoveFrom, lastMoveTo, inCheckSquare, orientation } =
    useGameStore();
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const isLegalTarget = (sq: number) => legalMoves.some((m) => m.to === sq);
  const isLastMoveSquare = (sq: number) => lastMoveFrom === sq || lastMoveTo === sq;

  useEffect(() => {
    if (camera instanceof THREE.PerspectiveCamera) {
      const pos = orientation === 'w' ? { x: 0, y: 8, z: 10 } : { x: 0, y: 8, z: -10 };
      camera.position.set(pos.x, pos.y, pos.z);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
    }
  }, [camera, orientation]);

  return (
    <>
      <PerspectiveCamera position={[0, 8, 10]} fov={50} makeDefault />

      <OrbitControls
        ref={controlsRef}
        maxPolarAngle={Math.PI * 0.45}
        minDistance={5}
        maxDistance={20}
      />

      {quality === 'high' && (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 7]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} />
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
    </>
  );
}

export default function Board3D() {
  const [quality, setQuality] = useState<'low' | 'high'>('high');
  const canvasRef = useRef<any>(null);

  const handleResetCamera = () => {
    if (canvasRef.current) {
      // Camera reset is handled inside BoardScene via useThree
      // This is just a placeholder - the reset logic is in BoardScene
    }
  };

  return (
    <div className="board3d-wrapper">
      <div className="board3d-container">
        <Canvas ref={canvasRef} shadows dpr={[1, 2]}>
          <BoardScene quality={quality} onResetCamera={handleResetCamera} />
        </Canvas>
      </div>

      {/* UI Controls - outside Canvas */}
      <div className="board3d-controls">
        <button onClick={handleResetCamera} title="Reset camera view" className="btn-reset-camera">
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
    </div>
  );
}
