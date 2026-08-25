import { formatMoves, formatTime } from '../utils/format';
import './Modal.css';

interface WinModalProps {
  levelName: string;
  moves: number;
  bestMoves?: number;
  timeMs: number;
  isNewRecord: boolean;
  hasNextLevel: boolean;
  onRepeat: () => void;
  onBackToLevels: () => void;
  onNextLevel: () => void;
}

export function WinModal({
  levelName,
  moves,
  bestMoves,
  timeMs,
  isNewRecord,
  hasNextLevel,
  onRepeat,
  onBackToLevels,
  onNextLevel,
}: WinModalProps) {
  return (
    <div className="modal-overlay">
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="win-modal-title">
        <p className="modal__eyebrow">Nível concluído</p>
        <h2 id="win-modal-title" className="modal__title">
          {levelName}
        </h2>

        <div className="modal__stats">
          <div className="stat">
            <span className="stat__label">Movimentos</span>
            <span className="stat__value">{formatMoves(moves)}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Recorde</span>
            <span className="stat__value">{formatMoves(bestMoves ?? moves)}</span>
          </div>
        </div>

        <div className="stat stat--wide">
          <span className="stat__label">Tempo total</span>
          <span className="stat__value">{formatTime(timeMs)}</span>
        </div>

        {isNewRecord && <p className="modal__record-note">Novo recorde para este nível!</p>}

        <div className="modal__actions">
          <button type="button" className="btn" onClick={onRepeat}>
            Repetir
          </button>
          <button type="button" className="btn" onClick={onBackToLevels}>
            Níveis
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={onNextLevel}
            disabled={!hasNextLevel}
          >
            Próximo Nível
          </button>
        </div>
      </div>
    </div>
  );
}
