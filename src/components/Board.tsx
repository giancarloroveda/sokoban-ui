import { key } from '../game/engine';
import type { GameState } from '../game/types';
import './Board.css';

interface BoardProps {
  state: GameState;
}

type CellKind = 'wall' | 'target' | 'box' | 'box-on-target' | 'player' | 'player-on-target' | 'floor';

function getCellKind(state: GameState, row: number, col: number): CellKind {
  const k = key(row, col);
  const isWall = state.walls.has(k);
  if (isWall) return 'wall';

  const isTarget = state.targets.has(k);
  const isBox = state.boxes.has(k);
  const isPlayer = state.player.row === row && state.player.col === col;

  if (isPlayer) return isTarget ? 'player-on-target' : 'player';
  if (isBox) return isTarget ? 'box-on-target' : 'box';
  if (isTarget) return 'target';
  return 'floor';
}

export function Board({ state }: BoardProps) {
  const cells: CellKind[][] = [];
  for (let row = 0; row < state.height; row++) {
    const rowCells: CellKind[] = [];
    for (let col = 0; col < state.width; col++) {
      rowCells.push(getCellKind(state, row, col));
    }
    cells.push(rowCells);
  }

  return (
    <div className="board-wrapper">
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${state.width}, var(--cell-size))`,
          gridTemplateRows: `repeat(${state.height}, var(--cell-size))`,
        }}
      >
        {cells.map((rowCells, row) =>
          rowCells.map((kind, col) => (
            <div key={`${row}-${col}`} className={`cell cell--${kind}`} aria-hidden="true">
              {(kind === 'box' || kind === 'box-on-target') && <span className="cell__box" />}
              {(kind === 'player' || kind === 'player-on-target') && <span className="cell__player" />}
              {kind === 'target' && <span className="cell__target" />}
            </div>
          )),
        )}
      </div>
    </div>
  );
}
