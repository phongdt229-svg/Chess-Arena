import { useEffect, useRef, lazy, Suspense, useState } from 'react';
import Board2D from '../components/board2d/Board2D';
import Controls from '../components/ui/Controls';
import GameOverModal from '../components/ui/GameOverModal';
import NewGameDialog from '../components/ui/NewGameDialog';
import PromotionDialog from '../components/board2d/PromotionDialog';
import { useGameStore } from '../store/gameStore';
import { useAuthStore } from '../store/authStore';
import { Link, navigate, useLocation } from '../router/router';
import ResumeDialog from '../components/ui/ResumeDialog';
import { useGameSounds } from '../audio/useGameSounds';
import { usePageMeta } from '../site/usePageMeta';
import AdSlot from '../ads/AdSlot';
import { useAutoSave } from '../persistence/useAutoSave';
import { useRecordStats } from '../persistence/useRecordStats';
import { useAnalysisSync } from '../store/useAnalysisSync';
import { useSettingsStore } from '../store/settingsStore';
import { clearSave, readSave, type SavedGame } from '../persistence/savedGame';
import '../App.css';

const Board3D = lazy(() => import('../components/board3d/Board3D'));

export default function GameApp() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { viewMode, setViewMode, newGame, resign, result, restoreGame } = useGameStore();
  const { user, logout } = useAuthStore();
  const { search } = useLocation();
  const importedPgn = useRef(search.get('pgn')).current;
  usePageMeta('Play');
  useGameSounds();
  useRecordStats(user?.id);
  useAnalysisSync();

  const [resumeOffer, setResumeOffer] = useState<SavedGame | null>(() =>
    user && !importedPgn ? readSave(user.id) : null,
  );
  useAutoSave(user?.id, resumeOffer === null);

  useEffect(() => {
    newGame({ mode: 'local' });
    useGameStore.getState().setViewMode(useSettingsStore.getState().defaultView);
    if (importedPgn) {
      useGameStore.getState().loadPGN(importedPgn);
      navigate('/play', { replace: true });
    }
  }, [newGame, importedPgn]);

  const resume = () => {
    if (resumeOffer && !restoreGame(resumeOffer) && user) clearSave(user.id);
    setResumeOffer(null);
  };

  const discard = () => {
    if (user) clearSave(user.id);
    setResumeOffer(null);
  };

  const handleNewGame = () => {
    setDialogOpen(true);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>
          <Link to="/" className="header-home" title="Back to home">
            ♟ Chess Arena
          </Link>
        </h1>
        <div className="header-controls">
          <Link to="/profile" className="header-user" title={`Elo ${user?.elo ?? ''}`}>
            {user?.username}
          </Link>
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
          <button
            onClick={() => {
              navigate('/');
              void logout();
            }}
            className="btn-secondary btn-logout"
            title="Log out"
          >
            Log out
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="board-container">
          {viewMode === '2d' && <Board2D evalBar />}
          {viewMode === '3d' && (
            <Suspense fallback={<div className="loading">Loading 3D board...</div>}>
              <Board3D />
            </Suspense>
          )}
        </div>

        <aside className="sidebar">
          <Controls onNewGameClick={handleNewGame} />
          <AdSlot placement="game" desktopOnly />
        </aside>
      </main>

      {resumeOffer && <ResumeDialog save={resumeOffer} onResume={resume} onDiscard={discard} />}
      <PromotionDialog />
      <GameOverModal />
      <NewGameDialog isOpen={dialogOpen} onClose={() => setDialogOpen(false)} />
    </div>
  );
}
