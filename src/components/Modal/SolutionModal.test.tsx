/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseLevel } from '../../game/engine';
import { solve } from '../../game/solver';
import { LEVELS } from '../../game/levels';
import { SolutionModal } from './SolutionModal';

function renderModal(onClose = vi.fn()) {
  return render(
    <SolutionModal
      level={LEVELS[0]}
      levelName={LEVELS[0].name}
      solution={solve(parseLevel(LEVELS[0]))}
      onClose={onClose}
    />,
  );
}

afterEach(cleanup);

describe('SolutionModal', () => {
  it('mantém o foco dentro do diálogo ao navegar com Tab', async () => {
    const user = userEvent.setup();
    renderModal();

    const close = screen.getByRole('button', { name: 'Fechar' });
    const next = screen.getByRole('button', { name: 'Próximo' });
    expect(document.activeElement).toBe(close);

    await user.tab();
    expect(document.activeElement).toBe(next);
    await user.tab();
    expect(document.activeElement).toBe(close);
    await user.tab();
    expect(document.activeElement).toBe(next);
  });

  it('não rouba o foco do passo atual quando o callback de fechar muda', () => {
    const { rerender } = renderModal();
    const next = screen.getByRole('button', { name: 'Próximo' });
    next.focus();

    rerender(
      <SolutionModal
        level={LEVELS[0]}
        levelName={LEVELS[0].name}
        solution={solve(parseLevel(LEVELS[0]))}
        onClose={() => undefined}
      />,
    );

    expect(document.activeElement).toBe(next);
  });

  it('restaura o foco para o elemento que abriu a demonstração ao fechar', () => {
    const opener = document.createElement('button');
    opener.textContent = 'Abrir solução';
    document.body.append(opener);
    opener.focus();
    const { unmount } = renderModal();

    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });
});
