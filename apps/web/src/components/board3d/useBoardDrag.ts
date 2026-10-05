import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import * as THREE from 'three';
import { useThree, type ThreeEvent } from '@react-three/fiber';
import { useGameStore } from '../../store/gameStore';
import { suppressNextClick } from '../board2d/dragState';
import { worldToSquare } from './coords';

const DRAG_THRESHOLD_PX = 6;
const BOARD_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.05); // top face of the tiles

export interface DragView {
  from: number;
  x: number;
  z: number;
}

// Drag-and-drop for 3D pieces: press a piece, move past a small threshold, release over a square.
// A short press is left to the normal click handlers.
export function useBoardDrag(controlsRef: RefObject<{ enabled: boolean } | null>) {
  const { camera, gl, raycaster, invalidate } = useThree();
  const [drag, setDrag] = useState<DragView | null>(null);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => () => cleanup.current?.(), []);

  const pointOnBoard = useCallback(
    (clientX: number, clientY: number) => {
      const rect = gl.domElement.getBoundingClientRect();
      const ndc = new THREE.Vector2(((clientX - rect.left) / rect.width) * 2 - 1, -((clientY - rect.top) / rect.height) * 2 + 1);
      raycaster.setFromCamera(ndc, camera);
      return raycaster.ray.intersectPlane(BOARD_PLANE, new THREE.Vector3());
    },
    [camera, gl, raycaster],
  );

  const onPress = useCallback(
    (from: number, e: ThreeEvent<PointerEvent>) => {
      const native = e.nativeEvent;
      if (native.pointerType === 'mouse' && native.button !== 0) return;
      e.stopPropagation();
      cleanup.current?.();

      const origin = { x: native.clientX, y: native.clientY };
      const pointerId = native.pointerId;
      const controls = controlsRef.current;
      let dragging = false;
      if (controls) controls.enabled = false; // the camera must not orbit while a piece is held

      const finish = () => {
        window.removeEventListener('pointermove', move);
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', cancel);
        if (controls) controls.enabled = true;
        setDrag(null);
        cleanup.current = null;
        invalidate();
      };

      const move = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        if (!dragging) {
          if (Math.hypot(ev.clientX - origin.x, ev.clientY - origin.y) < DRAG_THRESHOLD_PX) return;
          const store = useGameStore.getState();
          if (store.selectedSquare !== from) store.clickSquare(from);
          if (useGameStore.getState().selectedSquare !== from) {
            finish(); // this piece cannot be moved right now
            return;
          }
          dragging = true;
        }
        const hit = pointOnBoard(ev.clientX, ev.clientY);
        if (hit) setDrag({ from, x: hit.x, z: hit.z });
        invalidate();
      };

      const up = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return;
        if (dragging) {
          suppressNextClick();
          const hit = pointOnBoard(ev.clientX, ev.clientY);
          const to = hit ? worldToSquare(hit.x, hit.z) : null;
          if (to !== null && to !== from) useGameStore.getState().clickSquare(to);
        }
        finish();
      };

      const cancel = (ev: PointerEvent) => {
        if (ev.pointerId === pointerId) finish();
      };

      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', up);
      window.addEventListener('pointercancel', cancel);
      cleanup.current = finish;
    },
    [controlsRef, invalidate, pointOnBoard],
  );

  return { drag, onPress };
}
