import { useState } from 'react';
import Board2D from './components/board2d/Board2D';
import Controls from './components/ui/Controls';
import { useGameStore } from './store/gameStore';
import './App.css';

function App() {
  const [viewMode, setViewMode] = useState<'2d' | '3d'>('2d');
  const { gameState, newGame, resign } = useGameStore();

  const handleNewGame = () => {
    newGame({ mode: 'local' });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>♟ Chess Arena</h1>
        <div className="header-controls">
          <button onClick={handleNewGame} className="btn-primary">
            New Game
          </button>
          {viewMode === '2d' && (
            <button onClick={() => setViewMode('3d')} className="btn-secondary" title="Switch to 3D">
              3D View
            </button>
          )}
          {viewMode === '3d' && (
            <button onClick={() => setViewMode('2d')} className="btn-secondary" title="Switch to 2D">
              2D View
            </button>
          )}
          <button onClick={resign} className="btn-danger" disabled={gameState.result.status !== 'ongoing'}>
            Resign
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="board-container">
          {viewMode === '2d' && <Board2D />}
          {viewMode === '3d' && (
            <div className="placeholder-3d">
              <p>3D board will be implemented in Giai đoạn 3</p>
              <p>Currently showing 2D mode</p>
              <button onClick={() => setViewMode('2d')}>Back to 2D</button>
            </div>
          )}
        </div>

        <aside className="sidebar">
          <Controls />
        </aside>
      </main>
    </div>
  );
}

export default App;
