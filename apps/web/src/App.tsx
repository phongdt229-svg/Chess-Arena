import { useEffect, lazy, Suspense, useState } from 'react';
import Board2D from './components/board2d/Board2D';
import Controls from './components/ui/Controls';
import GameOverModal from './components/ui/GameOverModal';
import NewGameDialog from './components/ui/NewGameDialog';
import { useGameStore } from './store/gameStore';
import './App.css';

const Board3D = lazy(() => import('./components/board3d/Board3D'));

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { viewMode, setViewMode, newGame, resign, result } = useGameStore();

  useEffect(() => {
    newGame({ mode: 'local' });
  }, [newGame]);

  const handleNewGame = () => {
    setDialogOpen(true);
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
          <button onClick={resign} className="btn-danger" disabled={result.status !== 'ongoing'}>
            Resign
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="board-container">
          {viewMode === '2d' && <Board2D />}
          {viewMode === '3d' && (
            <Suspense fallback={<div className="loading">Loading 3D board...</div>}>
              <Board3D />
            </Suspense>
          )}
        </div>

        <aside className="sidebar">
          <Controls onNewGameClick={handleNewGame} />
        </aside>
      </main>

      <GameOverModal />
      <NewGameDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}

export default App;
