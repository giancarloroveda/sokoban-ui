import type { LevelDefinition } from './types';

// Níveis de exemplo para validar a interface (etapa 1 — sem resolução automática/A*).
// Todos foram verificados manualmente e possuem solução.
export const LEVELS: LevelDefinition[] = [
  {
    id: 'nivel-1',
    name: 'Primeiro Empurrão',
    rows: ['#####', '#@$.#', '#####'],
  },
  {
    id: 'nivel-2',
    name: 'Contorno',
    rows: [
      '#######',
      '#     #',
      '#  $  #',
      '#     #',
      '#  .  #',
      '#     #',
      '#  @  #',
      '#######',
    ],
  },
  {
    id: 'nivel-3',
    name: 'Par',
    rows: [
      '########',
      '#      #',
      '# $  $ #',
      '#  ##  #',
      '# .  . #',
      '#   @  #',
      '########',
    ],
  },
];

export function getLevelIndexById(id: string): number {
  return LEVELS.findIndex((level) => level.id === id);
}
