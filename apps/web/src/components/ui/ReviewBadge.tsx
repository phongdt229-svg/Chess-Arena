import { useGameStore } from '../../store/gameStore';
import './ReviewBadge.css';

// Shown on top of a board while a past position is displayed
export default function ReviewBadge({ inline = false }: { inline?: boolean }) {
  const reviewPly = useGameStore((s) => s.reviewPly);
  const total = useGameStore((s) => s.history.length);
  const reviewTo = useGameStore((s) => s.reviewTo);
  if (reviewPly === null) return null;

  return (
    <div className={`review-badge ${inline ? 'inline' : ''}`} role="status">
      <span>
        Viewing {reviewPly === 0 ? 'the start position' : `move ${reviewPly} of ${total}`}
      </span>
      <button onClick={() => reviewTo(null)}>Back to game</button>
    </div>
  );
}
