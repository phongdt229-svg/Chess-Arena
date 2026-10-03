import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import './NewGameDialog.css';

interface NewGameDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewGameDialog({ isOpen, onClose }: NewGameDialogProps) {
  const { newGame } = useGameStore();
  const [mode, setMode] = useState<'local' | 'ai'>('local');
  const [playerColor, setPlayerColor] = useState<'w' | 'b' | 'random'>('random');
  const [aiLevel, setAiLevel] = useState(3);

  const handleStart = () => {
    const color = playerColor === 'random' ? (Math.random() < 0.5 ? 'w' : 'b') : playerColor;
    newGame({ mode, playerColor: color, aiLevel });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <h2>New Game</h2>

        <div className="dialog-section">
          <label>Game Mode</label>
          <div className="radio-group">
            <label>
              <input type="radio" name="mode" value="local" checked={mode === 'local'} onChange={(e) => setMode(e.target.value as 'local')} />
              Local (2 Players)
            </label>
            <label>
              <input type="radio" name="mode" value="ai" checked={mode === 'ai'} onChange={(e) => setMode(e.target.value as 'ai')} />
              Play vs AI
            </label>
          </div>
        </div>

        {mode === 'ai' && (
          <>
            <div className="dialog-section">
              <label>Your Color</label>
              <div className="radio-group">
                <label>
                  <input type="radio" name="color" value="w" checked={playerColor === 'w'} onChange={(e) => setPlayerColor(e.target.value as 'w')} />
                  White
                </label>
                <label>
                  <input type="radio" name="color" value="b" checked={playerColor === 'b'} onChange={(e) => setPlayerColor(e.target.value as 'b')} />
                  Black
                </label>
                <label>
                  <input type="radio" name="color" value="random" checked={playerColor === 'random'} onChange={(e) => setPlayerColor(e.target.value as 'random')} />
                  Random
                </label>
              </div>
            </div>

            <div className="dialog-section">
              <label>AI Difficulty</label>
              <div className="slider-container">
                <input type="range" min="1" max="6" value={aiLevel} onChange={(e) => setAiLevel(Number(e.target.value))} className="slider" />
                <div className="level-display">
                  <span>Level {aiLevel}</span>
                  <span className="level-name">
                    {aiLevel === 1 && '(Beginner)'}
                    {aiLevel === 2 && '(Easy)'}
                    {aiLevel === 3 && '(Medium)'}
                    {aiLevel === 4 && '(Hard)'}
                    {aiLevel === 5 && '(Very Hard)'}
                    {aiLevel === 6 && '(Expert)'}
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="dialog-actions">
          <button onClick={onClose} className="btn-cancel">
            Cancel
          </button>
          <button onClick={handleStart} className="btn-start">
            Start Game
          </button>
        </div>
      </div>
    </div>
  );
}
