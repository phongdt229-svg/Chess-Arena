import { useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';
import { formatClock } from '../../store/clock';
import type { Color } from '@chess-arena/chess-core';
import './ClockPanel.css';

export default function ClockPanel() {
  const { clock, fen, result, history, orientation, tickClock } = useGameStore();

  useEffect(() => {
    if (!clock.enabled) return;
    const id = setInterval(tickClock, 200);
    return () => clearInterval(id);
  }, [clock.enabled, tickClock]);

  if (!clock.enabled) return null;

  const turn: Color = fen.split(' ')[1] === 'b' ? 'b' : 'w';
  const running = result.status === 'ongoing' && history.length >= 2;
  const bottom: Color = orientation;
  const top: Color = bottom === 'w' ? 'b' : 'w';

  const row = (color: Color) => {
    const ms = color === 'w' ? clock.whiteMs : clock.blackMs;
    const classes = ['clock-row', running && turn === color ? 'active' : '', ms < 10_000 ? 'low' : ''].join(' ');
    return (
      <div className={classes} key={color} data-color={color}>
        <span className="clock-side">{color === 'w' ? '♔ White' : '♚ Black'}</span>
        <span className="clock-time">{formatClock(ms)}</span>
      </div>
    );
  };

  return (
    <div className="clock-panel" aria-label="Clocks">
      {row(top)}
      {row(bottom)}
    </div>
  );
}
