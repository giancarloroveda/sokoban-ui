import { useCallback, useEffect, useRef, useState } from 'react';
import { useSokoban } from '../hooks/useSokoban';
import type { Direction, LevelDefinition, LevelProgress, LevelRecord } from '../game/types';
import { Board } from './Board';
import { Sidebar } from './Sidebar';
import { WinModal } from './WinModal';
import { RankingsModal } from './RankingsModal';
import { Header } from './Header';
import './GameScreen.css';

const KEY_MAP: Record<string, Direction> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  s: 'down',
  a: 'left',
  d: 'right',
};

interface GameScreenProps {
  level: LevelDefinition;
  levelNumber: number;
  totalLevels: number;
  completedCount: number;
  hasNextLevel: boolean;
  getProgress: (levelId: string) => LevelProgress;
  recordCompletion: (levelId: string, moves: number, timeMs: number) => void;
  getRankings: (levelId: string) => { byTime: LevelRecord[]; byMoves: LevelRecord[] };
  onBackToLevels: () => void;
  onNextLevel: () => void;
}

export function GameScreen({
  level,
  levelNumber,
  totalLevels,
  completedCount,
  hasNextLevel,
  getProgress,
  recordCompletion,
  getRankings,
  onBackToLevels,
  onNextLevel,
}: GameScreenProps) {
  const [showRankings, setShowRankings] = useState(false);
  const previousBestRef = useRef<number | undefined>(getProgress(level.id).bestMoves);
  const [winInfo, setWinInfo] = useState<{ moves: number; timeMs: number; isNewRecord: boolean } | null>(
    null,
  );

  useEffect(() => {
    previousBestRef.current = getProgress(level.id).bestMoves;
    setWinInfo(null);
    setShowRankings(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level.id]);

  const handleWin = useCallback(
    (moves: number, timeMs: number) => {
      const previousBest = previousBestRef.current;
      const isNewRecord = previousBest === undefined || moves < previousBest;
      recordCompletion(level.id, moves, timeMs);
      setWinInfo({ moves, timeMs, isNewRecord });
    },
    [level.id, recordCompletion],
  );

  const { state, status, moveCount, elapsedMs, canUndo, targetsCount, boxesOnTargetCount, handleMove, undo, restart } =
    useSokoban(level, handleWin);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName)) return;

      if (event.key in KEY_MAP) {
        event.preventDefault();
        handleMove(KEY_MAP[event.key]);
        return;
      }

      switch (event.key.toLowerCase()) {
        case 'z':
          event.preventDefault();
          undo();
          break;
        case 'r':
          event.preventDefault();
          restart();
          break;
        case 'escape':
          event.preventDefault();
          onBackToLevels();
          break;
        default:
          break;
      }
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleMove, undo, restart, onBackToLevels]);

  const progress = getProgress(level.id);
  const rankings = getRankings(level.id);

  return (
    <div className="screen">
      <Header completedCount={completedCount} totalLevels={totalLevels} onOpenLevels={onBackToLevels} />
      <main className="game-screen">
        <Board state={state} />
        <Sidebar
          levelName={level.name}
          levelNumber={levelNumber}
          totalLevels={totalLevels}
          moveCount={moveCount}
          bestMoves={progress.bestMoves}
          elapsedMs={elapsedMs}
          boxesOnTarget={boxesOnTargetCount}
          targetsCount={targetsCount}
          canUndo={canUndo}
          hasWon={status === 'won'}
          hasNextLevel={hasNextLevel}
          onUndo={undo}
          onRestart={restart}
          onNextLevel={onNextLevel}
          onShowRankings={() => setShowRankings(true)}
        />
      </main>

      {status === 'won' && winInfo && (
        <WinModal
          levelName={level.name}
          moves={winInfo.moves}
          bestMoves={getProgress(level.id).bestMoves}
          timeMs={winInfo.timeMs}
          isNewRecord={winInfo.isNewRecord}
          hasNextLevel={hasNextLevel}
          onRepeat={restart}
          onBackToLevels={onBackToLevels}
          onNextLevel={onNextLevel}
        />
      )}

      {showRankings && (
        <RankingsModal
          levelName={level.name}
          byTime={rankings.byTime}
          byMoves={rankings.byMoves}
          onClose={() => setShowRankings(false)}
        />
      )}
    </div>
  );
}
