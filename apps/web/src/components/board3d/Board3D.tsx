import { useState, useRef, useEffect, type MutableRefObject } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { useGameStore } from '../../store/gameStore';
import Tile3D from './Tile3D';
import Piece3D from './Piece3D';
import { QUALITY_PROFILES, cameraHome, defaultQuality, type Quality3D } from './quality';
import './Board3D.css';

interface SceneProps {
  quality: Quality3D;
  resetRef: MutableRefObject<(() => void) | null>;
}

function BoardScene({ quality, resetRef }: SceneProps) {
  const { board, selectedSquare, legalMoves, lastMoveFrom, lastMoveTo, inCheckSquare, orientation } = useGameStore();
  const { camera, invalidate } = useThree();
  const controlsRef = useRef<any>(null);
  const profile = QUALITY_PROFILES[quality];

  const isLegalTarget = (sq: number) => legalMoves.some((m) => m.to === sq);
  const isLastMoveSquare = (sq: number) => lastMoveFrom === sq || lastMoveTo === sq;

  useEffect(() => {
    const home = () => {
      const [x, y, z] = cameraHome(orientation);
      camera.position.set(x, y, z);
      if (controlsRef.current) {
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      }
      invalidate();
    };
    home();
    resetRef.current = home;
    return () => {
      resetRef.current = null;
    };
  }, [camera, orientation, invalidate, resetRef]);

  return (
    <>
      <PerspectiveCamera position={cameraHome(orientation)} fov={50} makeDefault />

      <OrbitControls ref={controlsRef} enableDamping={false} maxPolarAngle={Math.PI * 0.45} minDistance={5} maxDistance={20} />

      <ambientLight intensity={profile.extraLights ? 0.5 : quality === 'medium' ? 0.6 : 0.8} />
      <directionalLight
        position={profile.shadows ? [8, 12, 6] : [5, 8, 5]}
        intensity={profile.shadows ? 1.0 : 0.6}
        castShadow={profile.shadows}
        shadow-mapSize={[profile.shadowMapSize, profile.shadowMapSize]}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
      />
      {profile.extraLights && (
        <>
          <directionalLight position={[-5, 8, -8]} intensity={0.3} />
          <pointLight position={[0, 6, 0]} intensity={0.2} />
        </>
      )}

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
      {board.map((piece, sq) => (piece ? <Piece3D key={`piece-${sq}`} square={sq} piece={piece} /> : null))}
    </>
  );
}

export default function Board3D() {
  const [quality, setQuality] = useState<Quality3D>(defaultQuality);
  const resetRef = useRef<(() => void) | null>(null);
  const profile = QUALITY_PROFILES[quality];

  return (
    <div className="board3d-wrapper">
      <div className="board3d-container">
        <Canvas key={quality} shadows={profile.shadows} dpr={profile.dpr} frameloop="demand">
          <BoardScene quality={quality} resetRef={resetRef} />
        </Canvas>
      </div>

      {/* UI Controls - outside Canvas */}
      <div className="board3d-controls">
        <button onClick={() => resetRef.current?.()} title="Reset camera view" className="btn-reset-camera">
          ↻ Reset View
        </button>
        <div className="quality-selector">
          <label>
            Quality:
            <select value={quality} onChange={(e) => setQuality(e.target.value as Quality3D)}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}
