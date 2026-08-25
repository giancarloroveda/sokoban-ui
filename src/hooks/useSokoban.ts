import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { boxesOnTarget, cloneState, isWin, move, parseLevel } from '../game/engine';
import type { Direction, GameState, LevelDefinition } from '../game/types';

export type GameStatus = 'playing' | 'won';

export interface UseSokobanResult {
  state: GameState;
  status: GameStatus;
  moveCount: number;
  elapsedMs: number;
  canUndo: boolean;
  targetsCount: number;
  boxesOnTargetCount: number;
  handleMove: (direction: Direction) => void;
  undo: () => void;
  restart: () => void;
}

/**
 * Hook responsável por orquestrar a lógica pura do jogo (src/game/engine.ts)
 * com o ciclo de vida do React: histórico para undo, contagem de tempo/movimentos
 * e persistência do progresso ao vencer (RF06, RF07, RF08, RF16).
 *
 * Observação: valores lidos/gravados via refs (não via updaters de setState) para
 * que os efeitos colaterais (histórico, contagem, callback de vitória) rodem uma
 * única vez por jogada, mesmo em StrictMode.
 */
export function useSokoban(
  level: LevelDefinition,
  onWin: (moves: number, timeMs: number) => void,
): UseSokobanResult {
  const initialState = useMemo(() => parseLevel(level), [level]);

  const [state, setState] = useState<GameState>(() => cloneState(initialState));
  const [moveCount, setMoveCount] = useState(0);
  const [status, setStatus] = useState<GameStatus>('playing');
  const [elapsedMs, setElapsedMs] = useState(0);
  const [canUndo, setCanUndo] = useState(false);

  const stateRef = useRef<GameState>(state);
  const historyRef = useRef<GameState[]>([]);
  const moveCountRef = useRef(0);
  const statusRef = useRef<GameStatus>('playing');
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  // Reseta tudo sempre que o nível selecionado mudar.
  useEffect(() => {
    const fresh = cloneState(initialState);
    stateRef.current = fresh;
    historyRef.current = [];
    moveCountRef.current = 0;
    statusRef.current = 'playing';
    startTimeRef.current = null;
    setState(fresh);
    setMoveCount(0);
    setStatus('playing');
    setElapsedMs(0);
    setCanUndo(false);
  }, [initialState]);

  // RF16/RN12 — cronômetro inicia no primeiro movimento válido e para ao concluir o nível.
  useEffect(() => {
    if (status !== 'playing' || startTimeRef.current === null) {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const tick = () => {
      if (startTimeRef.current !== null) {
        setElapsedMs(Date.now() - startTimeRef.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (statusRef.current !== 'playing') return;

      const prevState = stateRef.current;
      const result = move(prevState, direction);
      if (!result.moved) return; // FA01 — movimento inválido, nada é contabilizado

      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
      }

      historyRef.current.push(prevState);
      moveCountRef.current += 1;
      stateRef.current = result.state;

      setState(result.state);
      setMoveCount(moveCountRef.current);
      setCanUndo(true);

      if (isWin(result.state)) {
        const finalTimeMs = Date.now() - (startTimeRef.current ?? Date.now());
        statusRef.current = 'won';
        setStatus('won');
        setElapsedMs(finalTimeMs);
        onWin(moveCountRef.current, finalTimeMs);
      }
    },
    [onWin],
  );

  // RF06/RN07 — desfaz a última jogada, sem alterar o tempo decorrido.
  const undo = useCallback(() => {
    if (statusRef.current !== 'playing') return;
    const last = historyRef.current.pop();
    if (!last) return;

    stateRef.current = last;
    moveCountRef.current = Math.max(0, moveCountRef.current - 1);
    setState(last);
    setMoveCount(moveCountRef.current);
    setCanUndo(historyRef.current.length > 0);
  }, []);

  // RF07/RN08 — reinicia o nível para o estado inicial.
  const restart = useCallback(() => {
    const fresh = cloneState(initialState);
    stateRef.current = fresh;
    historyRef.current = [];
    moveCountRef.current = 0;
    statusRef.current = 'playing';
    startTimeRef.current = null;
    setState(fresh);
    setMoveCount(0);
    setStatus('playing');
    setElapsedMs(0);
    setCanUndo(false);
  }, [initialState]);

  return {
    state,
    status,
    moveCount,
    elapsedMs,
    canUndo,
    targetsCount: state.targets.size,
    boxesOnTargetCount: boxesOnTarget(state),
    handleMove,
    undo,
    restart,
  };
}
