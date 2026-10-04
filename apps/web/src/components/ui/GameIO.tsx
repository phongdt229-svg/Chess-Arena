import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import './GameIO.css';

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function downloadText(filename: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/x-chess-pgn;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function GameIO() {
  const { fen, history, loadFEN, loadPGN, getPGN } = useGameStore();
  const [open, setOpen] = useState(false);
  const [fenText, setFenText] = useState('');
  const [pgnText, setPgnText] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!open) return;
    setFenText(fen);
    setPgnText(getPGN());
    setMessage(null);
    // refresh the fields only when the dialog opens or the game changes underneath it
  }, [open, fen, history.length, getPGN]);

  const copy = async (text: string, label: string) => {
    const ok = await copyText(text);
    setMessage(ok ? { kind: 'ok', text: `${label} copied.` } : { kind: 'error', text: 'Copy failed — select the text and copy manually.' });
  };

  const apply = (ok: boolean, label: string) => {
    if (ok) setOpen(false);
    else setMessage({ kind: 'error', text: `Invalid ${label}.` });
  };

  return (
    <>
      <button className="btn-block btn-secondary" onClick={() => setOpen(true)}>
        ⇅ Import / Export
      </button>

      {open && (
        <div className="dialog-overlay" onClick={() => setOpen(false)}>
          <div className="dialog-content gameio" role="dialog" aria-label="Import or export game" onClick={(e) => e.stopPropagation()}>
            <h2>Import / Export</h2>

            <section className="gameio-section">
              <label htmlFor="gameio-fen">Position (FEN)</label>
              <textarea id="gameio-fen" rows={2} value={fenText} onChange={(e) => setFenText(e.target.value)} spellCheck={false} />
              <div className="gameio-actions">
                <button onClick={() => copy(fenText, 'FEN')}>Copy</button>
                <button className="primary" onClick={() => apply(loadFEN(fenText), 'FEN')}>
                  Load FEN
                </button>
              </div>
            </section>

            <section className="gameio-section">
              <label htmlFor="gameio-pgn">Game (PGN)</label>
              <textarea id="gameio-pgn" rows={6} value={pgnText} onChange={(e) => setPgnText(e.target.value)} spellCheck={false} />
              <div className="gameio-actions">
                <button onClick={() => copy(pgnText, 'PGN')}>Copy</button>
                <button onClick={() => downloadText('chess-arena-game.pgn', pgnText)} disabled={!pgnText.trim()}>
                  Download .pgn
                </button>
                <button className="primary" onClick={() => apply(loadPGN(pgnText), 'PGN')}>
                  Load PGN
                </button>
              </div>
            </section>

            {message && (
              <div className={`gameio-message ${message.kind}`} role="status">
                {message.text}
              </div>
            )}

            <div className="dialog-actions">
              <button className="btn-cancel" onClick={() => setOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
